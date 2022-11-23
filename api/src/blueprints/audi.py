import requests

from flask import Blueprint, request

from libs.libs import send_response, send_error_response, validate_request

audi = Blueprint(name="audi", import_name=__name__)

# s = requests.Session()
api_url = "https://prod.aoaaudinagateway.svc.audiusa.io/graphql"


@audi.route("/api/inventory/audi", methods=["GET"])
def get_audi_inventory():
    request_args = request.args

    geo = request_args["geo"]
    year = request_args["year"]
    model = request_args["model"]
    radius = request_args["radius"]

    # We'll use the requesting UA to make the request to the audi APIs
    user_agent = request.headers["User-Agent"]

    params = {
        "year": year,
        "model": model,
        "radius": radius,
    }

    headers = {"User-Agent": user_agent, "Referer": "https://www.audiusa.com/"}

    inventory_post_data = {
        "operationName": "getFilteredVehiclesForWormwood",
        "variables": {
            "version": "2.0.0",
            "market": ["US"],
            "lang": "en",
            "filters": (
                "available-from.immediately,"
                "available-from.soon,"
                f"geo:{geo}_{radius}_miles_defaultcity,"
                f"model-group-range.{model},"
                "vtp-drivetrain.electrical,"
                f"model-year.{year}"
            ),
            "sort": "byDistance:ASC",
            "limit": 1000,
            "offset": 0,
            "preset": "foreign-brand.no,sold-order.no",
        },
        "query": "query getFilteredVehiclesForWormwood($version: String, $market: [MarketType]!, $limit: Int, $lang: String!, $filters: String, $sort: String, $offset: Int, $preset: String) {\n  getFilteredVehiclesForWormwood(\n    version: $version\n    market: $market\n    size: $limit\n    lang: $lang\n    filters: $filters\n    sort: $sort\n    from: $offset\n    preset: $preset\n  ) {\n    filterResults {\n      totalCount\n      totalNewCarCount\n      totalUsedCarCount\n      available_from_soon\n      available_from_immediately\n      has_warranties_yes\n      has_warranties_no\n      __typename\n    }\n    vehicles {\n      id\n      interiorColor\n      exteriorColor\n      modelID\n      modelYear\n      modelCode\n      modelName\n      modelPrice\n      modelPowerkW\n      modelMileage\n      audiCode\n      stockNumber\n      trimName\n      kvpsSyncId\n      dealerName\n      dealerRegion\n      vehicleType\n      warrantyType\n      modelImageFromScs\n      isAvailableNow\n      vin\n      bodyType\n      saleOrderType\n      vehicleInventoryType\n      vehicleOrderStatus\n      driveType\n      gearType\n      distanceFromUser\n      __typename\n    }\n    __typename\n  }\n}\n",  # noqa: B950
    }

    if validate_request(params.items()):
        # Make a call to the audi API
        inventory = requests.post(
            url=api_url, headers=headers, json=inventory_post_data, verify=False
        )

        data = inventory.json()

        try:
            # If the inventory request was successful, even if 0 vehicles are returned
            # the response will have the ['data'] dict, so validating that
            data["data"]
            return send_response(
                response_data=data,
                content_type="application/json",
                cache_control_age=3600,
            )
        except KeyError:
            print(f"ERROR Here: {data}")
            error_message = "An error occurred with the audi API"
            return send_error_response(error_message=error_message, error_data=data)
    # Request could not be validated
    else:
        return send_error_response(
            error_message="Request could not be validated",
            error_data=request.url,
            status_code=400,
        )


@audi.route("/api/vin/audi", methods=["GET"])
def get_vin_details():
    request_args = request.args

    zip_code = request_args["zip"]
    vin = request_args["vin"]

    # We'll use the requesting UA to make the request to the audi APIs
    user_agent = request.headers["User-Agent"]

    headers = {"User-Agent": user_agent, "referer": "https://www.vw.com/"}

    vin_post_data = {
        "operationName": "VehicleData",
        "variables": {"vin": vin, "zipcode": zip_code},
        "query": "query VehicleData($vin: String, $zipcode: String) {vehicle: getVehicleByVinAndZip(vin: $vin, zipcode: $zipcode) { portInstalledOptions vin model modelCode modelYear modelVersion carlineKey msrp mpgCity subTrimLevel engineDescription exteriorColorDescription exteriorColorBaseColor exteriorColorCode exteriorSwatchUrl interiorColorDescription interiorColorBaseColor interiorColorCode interiorSwatchUrl mpgHighway trimLevel mediaImageUrl mediaImageUrlAlt mediaAssets {   description   type   asset   __typename } onlineSalesURL dealerEnrollmentStatusInd highlightFeatures {   key   title   __typename } factoryModelYear dealerInstalledAccessories {   mdmCode   title   longTitle   description   image   itemPrice   creativeTitle   __typename } dealer {   generatedDate   dealerid   name   dealername   seolookupkey   address1   address2   city   state   postalcode   country   url   phone   latlong   staticMapsUrl   distance   inventoryCount   aor   isSatellite   isAssessing   lmaId   __typename } specifications {   text   values {     key     label     longTitle     value     __typename   }   key   __typename } destinationCharge __typename}}",  # noqa: B950
    }

    vin_detail = requests.post(
        url=api_url, headers=headers, json=vin_post_data, verify=False
    )

    data = vin_detail.json()

    if len(data["data"]["vehicle"]) > 0:
        return send_response(
            response_data=data, content_type="application/json", cache_control_age=3600
        )
    else:
        error_message = "An error occurred with the audi API"
        return send_error_response(error_message=error_message, error_data=data)
