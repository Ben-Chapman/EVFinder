from datetime import datetime
from flask import Blueprint, request

from libs.libs import send_response, send_error_response, validate_request
from libs.http import get

genesis = Blueprint(name="genesis", import_name=__name__)

@genesis.route('/api/inventory/genesis', methods=['GET'])
def get_genesis_inventory():
  request_args = request.args

  zip_code = request_args['zip']
  year = request_args['year']
  model = request_args['model']
  radius = request_args['radius']

  # We'll use the requesting UA to make the request to the Hyundai APIs
  user_agent = request.headers['User-Agent']
  refresh_token = datetime.now().isoformat(timespec='auto').split('T')[0]

  api_url = f'https://www.genesis.com/content/genesis/us/en/services/newinventory.js/model/{model}/type/inventory/refreshToken/{refresh_token}.js'

  params = {
      'zip': zip_code,
      'year': year,
      'model': model,
      'radius': radius,
  }

  headers = {
      'User-Agent': user_agent,
      'referer': f'https://www.genesis.com/us/en/new/inventory/results/year/{year}/model/{model.upper}/zip/{zip_code}'
  }

  if validate_request(params.items()):
    # Make a call to the Genesis API
    g = get(
      url=api_url,
      request_headers=headers,
      query_params={}
      )
    data = g.json()

    if len(data) > 0:
      return send_response(
        response_data=data,
        content_type='application/json',
        cache_control_age=3600
      )
    else:
      error_message = 'An error occured with the Genesis API'
      return send_error_response(
        error_message=error_message,
        error_data=data
      )
  else:
    # Request could not be validated
    return send_error_response(
      error_message='Request could not be validated',
      error_data=request.url,
      status_code=400
      )