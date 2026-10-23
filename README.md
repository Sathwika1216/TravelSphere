# TravelSphere

TravelSphere is an AI-assisted travel planning prototype that helps users search destinations, define trip preferences, and generate a practical itinerary with a sample cost breakdown and group-travel planning workflow.

## Week 1 sprint audit

### GitHub issue verification

This repository currently contains the following open GitHub issues and statuses as verified against GitHub on 2026-10-23:

| Issue | Title | Status | Summary |
| --- | --- | --- | --- |
| #1 | Project Coordination, WBS & GitHub Management | Open | Sprint coordination, tracking, blockers, and GitHub management. |
| #2 | Define TravelSphere Problem Statement & User Flow | Open | Define the problem, target users, input data, and user journey. |
| #3 | AI Travel Agent / LLM Module | Open | Prototype planning for Gemini-backed travel-agent flow and prompt design. |
| #4 | Travel APIs & Data Sources | Open | API research, mock-data fallback, and data-source documentation. |
| #5 | TravelSphere Backend | Open | API structure, validation, and backend integration plumbing. |
| #6 | TravelSphere Frontend | Closed | Frontend rewrite and prototype UI for trip generation. |
| #7 | Database Design & System Testing | Open | Schema planning, sample data, and system testing/reporting. |

### Team responsibilities for Week 1

The sprint is organized across seven workstreams:

1. Project lead and coordination
2. Product and UX research
3. AI agent prototype and prompt design
4. Travel API and data-source research
5. Backend engineering and validation
6. Frontend user experience and prototype UI
7. Database/schema and QA testing

### Prototype status

Completed locally in the current repository:

- Flask backend with POST /api/travel/plan and validation
- Gemini integration with a mock-data fallback
- React frontend trip planner with interest chips and itinerary results
- Indicative INR formatting and total-cost summary
- Cost breakdown and multi-traveller trip inputs added for the Week 1 completion work
- The trip summary groups major expenses such as transport, accommodation, food, and activities, then shows a total trip estimate and a per-person share based on the selected traveller count

Partially implemented or missing before the fix:

- Multi-traveller selection was not modeled in the form or API contract
- Cost breakdown was not exposed as a reusable UI component
- No tests existed for itinerary generation or backend validation
- No doc-based audit of Week 1 issue statuses existed

### Relevant files

- app.py — backend API and validation layer
- itinerary_generator.py — itinerary generation, mock-data fallback, and cost logic
- frontend/src/App.jsx — frontend planner and trip result experience
- frontend/src/App.css — frontend styles for the prototype
- .env.example — environment configuration for Gemini and app runtime

### Verification plan

- Run backend validation checks via Flask test client
- Run frontend build through Vite
- Run Python test coverage for itinerary generation and cost calculations
- Confirm that the mock-data fallback remains available without credentials
- Confirm the app still works with the existing Gemini env var path and no secret leaks

## Local setup

```bash
cd TravelSphere
python3 -m venv .venv
source .venv/bin/activate
pip install flask flask-cors python-dotenv google-genai pytest
cd frontend
npm install
npm run build
```

## Run the app

```bash
cd TravelSphere
python3 app.py
```

Then open the frontend in a browser via the Vite dev server in the frontend directory.

## Notes

- The app intentionally uses a mock itinerary fallback when GEMINI_API_KEY is not configured.
- It does not fabricate live flight or hotel pricing.
- All planning features remain local and sample-data based unless a real provider is configured.

