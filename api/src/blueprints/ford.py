import json
import math
import requests

from datetime import datetime
from flask import Blueprint, request

from libs.libs import send_response, send_error_response, validate_request

ford = Blueprint(name="ford", import_name=__name__)

s = requests.Session()

@ford.route('/api/inventory/ford', methods=['GET'])
def main():
  request_args = {
    'zip_code': request.args['zip'],
    'year': request.args['year'],
    'model': request.args['model'],
    'radius': request.args['radius'],
  }
  
  headers = {
    'User-Agent': request.headers['User-Agent'],  # Use the requesting UA
    'Referer': f"https://shop.ford.com/inventory/{request_args['model']}/",
  }

  common_params = {
    'make': 'Ford',
    'market': 'US',
    'inventoryType': 'Radius',
    'maxDealerCount': '1',
    'model': request_args['model'],
    'segment': 'Crossover',
    'zipcode': request_args['zip_code']
    }

  # Retrieve the dealer slug, which is needed for the inventory API call
  slug = get_dealer_slug(headers, common_params)

  if slug:
    # Retrieve the initial batch of 12 vehicles
    inventory_params = {
        **common_params,
        'dealerSlug': slug,
        'Radius': request_args['radius'],
        'Order': 'Distance',
        # 'beginIndex': '0',
        # 'endIndex': '500'
      }

    inv = get_ford_inventory(headers=headers, params=inventory_params)

    try:
      total_count = inv['data']['filterResults']['ExactMatch']['totalCount']
    except KeyError as e:
      print(f"No pagination for Inventory call: {e}")
    
    if total_count > 12:
      remainder_inventory_params = {
        **inventory_params,
        'beginIndex': '12',
        'endIndex': math.ceil(total_count / 12) * 12 # Ford pages 12 vehicles at a time
      }

      remainder = get_ford_inventory(
        headers=headers,
        params=remainder_inventory_params)
      
      # Return the merged inventory + remainder JSON objects
      inv['rdata'] = remainder['data']

      # Add the dealer_slug to the response, this will be needed for future API
      # calls
      inv['dealerSlug'] = slug

      return send_response(
        response_data=json.dumps(inv),
        content_type='application/json',
        cache_control_age=3600)
    else:
      return send_response(
        response_data=json.dumps(inv),
        content_type='application/json',
        cache_control_age=3600)
  

@ford.route('/api/vin/ford', methods=['GET'])
def get_vin_detail():
  vin_url = 'https://shop.ford.com/aemservices/cache/inventory/dealer/vehicle-details'

  headers = {
    'User-Agent': request.headers['User-Agent'],  # Use the requesting UA
    'Referer': f"https://shop.ford.com/inventory/{request.args['model']}/results?zipcode={request.args['zip']}&Radius=20&Dealer={request.args['paCode']}&year={request.args['year']}&Order=Distance"
  }

  vin_params = {
      'dealerSlug': request.args['dealerSlug'],
      'modelSlug': request.args['modelSlug'],
      'vin': request.args['vin'],
      'make': 'Ford',
      'market': 'US',
      'requestTowingData': 'undefined',
      'inventoryType': 'Radius',
      'ownerPACode': request.args['paCode'],
      'segment': 'Crossover',
      'zipcode': request.args['zip']
    }

  try:
    vin_data = s.get(
      url=vin_url,
      headers=headers,
      params=vin_params,
      verify=False)
  
    vin_data.raise_for_status()
    return send_response(
        response_data=json.dumps(vin_data),
        content_type='application/json',
        cache_control_age=3600)

  except Exception as e:
    return ((vin_data.status_code, vin_data.url, '\r\n'.join('{}: {}'.format(k, v) for k, v in vin_data.headers.items())))
    # error_message = f'An error occurred with the Ford API: {e}'
    # return send_error_response(
    #   error_message=error_message,
    #   error_data=vin_data
    # )


def get_ford_inventory(headers, params):
  inventory_url = f'https://shop.ford.com/aemservices/cache/inventory/dealer-lot'

  validate_request = True
  # if validate_request(params.items()):
  if validate_request:
    # Make a dealers API call to get a dealer slug, which will be needed for the
    # inventory API call later
    
    inventory = s.get(
      url=inventory_url,
      headers=headers,
      params=params,
      verify=False
    )
    inventory.raise_for_status()

    return inventory.json()
     




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

#   if inventory.json()['status'].lower() == 'success':
#     return send_response(
#       response_data=inventory.json(),
#       content_type='application/json',
#       cache_control_age=3600
#     )
#   else:
#     error_message = 'An error occurred with the Ford API'
#     return send_error_response(
#       error_message=error_message,
#       error_data=inventory.json()
#     )
# else:
#   # Request could not be validated
#   return send_error_response(
#     error_message='Request could not be validated',
#     error_data=request.url,
#     status_code=400
#     )

def get_dealer_slug(headers, params):
  dealers_url = f'https://shop.ford.com/aemservices/cache/inventory/dealer/dealers'
  
  dealers = s.get(
    url=dealers_url,
    headers=headers,
    params=params,
    verify=False)
  dealers.raise_for_status()

  dealers = dealers.json()

  if (dealers['status'].lower() == 'success' and len(dealers['data']['Response']) > 0):
    return dealers['data']['firstFDDealerSlug']

