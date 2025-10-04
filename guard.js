/*
 guard.js - AI Guard Node
 Security monitoring and threat detection
 Provides REST API for security analysis and alerts
*/

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const NODE_ID = 'guard';
const PORT = 4002;

// Load private key for signing
const PRIVATE_KEY_PATH = `./keys/${NODE_ID}.key`;
let privateKey = null;
if (fs.existsSync(PRIVATE_KEY_PATH)) {
    privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
}

// Security monitoring state
const securityState = {
    status: 'monitoring',
    lastHeartbeat: Date.now(),
    threats_detected: 0,
    alerts_issued: 0,
    security_level: 'normal', // normal, elevated, high, critical
    active_monitors: [],
    threat_history: [],
    security_metrics: {
        failed_authentications: 0,
        suspicious_activities: 0,
        blocked_requests: 0,
        anomaly_score: 0
    }
};

// Threat detection algorithms
function detectThreat(data) {
    const threat = {
        id: crypto.randomBytes(8).toString('hex'),
        timestamp: Date.now(),
        type: 'unknown',
        severity: 'low',
        confidence: 0,
        indicators: [],
        recommended_action: 'monitor'
    };

    // Analyze different threat patterns
    if (data.failed_logins && data.failed_logins > 5) {
        threat.type = 'brute_force';
        threat.severity = 'medium';
        threat.confidence = 0.75;
        threat.indicators.push('Multiple failed authentication attempts');
        threat.recommended_action = 'block_ip';
    }

    if (data.unusual_traffic && data.unusual_traffic > 100) {
        threat.type = 'ddos';
        threat.severity = 'high';
        threat.confidence = 0.85;
        threat.indicators.push('Abnormal traffic volume detected');
        threat.recommended_action = 'rate_limit';
    }

    if (data.malicious_patterns) {
        threat.type = 'intrusion_attempt';
        threat.severity = 'critical';
        threat.confidence = 0.90;
        threat.indicators.push('Malicious code patterns detected');
        threat.recommended_action = 'immediate_block';
    }

    // Update security metrics
    securityState.threats_detected++;
    securityState.threat_history.push(threat);
    
    // Adjust security level based on threat severity
    if (threat.severity === 'critical') {
        securityState.security_level = 'critical';
    } else if (threat.severity === 'high' && securityState.security_level !== 'critical') {
        securityState.security_level = 'high';
    }

    return threat;
}

// Generate security vote for quorum decisions
function generateSecurityVote(proposal) {
    const vote = {
        nodeId: NODE_ID,
        proposalId: proposal.id,
        decision: null,
        confidence: 0,
        security_assessment: {},
        reasoning: [],
        timestamp: Date.now()
    };

    // Security-focused voting logic
    if (proposal.type === 'self_destruct') {
        // Guard is very security-conscious
        if (proposal.security_breach_confirmed && proposal.data_compromise_risk > 0.8) {
            vote.decision = 'approve';
            vote.confidence = 0.90;
            vote.reasoning.push('Security breach confirmed, data protection requires destruction');
        } else if (proposal.threat_level >= 8) {
            vote.decision = 'approve';
            vote.confidence = 0.75;
            vote.reasoning.push('High threat level justifies destruction');
        } else {
            vote.decision = 'reject';
            vote.confidence = 0.85;
            vote.reasoning.push('Security threat not severe enough for destruction');
        }
    } else if (proposal.type === 'access_grant') {
        // Very conservative on access
        vote.decision = 'reject';
        vote.confidence = 0.80;
        vote.reasoning.push('Default deny policy for security');
    } else if (proposal.type === 'security_upgrade') {
        vote.decision = 'approve';
        vote.confidence = 0.95;
        vote.reasoning.push('Security upgrades always approved');
    }

    vote.security_assessment = {
        current_threat_level: securityState.security_level,
        recent_threats: securityState.threats_detected,
        system_integrity: 'intact'
    };

    return vote;
}

// API Endpoints
app.get('/status', (req, res) => {
    res.json({
        nodeId: NODE_ID,
        status: securityState.status,
        security_level: securityState.security_level,
        uptime: Date.now() - securityState.lastHeartbeat,
        threats_detected: securityState.threats_detected,
        alerts_issued: securityState.alerts_issued,
        metrics: securityState.security_metrics
    });
});

app.post('/heartbeat', (req, res) => {
    securityState.lastHeartbeat = Date.now();
    securityState.status = 'monitoring';
    console.log(`[${NODE_ID}] Security heartbeat received`);
    res.json({ status: 'monitoring', timestamp: securityState.lastHeartbeat });
});

app.post('/analyze-threat', (req, res) => {
    const data = req.body;
    if (!data) {
        return res.status(400).json({ error: 'No data provided for analysis' });
    }

    const threat = detectThreat(data);
    console.log(`[${NODE_ID}] Threat detected:`, threat.type, 'severity:', threat.severity);
    
    // Issue alert if threat is significant
    if (threat.severity === 'high' || threat.severity === 'critical') {
        securityState.alerts_issued++;
        console.log(`[${NODE_ID}] SECURITY ALERT: ${threat.type} - ${threat.severity}`);
    }
    
    res.json({
        success: true,
        threat: threat,
        nodeId: NODE_ID,
        alert_issued: threat.severity === 'high' || threat.severity === 'critical'
    });
});

app.post('/vote', (req, res) => {
    const proposal = req.body;
    if (!proposal || !proposal.id || !proposal.type) {
        return res.status(400).json({ error: 'Invalid proposal provided' });
    }

    const vote = generateSecurityVote(proposal);
    console.log(`[${NODE_ID}] Security vote cast:`, vote.decision, 'for proposal', proposal.id);
    
    res.json({
        success: true,
        vote: vote,
        nodeId: NODE_ID
    });
});

app.post('/security-scan', (req, res) => {
    const scanResults = {
        id: crypto.randomBytes(8).toString('hex'),
        timestamp: Date.now(),
        scan_type: 'comprehensive',
        vulnerabilities: Math.floor(Math.random() * 3), // Mock scan
        security_score: 85 + Math.floor(Math.random() * 15),
        recommendations: []
    };

    if (scanResults.vulnerabilities > 0) {
        scanResults.recommendations.push('Patch identified vulnerabilities');
        scanResults.recommendations.push('Update security configurations');
    }

    if (scanResults.security_score < 90) {
        scanResults.recommendations.push('Enhance monitoring capabilities');
    }

    console.log(`[${NODE_ID}] Security scan completed:`, scanResults.security_score, 'score');
    
    res.json({
        success: true,
        scan_results: scanResults,
        nodeId: NODE_ID
    });
});

app.get('/security-metrics', (req, res) => {
    const metrics = {
        ...securityState.security_metrics,
        threat_trend: securityState.threat_history.length > 0 ? 'stable' : 'improving',
        last_threat: securityState.threat_history.length > 0 ? 
            securityState.threat_history[securityState.threat_history.length - 1].timestamp : null,
        security_posture: securityState.security_level
    };

    res.json({
        success: true,
        metrics: metrics,
        nodeId: NODE_ID
    });
});

app.get('/generate-jwt', (req, res) => {
    if (!privateKey) {
        return res.status(500).json({ error: 'Private key not available' });
    }

    const payload = {
        nodeId: NODE_ID,
        role: 'security_guard',
        timestamp: Date.now(),
        security_clearance: 'high',
        capabilities: ['threat_detection', 'security_analysis', 'voting']
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

// Periodic security monitoring
setInterval(() => {
    // Simulate ongoing security monitoring
    securityState.security_metrics.anomaly_score = Math.random();
    
    // Auto-adjust security level based on recent activity
    if (securityState.threat_history.length > 0) {
        const recentThreats = securityState.threat_history.filter(
            t => Date.now() - t.timestamp < 300000 // Last 5 minutes
        );
        
        if (recentThreats.length === 0 && securityState.security_level !== 'normal') {
            securityState.security_level = 'normal';
            console.log(`[${NODE_ID}] Security level normalized`);
        }
    }
}, 30000); // Every 30 seconds

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log(`[${NODE_ID}] Security monitoring shutting down...`);
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log(`[${NODE_ID}] Security monitoring shutting down...`);
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`[${NODE_ID}] AI Guard Node listening on port ${PORT}`);
    securityState.lastHeartbeat = Date.now();
});