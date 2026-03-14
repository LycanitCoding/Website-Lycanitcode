import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/github/repos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setRepositories(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch repositories. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-image">
            <img src={process.env.PUBLIC_URL + '/images/logo.png'} alt="Logo" className="logo-image" /> 
          </div>
          <p className="hero-subtitle">A Developer in Development</p>
        </div>
      </div>

      <div className="repos-section">
        <h2 className="repos-title">View My GitHub Repositories</h2>
        
        {error && <div className="error-banner">{error}</div>}
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading repositories...</p>
          </div>
        ) : repositories.length === 0 ? (
          <div className="no-repos">
            <p>No repositories found.</p>
          </div>
        ) : (
          <div className="repos-grid">
            {repositories.map((repo) => (
              <div key={repo.id} className="repo-card">
                <div className="repo-header">
                  <h3 className="repo-name">{repo.name}</h3>
                  <span className={`repo-badge ${repo.private ? 'private' : 'public'}`}>
                    {repo.private ? 'Private' : 'Public'}
                  </span>
                </div>
                
                <p className="repo-description">
                  {repo.description || 'No description provided'}
                </p>
                
                <div className="repo-stats">
                  {repo.language && (
                    <span className="repo-language">
                      <span className="language-dot"></span>
                      {repo.language}
                    </span>
                  )}
                  <span className="repo-stars">⭐ {repo.stars}</span>
                </div>
                
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="repo-link"
                >
                  View Repository →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
