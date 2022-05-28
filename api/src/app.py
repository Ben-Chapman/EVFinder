import os

from flask import Flask, jsonify, request, make_response
from flask_cors import CORS

from blueprints.genesis import genesis
from blueprints.hyundai import hyundai
from blueprints.kia import kia
from blueprints.vin import vin
from blueprints.window_sticker import ws

app = Flask(__name__)

# Setup CORS handling
CORS(
  app, 
  resources=r'/api/*',
  origins=[
    "http://localhost:8080",
    "https://theevfinder.com",
    "https://www.theevfinder.com",
    
  ],
  methods="GET"
  )

# Register Blueprints
app.register_blueprint(genesis)
app.register_blueprint(hyundai)
app.register_blueprint(kia)
app.register_blueprint(vin)
app.register_blueprint(ws)

# Ensure we only serve traffic sourced from Cloudflare
# This will run for all routes in this app
@app.before_request
def validate_source():
  clouflare_auth = os.environ.get('CLOUDFLARE_AUTH')
  try:
    request.headers[clouflare_auth]
  except KeyError:
    return make_response(jsonify(''), 418)