import json
import os

PROMPT_TEMPLATE = """
You are an expert AI travel agent for Indian destinations.

Generate a detailed travel itinerary for the following trip:

Destination: {destination}
Days: {days}
Budget (INR): {budget}
Interests: {interests}

Rules:
1. Follow the exact number of days requested.
2. Respect the user's budget — keep total_estimated_cost within the budget.
3. Tailor activities to the user's interests.
4. Provide realistic, specific place names and activities.
5. Include morning, afternoon, and evening slots for each day.
6. Return ONLY valid JSON — no extra text outside the JSON.
7. Follow the exact schema below.

Schema:
{{
  "destination": "string",
  "days": number,
  "summary": "string (2-3 sentences describing the trip)",
  "itinerary": [
    {{
      "day": number,
      "theme": "string (e.g. Beach Day, Heritage Walk)",
      "morning": "string",
      "afternoon": "string",
      "evening": "string",
      "places": ["string"],
      "activities": ["string"],
      "food": ["string"],
      "estimated_cost": number
    }}
  ],
  "total_estimated_cost": number,
  "recommendations": ["string"],
  "tips": ["string"]
}}

Return JSON only.
"""

MOCK_DATA = {
    "goa": {
        "destination": "Goa",
        "days": None,
        "summary": "Goa is India's smallest state and a paradise for beach lovers, foodies, and night owls. From sun-soaked shores to colonial churches and vibrant nightlife, Goa offers a perfect blend of relaxation and excitement.",
        "daily_templates": [
            {
                "theme": "Arrival & North Goa Beaches",
                "morning": "Check in to your hotel and freshen up. Head to Calangute Beach for a relaxed morning swim.",
                "afternoon": "Visit Baga Beach and try water sports — parasailing, jet-ski, or banana boat rides.",
                "evening": "Stroll the Anjuna Flea Market (if open) or watch the sunset at Vagator Beach. Dinner at a beachside shack.",
                "places": ["Calangute Beach", "Baga Beach", "Vagator Beach"],
                "activities": ["Swimming", "Water Sports", "Sunset Watch", "Beach Shopping"],
                "food": ["Fresh Seafood Thali", "Fish Curry Rice", "Bebinca (Goan dessert)"],
                "estimated_cost": 4000
            },
            {
                "theme": "Culture, Food & Nightlife",
                "morning": "Visit Old Goa — Basilica of Bom Jesus and Se Cathedral. Explore the Portuguese heritage.",
                "afternoon": "Try authentic Goan lunch at a local restaurant. Visit Panaji city and the Fontainhas Latin Quarter.",
                "evening": "Experience Goa's legendary nightlife at Tito's or Club Cubana in Baga/Arpora.",
                "places": ["Basilica of Bom Jesus", "Se Cathedral", "Panaji", "Fontainhas", "Tito's Nightclub"],
                "activities": ["Heritage Walk", "Cultural Sightseeing", "Nightclub", "Goan Cuisine Tasting"],
                "food": ["Vindaloo", "Xacuti Chicken", "Prawn Balchão", "Feni Cocktail"],
                "estimated_cost": 4500
            },
            {
                "theme": "South Goa Serenity",
                "morning": "Drive to South Goa — Colva Beach and Benaulim Beach for a serene morning.",
                "afternoon": "Visit Dudhsagar Waterfalls (seasonal) or relax at Palolem Beach. Try fresh coconut water.",
                "evening": "Head to Chapora Fort for panoramic views. Farewell dinner at a rooftop restaurant in North Goa.",
                "places": ["Colva Beach", "Palolem Beach", "Dudhsagar Waterfalls", "Chapora Fort"],
                "activities": ["Beach Relaxation", "Waterfall Trek", "Sunset at Fort", "Photography"],
                "food": ["Goan Fish Fry", "Prawn Curry", "Sol Kadhi", "Coconut Feni"],
                "estimated_cost": 3500
            }
        ],
        "recommendations": [
            "Best beaches: Palolem (peaceful), Baga (lively), Vagator (scenic)",
            "Book water sports in advance during peak season (Oct–Mar)",
            "Rent a scooter (~₹300/day) for flexible exploration",
            "Try the Saturday Night Market at Arpora for food and shopping",
            "Avoid Monsoon season (Jun–Sep) for beach activities"
        ],
        "tips": [
            "Carry cash — many beach shacks don't accept cards",
            "Nightlife is best around Baga, Anjuna, and Vagator",
            "Stay in North Goa for nightlife, South Goa for peace",
            "Book accommodation 2–3 weeks ahead in peak season",
            "Always negotiate auto-rickshaw fares before riding"
        ]
    },
    "hyderabad": {
        "destination": "Hyderabad",
        "days": None,
        "summary": "Hyderabad, the City of Pearls, blends ancient Mughal grandeur with modern IT-era dynamism. Famous for its iconic biryani, historic forts, and vibrant bazaars.",
        "daily_templates": [
            {
                "theme": "Old City Heritage",
                "morning": "Visit Charminar — the iconic 16th-century monument. Explore Laad Bazaar for bangles and pearls.",
                "afternoon": "Tour Mecca Masjid and Chowmahalla Palace. Try authentic Hyderabadi biryani at Paradise or Bawarchi.",
                "evening": "Stroll along the Mir Alam Tank or visit Birla Mandir for city views at sunset.",
                "places": ["Charminar", "Laad Bazaar", "Mecca Masjid", "Chowmahalla Palace"],
                "activities": ["Heritage Walk", "Shopping", "Temple Visit", "Photography"],
                "food": ["Hyderabadi Biryani", "Haleem", "Irani Chai & Osmania Biscuits"],
                "estimated_cost": 2500
            },
            {
                "theme": "Forts & Nature",
                "morning": "Explore Golconda Fort — the medieval diamond fortress with its famous acoustics.",
                "afternoon": "Visit Qutb Shahi Tombs. Head to the Nehru Zoological Park for an afternoon outing.",
                "evening": "Visit Hussain Sagar Lake — take a boat ride to see the Buddha statue. Dinner at Tank Bund.",
                "places": ["Golconda Fort", "Qutb Shahi Tombs", "Hussain Sagar", "Buddha Statue"],
                "activities": ["Fort Exploration", "Boating", "Zoo Visit", "Laser Show (evening)"],
                "food": ["Biryani", "Sheer Khurma", "Mirchi ka Salan"],
                "estimated_cost": 2000
            },
            {
                "theme": "Modern Hyderabad & Shopping",
                "morning": "Visit Ramoji Film City (Asia's largest film studio). Book a tour in advance.",
                "afternoon": "Explore HITECH City and Cyber Towers area. Visit Shilparamam crafts village.",
                "evening": "Shopping at Inorbit Mall or GVK One. Try rooftop dining in Banjara Hills.",
                "places": ["Ramoji Film City", "HITECH City", "Shilparamam", "Banjara Hills"],
                "activities": ["Film Studio Tour", "Shopping", "Crafts Museum", "Modern City Exploration"],
                "food": ["Pesarattu", "Gongura Mutton", "Double ka Meetha"],
                "estimated_cost": 3000
            }
        ],
        "recommendations": [
            "Must-try: Hyderabadi Dum Biryani at Paradise Restaurant",
            "Best pearl shopping: Laad Bazaar near Charminar",
            "Use Metro Rail to avoid traffic — covers major tourist spots",
            "Golconda Fort sound & light show is a must-see experience",
            "Best time to visit: Oct–Feb for pleasant weather"
        ],
        "tips": [
            "Book Ramoji Film City tickets online to save time",
            "Hire a local guide at Golconda Fort for historical context",
            "Irani chai at a traditional Irani hotel is a unique experience",
            "Auto-rickshaws are metered — insist on meter",
            "Negotiate prices at Laad Bazaar before buying"
        ]
    },
    "default": {
        "destination": None,
        "days": None,
        "summary": "An exciting adventure awaits at this amazing destination filled with culture, food, and unforgettable experiences.",
        "daily_templates_factory": True,
        "recommendations": [
            "Research local transportation options beforehand",
            "Try authentic local cuisine at street food stalls",
            "Visit early morning to avoid tourist crowds at popular spots",
            "Keep emergency cash and a portable charger handy",
            "Check local weather and pack accordingly"
        ],
        "tips": [
            "Book accommodation in advance for peak season",
            "Learn a few words in the local language — it goes a long way",
            "Download offline maps before travelling",
            "Keep digital and physical copies of all travel documents",
            "Stay hydrated and carry a reusable water bottle"
        ]
    }
}


def normalize_interests(interests):
    if not interests:
        return []
    values = []
    for item in interests:
        normalized = str(item).strip().lower()
        if normalized:
            values.append(normalized)
    return values


def calculate_cost_breakdown(total_cost, traveller_count):
    total_cost = float(total_cost or 0)
    traveller_count = int(traveller_count or 1)

    if traveller_count < 1:
        raise ValueError("Traveller count must be at least 1.")
    if total_cost < 0:
        raise ValueError("Total trip cost must be non-negative.")

    transport = round(total_cost * 0.35)
    accommodation = round(total_cost * 0.30)
    food = round(total_cost * 0.20)
    activities = max(0, int(round(total_cost - transport - accommodation - food)))
    total = transport + accommodation + food + activities

    return {
        "transport": int(transport),
        "accommodation": int(accommodation),
        "food": int(food),
        "activities": int(activities),
        "total": int(total),
        "traveller_count": int(traveller_count),
        "per_person": int(round(total / traveller_count)) if traveller_count else 0,
    }


def build_dynamic_itinerary(destination, days, budget, interests, travellers=None):
    key = destination.strip().lower()
    mock = MOCK_DATA.get(key, MOCK_DATA["default"])
    normalized_interests = normalize_interests(interests)
    templates = mock.get("daily_templates", None)
    daily_cost = max(1, int(budget // max(days, 1)))

    itinerary = []
    for day_num in range(1, days + 1):
        if templates:
            tpl = templates[(day_num - 1) % len(templates)].copy()
            tpl["day"] = day_num
            tpl["estimated_cost"] = min(daily_cost, tpl.get("estimated_cost", daily_cost))
        else:
            activity_map = {
                "beaches": ["Beach relaxation", "Swimming", "Water sports"],
                "food": ["Local food tour", "Street food tasting", "Restaurant hopping"],
                "nightlife": ["Evening at local bar/club", "Night market visit", "Rooftop lounge"],
                "history": ["Heritage site visit", "Museum exploration", "Guided historical walk"],
                "nature": ["Park or garden visit", "Nature trail", "Scenic viewpoint"],
                "adventure": ["Adventure sports", "Trekking", "Zip-lining"],
                "shopping": ["Local market visit", "Shopping mall", "Souvenir hunting"],
                "culture": ["Cultural show", "Art gallery", "Local festival if available"],
            }
            chosen_activities = []
            chosen_places = []
            for interest in normalized_interests or ["sightseeing"]:
                acts = activity_map.get(interest, [f"{interest.capitalize()} activity"])
                chosen_activities.extend(acts[:1])
                chosen_places.append(f"{destination} {interest.capitalize()} Spot")

            tpl = {
                "day": day_num,
                "theme": f"Day {day_num} — Explore {destination}",
                "morning": f"Morning visit to a famous {destination} landmark.",
                "afternoon": f"Afternoon — {' and '.join(chosen_activities[:2]) if chosen_activities else 'sightseeing'}.",
                "evening": "Evening relaxation and local dining.",
                "places": chosen_places[:3] if chosen_places else [f"{destination} City Center"],
                "activities": chosen_activities[:3] if chosen_activities else ["Sightseeing"],
                "food": ["Local Cuisine", "Street Food", "Regional Specialty"],
                "estimated_cost": daily_cost
            }

        itinerary.append(tpl)

    total_estimated_cost = sum(day["estimated_cost"] for day in itinerary)
    traveller_names = []
    if travellers:
        for traveller in travellers:
            if isinstance(traveller, dict):
                name = traveller.get("name") or traveller.get("full_name")
                if name:
                    traveller_names.append(str(name).strip())
            elif traveller:
                traveller_names.append(str(traveller).strip())
    if not traveller_names:
        traveller_names = ["Traveller 1"]
    traveller_count = len(traveller_names)

    return {
        "destination": mock.get("destination") or destination,
        "days": days,
        "summary": mock.get("summary", f"An amazing {days}-day trip to {destination}."),
        "itinerary": itinerary,
        "total_estimated_cost": total_estimated_cost,
        "travellers": traveller_names,
        "traveller_count": traveller_count,
        "cost_breakdown": calculate_cost_breakdown(total_estimated_cost, traveller_count),
        "recommendations": mock.get("recommendations", MOCK_DATA["default"]["recommendations"]),
        "tips": mock.get("tips", MOCK_DATA["default"]["tips"])
    }


def generate_with_gemini(destination, days, budget, interests, travellers=None):
    try:
        from google import genai
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            return None

        client = genai.Client(api_key=api_key)
        prompt = PROMPT_TEMPLATE.format(
            destination=destination,
            days=days,
            budget=budget,
            interests=", ".join(interests) if interests else "general sightseeing"
        )
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        raw = response.text.strip()

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        data = json.loads(raw)
        if isinstance(data, dict):
            traveller_names = []
            if travellers:
                for traveller in travellers:
                    if isinstance(traveller, dict):
                        name = traveller.get("name") or traveller.get("full_name")
                        if name:
                            traveller_names.append(str(name).strip())
                    elif traveller:
                        traveller_names.append(str(traveller).strip())
            if not traveller_names:
                traveller_names = ["Traveller 1"]
            data.setdefault("travellers", traveller_names)
            data.setdefault("traveller_count", len(traveller_names))
            if "cost_breakdown" not in data:
                data["cost_breakdown"] = calculate_cost_breakdown(
                    data.get("total_estimated_cost", budget),
                    data.get("traveller_count", len(traveller_names)),
                )
        return data
    except Exception as e:
        print(f"[Gemini] Error: {e}")
        return None


def generate_itinerary(destination, days, budget, interests, travellers=None):
    ai_result = generate_with_gemini(destination, days, budget, interests, travellers=travellers)
    if ai_result:
        print(f"[AI] Generated itinerary for {destination} using Gemini.")
        return ai_result

    print(f"[Mock] Generating itinerary for {destination} using mock data.")
    return build_dynamic_itinerary(destination, days, budget, interests, travellers=travellers)


if __name__ == "__main__":
    result = generate_itinerary(
        destination="Goa",
        days=3,
        budget=15000,
        interests=["beaches", "food", "nightlife"],
        travellers=[{"name": "Asha"}, {"name": "Rohan"}, {"name": "Meera"}]
    )
    print(json.dumps(result, indent=2))
