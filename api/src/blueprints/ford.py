from datetime import datetime
from flask import Blueprint, request

from libs.libs import send_response, send_error_response, validate_request

import requests

ford = Blueprint(name="ford", import_name=__name__)

s = requests.Session()

@ford.route('/api/inventory/ford', methods=['GET'])
def get_ford_inventory():
  request_args = request.args

  zip_code = request_args['zip']
  year = request_args['year']
  model = request_args['model']
  radius = request_args['radius']

  # We'll use the requesting UA to make the request to the Ford APIs
  user_agent = request.headers['User-Agent']

  dealers_url = f'https://shop.ford.com/aemservices/cache/inventory/dealer/dealers'
  inventory_url = f'https://shop.ford.com/aemservices/cache/inventory/dealer-lot'

  headers = {
    'User-Agent': user_agent,
    'Referer': f'https://shop.ford.com/inventory/{model}/',
  }

  dealers_params = {
    'make': 'Ford',
    'market': 'US',
    'inventoryType': 'Radius',
    'maxDealerCount': '1',
    'model': model,
    'segment': 'Crossover',
    'zipcode': zip_code
  }

  validate_request = True
  # if validate_request(params.items()):
  if validate_request:
    # Make a dealers API call to get a dealer slug, which will be needed for the
    # inventory API call later
    dealers = s.get(
      url=dealers_url,
      headers=headers,
      params=dealers_params,
      verify=False
    )
    if (dealers.json()['status'].lower() == 'success' and len(dealers.json()['data']['Response']) > 0):
      dealer_slug = dealers.json()['data']['firstFDDealerSlug']

      inventory_params = {
        **dealers_params,
        'dealerSlug': dealer_slug,
        'Radius': radius,
        'Order': 'Distance',
        # 'beginIndex': '0',
        # 'endIndex': '500'
      }
  

      inventory = s.get(
        url=inventory_url,
        headers=headers,
        params=inventory_params,
        verify=False
      )
      # return inventory.json()
    # return (inventory.status_code, inventory.json())
      # remainder_inventory = s.get(
      #   url=inventory_url,
      #   headers=headers,
      #   params={
      #     **inventory_params,
      #     'beginIndex': '0',
      #     'endIndex': inventory.json()['data']['filterResults']['ExactMatch']['totalCount']
      #   }
      # )

    if inventory.json()['status'].lower() == 'success':
      return send_response(
        response_data=inventory.json(),
        content_type='application/json',
        cache_control_age=3600
      )
    else:
      error_message = 'An error occurred with the Ford API'
      return send_error_response(
        error_message=error_message,
        error_data=inventory.json()
      )
  else:
    # Request could not be validated
    return send_error_response(
      error_message='Request could not be validated',
      error_data=request.url,
      status_code=400
      )