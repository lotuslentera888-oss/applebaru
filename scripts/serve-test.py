"""Local-only SPA server for functional tests, not a production deployment."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[1] / "frontend" / "build"


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        candidate = ROOT / self.path.split("?", 1)[0].lstrip("/")
        if not candidate.exists() and "." not in candidate.name:
            self.path = "/index.html"
        super().do_GET()


os.chdir(ROOT)
print("Server uji lokal: http://127.0.0.1:4173", flush=True)
ThreadingHTTPServer(("127.0.0.1", 4173), Handler).serve_forever()
