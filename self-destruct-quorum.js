const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
app.use(express.json());

// Daftar AI nodes (public key untuk verifikasi JWT)
const pubkeys = JSON.parse(fs.readFileSync('pubkeys.json','utf8'));
// jumlah minimal AI yang harus setuju
const QUORUM = 2;

// Store ephemeral seeds & session shares
let ephemeralSeeds = {};
let sessionShares = new Map();

// Track votes dari AI nodes
let destructionVotes = new Set();

// Helper verifikasi JWT AI node
function verifyAIJWT(token, nodeId){
    const pub = pubkeys[nodeId];
    if(!pub) throw new Error('Unknown nodeId');
    return jwt.verify(token, pub, {algorithms:['RS256']});
}

// Endpoint self-destruct quorum
app.post('/self-destruct-quorum', (req,res)=>{
    const { nodeId, jwtToken, reason } = req.body || {};
    if(!nodeId || !jwtToken) return res.status(400).json({error:'missing'});
    
    try {
        verifyAIJWT(jwtToken, nodeId); // validasi node AI
        destructionVotes.add(nodeId);
        console.log(`Vote received from ${nodeId} (${destructionVotes.size}/${QUORUM}) - Reason: ${reason || 'not specified'}`);
        
        if(destructionVotes.size >= QUORUM){
            // --- EXECUTE SELF-DESTRUCT ---
            console.log('!!! QUORUM REACHED - EXECUTING SELF-DESTRUCT !!!');
            
            // Clear in-memory data
            ephemeralSeeds = {};
            sessionShares.clear();
            
            // Overwrite sensitive files
            const sensitiveFiles = ['page.sym.enc', 'master_key.hex'];
            sensitiveFiles.forEach(file => {
                if(fs.existsSync(file)) {
                    const size = fs.statSync(file).size;
                    fs.writeFileSync(file, Buffer.alloc(size, 0)); // overwrite with zeros
                    console.log(`Overwritten ${file} with zeros`);
                }
            });
            
            // Clear share files
            for(let i = 1; i <= 5; i++){
                const shareFile = `share-${i}.share`;
                if(fs.existsSync(shareFile)){
                    const size = fs.statSync(shareFile).size;
                    fs.writeFileSync(shareFile, Buffer.alloc(size, 0));
                    console.log(`Overwritten ${shareFile} with zeros`);
                }
            }
            
            destructionVotes.clear();
            console.log('!!! SYSTEM SELF-DESTRUCT EXECUTED !!!');
            return res.json({status:'destroyed', timestamp: new Date().toISOString()});
        } else {
            return res.json({status:'vote-registered', votes: destructionVotes.size, needed: QUORUM});
        }

    } catch(e){
        console.error('Quorum self-destruct verification failed:', e.message);
        return res.status(401).json({error:'invalid signature'});
    }
});

// Endpoint untuk cek status votes
app.get('/destruct-status', (req,res)=>{
    res.json({
        currentVotes: Array.from(destructionVotes),
        votesCount: destructionVotes.size,
        quorumNeeded: QUORUM,
        quorumReached: destructionVotes.size >= QUORUM
    });
});

// Endpoint untuk reset votes (emergency)
app.post('/reset-votes', (req,res)=>{
    const { adminKey } = req.body || {};
    if(adminKey === 'emergency-reset-2024') {
        destructionVotes.clear();
        console.log('Emergency vote reset executed');
        res.json({status:'votes-reset'});
    } else {
        res.status(401).json({error:'unauthorized'});
    }
});

// Status endpoint
app.get('/status', (req,res)=>{
    res.json({
        service: 'self-destruct-quorum',
        status: 'active',
        quorum_threshold: QUORUM,
        current_votes: destructionVotes.size,
        voters: Array.from(destructionVotes),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.listen(5501,()=>console.log('Self-destruct quorum server running :5501, QUORUM=', QUORUM));