/*
 coordinator.js - AI Coordinator Node
 Central coordination and decision orchestration
 Provides REST API for system coordination and consensus management
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

// Coordinator state
const coordinatorState = {
    status: 'coordinating',
    lastHeartbeat: Date.now(),
    decisions_made: 0,
    consensus_sessions: 0,
    active_proposals: new Map(),
    decision_history: [],
    node_health: {
        guard: { status: 'unknown', lastSeen: null },
        interpreter: { status: 'unknown', lastSeen: null }
    },
    system_metrics: {
        uptime: 0,
        total_votes: 0,
        successful_consensus: 0,
        failed_consensus: 0
    }
};

// Coordination algorithms
function initiateConsensus(proposal) {
    const session = {
        id: crypto.randomBytes(8).toString('hex'),
        proposal: proposal,
        votes: new Map(),
        status: 'active',
        created_at: Date.now(),
        timeout: Date.now() + 30000, // 30 second timeout
        required_votes: 2, // Need 2 out of 3 nodes (including coordinator)
        result: null
    };

    coordinatorState.active_proposals.set(session.id, session);
    coordinatorState.consensus_sessions++;

    // Cast coordinator's vote first
    const coordinatorVote = generateCoordinatorVote(proposal);
    session.votes.set(NODE_ID, coordinatorVote);

    console.log(`[${NODE_ID}] Consensus initiated for proposal:`, proposal.type);
    return session;
}

function processVote(sessionId, nodeId, vote) {
    const session = coordinatorState.active_proposals.get(sessionId);
    if (!session) {
        return { error: 'Session not found' };
    }

    if (session.status !== 'active') {
        return { error: 'Session not active' };
    }

    if (Date.now() > session.timeout) {
        session.status = 'timeout';
        return { error: 'Session timeout' };
    }

    session.votes.set(nodeId, vote);
    console.log(`[${NODE_ID}] Vote received from ${nodeId}:`, vote.decision);

    // Check if we have enough votes
    if (session.votes.size >= session.required_votes) {
        const result = evaluateConsensus(session);
        session.result = result;
        session.status = 'completed';
        
        coordinatorState.decision_history.push({
            sessionId: sessionId,
            proposal: session.proposal,
            votes: Array.from(session.votes.entries()),
            result: result,
            timestamp: Date.now()
        });

        if (result.consensus_reached) {
            coordinatorState.system_metrics.successful_consensus++;
        } else {
            coordinatorState.system_metrics.failed_consensus++;
        }

        coordinatorState.decisions_made++;
        console.log(`[${NODE_ID}] Consensus reached:`, result.decision);
    }

    return { success: true, session_status: session.status };
}

function evaluateConsensus(session) {
    const votes = Array.from(session.votes.values());
    const decisions = votes.map(v => v.decision);
    
    // Count votes
    const voteCounts = {};
    decisions.forEach(decision => {
        voteCounts[decision] = (voteCounts[decision] || 0) + 1;
    });

    // Find majority decision
    const maxVotes = Math.max(...Object.values(voteCounts));
    const majorityDecisions = Object.keys(voteCounts).filter(
        decision => voteCounts[decision] === maxVotes
    );

    // Calculate average confidence
    const avgConfidence = votes.reduce((sum, vote) => sum + vote.confidence, 0) / votes.length;

    const result = {
        consensus_reached: majorityDecisions.length === 1 && maxVotes >= session.required_votes,
        decision: majorityDecisions.length === 1 ? majorityDecisions[0] : 'no_consensus',
        vote_counts: voteCounts,
        confidence: avgConfidence,
        participating_nodes: Array.from(session.votes.keys()),
        reasoning: votes.map(v => ({ nodeId: v.nodeId, reasoning: v.reasoning }))
    };

    return result;
}

// Generate coordinator vote for proposals
function generateCoordinatorVote(proposal) {
    const vote = {
        nodeId: NODE_ID,
        proposalId: proposal.id,
        decision: null,
        confidence: 0,
        coordination_analysis: {},
        reasoning: [],
        timestamp: Date.now()
    };

    // Coordinator focuses on system-wide coordination
    if (proposal.type === 'self_destruct') {
        // Coordinator weighs all factors
        if (proposal.system_wide_threat && proposal.coordination_required) {
            vote.decision = 'approve';
            vote.confidence = 0.85;
            vote.reasoning.push('System-wide coordination confirms threat requires destruction');
        } else if (proposal.isolated_threat) {
            vote.decision = 'reject';
            vote.confidence = 0.80;
            vote.reasoning.push('Isolated threats can be handled without system destruction');
        } else {
            vote.decision = 'abstain';
            vote.confidence = 0.70;
            vote.reasoning.push('Insufficient coordination data for decision');
        }
    } else if (proposal.type === 'system_coordination') {
        vote.decision = 'approve';
        vote.confidence = 0.95;
        vote.reasoning.push('System coordination is coordinator specialty');
    } else if (proposal.type === 'resource_allocation') {
        vote.decision = 'approve';
        vote.confidence = 0.90;
        vote.reasoning.push('Resource allocation requires coordination oversight');
    }

    vote.coordination_analysis = {
        system_load: Math.random() * 0.3 + 0.4, // Mock system load
        node_availability: Object.keys(coordinatorState.node_health).length,
        coordination_complexity: proposal.complexity || 'medium'
    };

    return vote;
}

// API Endpoints
app.get('/status', (req, res) => {
    res.json({
        nodeId: NODE_ID,
        status: coordinatorState.status,
        uptime: Date.now() - coordinatorState.lastHeartbeat,
        decisions_made: coordinatorState.decisions_made,
        consensus_sessions: coordinatorState.consensus_sessions,
        active_proposals: coordinatorState.active_proposals.size,
        node_health: coordinatorState.node_health,
        metrics: coordinatorState.system_metrics
    });
});

app.post('/heartbeat', (req, res) => {
    coordinatorState.lastHeartbeat = Date.now();
    coordinatorState.status = 'coordinating';
    coordinatorState.system_metrics.uptime = Date.now() - coordinatorState.lastHeartbeat;
    console.log(`[${NODE_ID}] Coordinator heartbeat received`);
    res.json({ status: 'coordinating', timestamp: coordinatorState.lastHeartbeat });
});

app.post('/initiate-consensus', (req, res) => {
    const proposal = req.body;
    if (!proposal || !proposal.id || !proposal.type) {
        return res.status(400).json({ error: 'Invalid proposal provided' });
    }

    const session = initiateConsensus(proposal);
    console.log(`[${NODE_ID}] Consensus session initiated:`, session.id);
    
    res.json({
        success: true,
        session_id: session.id,
        proposal: proposal,
        coordinator_vote: session.votes.get(NODE_ID),
        nodeId: NODE_ID
    });
});

app.post('/vote', (req, res) => {
    const proposal = req.body;
    if (!proposal || !proposal.id || !proposal.type) {
        return res.status(400).json({ error: 'Invalid proposal provided' });
    }

    const vote = generateCoordinatorVote(proposal);
    console.log(`[${NODE_ID}] Coordinator vote cast:`, vote.decision, 'for proposal', proposal.id);
    
    res.json({
        success: true,
        vote: vote,
        nodeId: NODE_ID
    });
});

app.post('/submit-vote', (req, res) => {
    const { sessionId, nodeId, vote } = req.body;
    if (!sessionId || !nodeId || !vote) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = processVote(sessionId, nodeId, vote);
    console.log(`[${NODE_ID}] Vote processed from ${nodeId} for session ${sessionId}`);
    
    res.json({
        success: !result.error,
        result: result,
        nodeId: NODE_ID
    });
});

app.get('/consensus-status/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    const session = coordinatorState.active_proposals.get(sessionId);
    
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
        success: true,
        session: {
            id: session.id,
            status: session.status,
            votes_received: session.votes.size,
            required_votes: session.required_votes,
            result: session.result,
            time_remaining: Math.max(0, session.timeout - Date.now())
        },
        nodeId: NODE_ID
    });
});

app.get('/decision-history', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const recentDecisions = coordinatorState.decision_history.slice(-limit);
    
    res.json({
        success: true,
        decisions: recentDecisions,
        total_decisions: coordinatorState.decision_history.length,
        nodeId: NODE_ID
    });
});

app.post('/update-node-health', (req, res) => {
    const { nodeId, status } = req.body;
    if (!nodeId || !status) {
        return res.status(400).json({ error: 'Missing nodeId or status' });
    }

    if (coordinatorState.node_health[nodeId]) {
        coordinatorState.node_health[nodeId] = {
            status: status,
            lastSeen: Date.now()
        };
        console.log(`[${NODE_ID}] Node health updated: ${nodeId} -> ${status}`);
    }

    res.json({
        success: true,
        node_health: coordinatorState.node_health,
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
        authority: 'system_coordination',
        capabilities: ['consensus_management', 'decision_coordination', 'system_orchestration']
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

// Periodic coordination tasks
setInterval(() => {
    // Clean up expired sessions
    const now = Date.now();
    for (const [sessionId, session] of coordinatorState.active_proposals.entries()) {
        if (session.status === 'active' && now > session.timeout) {
            session.status = 'timeout';
            session.result = {
                consensus_reached: false,
                decision: 'timeout',
                reason: 'Session timeout reached'
            };
            coordinatorState.system_metrics.failed_consensus++;
            console.log(`[${NODE_ID}] Session ${sessionId} timed out`);
        }
    }

    // Update system metrics
    coordinatorState.system_metrics.uptime = now - coordinatorState.lastHeartbeat;
    coordinatorState.system_metrics.total_votes = coordinatorState.system_metrics.successful_consensus + coordinatorState.system_metrics.failed_consensus;
}, 10000); // Every 10 seconds

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log(`[${NODE_ID}] Coordinator shutting down...`);
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log(`[${NODE_ID}] Coordinator shutting down...`);
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`[${NODE_ID}] AI Coordinator Node listening on port ${PORT}`);
    coordinatorState.lastHeartbeat = Date.now();
});