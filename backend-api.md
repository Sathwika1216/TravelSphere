 # TravelSphere Backend API Documentation

## Overview

TravelSphere uses a Flask-based backend API to generate travel itineraries.

The backend exposes an API endpoint that accepts travel preferences such as destination, number of days, budget, and interests, and returns a generated itinerary.

---

## Base URL

When running locally, the API is available at:

`http://localhost:5000`

---

## API Endpoints

### 1. Health Check

**Endpoint:** `GET /`

This endpoint is used to check whether the TravelSphere backend is running.

#### Response

```json
{
  "status": "ok",
  "service": "TravelSphere API"
}
```

---

### 2. Generate Travel Plan

**Endpoint:** `POST /api/travel/plan`

This endpoint generates a travel itinerary based on the user's travel preferences.

#### Request Body

```json
{
  "destination": "Hyderabad",
  "days": 3,
  "budget": 10000,
  "interests": [
    "food",
    "history"
  ]
}
```

#### Request Parameters

| Parameter | Type | Description |
|---|---|---|
| `destination` | String | Destination for the trip |
| `days` | Integer | Number of days for the trip |
| `budget` | Integer | Maximum budget for the trip |
| `interests` | Array | List of travel interests |

---

## Input Validation

The API validates the received travel information before generating the itinerary.

### Destination

The destination must not be empty.

If no destination is provided, the API returns HTTP status `400`.

```json
{
  "error": "Destination is required"
}
```

### Number of Days

The number of days must be between **1 and 30**.

If the value is outside this range, the API returns HTTP status `400`.

```json
{
  "error": "Days must be between 1 and 30"
}
```

### Budget

The budget must be at least **₹100**.

If the budget is less than ₹100, the API returns HTTP status `400`.

```json
{
  "error": "Budget must be at least ₹100"
}
```

---

## Default Values

If values are not provided, the backend uses the following defaults:

| Parameter | Default Value |
|---|---|
| `destination` | `Hyderabad` |
| `days` | `3` |
| `budget` | `10000` |
| `interests` | Empty list |

---

## API Processing Flow

The travel planning request follows these steps:

1. The client sends a `POST` request to `/api/travel/plan`.
2. The backend reads the JSON request body.
3. The destination, number of days, budget, and interests are extracted.
4. The input values are validated.
5. The backend calls the `generate_itinerary()` function from `itinerary_generator.py`.
6. The generated itinerary is returned as a JSON response.

---

## Error Handling

The API handles different types of errors.

### Invalid Input

If an input value cannot be converted to the expected type, the API returns HTTP status `400`.

```json
{
  "error": "Invalid input: ..."
}
```

### Missing Request Body

If the request does not contain a valid body, the API returns HTTP status `400`.

```json
{
  "error": "Request body required"
}
```

### Server Error

If an unexpected error occurs while generating the itinerary, the API returns HTTP status `500`.

```json
{
  "error": "Failed to generate itinerary. Please try again."
}
```

---

## CORS

The backend uses Flask-CORS to allow cross-origin requests.

This allows the TravelSphere frontend to communicate with the Flask backend.

---

## Environment Variables

The backend loads environment variables from a `.env` file when available.

| Variable | Description |
|---|---|
| `PORT` | Port on which the Flask server runs |
| `FLASK_DEBUG` | Enables or disables Flask debug mode |
| `GEMINI_API_KEY` | API key used by the itinerary generation component when configured |

The default port is `5000`.

---

## Running the Backend

The backend can be started using the project's startup configuration.

When the application starts successfully, the API is available at:

`http://localhost:5000`

The health-check endpoint can then be accessed using:

`GET /`

---

## Backend Components

### `app.py`

The main Flask application.

It is responsible for:

- Creating the Flask application
- Configuring CORS
- Defining API routes
- Receiving and validating travel requests
- Calling the itinerary generator
- Returning JSON responses

### `itinerary_generator.py`

This module contains the `generate_itinerary()` function used by the backend to generate the travel itinerary.

---

## Summary

The TravelSphere backend provides a REST API for travel itinerary generation.

The main endpoint is:

`POST /api/travel/plan`

It accepts travel preferences and passes them to the itinerary generation module, returning the generated itinerary as JSON.