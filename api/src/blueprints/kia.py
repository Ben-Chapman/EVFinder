from flask import Blueprint, request

from libs.libs import send_response, send_error_response, validate_request
from libs.http import post

kia = Blueprint(name="kia", import_name=__name__)

@kia.route('/api/inventory/kia', methods=['GET'])
def get_kia_inventory():
  request_args = request.args

  zip_code = request_args['zip']
  year = request_args['year']
  model = request_args['model']
  radius = request_args['radius']
  # We'll use the requesting UA to make the request to the Kia APIs
  user_agent = request.headers['User-Agent']

  # Fetches data from the Kia Inventory API
  api_url = 'https://www.kia.com/us/services/en/inventory/initial'

  params = {
      'zipCode': zip_code,
      'year': year,
      'series': model,
      'radius': radius,
  }

# The Kia API operates via POST with the following data
  post_data = {
    "series": model,
    "year": year,
    "zipCode": zip_code,
    "status":["DS", "IT"],
    "selectedRange": int(radius),
    "currentRange": int(radius)
  }

  headers = {
    'User-Agent': user_agent,
    'Referer': f'https://www.kia.com/us/en/inventory/result?zipCode={zip_code}&seriesId={model}&year={year}',
    }

  if validate_request(params.items()):
    data = post(
      url=api_url,
      post_data=post_data,
      request_headers=headers
      )
    # The Kia API will return a JSON object for any reasonable request, and the
    # http helper library will return an empty JSON object for non-200 responses
    # so len(data) should be > 0 for all valid responses
    if len(data) > 0:
      return send_response(
        response_data=data,
        content_type='application/json',
        cache_control_age=3600
      )
    else:
      error_message = 'An error occurred with the Kia API'
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