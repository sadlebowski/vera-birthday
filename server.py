import http.server
import socketserver
import os
import sys
import urllib.parse

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class DualDirectoryHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def translate_path(self, path):
        # First check root directory, then check public/
        clean_path = urllib.parse.unquote(path.split('?', 1)[0].split('#', 1)[0])
        rel_path = clean_path.lstrip('/').replace('/', os.sep)
        if not rel_path:
            rel_path = 'index.html'

        target1 = os.path.join(DIRECTORY, rel_path)
        if os.path.exists(target1):
            return target1

        target2 = os.path.join(DIRECTORY, 'public', rel_path)
        if os.path.exists(target2):
            return target2

        return target1

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_POST(self):
        if self.path.startswith('/api/save_screenshot'):
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            import json, base64
            data = json.loads(post_data.decode('utf-8'))
            filename = data.get('filename', 'canvas_screenshot.png')
            b64_str = data.get('data', '')
            if ',' in b64_str:
                b64_str = b64_str.split(',', 1)[1]
            img_bytes = base64.b64decode(b64_str)
            
            artifact_dir = os.environ.get('ANTIGRAVITY_ARTIFACT_DIR', r'C:\Users\jackn\.gemini\antigravity\brain\09fa4cd8-2284-49eb-8ac2-4995a3a7e6ac')
            os.makedirs(artifact_dir, exist_ok=True)
            out_file = os.path.join(artifact_dir, filename)
            with open(out_file, 'wb') as f:
                f.write(img_bytes)
            # Also save copy in scratch directory for easy local access
            scratch_dir = os.path.join(DIRECTORY, 'scratch')
            os.makedirs(scratch_dir, exist_ok=True)
            with open(os.path.join(scratch_dir, filename), 'wb') as f:
                f.write(img_bytes)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "ok"}')
            return
        
        self.send_response(404)
        self.end_headers()

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

if __name__ == '__main__':
    import webbrowser
    import threading
    import time

    port = PORT
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])

    server = None
    try:
        server = ThreadedHTTPServer(('0.0.0.0', port), DualDirectoryHandler)
    except OSError as e:
        # Check if an existing server is already alive and serving on this port
        try:
            import urllib.request
            resp = urllib.request.urlopen(f"http://localhost:{port}/", timeout=1.0)
            if resp.getcode() == 200:
                print("=" * 60)
                print(f"  * Otkrytka dlya Very uzhe rabotaet: http://localhost:{port}/ *")
                print(f"  * Otkryvaem brauzer... *")
                print("=" * 60)
                if '--no-browser' not in sys.argv:
                    webbrowser.open(f"http://localhost:{port}/")
                sys.exit(0)
        except Exception:
            pass

        print(f"Port {port} zanyat, podbiraem sleduyushchij svobodnyj port...")
        for p in range(port + 1, port + 10):
            try:
                server = ThreadedHTTPServer(('0.0.0.0', p), DualDirectoryHandler)
                port = p
                break
            except OSError:
                continue

    if not server:
        print(f"Error: Could not bind server to any port near {PORT}")
        sys.exit(1)

    url = f"http://localhost:{port}/"
    print("=" * 60)
    print(f"  [OK] Otkrytka dlya Very zapushchena!")
    print(f"  Adres: {url}")
    print(f"  Otkryvaem brauzer...")
    print("=" * 60)

    if '--no-browser' not in sys.argv:
        def _open():
            time.sleep(0.6)
            try:
                webbrowser.open(url)
            except Exception:
                pass
        threading.Thread(target=_open, daemon=True).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
