import { useMemo, useState } from 'react'
import './App.css'

const INTERESTS = [
  { id: 'beaches', emoji: '🏖️', label: 'Beaches' },
  { id: 'food', emoji: '🍽️', label: 'Food' },
  { id: 'nightlife', emoji: '🎉', label: 'Nightlife' },
  { id: 'history', emoji: '🏛️', label: 'History' },
  { id: 'nature', emoji: '🌿', label: 'Nature' },
  { id: 'adventure', emoji: '🧗', label: 'Adventure' },
  { id: 'shopping', emoji: '🛍️', label: 'Shopping' },
  { id: 'culture', emoji: '🎭', label: 'Culture' },
]

const DEFAULT_TRAVELLERS = [
  { id: 'you', name: 'You' },
  { id: 'asha', name: 'Asha' },
  { id: 'rohan', name: 'Rohan' },
  { id: 'meera', name: 'Meera' },
  { id: 'arjun', name: 'Arjun' },
]

function formatInr(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) {
    return '₹0'
  }
  return `₹${number.toLocaleString('en-IN')}`
}

function TripCostBreakdown({ breakdown }) {
  if (!breakdown) {
    return null
  }

  return (
    <div className="cost-breakdown glass-card" aria-label="Trip cost breakdown">
      <div className="cost-header">
        <h3>💸 Cost Breakdown</h3>
        <span className="sample-badge">Sample data</span>
      </div>

      <dl className="cost-grid">
        <div className="cost-item">
          <dt>Transport</dt>
          <dd>{formatInr(breakdown.transport)}</dd>
        </div>
        <div className="cost-item">
          <dt>Accommodation</dt>
          <dd>{formatInr(breakdown.accommodation)}</dd>
        </div>
        <div className="cost-item">
          <dt>Food</dt>
          <dd>{formatInr(breakdown.food)}</dd>
        </div>
        <div className="cost-item">
          <dt>Activities</dt>
          <dd>{formatInr(breakdown.activities)}</dd>
        </div>
        <div className="cost-item total-row">
          <dt>Total trip cost</dt>
          <dd>{formatInr(breakdown.total)}</dd>
        </div>
        <div className="cost-item">
          <dt>Traveller count</dt>
          <dd>{breakdown.traveller_count}</dd>
        </div>
        <div className="cost-item">
          <dt>Estimated cost per person</dt>
          <dd>{formatInr(breakdown.per_person)}</dd>
        </div>
      </dl>
    </div>
  )
}

function App() {
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [days, setDays] = useState('3')
  const [budget, setBudget] = useState('15000')
  const [interests, setInterests] = useState([])
  const [selectedTravellers, setSelectedTravellers] = useState(['you', 'asha'])
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      text: 'Hi! I can help plan a group trip. Pick your destination, travellers, and budget to get started.',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const travellerMeta = useMemo(() => {
    const map = Object.fromEntries(DEFAULT_TRAVELLERS.map((traveller) => [traveller.id, traveller]))
    return map
  }, [])

  const selectedTravellerCount = selectedTravellers.length

  const toggleInterest = (id) => {
    setInterests((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleTraveller = (travellerId) => {
    setSelectedTravellers((prev) =>
      prev.includes(travellerId) ? prev.filter((item) => item !== travellerId) : [...prev, travellerId],
    )
  }

  const validateTrip = () => {
    if (!destination.trim()) {
      return 'Please enter a destination.'
    }
    if (!budget || Number(budget) <= 0) {
      return 'Budget must be greater than zero.'
    }
    if (Number(days) < 1 || Number(days) > 30) {
      return 'Trip duration must be between 1 and 30 days.'
    }
    if (selectedTravellerCount === 0) {
      return 'Select at least one traveller.'
    }
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return 'Please use valid travel dates.'
      }
      if (end < start) {
        return 'Trip end date must be on or after the start date.'
      }
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationMessage = validateTrip()
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setLoading(true)
    setItinerary(null)
    setError('')

    const selectedTravellerList = selectedTravellers
      .map((travellerId) => travellerMeta[travellerId])
      .filter(Boolean)
      .map((traveller) => ({ id: traveller.id, name: traveller.name }))

    const tripData = {
      destination: destination.trim(),
      days: Number(days) || 3,
      budget: Number(budget) || 10000,
      interests,
      travellers: selectedTravellerList,
      traveller_count: selectedTravellerList.length,
    }

    try {
      const response = await fetch('/api/travel/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to generate trip')
      }

      const data = await response.json()
      setItinerary(data)
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'agent',
          text: `I’ve built a ${data.days}-day ${data.destination} plan for ${data.traveller_count || selectedTravellerCount} travellers.`,
        },
      ])
      setTimeout(() => {
        document.getElementById('itinerary-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unable to generate trip. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChatSend = () => {
    const trimmed = chatInput.trim()
    if (!trimmed || chatLoading) {
      return
    }

    const userMessage = { id: Date.now(), sender: 'user', text: trimmed }
    setChatMessages((prev) => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)

    const lowerText = trimmed.toLowerCase()
    const recommendedDestination = destination.trim() || 'Goa'
    const travellerText = selectedTravellerCount > 1 ? `${selectedTravellerCount} travellers` : 'one traveller'

    let response = `I can help with a ${recommendedDestination} trip for ${travellerText}. Try refining the plan around your preferred activities and budget.`

    if (lowerText.includes('budget')) {
      response = `Your current budget is ${formatInr(budget || 15000)}, and we can keep the plan realistic for ${travellerText}.`
    } else if (lowerText.includes('food') || lowerText.includes('eat')) {
      response = `I would recommend local food trails, regional markets, and a standout dinner experience in ${recommendedDestination}.`
    } else if (lowerText.includes('activity') || lowerText.includes('adventure')) {
      response = `I can prioritize activities like sightseeing, local culture, and outdoor experiences to match your interests.`
    } else if (lowerText.includes('hotel') || lowerText.includes('stay')) {
      response = `For a group trip, I’d suggest a central stay with easy access to transport and dining.`
    }

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: response,
        },
      ])
      setChatLoading(false)
    }, 700)
  }

  const handleReset = () => {
    setItinerary(null)
    setError('')
    setChatMessages([
      {
        id: 1,
        sender: 'agent',
        text: 'Hi! I can help plan a group trip. Pick your destination, travellers, and budget to get started.',
      },
    ])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-wrapper">
      <header className="hero">
        <div className="hero-inner">
          <div className="logo-badge">✈️</div>
          <h1 className="hero-title">TravelSphere</h1>
          <p className="hero-sub">Your AI-Powered Travel Agent — Plan the Perfect Trip in Seconds</p>
        </div>
      </header>

      <main className="main-container">
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
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="start-date">📅 Start date</label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="end-date">📅 End date</label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="days">🗓️ Number of days</label>
                <input
                  id="days"
                  type="number"
                  min="1"
                  max="30"
                  placeholder="3"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
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
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </div>

            <fieldset className="traveller-section">
              <legend>👥 Travellers</legend>
              <div className="traveller-list">
                {DEFAULT_TRAVELLERS.map((traveller) => {
                  const isSelected = selectedTravellers.includes(traveller.id)
                  return (
                    <button
                      key={traveller.id}
                      type="button"
                      className={`traveller-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => toggleTraveller(traveller.id)}
                      aria-pressed={isSelected}
                    >
                      <span className="traveller-avatar">{traveller.name.slice(0, 2).toUpperCase()}</span>
                      <span>{traveller.name}</span>
                    </button>
                  )
                })}
              </div>
              <p className="traveller-meta">Selected travellers: {selectedTravellerCount}</p>
            </fieldset>

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

            <button id="generate-btn" type="submit" className="cta-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" /> Generating your trip…
                </>
              ) : (
                '✨ Generate My Trip Plan'
              )}
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
                <span />
                <span />
                <span />
              </div>
              <p>🤖 AI is crafting your personalised itinerary…</p>
            </div>
          )}
        </section>

        <section className="chat-card glass-card" aria-label="Travel assistant chat">
          <div className="chat-header">
            <h3>💬 Travel Agent</h3>
            <span className="chat-status">Online</span>
          </div>
          <div className="chat-thread" aria-live="polite">
            {chatMessages.map((message) => (
              <div key={message.id} className={`chat-message ${message.sender}`}>
                <div className="message-bubble">{message.text}</div>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-message agent typing-message">
                <div className="message-bubble typing-bubble" aria-label="Typing indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          <div className="chat-composer">
            <input
              type="text"
              aria-label="Type a message to the travel agent"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleChatSend()
                }
              }}
              placeholder="Ask about budget, food, activities..."
              disabled={chatLoading}
            />
            <button type="button" className="send-button" onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()}>
              Send
            </button>
          </div>
        </section>

        {itinerary && !loading && (
          <section id="itinerary-result" className="result-section" aria-label="Generated Itinerary">
            <div className="trip-header glass-card">
              <div className="trip-meta">
                <h2 className="trip-title">📍 {itinerary.destination}</h2>
                <div className="trip-badges">
                  <span className="badge">📅 {itinerary.days} Day{itinerary.days !== 1 ? 's' : ''}</span>
                  <span className="badge">👥 {itinerary.traveller_count || selectedTravellerCount} travellers</span>
                  <span className="badge green">💰 {formatInr(itinerary.total_estimated_cost)} est.</span>
                </div>
              </div>
              {itinerary.summary && <p className="trip-summary">{itinerary.summary}</p>}
            </div>

            <TripCostBreakdown breakdown={itinerary.cost_breakdown || {}} />

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
                            {day.places.map((place, index) => (
                              <span className="tag" key={`${day.day}-place-${index}`}>
                                {place}
                              </span>
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
                            {day.activities.map((activity, index) => (
                              <span className="tag activity-tag" key={`${day.day}-activity-${index}`}>
                                {activity}
                              </span>
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
                            {day.food.map((food, index) => (
                              <span className="tag food-tag" key={`${day.day}-food-${index}`}>
                                {food}
                              </span>
                            ))}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="day-cost">
                      💰 Day {day.day} estimate: <strong>{formatInr(day.estimated_cost)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="budget-card glass-card">
              <h3>💰 Total Estimated Budget</h3>
              <div className="budget-amount">{formatInr(itinerary.total_estimated_cost)}</div>
              <p className="budget-note">* Estimates are indicative and may vary based on actual prices.</p>
            </div>

            {itinerary.recommendations && itinerary.recommendations.length > 0 && (
              <div className="info-card glass-card">
                <h3>⭐ Recommendations</h3>
                <ul className="info-list">
                  {itinerary.recommendations.map((item, index) => (
                    <li key={`recommendation-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {itinerary.tips && itinerary.tips.length > 0 && (
              <div className="info-card tips-card glass-card">
                <h3>💡 Travel Tips</h3>
                <ul className="info-list">
                  {itinerary.tips.map((item, index) => (
                    <li key={`tip-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="plan-again-wrapper">
              <button id="plan-again-btn" className="cta-button secondary" onClick={handleReset} type="button">
                🔄 Plan Another Trip
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>TravelSphere © 2025 · AI Travel Agent</p>
      </footer>
    </div>
  )
}

export default App
