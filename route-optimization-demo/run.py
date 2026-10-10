"""Start a local routing demo; no model download or training is needed."""
import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=9000)
    args = parser.parse_args()
    if not (ROOT / "data/scenarios.json").exists():
        subprocess.run([sys.executable, "-m", "app.data"], cwd=ROOT, check=True)
    print(f"Open http://127.0.0.1:{args.port}. Ctrl+C stops the server.", flush=True)
    subprocess.run([sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", str(args.port)], cwd=ROOT, check=True)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nDemo stopped.")
