#!/usr/bin/env python3
"""
Simple HTTP server for testing the NovaVault landing page locally.
Run with: python3 server.py
Then open http://localhost:8000 in your browser.
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

PORT = 8080

# Change to the directory containing this script
os.chdir(Path(__file__).parent)

if __name__ == "__main__":
    try:
        with socketserver.TCPServer(("", PORT), http.server.SimpleHTTPRequestHandler) as httpd:
            print(f"🚀 NovaVault landing page server running on http://localhost:{PORT}")
            print("📱 Open this URL in your browser to view the page")
            print("🛑 Press Ctrl+C to stop the server")
            
            # Automatically open browser
            webbrowser.open(f'http://localhost:{PORT}')
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n⏹️  Server stopped")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use. Try a different port or stop the existing server.")
        else:
            print(f"❌ Error starting server: {e}")