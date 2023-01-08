#!/usr/bin/env python3
import os
import signal
import subprocess
import sys
from app import app


def signal_handler(sig, frame):
    sys.exit(0)


if __name__ == "__main__":
    # Enable Python to use Proxyman intermediate certs if Proxyman is running
    print("Using Proxyman Intermediate Certs")
    if subprocess.run(["pgrep", "Proxyman"]).returncode == 0:
        os.environ["SSL_CERT_FILE"] = os.path.expanduser("~/.proxyman/proxyman-ca.pem")
        os.environ["REQUESTS_CA_BUNDLE"] = os.path.expanduser(
            "~/.proxyman/proxyman-ca.pem"
        )

    signal.signal(signal.SIGINT, signal_handler)

    app.run(debug=True, host="0.0.0.0", port=8081)
