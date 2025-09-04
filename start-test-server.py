#!/usr/bin/env python3
"""
Simple HTTP Server for Testing the Doctors API
This script starts a local web server to serve the HTML test files
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

def start_server():
    # Get the current directory
    current_dir = Path(__file__).parent.absolute()
    
    # Change to the project directory
    os.chdir(current_dir)
    
    # Server configuration
    PORT = 8000
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print("🚀 [TEST SERVER] Starting HTTP server...")
            print(f"📁 [TEST SERVER] Serving directory: {current_dir}")
            print(f"🌐 [TEST SERVER] Server running on: http://localhost:{PORT}")
            print(f"🔗 [TEST SERVER] Test page: http://localhost:{PORT}/test-cors-fix.html")
            print(f"🔗 [TEST SERVER] API test page: http://localhost:{PORT}/test-doctors-api.html")
            print("=" * 60)
            print("✅ [TEST SERVER] Server started successfully!")
            print("📋 [TEST SERVER] Available test pages:")
            print("   - test-cors-fix.html (CORS troubleshooting)")
            print("   - test-doctors-api.html (Full API testing)")
            print("=" * 60)
            print("🛑 [TEST SERVER] Press Ctrl+C to stop the server")
            print()
            
            # Open the test page in browser
            test_url = f"http://localhost:{PORT}/test-cors-fix.html"
            print(f"🌐 [TEST SERVER] Opening test page: {test_url}")
            webbrowser.open(test_url)
            
            # Start serving
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 [TEST SERVER] Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 10048:  # Port already in use on Windows
            print(f"❌ [TEST SERVER] Port {PORT} is already in use!")
            print(f"💡 [TEST SERVER] Try using a different port or stop the existing server")
            print(f"💡 [TEST SERVER] You can also manually open: http://localhost:{PORT}/test-cors-fix.html")
        else:
            print(f"❌ [TEST SERVER] Error starting server: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ [TEST SERVER] Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_server()
