"""Local-only SPA server for functional tests, not production hosting."""
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os

parser = argparse.ArgumentParser()
parser.add_argument("--port", type=int, default=4173)
parser.add_argument("--root", default="frontend/build")
args = parser.parse_args()
ROOT = (Path(__file__).resolve().parents[1] / args.root).resolve()


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        candidate = ROOT / self.path.split("?", 1)[0].lstrip("/")
        if not candidate.exists() and "." not in candidate.name:
            self.path = "/index.html"
        super().do_GET()


os.chdir(ROOT)
print(f"Server uji lokal: http://127.0.0.1:{args.port} ({ROOT})", flush=True)
ThreadingHTTPServer(("127.0.0.1", args.port), Handler).serve_forever()
