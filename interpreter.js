/*
 interpreter.js - AI Interpreter Node
 Symbol analysis and content interpretation
 Provides REST API for symbol decoding and content analysis
*/

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const NODE_ID = 'interpreter';
const PORT = 4001;

// Load private key for signing
const PRIVATE_KEY_PATH = `./keys/${NODE_ID}.key`;
let privateKey = null;
if (fs.existsSync(PRIVATE_KEY_PATH)) {
    privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
}

// Load symbol dictionary
let symbolDict = {};
try {
    symbolDict = require('./symbol_dict.js');
} catch (e) {
    console.warn('[interpreter] symbol_dict.js not found, using empty dictionary');
}

// Interpreter state
const interpreterState = {
    status: 'ready',
    lastHeartbeat: Date.now(),
    interpretations_made: 0,
    symbols_analyzed: 0,
    content_processed: 0,
    interpretation_history: [],
    symbol_confidence: {},
    learning_data: []
};

// Advanced symbol interpretation with context
function interpretSymbolSequence(sequence, context = {}) {
    const interpretation = {
        id: crypto.randomBytes(8).toString('hex'),
        timestamp: Date.now(),
        input_sequence: sequence,
        context: context,
        symbols: [],
        meaning: '',
        confidence: 0,
        alternative_meanings: [],
        semantic_analysis: {}
    };

    // Process each symbol in the sequence
    const symbols = Array.from(sequence);
    let totalConfidence = 0;
    
    symbols.forEach((symbol, index) => {
        const symbolAnalysis = analyzeSymbol(symbol, context, index);
        interpretation.symbols.push(symbolAnalysis);
        totalConfidence += symbolAnalysis.confidence;
    });

    // Calculate overall confidence
    interpretation.confidence = symbols.length > 0 ? totalConfidence / symbols.length : 0;

    // Generate semantic meaning
    interpretation.meaning = generateSemanticMeaning(interpretation.symbols);
    interpretation.alternative_meanings = generateAlternativeMeanings(interpretation.symbols);
    
    // Perform semantic analysis
    interpretation.semantic_analysis = performSemanticAnalysis(interpretation);

    // Update state
    interpreterState.interpretations_made++;
    interpreterState.symbols_analyzed += symbols.length;
    interpreterState.interpretation_history.push(interpretation);

    return interpretation;
}

function analyzeSymbol(symbol, context, position) {
    const analysis = {
        symbol: symbol,
        position: position,
        unicode_value: symbol.charCodeAt(0),
        possible_meanings: [],
        confidence: 0,
        context_relevance: 0,
        frequency_score: 0
    };

    // Check symbol dictionary
    if (symbolDict[symbol]) {
        analysis.possible_meanings = symbolDict[symbol];
        analysis.confidence = 0.8;
    } else {
        // Fallback interpretation based on unicode ranges
        const unicode = symbol.charCodeAt(0);
        if (unicode >= 0x1D400 && unicode <= 0x1D7FF) {
            analysis.possible_meanings = [{ meaning: 'mathematical_symbol', type: 'mathematical' }];
            analysis.confidence = 0.6;
        } else if (unicode >= 0x2600 && unicode <= 0x26FF) {
            analysis.possible_meanings = [{ meaning: 'miscellaneous_symbol', type: 'symbolic' }];
            analysis.confidence = 0.5;
        } else {
            analysis.possible_meanings = [{ meaning: 'unknown_symbol', type: 'unknown' }];
            analysis.confidence = 0.3;
        }
    }

    // Context relevance scoring
    if (context.domain) {
        analysis.context_relevance = calculateContextRelevance(symbol, context.domain);
    }

    // Update symbol confidence tracking
    if (!interpreterState.symbol_confidence[symbol]) {
        interpreterState.symbol_confidence[symbol] = [];
    }
    interpreterState.symbol_confidence[symbol].push(analysis.confidence);

    return analysis;
}

function calculateContextRelevance(symbol, domain) {
    // Mock context relevance calculation
    const domainMappings = {
        'security': 0.8,
        'legal': 0.7,
        'technical': 0.6,
        'general': 0.5
    };
    
    return domainMappings[domain] || 0.5;
}

function generateSemanticMeaning(symbolAnalyses) {
    if (symbolAnalyses.length === 0) return 'empty_sequence';
    
    // Combine meanings from all symbols
    const meanings = symbolAnalyses.map(s => 
        s.possible_meanings.length > 0 ? s.possible_meanings[0].meaning : 'unknown'
    );
    
    // Generate composite meaning
    if (meanings.every(m => m.includes('mathematical'))) {
        return 'mathematical_expression';
    } else if (meanings.some(m => m.includes('security'))) {
        return 'security_related_content';
    } else if (meanings.some(m => m.includes('legal'))) {
        return 'legal_document_fragment';
    } else {
        return 'mixed_symbolic_content';
    }
}

function generateAlternativeMeanings(symbolAnalyses) {
    const alternatives = [];
    
    // Generate alternative interpretations
    alternatives.push('encoded_message');
    alternatives.push('cipher_text');
    alternatives.push('symbolic_representation');
    
    if (symbolAnalyses.length > 10) {
        alternatives.push('complex_document');
    }
    
    return alternatives;
}

function performSemanticAnalysis(interpretation) {
    return {
        complexity_score: Math.min(interpretation.symbols.length / 10, 1.0),
        coherence_score: interpretation.confidence,
        novelty_score: Math.random() * 0.5 + 0.5, // Mock novelty
        semantic_density: interpretation.symbols.length > 0 ? 
            interpretation.symbols.filter(s => s.confidence > 0.7).length / interpretation.symbols.length : 0
    };
}

// Generate interpretation vote for quorum decisions
function generateInterpretationVote(proposal) {
    const vote = {
        nodeId: NODE_ID,
        proposalId: proposal.id,
        decision: null,
        confidence: 0,
        interpretation_analysis: {},
        reasoning: [],
        timestamp: Date.now()
    };

    // Interpretation-focused voting logic
    if (proposal.type === 'self_destruct') {
        // Analyze the semantic content of the proposal
        if (proposal.content_analysis && proposal.content_analysis.threat_indicators > 5) {
            vote.decision = 'approve';
            vote.confidence = 0.80;
            vote.reasoning.push('Content analysis indicates genuine threat');
        } else if (proposal.linguistic_patterns && proposal.linguistic_patterns.authenticity < 0.5) {
            vote.decision = 'reject';
            vote.confidence = 0.85;
            vote.reasoning.push('Linguistic analysis suggests false alarm');
        } else {
            vote.decision = 'abstain';
            vote.confidence = 0.60;
            vote.reasoning.push('Insufficient semantic evidence for decision');
        }
    } else if (proposal.type === 'content_validation') {
        vote.decision = 'approve';
        vote.confidence = 0.90;
        vote.reasoning.push('Content validation is within interpreter expertise');
    }

    vote.interpretation_analysis = {
        semantic_coherence: Math.random() * 0.4 + 0.6,
        content_authenticity: Math.random() * 0.3 + 0.7,
        linguistic_patterns: 'normal'
    };

    return vote;
}

// API Endpoints
app.get('/status', (req, res) => {
    res.json({
        nodeId: NODE_ID,
        status: interpreterState.status,
        uptime: Date.now() - interpreterState.lastHeartbeat,
        interpretations_made: interpreterState.interpretations_made,
        symbols_analyzed: interpreterState.symbols_analyzed,
        content_processed: interpreterState.content_processed,
        symbol_dictionary_size: Object.keys(symbolDict).length
    });
});

app.post('/heartbeat', (req, res) => {
    interpreterState.lastHeartbeat = Date.now();
    interpreterState.status = 'ready';
    console.log(`[${NODE_ID}] Interpreter heartbeat received`);
    res.json({ status: 'ready', timestamp: interpreterState.lastHeartbeat });
});

app.post('/interpret', (req, res) => {
    const { sequence, context } = req.body;
    if (!sequence) {
        return res.status(400).json({ error: 'No sequence provided for interpretation' });
    }

    const interpretation = interpretSymbolSequence(sequence, context || {});
    console.log(`[${NODE_ID}] Interpreted sequence:`, interpretation.meaning);
    
    res.json({
        success: true,
        interpretation: interpretation,
        nodeId: NODE_ID
    });
});

app.post('/analyze-content', (req, res) => {
    const { content, analysis_type } = req.body;
    if (!content) {
        return res.status(400).json({ error: 'No content provided for analysis' });
    }

    const analysis = {
        id: crypto.randomBytes(8).toString('hex'),
        timestamp: Date.now(),
        content_type: analysis_type || 'general',
        content_length: content.length,
        linguistic_features: {
            complexity: Math.random() * 0.5 + 0.5,
            coherence: Math.random() * 0.4 + 0.6,
            authenticity: Math.random() * 0.3 + 0.7
        },
        semantic_markers: [],
        threat_indicators: Math.floor(Math.random() * 3),
        confidence: 0.75 + Math.random() * 0.2
    };

    // Mock semantic analysis
    if (content.includes('destroy') || content.includes('attack')) {
        analysis.threat_indicators += 2;
        analysis.semantic_markers.push('aggressive_language');
    }

    if (content.includes('secure') || content.includes('protect')) {
        analysis.semantic_markers.push('security_focused');
    }

    interpreterState.content_processed++;
    console.log(`[${NODE_ID}] Content analyzed:`, analysis.content_type);
    
    res.json({
        success: true,
        analysis: analysis,
        nodeId: NODE_ID
    });
});

app.post('/vote', (req, res) => {
    const proposal = req.body;
    if (!proposal || !proposal.id || !proposal.type) {
        return res.status(400).json({ error: 'Invalid proposal provided' });
    }

    const vote = generateInterpretationVote(proposal);
    console.log(`[${NODE_ID}] Interpretation vote cast:`, vote.decision, 'for proposal', proposal.id);
    
    res.json({
        success: true,
        vote: vote,
        nodeId: NODE_ID
    });
});

app.get('/symbol-stats', (req, res) => {
    const stats = {
        total_symbols_known: Object.keys(symbolDict).length,
        symbols_encountered: Object.keys(interpreterState.symbol_confidence).length,
        average_confidence: 0,
        most_frequent_symbols: [],
        interpretation_accuracy: 0.85 + Math.random() * 0.1
    };

    // Calculate average confidence
    const allConfidences = Object.values(interpreterState.symbol_confidence).flat();
    if (allConfidences.length > 0) {
        stats.average_confidence = allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length;
    }

    res.json({
        success: true,
        stats: stats,
        nodeId: NODE_ID
    });
});

app.get('/generate-jwt', (req, res) => {
    if (!privateKey) {
        return res.status(500).json({ error: 'Private key not available' });
    }

    const payload = {
        nodeId: NODE_ID,
        role: 'interpreter',
        timestamp: Date.now(),
        specialization: 'symbol_analysis',
        capabilities: ['symbol_interpretation', 'content_analysis', 'semantic_processing']
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

// Periodic learning and optimization
setInterval(() => {
    // Simulate continuous learning
    if (interpreterState.interpretation_history.length > 0) {
        const recentInterpretations = interpreterState.interpretation_history.slice(-10);
        const avgConfidence = recentInterpretations.reduce((sum, i) => sum + i.confidence, 0) / recentInterpretations.length;
        
        if (avgConfidence > 0.8) {
            console.log(`[${NODE_ID}] High interpretation confidence maintained: ${avgConfidence.toFixed(3)}`);
        }
    }
}, 60000); // Every minute

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log(`[${NODE_ID}] Interpreter shutting down...`);
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log(`[${NODE_ID}] Interpreter shutting down...`);
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`[${NODE_ID}] AI Interpreter Node listening on port ${PORT}`);
    interpreterState.lastHeartbeat = Date.now();
});