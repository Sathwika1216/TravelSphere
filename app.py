"""
TravelSphere Backend Server
Flask API that exposes /api/travel/plan endpoint.
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from itinerary_generator import generate_itinerary

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "TravelSphere API"})


@app.route("/api/travel/plan", methods=["POST"])
def plan_trip():
    """
    POST /api/travel/plan
    Body: { destination, days, budget, interests[] }
    Returns: itinerary JSON
    """
    try:
        data = request.get_json(force=True)

        if not data:
            return jsonify({"error": "Request body required"}), 400

        destination = str(data.get("destination", "Hyderabad")).strip()
        days = int(data.get("days", 3))
        budget = int(data.get("budget", 10000))
        interests = data.get("interests", [])

        # Validate
        if not destination:
            return jsonify({"error": "Destination is required"}), 400
        if days < 1 or days > 30:
            return jsonify({"error": "Days must be between 1 and 30"}), 400
        if budget < 100:
            return jsonify({"error": "Budget must be at least ₹100"}), 400

        print(f"\n[API] Plan request → destination={destination}, days={days}, budget={budget}, interests={interests}")

        result = generate_itinerary(
            destination=destination,
            days=days,
            budget=budget,
            interests=interests
        )

        print(f"[API] Itinerary generated for {destination} ✓")
        return jsonify(result)

    except ValueError as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400
    except Exception as e:
        print(f"[API] Error: {e}")
        return jsonify({"error": "Failed to generate itinerary. Please try again."}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    print(f"\n🌍 TravelSphere API starting on http://localhost:{port}")
    print(f"   GEMINI_API_KEY: {'SET ✓' if os.environ.get('GEMINI_API_KEY') else 'NOT SET (using mock data)'}\n")
    app.run(host="0.0.0.0", port=port, debug=debug)
