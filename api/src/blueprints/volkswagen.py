import requests

from flask import Blueprint, request

from libs.libs import send_response, send_error_response, validate_request

volkswagen = Blueprint(name="volkswagen", import_name=__name__)

# s = requests.Session()
api_url = 'https://api.vw.com/graphql'

@volkswagen.route('/api/inventory/volkswagen', methods=['GET'])
def get_volkswagen_inventory():
  request_args = request.args

  zip_code = request_args['zip']
  year = request_args['year']
  model = request_args['model']
  radius = request_args['radius']

  # We'll use the requesting UA to make the request to the Volkswagen APIs
  user_agent = request.headers['User-Agent']

  
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
  
  inventory_post_data = {
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
    inventory = requests.post(
      url=api_url,
      headers=headers,
      json=inventory_post_data,
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
      print(f'ERROR Here: {data}')
      error_message = 'An error occurred with the Volkswagen API'
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

@volkswagen.route('/api/vin/volkswagen', methods=['GET'])
def get_vin_details():
  request_args = request.args

  zip_code = request_args['zip']
  vin = request_args['vin']

  # We'll use the requesting UA to make the request to the Volkswagen APIs
  user_agent = request.headers['User-Agent']
  
  headers = {
      'User-Agent': user_agent,
      'referer': 'https://www.vw.com/'
  }
  
  vin_post_data = {
    "operationName": "VehicleData",
    "variables": {
      "vin": vin,
      "zipcode": zip_code
    },
    'query': 'query VehicleData($vin: String, $zipcode: String) {vehicle: getVehicleByVinAndZip(vin: $vin, zipcode: $zipcode) { portInstalledOptions vin model modelCode modelYear modelVersion carlineKey msrp mpgCity subTrimLevel engineDescription exteriorColorDescription exteriorColorBaseColor exteriorColorCode exteriorSwatchUrl interiorColorDescription interiorColorBaseColor interiorColorCode interiorSwatchUrl mpgHighway trimLevel mediaImageUrl mediaImageUrlAlt mediaAssets {   description   type   asset   __typename } onlineSalesURL dealerEnrollmentStatusInd highlightFeatures {   key   title   __typename } factoryModelYear dealerInstalledAccessories {   mdmCode   title   longTitle   description   image   itemPrice   creativeTitle   __typename } dealer {   generatedDate   dealerid   name   dealername   seolookupkey   address1   address2   city   state   postalcode   country   url   phone   latlong   staticMapsUrl   distance   inventoryCount   aor   isSatellite   isAssessing   lmaId   __typename } specifications {   text   values {     key     label     longTitle     value     __typename   }   key   __typename } destinationCharge __typename}}'
  }
  
  vin_detail = requests.post(
      url=api_url,
      headers=headers,
      json=vin_post_data,
      verify=False
    )
    
  data = vin_detail.json()

  if len(data['data']['vehicle']) > 0:
    return send_response(
      response_data=data,
      content_type='application/json',
      cache_control_age=3600
    )
  else:
    error_message = 'An error occurred with the Volkswagen API'
    return send_error_response(
      error_message=error_message,
      error_data=data
    )