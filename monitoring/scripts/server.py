#!/usr/bin/env python3
"""QA Metrics Dashboard — serves JSON metrics + dashboards"""
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class QAHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

HTTPServer(("0.0.0.0", 3002), QAHandler).serve_forever()
