from datetime import datetime
from flask import Blueprint, request

from libs.libs import send_response, send_error_response, validate_request

import requests

genesis = Blueprint(name="genesis", import_name=__name__)

# Global variables
refresh_token = datetime.now().isoformat(timespec="auto").split("T")[0]

s = requests.Session()


@genesis.route("/api/inventory/genesis", methods=["GET"])
def get_genesis_inventory():
    request_args = request.args

    zip_code = request_args["zip"]
    year = request_args["year"]
    model = request_args["model"]
    radius = request_args["radius"]

    # We'll use the requesting UA to make the request to the Genesis APIs
    user_agent = request.headers["User-Agent"]

    inventory_url = f"https://www.genesis.com/content/genesis/us/en/services/newinventory.js/model/{model}/type/inventory/refreshToken/{refresh_token}.js"

    params = {
        "zip": zip_code,
        "year": year,
        "model": model,
        "radius": radius,
    }

    headers = {
        "User-Agent": user_agent,
        "referer": f"https://www.genesis.com/us/en/new/inventory/results/year/{year}/model/{model.upper()}/zip/{zip_code}",
    }

    if validate_request(params.items()):
        # Make a call to the Genesis API
        inventory = s.get(
            url=inventory_url,
            headers=headers,
        )

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


@genesis.route("/api/dealer/genesis", methods=["GET"])
def get_genesis_dealers():
    request_args = request.args

    zip_code = request_args["zip"]
    year = request_args["year"]
    model = request_args["model"]
    # radius = request_args['radius']

    # We'll use the requesting UA to make the request to the Genesis APIs
    user_agent = request.headers["User-Agent"]

    # Genesis seems to limit the number of returned results not to the noOfResults param
    # but rather a distance of <=2000 miles from the origin zip code.
    dealer_url = f"https://www.genesis.com/content/genesis/us/en/services/dealerservice.js?countryCode=en-US&vehicleName=gOther&zipCode={zip_code}&noOfResults=300&servicetype=new&year={year}&refreshToken={refresh_token}"

    params = {
        "zip": zip_code,
        "year": year,
        "model": model,
        # 'radius': radius,
    }

    headers = {
        "User-Agent": user_agent,
        "referer": f"https://www.genesis.com/us/en/new/inventory/results/year/{year}/model/{model.upper()}/zip/{zip_code}",
    }

    if validate_request(params.items()):
        dealers = s.get(url=dealer_url, headers=headers)

        data = dealers.json()

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
