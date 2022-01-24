import json
import os

import requests

from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app)  # Enable CORS app-wide

@app.route('/inventory')
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

    print(type(data))
  except requests.exceptions.RequestException as e:
    return f'An error occured: {e}', 500

  if 'SUCCESS' in data['status']:
      return flatten_api_results(data), 200, {"Content-Type": "application/json"}
  ### End Prod


  ### Dev section
  # with open('tests/vehicles_data.json', 'r') as f:
  #     test_data = json.loads(f.read())
  # print(f'\n\n\t{request}')
  # print(f'\nUser agent for this request is: {user_agent}\n')

  # return flatten_api_results(test_data), 200, {"Content-Type": "application/json"}
  ### End testing

@app.route('/vin')
def get_vin_details():
  """
  curl 'https://www.hyundaiusa.com/var/hyundai/services/inventory/vehicleDetails.vin.json?vin=KM8KRDAF7NU064539&brand=hyundai' \
  -H 'authority: www.hyundaiusa.com' \
  -H 'accept: application/json, text/plain, */*' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36' \
  -H 'sec-gpc: 1' \
  -H 'sec-fetch-site: same-origin' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: https://www.hyundaiusa.com/us/en/inventory-search/details?model=Kona&year=2022&vin=KM8K3CA3XNU859036' \
  """
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

    print(type(data))
  except requests.exceptions.RequestException as e:
    return f'An error occured: {e}', 500

  if 'SUCCESS' in data['status']:
      return data, 200, {"Content-Type": "application/json"}
  ### End Prod

  ### Dev section
  # with open('tests/vin_data.json', 'r') as f:
  #     test_data = json.loads(f.read())
  # print(f'\n\n\t{request}')
  # print(f'\nUser agent for this request is: {user_agent}\n')

  # return test_data, 200, {"Content-Type": "application/json"}
  ### End testing

def flatten_api_results(input_data: str):
  tmp = []
  # print(type(input_data))
  input_data = input_data['data'][0]['dealerInfo']
  for dealer in range(0, len(input_data)):
    for k, v in input_data[dealer].items():
      if 'vehicles' in k and v is not None:
        for i in range(0, len(v)):
          tmp.append({**input_data[dealer], **input_data[dealer]['vehicles'][i]})

  for i in range(0, len(tmp)):
      del tmp[i]['vehicles']

  return json.dumps(tmp)



if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))