import { useState } from 'react'
import './App.css'

const mockItinerary = {
  destination: 'Hyderabad',
  days: 3,
  itinerary: [
    {
      day: 1,
      places: ['Charminar'],
      activities: ['Sightseeing'],
      food: ['Hyderabadi Biryani'],
      estimated_cost: 2500,
    },
    {
      day: 2,
      places: ['Golconda Fort'],
      activities: ['Historical sightseeing'],
      food: ['Local cuisine'],
      estimated_cost: 2000,
    },
    {
      day: 3,
      places: ['Hussain Sagar'],
      activities: ['Local sightseeing'],
      food: ['Local cuisine'],
      estimated_cost: 2500,
    },
  ],
  total_estimated_cost: 7000,
}

function App() {
  const [destination, setDestination] = useState('')
  const [days, setDays] = useState('')
  const [budget, setBudget] = useState('')
  const [interests, setInterests] = useState([])
  const [itinerary, setItinerary] = useState(null)

  // Loading state
  const [loading, setLoading] = useState(false)

  // Error state
  const [error, setError] = useState('')

  const handleInterestChange = (interest) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setItinerary(null)
    setError('')

    const tripData = {
      destination: destination || 'Hyderabad',
      days: Number(days) || 3,
      budget: Number(budget) || 10000,
      interests,
    }

    try {
      const response = await fetch('/api/travel/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate trip')
      }

      const data = await response.json()

      setItinerary(data)
    } catch (error) {
      console.error(error)
      setError('Unable to generate trip. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="travel-app">
      <div className="travel-card">
        <h1>TravelSphere</h1>

        <p className="subtitle">
          Plan your perfect trip with AI
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="destination">Destination</label>

          <input
            id="destination"
            type="text"
            placeholder="Hyderabad"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          />

          <label htmlFor="days">Number of Days</label>

          <input
            id="days"
            type="number"
            min="1"
            placeholder="3"
            value={days}
            onChange={(event) => setDays(event.target.value)}
          />

          <label htmlFor="budget">Budget</label>

          <input
            id="budget"
            type="number"
            min="1"
            placeholder="10000"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          />

          <fieldset>
            <legend>Interests</legend>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={interests.includes('food')}
                onChange={() => handleInterestChange('food')}
              />
              Food
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={interests.includes('history')}
                onChange={() => handleInterestChange('history')}
              />
              History
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={interests.includes('adventure')}
                onChange={() => handleInterestChange('adventure')}
              />
              Adventure
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={interests.includes('nature')}
                onChange={() => handleInterestChange('nature')}
              />
              Nature
            </label>
          </fieldset>

          <button type="submit" disabled={loading}>
            {loading ? 'GENERATING...' : 'GENERATE TRIP'}
          </button>
        </form>

        {loading && (
          <p className="loading-message">
            Generating your trip...
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {itinerary && !loading && (
          <section className="itinerary">
            <h2>
              {itinerary.destination} — {itinerary.days} Day Trip
            </h2>

            {itinerary.itinerary.map((day) => (
              <div className="day-card" key={day.day}>
                <h3>DAY {day.day}</h3>

                <p>
                  📍 <strong>Places:</strong>{' '}
                  {day.places.join(', ')}
                </p>

                <p>
                  🎯 <strong>Activities:</strong>{' '}
                  {day.activities.join(', ')}
                </p>

                <p>
                  🍴 <strong>Food:</strong>{' '}
                  {day.food.join(', ')}
                </p>

                <p>
                  💰 <strong>Estimated Cost:</strong> ₹
                  {day.estimated_cost.toLocaleString('en-IN')}
                </p>
              </div>
            ))}

            <h3 className="total-cost">
              Total Estimated Cost: ₹
              {itinerary.total_estimated_cost.toLocaleString('en-IN')}
            </h3>
          </section>
        )}
      </div>
    </main>
  )
}

export default App 