/*
 final-sendec-system.js
 Master orchestrator for Final Sendec System.
 - Spawns/monitors child processes for known services (if files exist).
 - Provides admin HTTP API on port 6000 for status, JWT demo, attack trigger, rotate, start/stop.
 - Uses keys in ./keys/ for signing demo JWTs.
*/
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const BASE = process.cwd();
const SERVICES = {
  sendec: { script: 'server.js', args: [], port: 3000 },
  token_sss: { script: 'token-service-sss.js', args: [], port: 5000 },
  interpreter: { script: 'interpreter.js', args: [], port: 4001 },
  guard: { script: 'guard.js', args: [], port: 4002 },
  coordinator: { script: 'coordinator.js', args: [], port: 4003 },
  selfdestruct: { script: 'self-destruct-quorum.js', args: [], port: 5501 },
  token_gen: { script: 'token-generator-endpoint.js', args: [], port: 5502 }
};

const procs = {}; // name -> { proc, startedAt }

function spawnService(name){
  const s = SERVICES[name];
  if(!s) return null;
  const scriptPath = path.join(BASE, s.script);
  if(!fs.existsSync(scriptPath)){
    console.log(`[orchestrator] script missing: ${s.script}`);
    return null;
  }
  if(procs[name] && procs[name].proc && !procs[name].proc.killed) {
    return procs[name];
  }
  const child = spawn('node', [scriptPath, ...s.args], { cwd: BASE, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', d => process.stdout.write(`[${name}] ${d}`));
  child.stderr.on('data', d => process.stderr.write(`[${name}] ERR ${d}`));
  child.on('exit', (code, sig) => {
    console.log(`[orchestrator] ${name} exited code=${code} sig=${sig}`);
    if(procs[name]) procs[name].proc = null;
  });
  procs[name] = { proc: child, pid: child.pid, startedAt: Date.now() };
  console.log(`[orchestrator] spawned ${name} pid=${child.pid}`);
  return procs[name];
}

function stopService(name){
  const entry = procs[name];
  if(entry && entry.proc) {
    try { entry.proc.kill('SIGTERM'); } catch(e){/* */}
    procs[name] = { proc: null, pid: null, startedAt: null };
  }
}

function serviceStatus(){
  const keys = Object.keys(SERVICES);
  return keys.map(k => {
    const s = SERVICES[k];
    const p = procs[k];
    return {
      name: k,
      script: s.script,
      port: s.port,
      running: p && p.proc && !p.proc.killed,
      pid: p && p.pid || null,
      startedAt: p && p.startedAt || null
    };
  });
}

// auto-spawn all available services
function startAll(){
  Object.keys(SERVICES).forEach(k => spawnService(k));
}
function stopAll(){
  Object.keys(SERVICES).forEach(k => stopService(k));
}

// utilities: create keypair if missing (RSA 2048)
function ensureKeys(){
  const KDIR = path.join(BASE, 'keys');
  if(!fs.existsSync(KDIR)) fs.mkdirSync(KDIR);
  const nodes = ['coordinator', 'guard', 'interpreter'];
  nodes.forEach(n => {
    const priv = path.join(KDIR, `${n}.key`);
    const pub = path.join(KDIR, `${n}.pub`);
    if(!fs.existsSync(priv) || !fs.existsSync(pub)){
      console.log(`[orchestrator] Generating RSA keypair for ${n} ...`);
      const { execSync } = require('child_process');
      execSync(`openssl genpkey -algorithm RSA -out ${priv} -pkeyopt rsa_keygen_bits:2048`);
      execSync(`openssl rsa -in ${priv} -pubout -out ${pub}`);
      console.log(`[orchestrator] keys written: ${priv}, ${pub}`);
    }
  });
  // build pubkeys.json for services that need it (if not present)
  const PUBJSON = path.join(BASE, 'pubkeys.json');
  if(!fs.existsSync(PUBJSON)){
    const obj = {};
    nodes.forEach(n => {
      const pub = fs.readFileSync(path.join(KDIR, `${n}.pub`),'utf8');
      obj[n] = pub;
    });
    fs.writeFileSync(PUBJSON, JSON.stringify(obj, null, 2));
    console.log('[orchestrator] pubkeys.json generated.');
  }
}

// admin endpoints
app.get('/status', (req,res) => {
  res.json({ uptime: process.uptime(), services: serviceStatus() });
});

// start/stop individual service
app.post('/service/:name/start', (req,res) => {
  const name = req.params.name;
  const info = spawnService(name);
  res.json({ started: !!info, name, info });
});
app.post('/service/:name/stop', (req,res) => {
  const name = req.params.name;
  stopService(name);
  res.json({ stopped:true, name });
});

// start/stop all
app.post('/start-all', (req,res) => { startAll(); res.json({ok:true}); });
app.post('/stop-all', (req,res) => { stopAll(); res.json({ok:true}); });

// simple JWT generator for demo nodes (development only). Signs payload with node private key.
app.get('/generate-jwt', (req,res) => {
  const nodeId = req.query.node || 'coordinator';
  const KDIR = path.join(BASE, 'keys');
  const pk = path.join(KDIR, `${nodeId}.key`);
  if(!fs.existsSync(pk)) return res.status(404).json({ error: 'private key missing for ' + nodeId });
  const priv = fs.readFileSync(pk,'utf8');
  const payload = { nodeId, ts: Date.now() };
  const token = jwt.sign(payload, priv, { algorithm: 'RS256', expiresIn: '60s' });
  res.json({ nodeId, token });
});

// trigger attack.sh (if exists)
app.post('/trigger-attack', (req,res) => {
  const script = path.join(BASE, 'attack.sh');
  if(!fs.existsSync(script)) return res.status(404).json({ error: 'attack.sh missing' });
  const child = spawn('bash', [script], { cwd: BASE, stdio:'pipe' });
  child.stdout.on('data', d => process.stdout.write(`[attack] ${d}`));
  child.stderr.on('data', d => process.stderr.write(`[attack] ERR ${d}`));
  child.on('exit', c => console.log('[attack] finished', c));
  res.json({ triggered: true });
});

// rotate endpoint (call /rotate on token service if available)
app.post('/rotate', async (req,res) => {
  const ts = Date.now();
  const tokenServiceUrl = 'http://127.0.0.1:5000/rotate?scope=all';
  const { exec } = require('child_process');
  exec(`curl -s "${tokenServiceUrl}"`, (err, stdout, stder) => {
    if(err) return res.status(500).json({ error: err.message });
    res.json({ rotated: stdout, at: ts });
  });
});

// graceful shutdown: stop children
function shutdown(){
  console.log('[orchestrator] shutting down, stopping children...');
  stopAll();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// init
ensureKeys();
startAll();
const PORT = 6000;
app.listen(PORT, ()=> console.log(`[orchestrator] admin API listening :${PORT}`));