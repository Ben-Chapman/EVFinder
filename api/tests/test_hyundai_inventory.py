import pytest
import requests
from faker import Faker

from .vcr import program_vcr


vcr = program_vcr()


@pytest.fixture(
    name="test_cassette",
    params=[
        "Ioniq%205",
        # "Ioniq%20Phev",
        # "Ioniq%20Phev",
        # "Santa%20Fe%20Phev",
        # "Tucson%20Phev",
    ],
)
def _test_cassette(request):
    fake = Faker()
    api_base = "http://localhost:8081"

    vehicle_model = request.param

    params = {"zip": "90210", "year": "2023", "radius": "125", "model": vehicle_model}

    headers = {"User-Agent": fake.user_agent()}

    cassette_name = f"hyundai-{vehicle_model}.yaml"
    with vcr.use_cassette(cassette_name):
        api_response = requests.get(
            url=api_base + "/api/inventory/hyundai",
            headers=headers,
            params=params,
        )

    return api_response


def test_api_returns_200(test_cassette):
    assert test_cassette.status_code == 200, (
        f"API response status code was "
        f"{test_cassette.status_code}, it was expected to be 200"
    )


def test_hyundai_inventory_response_is_json(test_cassette):
    try:
        test_cassette.json()
    except Exception:
        pytest.fail(f"API response is not valid JSON. It was: {test_cassette.text}")


def test_hyundai_inventory_contains_success(test_cassette):
    assert (
        len(test_cassette.json()) > 0
    ), f"'success' not found in API response. It was: {test_cassette.json()}"


def test_hyundai_inventory_has_vehicles(test_cassette):
    assert len(test_cassette.json()) > 0, (
        "No inventory found in API response. " f"It was: {test_cassette.json()}"
    )


def test_hyundai_vin():
    # Placeholder for now
    pass
