#!/usr/bin/env node

/**
 * OPD-EMR Production Startup Script
 * This script starts the application in production mode
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 OPD-EMR Production Startup');
console.log('==============================');
console.log('');

// Check if build directory exists
const buildPath = path.join(__dirname, 'build');
if (!fs.existsSync(buildPath)) {
    console.log('📦 Building application for production...');
    console.log('');
    
    const buildProcess = spawn('npm', ['run', 'build'], {
        stdio: 'inherit',
        shell: true
    });
    
    buildProcess.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Build completed successfully!');
            console.log('');
            startProductionServer();
        } else {
            console.log('❌ Build failed! Please fix errors and try again.');
            process.exit(1);
        }
    });
} else {
    console.log('✅ Build directory found, starting production server...');
    console.log('');
    startProductionServer();
}

function startProductionServer() {
    console.log('🌐 Starting production server...');
    console.log('');
    
    // Start backend server
    const backendProcess = spawn('node', ['backend/server.js'], {
        stdio: 'inherit',
        shell: true,
        env: {
            ...process.env,
            NODE_ENV: 'production',
            PORT: process.env.PORT || 3001
        }
    });
    
    // Start frontend server (serving build files)
    const frontendProcess = spawn('npx', ['serve', '-s', 'build', '-l', '3000'], {
        stdio: 'inherit',
        shell: true
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
        console.log('');
        console.log('🛑 Shutting down production server...');
        backendProcess.kill();
        frontendProcess.kill();
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        console.log('');
        console.log('🛑 Shutting down production server...');
        backendProcess.kill();
        frontendProcess.kill();
        process.exit(0);
    });
    
    console.log('🎉 Production server started successfully!');
    console.log('');
    console.log('📱 Application URLs:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend:  http://localhost:3001');
    console.log('   Health:   http://localhost:3001/health');
    console.log('');
    console.log('💡 Press Ctrl+C to stop the server');
    console.log('');
}
