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
        "query": "query getFilteredVehiclesForWormwood($version: String, $market: [MarketType]!, $limit: Int, $lang: String!, $filters: String, $sort: String, $offset: Int, $preset: String) { getFilteredVehiclesForWormwood( version: $version market: $market size: $limit lang: $lang filters: $filters sort: $sort from: $offset preset: $preset ) { filterResults { totalCount totalNewCarCount totalUsedCarCount available_from_soon available_from_immediately has_warranties_yes has_warranties_no __typename } vehicles { id interiorColor exteriorColor modelID modelYear modelCode modelName modelPrice modelPowerkW modelMileage audiCode stockNumber trimName kvpsSyncId dealerName dealerRegion vehicleType warrantyType modelImageFromScs isAvailableNow vin bodyType saleOrderType vehicleInventoryType vehicleOrderStatus driveType gearType distanceFromUser __typename } __typename }\n}\n",  # noqa: B950
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

    vehicle_id = request_args["vehicleId"]

    # We'll use the requesting UA to make the request to the audi APIs
    user_agent = request.headers["User-Agent"]

    headers = {"User-Agent": user_agent, "Referer": "https://www.audiusa.com/"}

    vin_post_data = {
        "operationName": "getVehicleInfoForWormwood",
        "variables": {
            "version": "2.0.0",
            "market": "US",
            "lang": "en",
            "id": f"{vehicle_id}",
        },
        "query": "query getVehicleInfoForWormwood($market: MarketType!, $lang: String!, $id: String!, $version: String) { getVehicleInfoForWormwood( market: $market lang: $lang id: $id version: $version ) { modelName trimName bodyType modelYear trimline gearType driveType modelMileage vehicleType market fuelType equipments { optionalEquipments { headline text imageUrl benefits __typename } standardEquipments { interior { headline text imageUrl __typename } exterior { headline text imageUrl __typename } assistanceSystems { headline text imageUrl __typename } technology { headline text imageUrl __typename } trimsAndPackages { headline text imageUrl __typename } performance { headline text imageUrl __typename } __typename } __typename } exteriorColor upholsteryColor interiorTileImage exteriorTileImage dealerName dealerNote staticDealerInfo { isDealerNoteVisible mapImage dagid __typename } vehicleMedia { mediaRequestString mediaImages { config imageType url __typename } __typename } technicalSpecifications { engineType displacement maxOutput maxTorque gearbox frontAxle rearAxle brakes steering unladenWeight grossWeightLimit tankCapacity luggageCompartmentCapacity topSpeed acceleration fuelType fuelData { fuel_petrol { unit urban extraUrban combined __typename } fuel_electrical { unit urban extraUrban combined __typename } __typename } __typename } __typename }}",  # noqa: B950
    }

    vin_detail = requests.post(
        url=api_url, headers=headers, json=vin_post_data, verify=False
    )

    data = vin_detail.json()

    try:
        data["data"]["getVehicleInfoForWormwood"]
        return send_response(
            response_data=data, content_type="application/json", cache_control_age=3600
        )
    except KeyError:
        error_message = "An error occurred with the Audi API"
        return send_error_response(error_message=error_message, error_data=data)
