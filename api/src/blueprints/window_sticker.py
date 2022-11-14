from flask import Blueprint, request

from libs.libs import send_response
from libs.http import get

ws = Blueprint(name="ws", import_name=__name__)


@ws.route("/api/ws/hyundai", methods=["GET"])
def get_hyundai_window_sticker():
    request_args = request.args

    model = request_args["model"]
    year = request_args["year"]
    vin = request_args["vin"]

    # Fetches data from the Hyundai API
    api_url = "https://www.hyundaiusa.com/var/hyundai/services/inventory/monroney.pdf"

    # We'll use the requesting UA to make the request to the Hyundai APIs
    user_agent = request.headers["User-Agent"]

    headers = {
        "User-Agent": user_agent,
        "Referer": f"https://www.hyundaiusa.com/us/en/inventory-search/details?model={model}&year={year}&vin={vin}",
    }

    params = {
        "model": model.replace(" ", "-"),
        "vin": vin,
    }

    data = get(
        url=api_url,
        query_params=params,
        request_headers=headers,
    )

    if data.status_code == 200:
        return send_response(data.content, "application/pdf", 86400)
