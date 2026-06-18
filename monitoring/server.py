#!/usr/bin/env python3
"""QA Metrics Server — lightweight dashboard + JSON API"""
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os, sys, socket

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3002
ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

class H(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

srv = HTTPServer(("127.0.0.1", PORT), H)
srv.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
print(f"QA Dashboards: http://localhost:{PORT}/grafana/dashboards/index.html")
print(f"Metrics API:   http://localhost:{PORT}/metrics/")
try:
    srv.serve_forever()
except KeyboardInterrupt:
    srv.server_close()
    print("\nBye.")
