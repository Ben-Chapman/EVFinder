import pytest
import requests
from faker import Faker

from .vcr import program_vcr


vcr = program_vcr()


@pytest.fixture(name="test_cassette", params=["N", "V"])
def _test_cassette(request):
    fake = Faker()
    api_base = "http://localhost:8081"

    vehicle_model = request.param

    params = {"zip": "90210", "year": "2023", "radius": "125", "model": vehicle_model}

    headers = {"User-Agent": fake.user_agent()}

    cassette_name = f"kia-{vehicle_model}.yaml"
    with vcr.use_cassette(cassette_name):
        api_response = requests.get(
            url=api_base + "/api/inventory/kia",
            headers=headers,
            params=params,
        )

    return api_response


def test_api_returns_200(test_cassette):
    assert test_cassette.status_code == 200, (
        f"API response status code was "
        f"{test_cassette.status_code}, it was expected to be 200"
    )


def test_kia_inventory_response_is_json(test_cassette):
    try:
        test_cassette.json()
    except Exception:
        pytest.fail(f"API response is not valid JSON. It was: {test_cassette.text}")


def test_kia_inventory_has_vehicles(test_cassette):
    try:
        test_cassette.json()["inventoryVehicles"]
    except KeyError as e:
        print(f"\nMissing Key for {test_cassette}: {e}\n{test_cassette.json()}")
    assert len(test_cassette.json()["inventoryVehicles"]) > 0, (
        "No inventory found in API response. " f"It was: {test_cassette}"
    )


def test_kia_inventory_reported_count_matches_inventory(test_cassette):
    """
    The Kia API provides a vehicleCount element, with the number of vehicles found.
    Ensuring that value matches the count of vehicles actually returned from the API
    """
    inventory = test_cassette.json()
    assert int(inventory["vehicleCount"]) == len(
        inventory["inventoryVehicles"]
    ), "Kia vehicleCount does not match the number of vehicles returned from the API"


def test_kia_vin():
    # Placeholder for now
    pass
