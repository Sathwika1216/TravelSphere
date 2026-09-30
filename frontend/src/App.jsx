import { useState } from 'react'
import './App.css'

const INTERESTS = [
  { id: 'beaches',   emoji: '🏖️', label: 'Beaches'   },
  { id: 'food',      emoji: '🍽️', label: 'Food'      },
  { id: 'nightlife', emoji: '🎉', label: 'Nightlife'  },
  { id: 'history',   emoji: '🏛️', label: 'History'   },
  { id: 'nature',    emoji: '🌿', label: 'Nature'     },
  { id: 'adventure', emoji: '🧗', label: 'Adventure'  },
  { id: 'shopping',  emoji: '🛍️', label: 'Shopping'  },
  { id: 'culture',   emoji: '🎭', label: 'Culture'    },
]

function App() {
  const [destination, setDestination] = useState('')
  const [days, setDays]               = useState('')
  const [budget, setBudget]           = useState('')
  const [interests, setInterests]     = useState([])
  const [itinerary, setItinerary]     = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const toggleInterest = (id) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!destination.trim()) {
      setError('Please enter a destination.')
      return
    }

    setLoading(true)
    setItinerary(null)
    setError('')

    const tripData = {
      destination: destination.trim() || 'Hyderabad',
      days:        Number(days)   || 3,
      budget:      Number(budget) || 10000,
      interests,
    }

    try {
      const response = await fetch('/api/travel/plan', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(tripData),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to generate trip')
      }

      const data = await response.json()
      setItinerary(data)
      // Scroll to result
      setTimeout(() => {
        document.getElementById('itinerary-result')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unable to generate trip. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setItinerary(null)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-wrapper">
      {/* ── Hero Header ─────────────────────────────────────── */}
      <header className="hero">
        <div className="hero-inner">
          <div className="logo-badge">✈️</div>
          <h1 className="hero-title">TravelSphere</h1>
          <p className="hero-sub">Your AI-Powered Travel Agent — Plan the Perfect Trip in Seconds</p>
        </div>
      </header>

      {/* ── Main Container ──────────────────────────────────── */}
      <main className="main-container">

        {/* ── Planning Form ─────────────────────────────────── */}
        <section className="planner-card glass-card" aria-label="Trip Planner">
          <h2 className="section-title">
            <span className="section-icon">🗺️</span> Plan My Trip
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="destination">📍 Destination</label>
                <input
                  id="destination"
                  type="text"
                  placeholder="e.g. Goa, Manali, Jaipur..."
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="days">📅 Number of Days</label>
                <input
                  id="days"
                  type="number"
                  min="1"
                  max="30"
                  placeholder="3"
                  value={days}
                  onChange={e => setDays(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="budget">💰 Budget (₹)</label>
                <input
                  id="budget"
                  type="number"
                  min="500"
                  placeholder="15000"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                />
              </div>
            </div>

            <fieldset className="interests-section">
              <legend>🎯 Your Interests</legend>
              <div className="interests-grid">
                {INTERESTS.map(({ id, emoji, label }) => (
                  <button
                    key={id}
                    type="button"
                    className={`interest-chip ${interests.includes(id) ? 'active' : ''}`}
                    onClick={() => toggleInterest(id)}
                    aria-pressed={interests.includes(id)}
                  >
                    <span>{emoji}</span> {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              id="generate-btn"
              type="submit"
              className="cta-button"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" /> Generating your trip…</>
                : '✨ Generate My Trip Plan'}
            </button>
          </form>

          {error && (
            <div className="error-banner" role="alert">
              ⚠️ {error}
            </div>
          )}

          {loading && (
            <div className="loading-panel" aria-live="polite">
              <div className="pulse-dots">
                <span /><span /><span />
              </div>
              <p>🤖 AI is crafting your personalised itinerary…</p>
            </div>
          )}
        </section>

        {/* ── Itinerary Result ──────────────────────────────── */}
        {itinerary && !loading && (
          <section id="itinerary-result" className="result-section" aria-label="Generated Itinerary">

            {/* Trip Summary */}
            <div className="trip-header glass-card">
              <div className="trip-meta">
                <h2 className="trip-title">
                  📍 {itinerary.destination}
                </h2>
                <div className="trip-badges">
                  <span className="badge">📅 {itinerary.days} Day{itinerary.days !== 1 ? 's' : ''}</span>
                  <span className="badge green">
                    💰 ₹{Number(itinerary.total_estimated_cost).toLocaleString('en-IN')} est.
                  </span>
                </div>
              </div>
              {itinerary.summary && (
                <p className="trip-summary">{itinerary.summary}</p>
              )}
            </div>

            {/* Day-by-day Itinerary */}
            <div className="days-container">
              {itinerary.itinerary.map((day) => (
                <div className="day-card glass-card" key={day.day}>
                  <div className="day-header">
                    <span className="day-pill">Day {day.day}</span>
                    {day.theme && <span className="day-theme">{day.theme}</span>}
                  </div>

                  <div className="day-timeline">
                    {day.morning && (
                      <div className="timeline-slot">
                        <span className="slot-label morning">🌅 Morning</span>
                        <p>{day.morning}</p>
                      </div>
                    )}
                    {day.afternoon && (
                      <div className="timeline-slot">
                        <span className="slot-label afternoon">☀️ Afternoon</span>
                        <p>{day.afternoon}</p>
                      </div>
                    )}
                    {day.evening && (
                      <div className="timeline-slot">
                        <span className="slot-label evening">🌆 Evening</span>
                        <p>{day.evening}</p>
                      </div>
                    )}
                  </div>

                  <div className="day-details">
                    {day.places && day.places.length > 0 && (
                      <div className="detail-row">
                        <span className="detail-icon">📍</span>
                        <div>
                          <strong>Places:</strong>
                          <span className="tags">
                            {day.places.map((p, i) => (
                              <span className="tag" key={i}>{p}</span>
                            ))}
                          </span>
                        </div>
                      </div>
                    )}
                    {day.activities && day.activities.length > 0 && (
                      <div className="detail-row">
                        <span className="detail-icon">🎯</span>
                        <div>
                          <strong>Activities:</strong>
                          <span className="tags">
                            {day.activities.map((a, i) => (
                              <span className="tag activity-tag" key={i}>{a}</span>
                            ))}
                          </span>
                        </div>
                      </div>
                    )}
                    {day.food && day.food.length > 0 && (
                      <div className="detail-row">
                        <span className="detail-icon">🍴</span>
                        <div>
                          <strong>Food:</strong>
                          <span className="tags">
                            {day.food.map((f, i) => (
                              <span className="tag food-tag" key={i}>{f}</span>
                            ))}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="day-cost">
                      💰 Day {day.day} estimate: <strong>₹{Number(day.estimated_cost).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Budget Summary */}
            <div className="budget-card glass-card">
              <h3>💰 Total Estimated Budget</h3>
              <div className="budget-amount">
                ₹{Number(itinerary.total_estimated_cost).toLocaleString('en-IN')}
              </div>
              <p className="budget-note">* Estimates are indicative and may vary based on actual prices.</p>
            </div>

            {/* Recommendations */}
            {itinerary.recommendations && itinerary.recommendations.length > 0 && (
              <div className="info-card glass-card">
                <h3>⭐ Recommendations</h3>
                <ul className="info-list">
                  {itinerary.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Travel Tips */}
            {itinerary.tips && itinerary.tips.length > 0 && (
              <div className="info-card tips-card glass-card">
                <h3>💡 Travel Tips</h3>
                <ul className="info-list">
                  {itinerary.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Plan Again Button */}
            <div className="plan-again-wrapper">
              <button
                id="plan-again-btn"
                className="cta-button secondary"
                onClick={handleReset}
              >
                🔄 Plan Another Trip
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>TravelSphere &copy; 2025 · AI Travel Agent</p>
      </footer>
    </div>
  )
}

export default App