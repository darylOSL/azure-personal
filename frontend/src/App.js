import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [health, setHealth] = useState(null);
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // Check backend health
    fetch(`${apiUrl}/api/health`)
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => console.error('Health check failed:', err));

    // Fetch data
    fetch(`${apiUrl}/api/data`)
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error('Data fetch failed:', err));
  }, [apiUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setResponse(data);
      setMessage('');
    } catch (err) {
      console.error('Message send failed:', err);
      setResponse({ success: false, error: 'Failed to send message' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Azure App Service Test App</h1>
        <p>Frontend + Backend Deployment Test</p>
      </header>

      <main className="App-main">
        <section className="status-section">
          <h2>Backend Status</h2>
          {health ? (
            <div className="status-card success">
              <p><strong>Status:</strong> {health.status}</p>
              <p><strong>Message:</strong> {health.message}</p>
              <p><strong>Timestamp:</strong> {health.timestamp}</p>
            </div>
          ) : (
            <div className="status-card error">
              <p>Connecting to backend...</p>
            </div>
          )}
        </section>

        <section className="data-section">
          <h2>Sample Data</h2>
          {data ? (
            <div className="data-card">
              <p className="data-message">{data.message}</p>
              <ul className="data-list">
                {data.data.map(item => (
                  <li key={item.id}>
                    <strong>{item.name}:</strong> {item.description}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Loading data...</p>
          )}
        </section>

        <section className="message-section">
          <h2>Send a Message</h2>
          <form onSubmit={handleSubmit} className="message-form">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              className="message-input"
              required
            />
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
          {response && (
            <div className={`response-card ${response.success ? 'success' : 'error'}`}>
              <p><strong>Response:</strong> {response.echo || response.error}</p>
              {response.timestamp && (
                <p><strong>Timestamp:</strong> {response.timestamp}</p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
