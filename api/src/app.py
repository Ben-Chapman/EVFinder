import os

from flask import Flask, request
from flask_cors import CORS

from blueprints.audi import audi
from blueprints.bmw import bmw
from blueprints.chevrolet import chevrolet
from blueprints.ford import ford
from blueprints.logger import logger
from blueprints.genesis import genesis
from blueprints.hyundai import hyundai
from blueprints.kia import kia
from blueprints.vin import vin
from blueprints.volkswagen import volkswagen
from blueprints.window_sticker import ws

from libs.libs import send_error_response
from blueprints.logger import send_gcp_log_message, send_gcp_error_message

app = Flask(__name__)

# Setup CORS handling
CORS(
    app,
    resources=r"/api/*",
    origins=[
        "https://theevfinder.com",
        "https://www.theevfinder.com",
        "http://dev.theevfinder.com",
        "http://bs-local.com:8080",
        "http://localhost:8080",
    ],
    methods=["GET", "POST"],
)

# Register Blueprints
app.register_blueprint(audi)
app.register_blueprint(bmw)
app.register_blueprint(chevrolet)
app.register_blueprint(ford)
app.register_blueprint(logger)
app.register_blueprint(genesis)
app.register_blueprint(hyundai)
app.register_blueprint(kia)
app.register_blueprint(volkswagen)
app.register_blueprint(vin)
app.register_blueprint(ws)


@app.before_request
def validate_source():
    """Validating that the requestor is Cloudflare through the validation of a
    CLOUDFLARE_AUTH env variable, which is accessed through GCP Secrets Manager.
    If the env variable does not exist, permit the request to continue, and log an
    error.
    """
    if "CLOUDFLARE_AUTH" in os.environ:
        clouflare_auth = os.environ.get("CLOUDFLARE_AUTH")
        try:
            request.headers[clouflare_auth]
        except KeyError:
            send_gcp_log_message(
                f"Non-Cloudflare Request: "
                f"{request.remote_addr}, {request.user_agent}, {request.url}"
            )
            return send_error_response(
                error_message="The request could not be validated",
                error_data="",
                status_code=418,
            )
    else:
        send_gcp_error_message("CLOUDFLARE_AUTH Env Variable not found.")
