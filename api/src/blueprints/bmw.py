import requests

from flask import Blueprint, request

from libs.libs import send_response, send_error_response, validate_request

bmw = Blueprint(name="bmw", import_name=__name__)

# s = requests.Session()
api_url = "https://www.bmwusa.com/inventory/graphql"


@bmw.route("/api/inventory/bmw", methods=["GET"])
def get_bmw_inventory():
    # The BMW API has a pageSize attribute which is 24 by default. Setting a larger
    # pageSize to avoid API request pagination
    max_page_size = 2000

    zip_code = request.args["zip"]
    year = request.args["year"]
    model = request.args["model"]
    radius = request.args["radius"]

    # We'll use the requesting UA to make the request to the  BMW APIs
    user_agent = request.headers["User-Agent"]

    params = {
        "zip": zip_code,
        "year": year,
        "model": model,
        "radius": radius,
    }

    headers = {
        "User-Agent": user_agent,
        "Referer": "https://www.bmwusa.com/inventory.html",
    }

    inventory_post_data = {
        "query": "query inventory {getInventory(zip: "
        + f'"{params["zip"]}"'
        + ", bucket: BYO, filter: { locatorRange: "
        + params["radius"]
        + " excludeStopSale: false series: "
        + f'"{params["model"]}"'
        # Order statuses 0 and 1: Vehicle is at the dealership
        # 2, 3, 4, and 5: Vehicle is in transit or in production"
        + ', statuses:["0","1","2","3","4","5"] }, sorting: [{order: ASC, criteria: DISTANCE_TO_LOCATOR_ZIP},{order:ASC,criteria:PRICE}] pagination: {pageIndex: 1, '  # noqa: B950
        + f"pageSize: {max_page_size}"
        + "}) { numberOfFilteredVehicles pageNumber totalPages errorCode filter { modelsWithSeries { series { code name } model { code name } } } dealerInfo { centerID newVehicleSales { dealerName distance longitude locationID dealerURL phoneNumber address { lineOne lineTwo city state zipcode } } } result { name modelYear sold daysOnLot orderType dealerEstArrivalDate marketingText technicalText interiorGenericColor exteriorGenericColor hybridFlag sportsFlag vehicleDetailsPage milesPerGallon milesPerGallonEqv code bodyStyle { name } engineDriveType { name } series { name code } qualifiedModelCode technicalText totalMsrp dealerId dealerLocation distanceToLocatorZip orderStatus vin initialCOSYURL cosy { panoramaViewUrlPart walkaround360DegViewUrlPart } vehicleDetailsPage vehicleProcessingCenter isAtPmaDealer } } }"  # noqa: B950
    }

    if validate_request(params.items()):
        # Make a call to the  BMW API
        inventory = requests.post(
            url=api_url, headers=headers, json=inventory_post_data
        )

        data = inventory.json()

        try:
            # If the inventory request was successful, even if 0 vehicles are returned
            # the response will have the ['getInventory'] dict, so validating that
            data["data"]["getInventory"]
            return send_response(
                response_data=data,
                content_type="application/json",
                cache_control_age=3600,
            )
        except KeyError:
            print(f"ERROR Here: {data}")
            error_message = "An error occurred with the BMW API"
            return send_error_response(error_message=error_message, error_data=data)
    # Request could not be validated
    else:
        return send_error_response(
            error_message="Request could not be validated",
            error_data=request.url,
            status_code=400,
        )


@bmw.route("/api/vin/bmw", methods=["GET"])
def get_vin_details():
    request_args = request.args

    vin = request_args["vin"]

    # We'll use the requesting UA to make the request to the  BMW APIs
    user_agent = request.headers["User-Agent"]

    headers = {"User-Agent": user_agent, "Referer": "https://www.bmwusa.com/inventory/"}

    vin_post_data = (
        {
            "query": "query inventory { getInventoryByIdentifier("
            + f'identifier: "{vin}")'
            + " { result { code id dealerId dealerLocation vin totalMsrp name powertrain fuelType marketingText orderStatus technicalText acceleration horsepower milesPerGallon milesPerGallonEqv modelYear productionNumber sold hybridFlag sportsFlag vehicleDetailsPage destinationAndHandling qualifiedModelCode series { code name } bodyStyle { code name } engineDriveType { code name } options { name code optionPackageCodeKey price wholesalePrice optionType optionAttribute isPaint isUpholstery isPackage isTrim isAccessory isWheel isStandard isLine isTop isUni isMetallic isIndividual isMarketing } vehicleDetailsPage vehicleProcessingCenter isAtPmaDealer } dealerInfo { centerID newVehicleSales { dealerName distance longitude locationID dealerURL phoneNumber address { lineOne lineTwo city state zipcode } } } } }"  # noqa: B950
        },
    )

    vin_detail = requests.post(url=api_url, headers=headers, json=vin_post_data)

    data = vin_detail.json()

    if len(data[0]["data"]["getInventoryByIdentifier"]["result"]) > 0:
        return send_response(
            response_data=data[0],
            content_type="application/json",
            cache_control_age=3600,
        )
    else:
        error_message = "An error occurred with the  BMW API"
        return send_error_response(error_message=error_message, error_data=data)
