const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const secrets = require('secrets.js-grempe');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

// konfigurasi
const SHARE_THRESHOLD = parseInt(process.env.SSS_THRESHOLD || '3', 10); // t
const SHARE_STORE_TTL = 60_000; // ms - shares expire if not enough collected
const PUBKEYS_FILE = 'pubkeys.json'; // publik key AI nodes untuk verifikasi JWT
if(!fs.existsSync(PUBKEYS_FILE)){
  console.error('Warning: pubkeys.json not found. Create it with nodes public keys.');
}

// load public keys
let pubkeys = {};
try { pubkeys = JSON.parse(fs.readFileSync(PUBKEYS_FILE,'utf8')); } catch(e){ pubkeys = {}; }

// in-memory store: sessionId -> { shares: [{nodeId, share, ts, jwt}], createdAt }
const sessionShares = new Map();

// helper: verify JWT signed by node
function verifyNodeJwt(token, nodeId){
  const pub = pubkeys[nodeId];
  if(!pub) throw new Error('unknown nodeId');
  try {
    const decoded = jwt.verify(token, pub, { algorithms: ['RS256'] });
    return decoded;
  } catch(e){
    throw e;
  }
}

// endpoint: nodes submit their share for a sessionId
app.post('/submit-share', (req, res) => {
  const { nodeId, share, jwtToken, sessionId } = req.body || {};
  if(!nodeId || !share || !jwtToken || !sessionId) return res.status(400).json({ error: 'missing' });
  // verify jwt
  try {
    const decoded = verifyNodeJwt(jwtToken, nodeId);
    // optional: check payload nonce/timestamp in decoded
    // store share
    const entry = sessionShares.get(sessionId) || { shares: [], createdAt: Date.now() };
    // check duplicate node
    if(entry.shares.find(s => s.nodeId === nodeId)) return res.status(400).json({ error: 'node already submitted' });
    entry.shares.push({ nodeId, share, ts: Date.now() });
    sessionShares.set(sessionId, entry);
    console.log('Received share from', nodeId, 'for session', sessionId, 'count', entry.shares.length);
    // if reached threshold -> combine
    if(entry.shares.length >= SHARE_THRESHOLD){
      try {
        const shareStrings = entry.shares.map(s => s.share);
        const combined = secrets.combine(shareStrings); // hex master
        console.log('Reconstructed master (hex):', combined);
        // perform secured action: create ephemeral seed & token (demo)
        const seed = crypto.randomBytes(32).toString('hex');
        // For demo create ephemeral token (signed) containing seedId but NOT the seed itself
        const seedId = crypto.randomBytes(12).toString('hex');
        // store seed server-side temporarily in memory
        entry.reconstructed = { seedId, seed, createdAt: Date.now() };
        // clear shares for session to avoid reuse (but keep record)
        // optionally delete sessionShares(sessionId) or mark used
        // respond with seedId (client will request actual key via authenticated channel)
        res.json({ ok:true, seedId, info: 'master reconstructed, seed created' });
        // zero-out: IMPORTANT -> we will zero memory of combined (not secure in JS but demo)
        // overwrite combined variable
      } catch(e){
        console.error('combine error', e);
        return res.status(500).json({ error: 'combine failed' });
      }
    } else {
      res.json({ ok:true, message: 'share stored', current: entry.shares.length, need: SHARE_THRESHOLD });
    }
  } catch(e){
    console.error('verify error', e.message);
    return res.status(401).json({ error: 'invalid signature' });
  }
});

// endpoint to fetch seed (only allowed if session has reconstructed seed)
app.get('/fetch-seed', (req,res) => {
  const { sessionId, seedId } = req.query;
  if(!sessionId || !seedId) return res.status(400).json({ error: 'missing' });
  const entry = sessionShares.get(sessionId);
  if(!entry || !entry.reconstructed) return res.status(404).json({ error: 'no seed' });
  if(entry.reconstructed.seedId !== seedId) return res.status(404).json({ error: 'invalid seed' });
  // return seed (in production, require auth and short TTL)
  const seed = entry.reconstructed.seed;
  // delete seed after returning once
  delete entry.reconstructed;
  sessionShares.set(sessionId, entry);
  // IMPORTANT: Zeroing in JS: just let GC handle; for demo we return then hope it's dropped
  res.json({ seed });
});

// cleanup expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for(const [k, v] of sessionShares.entries()){
    if(now - v.createdAt > SHARE_STORE_TTL){
      sessionShares.delete(k);
      console.log('Expired shares for session', k);
    }
  }
}, 10_000);

// Status endpoint
app.get('/status', (req,res)=>{
    res.json({
        service: 'token-service-sss',
        status: 'active',
        threshold: SHARE_THRESHOLD,
        active_sessions: sessionShares.size,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.listen(5000, ()=>console.log('Token Service (SSS) listening :5000. Threshold t=', SHARE_THRESHOLD));