import pytest
import requests
import vcr
from faker import Faker


vcr = vcr.VCR(
    cassette_library_dir="tests/cassettes",
    record_mode="once",
)


def get_name(input):
    return input


# @pytest.mark.parametrize("m", ["Bolt EV", "Bolt EUV"])
# class TestChevroletInventory:
@pytest.fixture(name="test_cassette", params=["Bolt EV", "Bolt EUV"])
def _test_cassette(request):
    fake = Faker()
    api_base = "http://localhost:8081"

    vehicle_model = request.param

    params = {"zip": "90210", "year": "2023", "radius": "125", "model": vehicle_model}

    headers = {"User-Agent": fake.user_agent()}

    cassette_name = f"chevrolet-{vehicle_model}.yaml"
    with vcr.use_cassette(cassette_name):
        api_response = requests.get(
            url=api_base + "/api/inventory/chevrolet",
            headers=headers,
            params=params,
        )

    return api_response


def test_api_returns_200(test_cassette):
    assert test_cassette.status_code == 200, (
        f"API response status code was "
        f"{test_cassette.status_code}, it was expected to be 200"
    )


def test_chevrolet_inventory_response_is_json(test_cassette):
    try:
        test_cassette.json()
    except Exception:
        pytest.fail(f"API response is not valid JSON. It was: {test_cassette.text}")


def test_chevrolet_inventory_contains_success(test_cassette):
    assert (
        "success" in test_cassette.json()["status"]
    ), f"'success' not found in API response. It was: {test_cassette.json()['status']}"


def test_chevrolet_inventory_has_vehicles(test_cassette):
    assert len(test_cassette.json()["data"]["listResponse"]) > 0, (
        "No inventory found in API response. "
        f"It was: {test_cassette.json()['data']['listResponse']}"
    )
