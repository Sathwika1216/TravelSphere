from app import app
from itinerary_generator import calculate_cost_breakdown, generate_itinerary


def test_cost_breakdown_validates_inr_split():
    breakdown = calculate_cost_breakdown(16000, 4)

    assert breakdown["transport"] == 5600
    assert breakdown["accommodation"] == 4800
    assert breakdown["food"] == 3200
    assert breakdown["activities"] == 2400
    assert breakdown["total"] == 16000
    assert breakdown["traveller_count"] == 4
    assert breakdown["per_person"] == 4000


def test_itinerary_includes_group_traveller_metadata():
    result = generate_itinerary(
        destination="Goa",
        days=3,
        budget=15000,
        interests=["beaches", "food"],
        travellers=[{"name": "Asha"}, {"name": "Rohan"}, {"name": "Meera"}],
    )

    assert result["traveller_count"] == 3
    assert result["travellers"] == ["Asha", "Rohan", "Meera"]
    assert result["cost_breakdown"]["traveller_count"] == 3
    assert result["cost_breakdown"]["per_person"] > 0


def test_api_rejects_zero_travellers():
    client = app.test_client()

    response = client.post(
        "/api/travel/plan",
        json={
            "destination": "Goa",
            "days": 3,
            "budget": 15000,
            "interests": ["beaches"],
            "travellers": [],
            "traveller_count": 0,
        },
    )

    assert response.status_code == 400
    assert "At least one traveller is required" in response.get_json()["error"]


def test_api_generates_itinerary_for_group_trip():
    client = app.test_client()

    response = client.post(
        "/api/travel/plan",
        json={
            "destination": "Hyderabad",
            "days": 2,
            "budget": 25000,
            "interests": ["history", "food"],
            "travellers": [{"name": "You"}, {"name": "Asha"}],
        },
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["destination"] == "Hyderabad"
    assert payload["traveller_count"] == 2
    assert payload["cost_breakdown"]["traveller_count"] == 2
