import requests

from flask import Blueprint, request

from libs.libs import send_response, send_error_response, validate_request

chevrolet = Blueprint(name="chevrolet", import_name=__name__)

BASE_API = "https://www.chevrolet.com/electric/shopping/api/drp-cp-api/p/v1"


@chevrolet.route("/api/inventory/chevrolet", methods=["GET"])
def get_chevrolet_inventory():
    params = {
        "zip": request.args.get("zip"),
        "year": request.args.get("year"),
        "model": request.args.get("model"),
        "radius": request.args.get("radius"),
    }

    # We'll use the requesting UA to make the request to the API
    headers = {
        "User-Agent": request.headers["User-Agent"],
    }

    inventory_post_data = {
        "name": "DrpInventory",
        "filters": [
            {
                "field": "model",
                "operator": "IN",
                "values": [params["model"]],
                "key": "model",
            },
            {
                "field": "year",
                "operator": "IN",
                "values": [params["year"]],
                "key": "year",
            },
            {
                "field": "radius",
                "operator": "IN",
                "values": [params["radius"]],
                "key": "radius",
            },
            {
                "field": "zipcode",
                "operator": "IN",
                "values": [params["zip"]],
                "key": "zipcode",
            },
        ],
        "sort": [{"field": "distance", "order": "ASC"}],
        "pageInfo": {"rows": 1000},
    }

    if validate_request(params.items()):
        # Make a call to the API
        inventory = requests.post(
            url=f"{BASE_API}/vehicles",
            headers=headers,
            json=inventory_post_data,
        )

        data = inventory.json()

        try:
            # If the inventory request was successful, even if 0 vehicles are returned
            # the response will have the ['listResponse'] dict, so validating that
            data["data"]["listResponse"]
            return send_response(
                response_data=data,
                content_type="application/json",
                cache_control_age=3600,
            )
        except KeyError:
            error_message = "An error occurred with the Chevrolet API"
            return send_error_response(error_message=error_message, error_data=data)
    else:
        # Request could not be validated
        return send_error_response(
            error_message="Request could not be validated",
            error_data=request.url,
            status_code=400,
        )


@chevrolet.route("/api/vin/chevrolet", methods=["GET"])
def get_chevrolet_details():
    # We'll use the requesting UA to make the request to the API
    headers = {
        "User-Agent": request.headers["User-Agent"],
    }

    vin = request.args.get("vin")
    vin_post_data = {"key": "VIN", "value": vin}

    # Make a call to the API
    details = requests.post(
        url=f"{BASE_API}/vehicles/details",
        headers=headers,
        json=vin_post_data,
    )

    data = details.json()

    status_text = data.get("status")
    if status_text and status_text != "success":
        error_message = f"An error occurred with the Chevrolet API when fetching VIN details for {vin}"
        return send_error_response(error_message=error_message, error_data=data)
    return send_response(
        response_data=data, content_type="application/json", cache_control_age=3600
    )
