#!/usr/bin/env node

/**
 * OPD-EMR Deployment Testing Script
 * Tests the deployed application functionality
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
    // Update this URL to your deployed application
    BASE_URL: process.env.DEPLOYMENT_URL || 'https://your-app-name.vercel.app',
    TIMEOUT: 10000,
    TESTS: [
        {
            name: 'Frontend Health Check',
            url: '/',
            method: 'GET',
            expectedStatus: 200
        },
        {
            name: 'Backend Health Check',
            url: '/api/health',
            method: 'GET',
            expectedStatus: 200
        },
        {
            name: 'API Auth Endpoint',
            url: '/api/auth/login',
            method: 'POST',
            expectedStatus: 400, // Should return 400 for missing credentials
            body: {}
        },
        {
            name: 'API Patients Endpoint',
            url: '/api/patients',
            method: 'GET',
            expectedStatus: 401 // Should return 401 for unauthorized access
        },
        {
            name: 'API Doctors Endpoint',
            url: '/api/doctors',
            method: 'GET',
            expectedStatus: 401 // Should return 401 for unauthorized access
        }
    ]
};

class DeploymentTester {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
    }

    async runTests() {
        console.log('🧪 OPD-EMR Deployment Testing');
        console.log('============================');
        console.log(`🌐 Testing URL: ${CONFIG.BASE_URL}`);
        console.log(`⏰ Timeout: ${CONFIG.TIMEOUT}ms`);
        console.log('');

        for (const test of CONFIG.TESTS) {
            await this.runTest(test);
        }

        this.printResults();
    }

    async runTest(test) {
        const startTime = Date.now();
        const url = `${CONFIG.BASE_URL}${test.url}`;
        
        console.log(`🔍 Testing: ${test.name}`);
        console.log(`   URL: ${url}`);
        console.log(`   Method: ${test.method}`);
        
        try {
            const result = await this.makeRequest(test);
            const duration = Date.now() - startTime;
            
            const success = result.status === test.expectedStatus;
            const status = success ? '✅ PASS' : '❌ FAIL';
            
            console.log(`   Status: ${status}`);
            console.log(`   Response: ${result.status} ${result.statusText}`);
            console.log(`   Duration: ${duration}ms`);
            
            if (!success) {
                console.log(`   Expected: ${test.expectedStatus}, Got: ${result.status}`);
            }
            
            this.results.push({
                name: test.name,
                success,
                status: result.status,
                expectedStatus: test.expectedStatus,
                duration,
                error: null
            });
            
        } catch (error) {
            const duration = Date.now() - startTime;
            console.log(`   Status: ❌ ERROR`);
            console.log(`   Error: ${error.message}`);
            console.log(`   Duration: ${duration}ms`);
            
            this.results.push({
                name: test.name,
                success: false,
                status: null,
                expectedStatus: test.expectedStatus,
                duration,
                error: error.message
            });
        }
        
        console.log('');
    }

    makeRequest(test) {
        return new Promise((resolve, reject) => {
            const url = new URL(`${CONFIG.BASE_URL}${test.url}`);
            const isHttps = url.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const options = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                method: test.method,
                timeout: CONFIG.TIMEOUT,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'OPD-EMR-Deployment-Tester/1.0'
                }
            };

            if (test.body) {
                const body = JSON.stringify(test.body);
                options.headers['Content-Length'] = Buffer.byteLength(body);
            }

            const req = client.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        statusText: res.statusMessage,
                        headers: res.headers,
                        data: data
                    });
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (test.body) {
                req.write(JSON.stringify(test.body));
            }
            
            req.end();
        });
    }

    printResults() {
        const totalDuration = Date.now() - this.startTime;
        const passed = this.results.filter(r => r.success).length;
        const failed = this.results.filter(r => !r.success).length;
        
        console.log('📊 Test Results Summary');
        console.log('======================');
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⏱️  Total Duration: ${totalDuration}ms`);
        console.log('');
        
        if (failed > 0) {
            console.log('❌ Failed Tests:');
            this.results.filter(r => !r.success).forEach(result => {
                console.log(`   • ${result.name}: ${result.error || `Expected ${result.expectedStatus}, got ${result.status}`}`);
            });
            console.log('');
        }
        
        if (passed === this.results.length) {
            console.log('🎉 All tests passed! Your deployment is working correctly.');
        } else {
            console.log('⚠️  Some tests failed. Please check your deployment configuration.');
        }
        
        console.log('');
        console.log('📋 Next Steps:');
        console.log('1. Test the application manually in your browser');
        console.log('2. Try logging in with demo credentials');
        console.log('3. Test all major features (patients, doctors, prescriptions, billing)');
        console.log('4. Check that data persists (if using persistent database)');
        console.log('');
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    const tester = new DeploymentTester();
    tester.runTests().catch(console.error);
}

module.exports = DeploymentTester;
