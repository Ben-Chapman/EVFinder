import logging
import json
import requests

from flask import Flask, request, make_response
from flask_cors import CORS
from http.client import HTTPConnection

# Requests Debugging
# requests_log = logging.getLogger('urllib3')
# requests_log.setLevel(logging.DEBUG)

# # logging from urllib3 to console
# ch = logging.StreamHandler()
# ch.setLevel(logging.DEBUG)
# requests_log.addHandler(ch)

# HTTPConnection.debuglevel = 1

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

  # We'll use the requesting UA to make the request to the Hyundai APIs
  user_agent = request.headers['User-Agent']

  headers = {
      'User-Agent': user_agent,
      'referer': 'https://www.hyundaiusa.com/us/en/vehicles'
  }
  ### Prod section
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
      return flatten_api_results(data), 200, {"Content-Type": "application/json"}
  ### End Prod


  ### Dev section
  # with open('../tests/vehicles_data.json', 'r') as f:
  #     test_data = json.loads(f.read())
  # print(f'\n\n\t{request}')
  # print(f'\nUser agent for this request is: {user_agent}\n')

  # return flatten_api_results(test_data), 200, {"Content-Type": "application/json"}
  ### End testing

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
  ### Prod section
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
      return data, 200, {"Content-Type": "application/json"}
  ### End Prod

  ### Dev section
  # with open('../tests/vin_data.json', 'r') as f:
  #     test_data = json.loads(f.read())
  # print(f'\n\n\t{request}')
  # print(f'\nUser agent for this request is: {user_agent}\n')

  # return test_data, 200, {"Content-Type": "application/json"}
  ### End testing

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
    response = make_response(window_sticker_pdf)
    response.headers.set('Content-Type', 'application/pdf')
    return response



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


if __name__ == "__main__":
  # Flask CORS logging
  # logging.basicConfig(level=logging.INFO)
  # logging.getLogger('flask_cors').level = logging.DEBUG


  app.run(debug=True, host="0.0.0.0", port=8081)