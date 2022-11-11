import json
import math
import requests

from flask import Blueprint, request

from libs.libs import send_response, send_error_response, validate_request

ford = Blueprint(name="ford", import_name=__name__)

s = requests.Session()


@ford.route("/api/inventory/ford", methods=["GET"])
def main():
    request_args = {
        "zip_code": request.args["zip"],
        "year": request.args["year"],
        "model": request.args["model"],
        "radius": request.args["radius"],
    }

    # Usually a request to the manufacturer's API is made with the requesting
    # user agent. The Ford API is behind Akamai, who treats a 'forged' UA as a
    # bot and will tarpit the request. So just letting the requests UA be used.
    headers = {
        "Referer": f"https://shop.ford.com/inventory/{request_args['model']}/",
    }

    common_params = {
        "make": "Ford",
        "market": "US",
        "inventoryType": "Radius",
        "maxDealerCount": "1",
        "model": request_args["model"],
        "segment": "Crossover",
        "zipcode": request_args["zip_code"],
    }

    # Retrieve the dealer slug, which is needed for the inventory API call
    if validate_request(request_args.items()):
        slug = get_dealer_slug(headers, common_params)
        if 'ERROR' in slug:
            error_message = f"An error occurred with the Ford API. Try adjusting your search parameters."
            return send_error_response(
                error_message=error_message,
                error_data="",
                status_code=slug.split(':')[1])
    else:
        # Request could not be validated
        return send_error_response(
            error_message="Request could not be validated",
            error_data=request.url,
            status_code=400,
        )
    if slug:
        # Retrieve the initial batch of 12 vehicles
        inventory_params = {
            **common_params,
            "dealerSlug": slug,
            "Radius": request_args["radius"],
            "Order": "Distance",
        }

        inv = get_ford_inventory(headers=headers, params=inventory_params)

        # Add the dealer_slug to the response, the frontend will need this for future
        # API calls
        inv["dealerSlug"] = slug

        try:
            total_count = inv["data"]["filterResults"]["ExactMatch"]["totalCount"]
            if total_count > 12:
                remainder_inventory_params = {
                    **inventory_params,
                    "beginIndex": "12",
                    # The Ford inventory API pages 12 vehicles at a time, and their API does
                    # not seem to accept a random high value for endIndex, so calculating
                    # the actual value here
                    "endIndex": math.ceil(total_count / 12) * 12,
                }

                remainder = get_ford_inventory(
                    headers=headers, params=remainder_inventory_params
                )

                # Return the merged inventory + remainder JSON objects
                inv["rdata"] = remainder["data"]

                return send_response(
                    response_data=json.dumps(inv),
                    content_type="application/json",
                    cache_control_age=3600,
                )
            # else:
                
        except KeyError as e:
            print(f"No pagination for Inventory call: {e}")

        return send_response(
            response_data=json.dumps(inv),
            content_type="application/json",
            cache_control_age=3600,
            )


@ford.route("/api/vin/ford", methods=["GET"])
def get_vin_detail():
    vin_url = "https://shop.ford.com/aemservices/cache/inventory/dealer/vehicle-details"

    headers = {
        # 'User-Agent': request.headers['User-Agent'],  # Use the requesting UA
        "Referer": f"https://shop.ford.com/inventory/mach-e/results?zipcode={request.args['zip']}&Radius=20&year={request.args['year']}&Order=Distance"
    }

    vin_params = {
        "dealerSlug": request.args["dealerSlug"],
        "modelSlug": request.args["modelSlug"],
        "vin": request.args["vin"],
        "make": "Ford",
        "market": "US",
        "requestTowingData": "undefined",
        "inventoryType": "Radius",
        "ownerPACode": request.args["paCode"],
        "segment": "Crossover",
        "zipcode": request.args["zip"],
    }

    try:
        vin_data = s.get(
            url=vin_url,
            headers=headers,
            params=vin_params,
            timeout=(3.05, 15.05),
            verify=False,
        )
        vin_data.raise_for_status()
    except Exception as e:
        error_message = f"An error occurred with the Ford API: {e}"
        return send_error_response(error_message=error_message, error_data=vin_data)

    return send_response(
        response_data=vin_data.json(),
        content_type="application/json",
        cache_control_age=3600,
    )


def get_ford_inventory(headers, params):
    inventory_url = f"https://shop.ford.com/aemservices/cache/inventory/dealer-lot"

    inventory = s.get(
        url=inventory_url,
        headers=headers,
        params=params,
        timeout=(3.05, 30.05),
        verify=False,
    )

    return inventory.json()

def get_dealer_slug(headers, params):
    dealers_url = f"https://shop.ford.com/aemservices/cache/inventory/dealer/dealers"

    dealers = s.get(
        url=dealers_url,
        headers=headers,
        params=params,
        timeout=(3.05, 15.05),
        verify=False,
    )

    if dealers.status_code >= 400:
        return f"ERROR: {dealers.status_code}"
    else:
        dealers = dealers.json()
        if dealers["status"].lower() == "success" and len(dealers["data"]["Response"]) > 0:
            return dealers["data"]["firstFDDealerSlug"]
