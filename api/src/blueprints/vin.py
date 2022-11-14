from flask import Blueprint, jsonify, request

from libs.libs import send_error_response, send_response

from libs.http import get

vin = Blueprint(name="vin", import_name=__name__)


@vin.route("/api/vin", methods=["GET"])
@vin.route("/api/vin/hyundai", methods=["GET"])
def get_vin_details():
    request_args = request.args
    model = request_args["model"]
    year = request_args["year"]
    vin = request_args["vin"]

    # Fetches data from the Hyundai API
    api_url = "https://www.hyundaiusa.com/var/hyundai/services/inventory/vehicleDetails.vin.json"
    params = {
        "model": model,
        "year": year,
        "vin": vin,
        "brand": "hyundai",
    }

    # We'll use the requesting UA to make the request to the Hyundai APIs
    user_agent = request.headers["User-Agent"]
    headers = {
        "authority": "www.hyundaiusa.com",
        "User-Agent": user_agent,
        "referer": f"https://www.hyundaiusa.com/us/en/inventory-search/details?model={model.capitalize()}&year={year}&vin={vin}",
    }

    g = get(url=api_url, query_params=params, request_headers=headers)
    data = g.json()

    if "SUCCESS" in data["status"]:
        return send_response(
            response_data=data, content_type="application/json", cache_control_age=3600
        )
    else:
        return send_error_response(
            error_message="Received invalid data from the Hyundai API",
            error_data=data,
            status_code=400,
        )
