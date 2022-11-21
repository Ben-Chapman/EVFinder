import pytest
import requests
from faker import Faker

from .vcr import program_vcr


vcr = program_vcr()


@pytest.fixture(name="test_cassette", params=["mache"], autouse=True)
def _test_cassette(request):
    fake = Faker()
    api_base = "http://localhost:8081"

    vehicle_model = request.param

    params = {"zip": "90210", "year": "2023", "radius": "125", "model": vehicle_model}

    headers = {"User-Agent": fake.user_agent()}

    cassette_name = f"ford-{vehicle_model}.yaml"
    with vcr.use_cassette(cassette_name):
        api_response = requests.get(
            url=api_base + "/api/inventory/ford",
            headers=headers,
            params=params,
        )

    return api_response


def test_api_returns_200(test_cassette):
    assert test_cassette.status_code == 200, (
        f"API response status code was "
        f"{test_cassette.status_code}, it was expected to be 200"
    )


def test_ford_inventory_response_is_json(test_cassette):
    try:
        test_cassette.json()
    except Exception:
        pytest.fail(f"API response is not valid JSON. It was: {test_cassette.text}")


def test_ford_inventory_contains_success(test_cassette):
    assert (
        "success" in test_cassette.json()["status"]
    ), f"'success' not found in API response. It was: {test_cassette.json()['status']}"


def test_ford_inventory_contains_dealerSlug(test_cassette):
    """
    dealerSlug is a hash that the Ford API provides, and is needed for all inventory API
    calls. It's a string, and appears to be a 64-bit value
    """
    dealer_slug = test_cassette.json()["dealerSlug"]

    assert (
        type(dealer_slug) == str and len(dealer_slug) > 30
    ), f"No dealer slug was found, or the dealer slug appears to be invalid: {dealer_slug}"


def test_ford_inventory_has_vehicles(test_cassette):
    inventory = test_cassette.json()["data"]["filterResults"]["ExactMatch"]["vehicles"]

    assert len(inventory) > 0, (
        "No inventory found in API response. " f"It was: {test_cassette.json()}"
    )


def test_ford_inventory_should_have_paged_inventory_data(test_cassette):
    """
    The Ford API provides an initial inventory response of max(12) vehicles for any
    given search radius. The EVFinder API will make a second API call to get the remaining
    inventory if needed. Validating the remaining inventory is present in the API response
    and the inventory count provided by Ford matches the sum of the vehicles array
    """
    initial_inventory = test_cassette.json()["data"]["filterResults"]["ExactMatch"][
        "vehicles"
    ]
    if len(initial_inventory) == 12:
        remaining_inventory = test_cassette.json()["rdata"]["filterResults"][
            "ExactMatch"
        ]["vehicles"]
        assert (
            len(remaining_inventory) >= 1
            and (len(initial_inventory) + len(remaining_inventory))
            == test_cassette.json()["data"]["filterResults"]["ExactMatch"]["totalCount"]
        )


def test_ford_vin():
    # Placeholder for now
    pass
