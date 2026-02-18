#!/usr/bin/env python3
import argparse
import http.server
import os
import socket
import socketserver
import sys
import time
import webbrowser


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".webmanifest": "application/manifest+json",
        ".js": "application/javascript",
    }

    def log_message(self, fmt, *args):
        # Keep console readable while server is running.
        return


class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


def find_free_port(candidates):
    for port in candidates:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise RuntimeError("No free port available in candidate list.")


def main():
    parser = argparse.ArgumentParser(description="Run Astronomy DZ local server.")
    parser.add_argument("--port", type=int, default=0, help="Optional fixed port.")
    parser.add_argument("--no-browser", action="store_true", help="Do not auto-open browser.")
    args = parser.parse_args()

    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    if args.port > 0:
        port = args.port
    else:
        port = find_free_port([5500, 8080, 8000, 3000, 5173])

    server = ThreadingHTTPServer(("127.0.0.1", port), QuietHandler)
    url = f"http://127.0.0.1:{port}/index.html?t={int(time.time())}"

    print("Astronomy DZ local app is running.")
    print(f"Open: {url}")
    print("Press Ctrl+C to stop.")

    if not args.no_browser:
        webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        print("Server stopped.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Failed to start local server: {exc}")
        sys.exit(1)
