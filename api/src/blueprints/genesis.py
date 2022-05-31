from flask import Blueprint, jsonify, request

from libs.libs import flatten_api_results, send_response, validate_request
from libs.http import get

genesis = Blueprint(name="genesis", import_name=__name__)

@genesis.route('/api/inventory/genesis', methods=['GET'])
def get_genesis_inventory():
  pass