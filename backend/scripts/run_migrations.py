"""Convenience script to run Alembic migrations programmatically."""
import os
import sys
import subprocess

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run Alembic migrations")
    parser.add_argument(
        "command",
        choices=["upgrade", "downgrade", "current", "history", "heads", "revision"],
        default="upgrade",
        nargs="?",
        help="Alembic command to run (default: upgrade)",
    )
    parser.add_argument(
        "revision",
        nargs="?",
        default="head",
        help="Target revision (default: head)",
    )
    args = parser.parse_args()

    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cmd = [sys.executable, "-m", "alembic", args.command]
    if args.command in ["upgrade", "downgrade"]:
        cmd.append(args.revision)

    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=backend_dir)
    sys.exit(result.returncode)
