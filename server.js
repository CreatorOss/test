/*
 server.js - sendec-server
 Minimal demo server:
 - /get-ephemeral  => issue ephemeral token + seed (stored server-side)
 - /fetch-key      => return decryption key for token
 - /page.sym.enc   => serve encrypted payload
 - /interpret      => interpret symbol sequence using per-token seed
 - /rotate         => admin rotate seeds (for demo)
 - /heartbeat, /revoke    => logging & block
*/
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { recordAndCheck } = require('./detector');
const symbolDict = require('./symbol_dict');

const app = express();
app.use(bodyParser.json());

const MASTER_KEY_FILE = path.join(__dirname, 'master_key.hex');
if(!fs.existsSync(MASTER_KEY_FILE)){
  console.warn('Warning: master_key.hex missing. Run encrypt.js to generate (or create one).');
}
const MASTER_KEY = fs.existsSync(MASTER_KEY_FILE) ? Buffer.from(fs.readFileSync(MASTER_KEY_FILE,'utf8').trim(),'hex') : crypto.randomBytes(32);

// ephemeral: token -> { clientId, keyBuf, seedHex, expires }
const ephemeral = new Map();
const blocked = new Set();

function makeEphemeral(clientId){
  const keyBuf = crypto.randomBytes(32);
  const seedHex = crypto.randomBytes(32).toString('hex');
  const token = crypto.randomBytes(16).toString('hex');
  const expires = Date.now() + 30_000; // 30s TTL
  ephemeral.set(token, { clientId, keyBuf, seedHex, expires });
  return { token, expires };
}

function interpretSymbolWithSeed(seedHex, symbol){
  const seed = Buffer.from(seedHex, 'hex');
  const h = crypto.createHmac('sha256', seed).update(symbol).digest();
  const idx = h.readUInt32BE(0);
  const choices = symbolDict[symbol] || [];
  if(choices.length === 0) return { raw: symbol };
  return choices[idx % choices.length];
}

app.get('/get-ephemeral', (req,res)=>{
  const clientId = req.query.clientId || 'anon';
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  if(blocked.has(clientId) || blocked.has(ip)) return res.status(403).json({error:'blocked'});
  const hit = recordAndCheck(clientId);
  if(hit){
    blocked.add(clientId);
    console.log('BLOCKED', clientId);
    return res.status(403).json({error:'rate_limited'});
  }
  const e = makeEphemeral(clientId);
  console.log('ISSUE', clientId, 'token', e.token);
  res.json({ token: e.token, expires: e.expires });
});

app.get('/fetch-key', (req,res)=>{
  const token = req.query.token;
  const rec = ephemeral.get(token);
  if(!rec) return res.status(404).json({error:'invalid'});
  if(rec.expires < Date.now()){ ephemeral.delete(token); return res.status(410).json({error:'expired'}); }
  res.json({ key: rec.keyBuf.toString('hex') });
});

app.get('/page.sym.enc', (req,res)=>{
  const f = path.join(__dirname,'page.sym.enc');
  if(!fs.existsSync(f)) return res.status(404).send('missing');
  res.sendFile(f);
});

app.post('/interpret', (req,res) => {
  const { token, sequence } = req.body || {};
  if(!token || !sequence) return res.status(400).json({ error: 'missing token or sequence' });
  const rec = ephemeral.get(token);
  if(!rec) return res.status(401).json({ error: 'invalid_token' });
  if(rec.expires < Date.now()){ ephemeral.delete(token); return res.status(410).json({ error: 'expired' }); }

  const symbols = Array.from(sequence);
  const blueprint = symbols.map(sym => interpretSymbolWithSeed(rec.seedHex, sym));
  res.json({ blueprint, version: 'v1' });
});

app.post('/heartbeat', (req,res)=>{
  console.log('HEARTBEAT', req.body, 'ip=', req.ip);
  res.json({ok:true});
});

app.post('/revoke', (req,res)=>{
  const { clientId, ip } = req.body || {};
  if(clientId) blocked.add(clientId);
  if(ip) blocked.add(ip);
  console.log('REVOKE', clientId, ip);
  res.json({ok:true});
});

app.get('/rotate', (req,res) => {
  const scope = req.query.scope || 'all';
  let count = 0;
  if(scope === 'all'){
    for(const [token, rec] of ephemeral.entries()){
      rec.seedHex = crypto.randomBytes(32).toString('hex');
      rec.expires = Date.now() + 30_000;
      ephemeral.set(token, rec);
      count++;
    }
  }
  console.log('ROTATE', scope, 'count', count);
  res.json({ ok: true, rotated: count });
});

// Status endpoint
app.get('/status', (req,res) => {
  res.json({
    service: 'sendec-server',
    status: 'active',
    active_tokens: ephemeral.size,
    blocked_clients: blocked.size,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(3000, ()=>console.log('sendec-server listening :3000'));