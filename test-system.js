#!/usr/bin/env node
/*
 test-system.js - Comprehensive System Testing
 Tests all components of the Final Sendec System
*/

const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');

const BASE_URL = 'http://127.0.0.1';
const ORCHESTRATOR_PORT = 6000;
const SERVICES = {
    orchestrator: 6000,
    sendec: 3000,
    token_sss: 5000,
    interpreter: 4001,
    guard: 4002,
    coordinator: 4003,
    selfdestruct: 5501,
    token_gen: 5502
};

let orchestratorProcess = null;
let testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

function log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
}

function addTestResult(testName, passed, message = '') {
    testResults.tests.push({
        name: testName,
        passed: passed,
        message: message,
        timestamp: new Date().toISOString()
    });
    
    if (passed) {
        testResults.passed++;
        log(`✅ ${testName}: PASSED ${message}`, 'PASS');
    } else {
        testResults.failed++;
        log(`❌ ${testName}: FAILED ${message}`, 'FAIL');
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startOrchestrator() {
    log('Starting orchestrator system...');
    
    orchestratorProcess = spawn('node', ['final-sendec-system.js'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe']
    });
    
    orchestratorProcess.stdout.on('data', (data) => {
        // Suppress orchestrator output during testing
    });
    
    orchestratorProcess.stderr.on('data', (data) => {
        log(`Orchestrator error: ${data}`, 'ERROR');
    });
    
    // Wait for services to start
    await sleep(5000);
    
    return orchestratorProcess;
}

async function stopOrchestrator() {
    if (orchestratorProcess) {
        log('Stopping orchestrator system...');
        orchestratorProcess.kill('SIGTERM');
        await sleep(2000);
    }
}

async function testServiceHealth(serviceName, port) {
    try {
        const response = await axios.get(`${BASE_URL}:${port}/status`, {
            timeout: 3000
        });
        
        if (response.status === 200) {
            addTestResult(`Service Health - ${serviceName}`, true, `Port ${port} responding`);
            return true;
        } else {
            addTestResult(`Service Health - ${serviceName}`, false, `Unexpected status: ${response.status}`);
            return false;
        }
    } catch (error) {
        addTestResult(`Service Health - ${serviceName}`, false, `Connection failed: ${error.message}`);
        return false;
    }
}

async function testOrchestratorAPI() {
    try {
        // Test status endpoint
        const statusResponse = await axios.get(`${BASE_URL}:${ORCHESTRATOR_PORT}/status`);
        const status = statusResponse.data;
        
        if (status.services && Array.isArray(status.services)) {
            addTestResult('Orchestrator Status API', true, `${status.services.length} services reported`);
        } else {
            addTestResult('Orchestrator Status API', false, 'Invalid status response format');
            return false;
        }
        
        // Test JWT generation
        const jwtResponse = await axios.get(`${BASE_URL}:${ORCHESTRATOR_PORT}/generate-jwt?node=coordinator`);
        const jwtData = jwtResponse.data;
        
        if (jwtData.token && jwtData.nodeId === 'coordinator') {
            addTestResult('JWT Generation', true, 'Coordinator JWT generated successfully');
        } else {
            addTestResult('JWT Generation', false, 'Invalid JWT response');
            return false;
        }
        
        return true;
    } catch (error) {
        addTestResult('Orchestrator API', false, `API test failed: ${error.message}`);
        return false;
    }
}

async function testAINodes() {
    const aiNodes = ['coordinator', 'guard', 'interpreter'];
    
    for (const node of aiNodes) {
        const port = SERVICES[node];
        
        try {
            // Test status endpoint
            const statusResponse = await axios.get(`${BASE_URL}:${port}/status`);
            const status = statusResponse.data;
            
            if (status.nodeId === node) {
                addTestResult(`AI Node - ${node} Status`, true, `Node responding correctly`);
            } else {
                addTestResult(`AI Node - ${node} Status`, false, `Incorrect nodeId: ${status.nodeId}`);
                continue;
            }
            
            // Test heartbeat
            const heartbeatResponse = await axios.post(`${BASE_URL}:${port}/heartbeat`, {});
            if (heartbeatResponse.status === 200) {
                addTestResult(`AI Node - ${node} Heartbeat`, true, 'Heartbeat successful');
            } else {
                addTestResult(`AI Node - ${node} Heartbeat`, false, `Heartbeat failed`);
            }
            
        } catch (error) {
            addTestResult(`AI Node - ${node}`, false, `Node test failed: ${error.message}`);
        }
    }
}

async function testSendecCore() {
    try {
        // Test ephemeral token generation
        const ephemeralResponse = await axios.get(`${BASE_URL}:${SERVICES.sendec}/get-ephemeral?clientId=test`);
        const ephemeralData = ephemeralResponse.data;
        
        if (ephemeralData.token && ephemeralData.expires) {
            addTestResult('Sendec Ephemeral Token', true, 'Token generated successfully');
            
            // Test key fetch with the token
            const keyResponse = await axios.get(`${BASE_URL}:${SERVICES.sendec}/fetch-key?token=${ephemeralData.token}`);
            const keyData = keyResponse.data;
            
            if (keyData.key) {
                addTestResult('Sendec Key Fetch', true, 'Key retrieved successfully');
            } else {
                addTestResult('Sendec Key Fetch', false, 'No key in response');
            }
        } else {
            addTestResult('Sendec Ephemeral Token', false, 'Invalid token response');
        }
        
    } catch (error) {
        addTestResult('Sendec Core', false, `Core test failed: ${error.message}`);
    }
}

async function generateTestReport() {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total: testResults.passed + testResults.failed,
            passed: testResults.passed,
            failed: testResults.failed,
            success_rate: ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2) + '%'
        },
        tests: testResults.tests
    };
    
    // Write report to file
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    
    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('🧪 FINAL SENDEC SYSTEM - TEST REPORT');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${report.summary.total}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`📈 Success Rate: ${report.summary.success_rate}`);
    console.log('='.repeat(60));
    
    if (testResults.failed > 0) {
        console.log('\n❌ FAILED TESTS:');
        testResults.tests.filter(t => !t.passed).forEach(test => {
            console.log(`   • ${test.name}: ${test.message}`);
        });
    }
    
    console.log(`\n📄 Detailed report saved to: test-report.json`);
    
    return report;
}

async function runAllTests() {
    log('🚀 Starting Final Sendec System Tests...');
    
    try {
        // Start the system
        await startOrchestrator();
        
        // Wait for all services to be ready
        log('⏳ Waiting for services to initialize...');
        await sleep(3000);
        
        // Run tests
        log('🧪 Running orchestrator tests...');
        await testOrchestratorAPI();
        
        log('🧪 Testing service health...');
        for (const [serviceName, port] of Object.entries(SERVICES)) {
            if (serviceName !== 'orchestrator') {
                await testServiceHealth(serviceName, port);
            }
        }
        
        log('🧪 Testing AI nodes...');
        await testAINodes();
        
        log('🧪 Testing Sendec core...');
        await testSendecCore();
        
    } catch (error) {
        log(`💥 Test execution error: ${error.message}`, 'ERROR');
        addTestResult('Test Execution', false, error.message);
    } finally {
        // Stop the system
        await stopOrchestrator();
        
        // Generate report
        const report = await generateTestReport();
        
        // Exit with appropriate code
        process.exit(testResults.failed > 0 ? 1 : 0);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    log('🛑 Test interrupted, cleaning up...');
    await stopOrchestrator();
    process.exit(1);
});

process.on('SIGTERM', async () => {
    log('🛑 Test terminated, cleaning up...');
    await stopOrchestrator();
    process.exit(1);
});

// Run tests if called directly
if (require.main === module) {
    runAllTests().catch(error => {
        log(`💥 Unhandled error: ${error.message}`, 'ERROR');
        process.exit(1);
    });
}

module.exports = {
    runAllTests,
    testResults
};