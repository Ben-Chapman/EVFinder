import pytest
import requests
from faker import Faker

from .vcr import program_vcr


vcr = program_vcr()


@pytest.fixture(name="test_cassette", params=["ID.4"])
def _test_cassette(request):
    fake = Faker()
    api_base = "http://localhost:8081"

    vehicle_model = request.param

    params = {"zip": "90210", "year": "2023", "radius": "125", "model": vehicle_model}

    headers = {"User-Agent": fake.user_agent()}

    cassette_name = f"volkswagen-{vehicle_model}.yaml"
    with vcr.use_cassette(cassette_name):
        api_response = requests.get(
            url=api_base + "/api/inventory/volkswagen",
            headers=headers,
            params=params,
        )

    return api_response


def test_api_returns_200(test_cassette):
    assert test_cassette.status_code == 200, (
        f"API response status code was "
        f"{test_cassette.status_code}, it was expected to be 200"
    )


def test_volkswagen_inventory_response_is_json(test_cassette):
    try:
        test_cassette.json()
    except Exception:
        pytest.fail(f"API response is not valid JSON. It was: {test_cassette.text}")


def test_volkswagen_inventory_has_vehicles(test_cassette):
    try:
        inventory = test_cassette.json()["data"]["inventory"]["vehicles"]
    except KeyError:
        print(f"Inventory key not found: {test_cassette.json()}")
    assert len(inventory) > 0, (
        "No inventory found in API response. "
        f"It was: {test_cassette.json()['data']['listResponse']}"
    )


def test_volkswagen_inventory_reported_count_matches_inventory(test_cassette):
    """
    The VW API provides a totalVehicles element, with the number of vehicles found.
    Ensuring that value matches the count of vehicles actually returned from the API
    """
    inventory = test_cassette.json()
    assert int(inventory["data"]["inventory"]["totalVehicles"]) == len(
        inventory["data"]["inventory"]["vehicles"]
    ), "Volkswagen totalVehicles does not match the number of vehicles returned from the API"


def test_volkswagen_vin():
    # Placeholder for now
    pass
