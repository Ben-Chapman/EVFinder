import requests
from flask import Blueprint, request
from libs.libs import send_error_response, send_response, validate_request

genesis = Blueprint(name="genesis", import_name=__name__)


@genesis.route("/api/inventory/genesis", methods=["GET"])
def get_genesis_inventory():
    request_args = request.args

    zip_code = request_args["zip"]
    year = request_args["year"]
    model = request_args["model"]

    # We'll use the requesting UA to make the request to the Genesis APIs
    user_agent = request.headers["User-Agent"]

    inventory_url = "https://www.genesis.com/bin/api/v1/inventory"

    params = {
        "zip": zip_code,
        "year": year,
        "modelname": model,
    }

    headers = {
        "User-Agent": user_agent,
        "referer": "https://www.genesis.com/us/en/new/inventory.html",
    }

    if validate_request(params.items()):
        # Make a call to the Genesis API
        inventory = requests.get(url=inventory_url, headers=headers, params=params)

        data = inventory.json()

        if len(data) > 0:
            return send_response(
                response_data=data,
                content_type="application/json",
                cache_control_age=3600,
            )
        else:
            error_message = "An error occurred with the Genesis API"
            return send_error_response(error_message=error_message, error_data=data)
    else:
        # Request could not be validated
        return send_error_response(
            error_message="Request could not be validated",
            error_data=request.url,
            status_code=400,
        )


@genesis.route("/api/vin/genesis", methods=["GET"])
def get_genesis_vin_detail():
    vin_url = "https://www.genesis.com/bin/api/v1/vehicledetails.json"

    print(f"\n\n{request.args}")
    vin_params = {
        "zip": request.args["zip"],
        "vin": request.args["vin"],
    }

    # We'll use the requesting UA to make the request to the Genesis APIs
    user_agent = request.headers["User-Agent"]

    headers = {
        "User-Agent": user_agent,
        "referer": f"https://www.genesis.com/us/en/new/inventory.html?vin={vin_params['vin']}",
    }

    try:
        vin_data = requests.get(
            url=vin_url,
            headers=headers,
            params=vin_params,
            timeout=(3.05, 15.05),
        )
        vin_data.raise_for_status()
    except Exception as e:
        error_message = f"An error occurred with the Genesis API: {e}"
        return send_error_response(error_message=error_message, error_data=vin_data)

    return send_response(
        response_data=vin_data.json(),
        content_type="application/json",
        cache_control_age=3600,
    )
