/*
 coordinator.js - AI Coordinator Node
 Strategic decision making and system coordination
 Provides REST API for coordination tasks and voting
*/

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const NODE_ID = 'coordinator';
const PORT = 4003;

// Load private key for signing
const PRIVATE_KEY_PATH = `./keys/${NODE_ID}.key`;
let privateKey = null;
if (fs.existsSync(PRIVATE_KEY_PATH)) {
    privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
}

// Node state
const nodeState = {
    status: 'active',
    lastHeartbeat: Date.now(),
    decisions: [],
    votingHistory: [],
    strategicAssessments: []
};

// Strategic decision making
function makeStrategicDecision(context) {
    const assessment = {
        id: crypto.randomBytes(8).toString('hex'),
        timestamp: Date.now(),
        context: context,
        decision: null,
        confidence: 0,
        reasoning: []
    };

    // Analyze context and make strategic decision
    if (context.type === 'security_threat') {
        assessment.decision = 'escalate';
        assessment.confidence = 0.85;
        assessment.reasoning.push('Security threat detected, escalation required');
    } else if (context.type === 'system_optimization') {
        assessment.decision = 'approve';
        assessment.confidence = 0.75;
        assessment.reasoning.push('Optimization benefits outweigh risks');
    } else if (context.type === 'resource_allocation') {
        assessment.decision = 'conditional_approve';
        assessment.confidence = 0.70;
        assessment.reasoning.push('Approve with monitoring conditions');
    } else {
        assessment.decision = 'analyze_further';
        assessment.confidence = 0.60;
        assessment.reasoning.push('Insufficient data for immediate decision');
    }

    nodeState.strategicAssessments.push(assessment);
    return assessment;
}

// Generate vote for quorum decisions
function generateVote(proposal) {
    const vote = {
        nodeId: NODE_ID,
        proposalId: proposal.id,
        decision: null,
        confidence: 0,
        reasoning: [],
        timestamp: Date.now()
    };

    // Coordinator voting logic
    if (proposal.type === 'self_destruct') {
        // Very conservative on destruction
        if (proposal.threat_level >= 9 && proposal.evidence_score >= 0.9) {
            vote.decision = 'approve';
            vote.confidence = 0.95;
            vote.reasoning.push('Critical threat confirmed, destruction necessary');
        } else {
            vote.decision = 'reject';
            vote.confidence = 0.80;
            vote.reasoning.push('Insufficient evidence for destruction');
        }
    } else if (proposal.type === 'security_upgrade') {
        vote.decision = 'approve';
        vote.confidence = 0.85;
        vote.reasoning.push('Security upgrades align with strategic objectives');
    } else {
        vote.decision = 'abstain';
        vote.confidence = 0.50;
        vote.reasoning.push('Proposal outside coordinator expertise');
    }

    nodeState.votingHistory.push(vote);
    return vote;
}

// API Endpoints
app.get('/status', (req, res) => {
    res.json({
        nodeId: NODE_ID,
        status: nodeState.status,
        uptime: Date.now() - nodeState.lastHeartbeat,
        decisions_made: nodeState.decisions.length,
        votes_cast: nodeState.votingHistory.length,
        assessments: nodeState.strategicAssessments.length
    });
});

app.post('/heartbeat', (req, res) => {
    nodeState.lastHeartbeat = Date.now();
    nodeState.status = 'active';
    console.log(`[${NODE_ID}] Heartbeat received`);
    res.json({ status: 'acknowledged', timestamp: nodeState.lastHeartbeat });
});

app.post('/strategic-decision', (req, res) => {
    const context = req.body;
    if (!context || !context.type) {
        return res.status(400).json({ error: 'Invalid context provided' });
    }

    const decision = makeStrategicDecision(context);
    console.log(`[${NODE_ID}] Strategic decision made:`, decision.decision);
    
    res.json({
        success: true,
        decision: decision,
        nodeId: NODE_ID
    });
});

app.post('/vote', (req, res) => {
    const proposal = req.body;
    if (!proposal || !proposal.id || !proposal.type) {
        return res.status(400).json({ error: 'Invalid proposal provided' });
    }

    const vote = generateVote(proposal);
    console.log(`[${NODE_ID}] Vote cast:`, vote.decision, 'for proposal', proposal.id);
    
    res.json({
        success: true,
        vote: vote,
        nodeId: NODE_ID
    });
});

app.post('/analyze-threat', (req, res) => {
    const threatData = req.body;
    
    const analysis = {
        id: crypto.randomBytes(8).toString('hex'),
        timestamp: Date.now(),
        threat_level: Math.random() * 10, // Mock threat assessment
        strategic_impact: Math.random(),
        recommended_action: 'monitor',
        confidence: 0.75 + Math.random() * 0.2
    };

    if (analysis.threat_level > 7) {
        analysis.recommended_action = 'immediate_response';
    } else if (analysis.threat_level > 4) {
        analysis.recommended_action = 'elevated_monitoring';
    }

    console.log(`[${NODE_ID}] Threat analyzed:`, analysis.recommended_action);
    
    res.json({
        success: true,
        analysis: analysis,
        nodeId: NODE_ID
    });
});

app.get('/generate-jwt', (req, res) => {
    if (!privateKey) {
        return res.status(500).json({ error: 'Private key not available' });
    }

    const payload = {
        nodeId: NODE_ID,
        role: 'coordinator',
        timestamp: Date.now(),
        capabilities: ['strategic_decision', 'threat_analysis', 'voting']
    };

    try {
        const token = jwt.sign(payload, privateKey, { 
            algorithm: 'RS256', 
            expiresIn: '60s' 
        });
        
        res.json({
            success: true,
            token: token,
            nodeId: NODE_ID,
            expires_in: 60
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate JWT' });
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log(`[${NODE_ID}] Shutting down gracefully...`);
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log(`[${NODE_ID}] Shutting down gracefully...`);
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`[${NODE_ID}] AI Coordinator Node listening on port ${PORT}`);
    nodeState.lastHeartbeat = Date.now();
});