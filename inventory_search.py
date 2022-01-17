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

    # try:
    #     r = requests.get(api_url, params=params, headers=headers)
    #     data = r.json()
    # except requests.exceptions.RequestException as e:
    #     return f'An error occured: {e}', 500

    # if 'SUCCESS' in data['status']:
    #     return jsonify(data['data'])

    # For testing
    with open('test_data.json', 'r') as f:
        test_data = f.read()
    print(f'\n\n\t{request}')
    print(f'\nUser agent for this request is: {user_agent}\n')
    return test_data, 200, {"Content-Type": "application/json"}

@app.route('/testing/')
def testing():
    return "Hello there!"

if __name__ == '__main__':
    app.run(debug=True)