import json
import logging
import requests


def get(url, query_params, request_headers):
    try:
        if len(query_params) > 0:
            r = requests.get(url, params=query_params, headers=request_headers)
        else:
            r = requests.get(url, headers=request_headers)
    except requests.exceptions.RequestException as e:
        logging.error(f"Request Error: {e}")
        request_debug = {
            "Content": r.content,
            "Elapsed": r.elapsed,
            "Headers": r.headers,
            "Is_OK": r.ok,
            "Reason": r.reason,
            "Request_Type": r.request,
            "Status_Code": r.status_code,
            "Request_URL": r.url,
        }
        logging.error(json.dumps(request_debug))
        return "{}", 500

    return r


def post(url, request_headers, post_data):
    try:
        r = requests.post(url, json=post_data, headers=request_headers)
        data = r.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Request Error: {e}")
        request_debug = {
            "Content": r.content,
            "Elapsed": r.elapsed,
            "Headers": r.headers,
            "Is_OK": r.ok,
            "Reason": r.reason,
            "Request_Type": r.request,
            "Status_Code": r.status_code,
            "Request_URL": r.url,
        }
        logging.error(json.dumps(request_debug))
        return "{}", 500

    return data
