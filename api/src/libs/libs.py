import asyncio
import json
import logging
import time

from tokenize import String
from flask import make_response
from functools import partial, wraps


def send_response(response_data, content_type, cache_control_age, status_code=200):
    response = make_response(response_data, status_code)
    response.headers = {
        "Content-Type": content_type,
        "Cache-Control": f"public, max-age={cache_control_age}, immutable",
    }
    return response


def send_error_response(error_message: String, error_data, status_code: int = 500):
    response = make_response(error_message, status_code)
    response.headers = {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=0, immutable",
    }

    # Logging this error
    logging.warning(f"{error_message}: {error_data}")

    return response


def validate_request(input_data):
    is_valid_request = True
    for k, v in input_data:
        if not validate(k, v):
            is_valid_request = False
            print(f"\n\nFailed to validate: {k} {v}")
            break

    return is_valid_request


def validate(validation_type, validation_data):
    # https://facts.usps.com/42000-zip-codes/
    valid_zip_codes = [501, 99950]  # Starting zip code is 00501
    valid_years = ["2022", "2023"]
    valid_models = [
        "Ioniq%205",
        "Ioniq%206",
        "Ioniq%20Phev",
        "Kona%20Ev",
        "Santa%20Fe%20Phev",
        "Tucson%20Phev",
        "N",  # EV6
        "V",  # Niro EV
        "F",  # Niro Plug-in Hybrid
        "R",  # Sportage Plug-in Hybrid
        "T",  # Sorento Plug-in Hybrid
        "GV60",  # Genesis GV60
        "ElectrifiedG80",  # Genesis Electrified G80
        "ID.4",  # VW ID.4
        "mache",  # Ford Mustang Mach-E
        "Bolt EV",  # Chevrolet Bolt EV
        "Bolt EUV",  # Chevrolet Bolt EUV
        "etron",  # Audi e-tron
        "etrongt",  # Audi e-tron GT
        "q4",  # Audi Q4 e-tron
    ]
    valid_radii = [1, 999]

    if "zip" in validation_type:  # Capture variations of "zip code"
        # Can zip be cast to an int?
        try:
            int(validation_data)
        except ValueError:
            return False

        # Zip too short
        if len(validation_data) != 5:
            return False

        # Is zip within valid zip codes?
        return (
            int(validation_data) >= valid_zip_codes[0]
            and int(validation_data) <= valid_zip_codes[1]
        )

    elif validation_type == "year":
        return validation_data in valid_years

    elif validation_type == "model" or validation_type == "series":
        return validation_data in valid_models

    elif validation_type == "radius":
        # Can radius be cast to an int?
        try:
            int(validation_data)
        except ValueError:
            return False

        # Is radius within valid_radii?
        return (
            int(validation_data) >= valid_radii[0]
            and int(validation_data) <= valid_radii[1]
        )


# TODO: Move this logic to the Vue app
def flatten_api_results(input_data: str):
    tmp = []
    input_data = input_data["data"][0]["dealerInfo"]

    if input_data:
        for dealer in range(0, len(input_data)):
            for k, v in input_data[dealer].items():
                if "vehicles" in k and v is not None:
                    for i in range(0, len(v)):
                        tmp.append(
                            {**input_data[dealer], **input_data[dealer]["vehicles"][i]}
                        )

        for i in range(0, len(tmp)):
            del tmp[i]["vehicles"]

            tmp[i]["ExtColorLongDesc"] = tmp[i]["colors"][0]["ExtColorLongDesc"]

        return json.dumps(tmp)
    else:
        return json.dumps({})


def timeit(function_to_time):
    @wraps(function_to_time)
    def timed(*args, **kw):

        start_time = time.perf_counter_ns()
        output = function_to_time(*args, **kw)
        end_time = time.perf_counter_ns()
        total_time = end_time - start_time

        # TODO: Push this to a custom metric
        print(f"Function {function_to_time.__name__} took {total_time/1000000:.5f} ms")

        return output

    return timed


def async_timeit(function_to_time):
    @wraps(function_to_time)
    async def wrapper(*args, **kwargs):
        start_time = time.perf_counter_ns()
        try:
            return await function_to_time(*args, **kwargs)
        finally:
            total_time = time.perf_counter_ns() - start_time
            # TODO: Push this to a custom metric
            print(
                f"Function {function_to_time.__name__} took {total_time/1000000:.5f} ms"
            )

    return wrapper


def fire_and_forget(f):
    """https://dotmethod.me/posts/python-async-fire-and-forget/"""

    @wraps(f)
    def wrapped(*args, **kwargs):
        loop = asyncio.get_event_loop()
        if callable(f):
            return loop.run_in_executor(None, partial(f, *args, **kwargs))
        else:
            raise TypeError("Task must be a callable")

    return wrapped
