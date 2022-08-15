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
  try:
    series_name = request_args['seriesName']
  except Exception:  # temporary for rollout of this new query param
    series_name = 'EV6'
  radius = request_args['radius']
  # We'll use the requesting UA to make the request to the Kia APIs
  user_agent = request.headers['User-Agent']

  # Fetches data from the Kia Inventory API
  api_url = 'https://www.kia.com/us/services/en/inventory'

  params = {
      'zipCode': zip_code,
      'year': year,
      'series': model,
      'radius': radius,
  }

# The Kia API operates via POST with the following data
  post_data = {
  "filterSet": {
    "seriesName": series_name,
    "series": model,
    "year": year,
    "zipCode": zip_code,
    "currentRange": int(radius),
    "selectedRange": int(radius),
    "isInitialRequest": 'false',
    "status": [
      "DS",
      "IT"
      ]
    }
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