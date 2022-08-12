import requests

from flask import Blueprint, request

from libs.libs import send_response, send_error_response, validate_request

volkswagen = Blueprint(name="volkswagen", import_name=__name__)

s = requests.Session()

@volkswagen.route('/api/inventory/volkswagen', methods=['GET'])
def get_volkswagen_inventory():
  request_args = request.args

  zip_code = request_args['zip']
  year = request_args['year']
  model = request_args['model']
  radius = request_args['radius']

  # We'll use the requesting UA to make the request to the Volkswagen APIs
  user_agent = request.headers['User-Agent']

  inventory_url = 'https://api.vw.com/graphql'
  params = {
      'zip': zip_code,
      'year': year,
      'model': model,
      'radius': radius,
  }
  
  headers = {
      'User-Agent': user_agent,
      'referer': 'https://www.vw.com/'
  }
  
  post_data = {
    "operationName": "InventoryData",
    "variables": {
      "zipcode": zip_code,
      "distance": int(radius),
      "pageSize": 500,  # Hardcoded for now
      "pageNumber": 0,
      "sortBy": "",
      "filters": str({
        "modelName": [model],
        "modelYear": [int(year)]
        })
    },
    'query': 'query InventoryData($zipcode: String, $distance: Int, $pageSize: Int, $pageNumber: Int, $sortBy: String, $filters: String) {inventory: getPagedInventoryByZipAndDistanceAndFilters(zipcode: $zipcode distance: $distance pageSize: $pageSize pageNumber: $pageNumber sortBy: $sortBy filters: $filters) { totalPages totalVehicles vehicles {vin model  msrp  modelYear  exteriorColorDescription  factoryExteriorCode  interiorColorDescription  factoryInteriorCode  mpgCity  subTrimLevel  engineDescription  mpgHighway  trimLevel  mediaImageUrl  mediaImageUrlAlt  onlineSalesURL  dealerEnrollmentStatusInd  inTransit  dealer {dealerid  name  url  distance  address1  address2  city  state  postalcode  phone  aor  __typename}  highlightFeatures {key  title  __typename}  __typename} dealers {  dealerid  name  url  distance  address1  address2  city  state  postalcode  phone  aor  __typename } aorDealer {  dealerid  name  url  distance  address1  address2  city  state  postalcode  phone  aor  __typename } aorVehicle {  vin  model  msrp  modelYear  exteriorColorDescription  factoryExteriorCode  interiorColorDescription  factoryInteriorCode  mpgCity  subTrimLevel  engineDescription  mpgHighway  trimLevel  mediaImageUrl  mediaImageUrlAlt  onlineSalesURL  dealerEnrollmentStatusInd  inTransit  dealer {  dealerid  name  url  distance  address1  address2  city  state  postalcode  phone  aor  __typename  }  highlightFeatures {  key  title  __typename  }  __typename } filter {  modelName  filterAttributes {  transmissionType { key value __typename  }  exteriorColor {key value __typename  }  interiorColor { key value __typename  }  modelYear { key value __typename  }  trimLevel { key value __typename  }  dealers { key value __typename  }  models { key value __typename  }  __typename  }  __typename } __typename}}'
  }

  if validate_request(params.items()):
    # Make a call to the Volkswagen API
    inventory = s.post(
      url=inventory_url,
      headers=headers,
      json=post_data,
      verify=False
    )
    
    data = inventory.json()

    try:
      # If the inventory request was successful, even if 0 vehicles are returned
      # the response will have the ['inventory'] dict, so validating that
      data['data']['inventory']
      return send_response(
        response_data=data,
        content_type='application/json',
        cache_control_age=3600
      )
    except KeyError:
      error_message = 'An error occured with the Volkswagen API'
      return send_error_response(
        error_message=error_message,
        error_data=data
      )
  # Request could not be validated
  else:
    return send_error_response(
      error_message='Request could not be validated',
      error_data=request.url,
      status_code=400
      )