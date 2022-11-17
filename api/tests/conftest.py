# flake8: noqa

import pytest
import subprocess
import time

# https://lyz-code.github.io/blue-book/pytest_httpserver/
# @pytest.fixture(scope="session", autouse=True)
# def start_web_server():
#     # https://til.simonwillison.net/pytest/subprocess-server
#     webserver = subprocess.Popen(
#         ["python3", "/Users/ben/src/EVFinder/api/src/run.py"],
#         stdout=subprocess.PIPE,
#         stderr=subprocess.STDOUT,
#     )
#     yield webserver


# retries = 5
# while retries > 0:
#     conn = requests.get
#     try:
#         conn.request("HEAD", "/")
#         response = conn.getresponse()
#         if response is not None:
#             yield webserver
#             break
#     except ConnectionRefusedError:
#         time.sleep(1)
#         retries -= 1

# if not retries:
#     raise RuntimeError("Failed to start http server")
# else:
#     webserver.terminate()
#     webserver.wait()
