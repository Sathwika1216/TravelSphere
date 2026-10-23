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

## Animated conversation & accessibility

The travel assistant chat (`frontend/src/App.jsx` and `frontend/src/App.css`) provides visual feedback for message turns while respecting user motion preferences:

- **Agent typing indicator:** When a user submits a chat prompt via `handleChatSend`, `chatLoading` is set to `true` for the 700ms response window and the composer input and `Send` button are temporarily disabled. Inside `.chat-thread` (`aria-live="polite"`), a `.chat-message.agent.typing-message` element renders `.message-bubble.typing-bubble` (`aria-label="Typing indicator"`) containing three `<span>` dots animated with `@keyframes blink` (`1.2s infinite ease-in-out`) and staggered `animation-delay`s (`0s`, `0.2s`, and `0.4s`), scaling between `0.7` (`opacity: 0.5`) and `1` (`opacity: 1`).
- **Message-entry animation & conversation flow:** Outgoing user prompts (`.chat-message.user`) and incoming agent replies (`.chat-message.agent`) are appended sequentially to `chatMessages` and rendered as `.message-bubble` items within the scrollable `.chat-thread` container, alongside automatic agent summary messages when a trip plan is generated (`handleSubmit`) and smooth scroll transitions (`scrollIntoView({ behavior: 'smooth' })`).
- **Reduced-motion support:** A `@media (prefers-reduced-motion: reduce)` media query in `frontend/src/App.css` overrides `animation-duration: 0.01ms !important`, `animation-iteration-count: 1 !important`, `transition-duration: 0.01ms !important`, and `scroll-behavior: auto !important` across `*, *::before, *::after`, disabling continuous keyframe animations (such as `blink`, `pulse-dot`, `spin`, and `float`) and smooth-scroll motion for users who prefer reduced motion.

## Cost calculation utility

The trip cost calculation utility (`calculate_cost_breakdown` in `itinerary_generator.py` and `TripCostBreakdown` in `frontend/src/App.jsx`) provides equal expense splitting for group travel:

- **Equal expense splitting:** Divides the total estimated trip cost equally among all travellers to determine each person's individual share (for example, ₹12,000 divided among 4 travellers = ₹3,000 each).

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

