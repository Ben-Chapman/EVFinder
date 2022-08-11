from distutils.log import error
from os import stat
from tempfile import TemporaryFile
from flask import Blueprint, jsonify, request

from libs.libs import flatten_api_results, send_error_response, send_response, validate_request
from libs.http import get

hyundai = Blueprint(name="hyundai", import_name=__name__)
import requests
import logging
logging.getLogger('flask_cors').level = logging.DEBUG

@hyundai.route('/api/inventory', methods=['GET'])
@hyundai.route('/api/inventory/hyundai', methods=['GET'])
def get_inventory():
  request_args = request.args

  zip_code = request_args['zip']
  year = request_args['year']
  model = request_args['model']
  radius = request_args['radius']

  # We'll use the requesting UA to make the request to the Hyundai APIs
  user_agent = request.headers['User-Agent']
  api_url = 'https://www.hyundaiusa.com/var/hyundai/services/inventory/vehicleList.json'
  params = {
      'zip': zip_code,
      'year': year,
      'model': model,
      'radius': radius,
  } 
  headers = {
      'User-Agent': user_agent,
      'referer': 'https://www.hyundaiusa.com/us/en/vehicles'
  }

  if validate_request(params.items()):
    # g = requests.get(url=api_url, params=params, headers=headers)
    # Make a call to the Hyundai API
    g = get(
      url=api_url,
      query_params=params,
      request_headers=headers
      )
    data = g.json()
    # Ensure the reponse back from the API has some status, indicating a successful
    # API call
    try:
      data['status']
    except KeyError:
      return send_error_response(
        error_message='Invalid data received from the Hyundai API',
        error_data=data,
        status_code=500
      )
    
    if 'SUCCESS' in data['status']:
      try:
        request_args['v2']
        return send_response(data, 'application/json', 3600)
      except KeyError:
        return send_response(flatten_api_results(data), 'application/json', 3600)
    else:
      return send_error_response(
        error_message='Received invalid data from the Hyundai API',
        error_data=data,
        status_code=400
      )
  else:
    # Request could not be validated
    return send_error_response(
      error_message='Request could not be validated',
      error_data=request.url,
      status_code=400
      )

@hyundai.route('/api/inventory/test', methods=['GET'])
def testing():
  return send_response({'testing': 'working'}, 'application/json', 3600)
  # return send_error_response(
  #       error_message='Received invalid data from the Hyundai API',
  #       error_data={'testing': 'working'},
  #       status_code=400
  #     )