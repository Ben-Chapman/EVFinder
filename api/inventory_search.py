from codecs import ignore_errors
import logging
import json
import os
import requests

from flask import Flask, request, make_response
from flask_cors import CORS
from http.client import HTTPConnection

app = Flask(__name__)
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

@app.route('/api/inventory')
def get_inventory():
  
  request_args = request.args

  zip_code = request_args['zip']
  year = request_args['year']
  model = request_args['model']
  radius = request_args['radius']

  # Fetches data from the Hyundai API
  api_url = 'https://www.hyundaiusa.com/var/hyundai/services/inventory/vehicleList.json'

  params = {
      'zip': zip_code,
      'year': year,
      'model': model,
      'radius': radius,
  }
  valid_request = True
  for k, v in params.items():
    if not validate_request(k, v):
      valid_request = False
      break
  
  # Ensure we only serve traffic sourced from Cloudflare
  try:
    request.headers['CF-RAY']
  except KeyError as e:
    print(f'Non-CF Access - {request.headers}')
    return json.dumps({}), 418

  if valid_request:
    # We'll use the requesting UA to make the request to the Hyundai APIs
    user_agent = request.headers['User-Agent']

    headers = {
        'User-Agent': user_agent,
        'referer': 'https://www.hyundaiusa.com/us/en/vehicles'
    }
    # For local/offline testing
    if os.environ.get('API_ENV'):
      with open('./tests/vehicles_data.json', 'r') as f:
        data = json.loads(f.read())

      print(f'\nUser agent for this request is: {user_agent}')
      return send_response(flatten_api_results(data), 'application/json', 0)

    try:
      r = requests.get(api_url, params=params, headers=headers)
      data = r.json()
    except requests.exceptions.RequestException as e:
      print(f'Request Error: {e}')
      request_debug = {
        'Content': r.content, 
        'Elapsed': r.elapsed, 
        'Headers': r.headers, 
        'Is_OK': r.ok, 
        'Reason': r.reason, 
        'Request_Type': r.request, 
        'Status_Code': r.status_code, 
        'Request_URL': r.url,
      }
      print(request_debug)
      
      return '{}', 500

    if 'SUCCESS' in data['status']:
      return send_response(flatten_api_results(data), 'application/json', 3600)
  else:  # Invalid request
    return json.dumps({'message': 'Invalid Request'}), 500


@app.route('/api/vin')
def get_vin_details():
  request_args = request.args
  model = request_args['model']
  year = request_args['year']
  vin = request_args['vin']

  # Fetches data from the Hyundai API
  api_url = 'https://www.hyundaiusa.com/var/hyundai/services/inventory/vehicleDetails.vin.json'
  params = {
      'model': model,
      'year': year,
      'vin': vin,
      'brand': 'hyundai',
  }

  # We'll use the requesting UA to make the request to the Hyundai APIs
  user_agent = request.headers['User-Agent']
  headers = {
      'authority': 'www.hyundaiusa.com',
      'User-Agent': user_agent,
      'referer': f'https://www.hyundaiusa.com/us/en/inventory-search/details?model={model.capitalize()}&year={year}&vin={vin}',
  }

  # For local/offline testing
  if os.environ.get('API_ENV'):
    with open('./tests/vin_data.json', 'r') as f:
      data = json.loads(f.read())

    print(f'\nUser agent for this request is: {user_agent}')
    return send_response(data, 'application/json', 0)

  try:
    r = requests.get(api_url, params=params, headers=headers)
    data = r.json()
  except requests.exceptions.RequestException as e:
    print(f'Request Error: {e}')
    request_debug = {
      'Content': r.content, 
      'Elapsed': r.elapsed, 
      'Headers': r.headers, 
      'Is_OK': r.ok, 
      'Reason': r.reason, 
      'Request_Type': r.request, 
      'Status_Code': r.status_code, 
      'Request_URL': r.url
    }
    print(request_debug)
    return '{}', 500

  if 'SUCCESS' in data['status']:
    return send_response(data, 'application/json', 3600)
  

@app.route('/api/ws')
def get_window_sticker():
  request_args = request.args

  model = request_args['model']
  year = request_args['year']
  vin = request_args['vin']

  # Fetches data from the Hyundai API
  api_url = 'https://www.hyundaiusa.com/var/hyundai/services/inventory/monroney.pdf'

  # We'll use the requesting UA to make the request to the Hyundai APIs
  user_agent = request.headers['User-Agent']

  headers = {
      'User-Agent': user_agent,
      'Referer': f'https://www.hyundaiusa.com/us/en/inventory-search/details?model={model}&year={year}&vin={vin}'
  }

  params = {
      'model': model.replace(' ', '-'),
      'vin': vin,
  }
  
  try:
    r = requests.get(api_url, params=params, headers=headers, verify=False)
    window_sticker_pdf = r.content
  except requests.exceptions.RequestException as e:
    print(f'Request Error: {e}')
    # request_debug = {
    #   'Elapsed': r.elapsed, 
    #   'Headers': r.headers, 
    #   'Is_OK': r.ok,
    #   'Reason': r.reason, 
    #   'Request_Type': r.request, 
    #   'Status_Code': r.status_code, 
    #   'Request_URL': r.url
    # }
    # print(request_debug)
    return '', 500

  if r.status_code == 200:
    return send_response(window_sticker_pdf, 'application/pdf', 86400)

def flatten_api_results(input_data: str):
  tmp = []
  input_data = input_data['data'][0]['dealerInfo']

  if input_data:
    for dealer in range(0, len(input_data)):
      for k, v in input_data[dealer].items():
        if 'vehicles' in k and v is not None:
          for i in range(0, len(v)):
            tmp.append({**input_data[dealer], **input_data[dealer]['vehicles'][i]})

    for i in range(0, len(tmp)):
        del tmp[i]['vehicles']

        tmp[i]['ExtColorLongDesc'] = tmp[i]['colors'][0]['ExtColorLongDesc']

    return json.dumps(tmp)
  else:
    return json.dumps({})

def send_response(response_data, content_type, cache_control_age):
  response = make_response(response_data)
  response.headers = {
    'Content-Type': content_type,
    'Cache-Control': f'public, max-age={cache_control_age}, immutable',
  }
  return response

def validate_request(validation_type, validation_data):
  # https://facts.usps.com/42000-zip-codes/
  valid_zip_codes = [501, 99950]  # Starting zip code is 00501
  valid_years = ['2022']
  valid_models = [
    'Ioniq%205',
    'Ioniq%20Phev',
    'Kona%20Ev',
    'Santa%20Fe%20Phev',
    'Sonata%20Hev',
    'Tucson%20Phev'
    ]
  valid_radii = [1, 999]
  valid_vins = []

  if validation_type == 'zip':
    # Can zip be cast to an int
    try:
      int(validation_data)
    except ValueError as e:
      return False

    if len(validation_data) != 5:  # Zip too short
      return False
    
    return (int(validation_data) >= valid_zip_codes[0] and int(validation_data) <= valid_zip_codes[1])

  elif validation_type == 'year':
    return validation_data in valid_years

  elif validation_type == 'model':
    return validation_data in valid_models

  elif validation_type == 'radius':
    # Can radius be cast to an int
    try:
      int(validation_data)
    except ValueError as e:
      return False
    return (int(validation_data) >= valid_radii[0] and int(validation_data) <= valid_radii[1])


if os.environ.get('API_ENV_DEBUG'):
    # Requests Debugging
    requests_log = logging.getLogger('urllib3')
    requests_log.setLevel(logging.DEBUG)

    # logging from urllib3 to console
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    requests_log.addHandler(ch)
    HTTPConnection.debuglevel = 1

    # Flask CORS logging
    logging.basicConfig(level=logging.INFO)
    logging.getLogger('flask_cors').level = logging.DEBUG

if __name__ == "__main__":
  app.run(debug=True, host="0.0.0.0", port=8081)