import json

import requests

from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app)  # Enable CORS app-wide

@app.route('/inventory')
def get_inventory():
  # We'll use the requesting UA to make the request to the Hyundai API
  user_agent = request.headers['User-Agent']
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

  headers = {
      'User-Agent': user_agent,
      'referer': 'https://www.hyundaiusa.com/us/en/vehicles'
  }
  ### Prod section
  # try:
  #   r = requests.get(api_url, params=params, headers=headers)
  #   data = r.json()

  #   print(type(data))
  # except requests.exceptions.RequestException as e:
  #   return f'An error occured: {e}', 500

  # if 'SUCCESS' in data['status']:
  #     return flatten_api_results(data), 200, {"Content-Type": "application/json"}
  ### End Prod


  ### For testing
  with open('test_data.json', 'r') as f:
      test_data = json.loads(f.read())
  print(f'\n\n\t{request}')
  print(f'\nUser agent for this request is: {user_agent}\n')

  return flatten_api_results(test_data), 200, {"Content-Type": "application/json"}
  ### End testing

def flatten_api_results(input_data: str):
  # hmm = {}
  tmp = []
  # print(type(input_data))
  input_data = input_data['data'][0]['dealerInfo']
  for dealer in range(0, len(input_data)):
    for k, v in input_data[dealer].items():
      if 'vehicles' in k and v is not None:
        # hmm = input_data[dealer]
        for i in range(0, len(v)):
          tmp.append({**input_data[dealer], **input_data[dealer]['vehicles'][i]})

  for i in range(0, len(tmp)):
      del tmp[i]['vehicles']

  return json.dumps(tmp)



if __name__ == '__main__':
    app.run(debug=True)