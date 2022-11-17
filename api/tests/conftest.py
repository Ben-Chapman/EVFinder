import os
import pytest
import subprocess
import time


@pytest.fixture(scope="session", autouse=True)
def start_web_server():
    # https://til.simonwillison.net/pytest/subprocess-server
    cwd = os.getcwd()
    if "api" not in cwd.split("/")[-1]:
        print("Test initialization failed. cd to EVFinder/api and retry.")

    web_server = subprocess.Popen(
        ["python3", f"{cwd}/src/run.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    time.sleep(3)  # Allow time for the Flask server to startup
    yield web_server

    print("Terminating Web Server")
    web_server.terminate()
    outs, errs = web_server.communicate()
