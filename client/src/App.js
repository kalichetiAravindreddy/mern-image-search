import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [topSearches, setTopSearches] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthStatus();
    fetchTopSearches();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSearchHistory();
    }
  }, [user]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/user`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    }
  };

  const fetchTopSearches = async () => {
    try {
      const response = await fetch(`${API_BASE}/top-searches`);
      const data = await response.json();
      
      if (data.success) {
        setTopSearches(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch top searches:', error);
    }
  };

  const fetchSearchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/search/history`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setSearchHistory(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch search history:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ term: searchTerm.trim() })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
        setSelectedImages(new Set());
        fetchTopSearches();
        fetchSearchHistory();
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (imageId) => {
    setSelectedImages(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(imageId)) {
        newSelected.delete(imageId);
      } else {
        newSelected.add(imageId);
      }
      return newSelected;
    });
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setSearchResults(null);
      setSearchHistory([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>📸 Image Search</h1>
          <div className="auth-section">
            {user ? (
              <div className="user-info">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="user-avatar"
                />
                <span>Welcome, {user.name}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <a 
                href={`${API_BASE}/auth/google`} 
                className="login-btn"
              >
                Login with Google
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="top-searches-banner">
        <h3>🔥 Top Searches</h3>
        <div className="top-searches-list">
          {topSearches.length > 0 ? (
            topSearches.map((item, index) => (
              <div key={index} className="search-tag">
                <span className="term">{item.term}</span>
                <span className="count">({item.count})</span>
              </div>
            ))
          ) : (
            <div className="no-data">No searches yet</div>
          )}
        </div>
      </div>

      <main className="main-content">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={user ? "Search for images..." : "Please login to search"}
              disabled={!user || loading}
              className="search-input"
            />
            <button 
              type="submit" 
              disabled={!user || !searchTerm.trim() || loading}
              className="search-btn"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {searchResults && (
          <div className="results-section">
            <div className="results-header">
              <h2>
                You searched for "{searchResults.term}" — {searchResults.total} results
              </h2>
              <div className="selection-counter">
                Selected: {selectedImages.size} images
              </div>
            </div>

            <div className="images-grid">
              {searchResults.results.map((image) => (
                <div 
                  key={image.id} 
                  className={`image-card ${selectedImages.has(image.id) ? 'selected' : ''}`}
                  onClick={() => handleImageSelect(image.id)}
                >
                  <img 
                    src={image.urls.small} 
                    alt={image.alt_description || 'Unsplash image'}
                    loading="lazy"
                  />
                  <div className="image-overlay">
                    <input
                      type="checkbox"
                      checked={selectedImages.has(image.id)}
                      onChange={() => {}}
                      className="selection-checkbox"
                    />
                    <div className="image-info">
                      <p>{image.description || 'No description'}</p>
                      <span>By {image.user.name}</span>
                      <span>❤️ {image.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {user && searchHistory.length > 0 && (
          <div className="history-section">
            <h3>📚 Your Search History</h3>
            <div className="history-list">
              {searchHistory.map((item, index) => (
                <div key={index} className="history-item">
                  <span className="history-term">{item.term}</span>
                  <span className="history-time">
                    {formatDate(item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;