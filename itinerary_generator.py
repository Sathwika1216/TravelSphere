import json

PROMPT_TEMPLATE = """
You are a travel itinerary generator.

Generate a travel itinerary for:

Destination: {destination}
Days: {days}
Budget: {budget}
Interests: {interests}

Rules:
1. Follow the exact number of days.
2. Respect the user's budget.
3. Consider the selected interests.
4. Give realistic activities.
5. Return JSON only.
6. Follow the exact schema.
7. Do not add explanations outside JSON.

Schema:

{{
  "destination": "string",
  "days": number,
  "itinerary": [
    {{
      "day": number,
      "places": ["string"],
      "activities": ["string"],
      "food": ["string"],
      "estimated_cost": number
    }}
  ],
  "total_estimated_cost": number
}}

Return JSON only.
"""


def mock_itinerary(destination, days, budget, interests):
    daily_cost = budget // days

    itinerary = []

    for day in range(1, days + 1):
        itinerary.append({
            "day": day,
            "places": [f"{destination} Attraction {day}"],
            "activities": interests if interests else ["Sightseeing"],
            "food": ["Local Cuisine"],
            "estimated_cost": daily_cost
        })

    return {
        "destination": destination,
        "days": days,
        "itinerary": itinerary,
        "total_estimated_cost": daily_cost * days
    }


def generate_itinerary(destination, days, budget, interests):
    try:
        # TODO:
        # Replace this section with Gemini/OpenAI API call

        prompt = PROMPT_TEMPLATE.format(
            destination=destination,
            days=days,
            budget=budget,
            interests=", ".join(interests)
        )

        print("Prompt sent to AI:")
        print(prompt)

        # Mock AI response for now
        return mock_itinerary(
            destination,
            days,
            budget,
            interests
        )

    except Exception:
        return mock_itinerary(
            destination,
            days,
            budget,
            interests
        )


if __name__ == "__main__":

    result = generate_itinerary(
        destination="Hyderabad",
        days=3,
        budget=10000,
        interests=["food", "history"]
    )

    print(json.dumps(result, indent=2))