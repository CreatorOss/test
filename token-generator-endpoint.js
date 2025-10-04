const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('.'));

function createJWT(nodeId, reason = 'security-breach-detected'){
    const privKeyPath = `keys/${nodeId}.key`;
    if(!fs.existsSync(privKeyPath)){
        throw new Error(`Private key not found for ${nodeId}`);
    }
    const priv = fs.readFileSync(privKeyPath,'utf8');
    const payload = {
        nodeId,
        reason,
        ts: Date.now(),
        action: 'self-destruct-vote'
    };
    return jwt.sign(payload, priv, {algorithm:'RS256',expiresIn:'300s'}); // 5 minutes
}

// Endpoint to generate JWT for AI nodes
app.post('/generate-token', (req, res) => {
    const { nodeId, reason } = req.body || {};
    if(!nodeId) return res.status(400).json({error: 'nodeId required'});
    
    try {
        const token = createJWT(nodeId, reason);
        console.log(`Generated JWT for ${nodeId}: ${reason || 'no reason'}`);
        res.json({ token, nodeId, reason });
    } catch(e) {
        console.error(`Failed to generate JWT for ${nodeId}:`, e.message);
        res.status(500).json({error: e.message});
    }
});

// Status endpoint
app.get('/status', (req,res)=>{
    res.json({
        service: 'token-generator',
        status: 'active',
        available_nodes: ['coordinator', 'guard', 'interpreter'],
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.listen(5502, () => console.log('Token generator server running :5502'));

module.exports = { createJWT };