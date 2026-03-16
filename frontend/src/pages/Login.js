import React, { useState } from 'react';
import api from '../api';
import './Login.css';

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegisterMode = mode === 'register';

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setPassword('');
    resetMessages();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (isRegisterMode) {
        const response = await api.post('/auth/register', {
          username,
          email,
          password,
        });

        const { token, user } = response.data;
        onLogin(user, token);
        window.location.href = '/';
      } else {
        const response = await api.post('/auth/login', {
          username,
          password,
        });

        const { token, user } = response.data;
        onLogin(user, token);
        window.location.href = '/';
      }
    } catch (err) {
      if (isRegisterMode) {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">{isRegisterMode ? 'Create Account' : 'Portfolio Login'}</h1>
        <div className="auth-switch" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={`switch-button ${!isRegisterMode ? 'active' : ''}`}
            onClick={() => switchMode('login')}
            disabled={loading}
          >
            Login
          </button>
          <button
            type="button"
            className={`switch-button ${isRegisterMode ? 'active' : ''}`}
            onClick={() => switchMode('register')}
            disabled={loading}
          >
            Register
          </button>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          {isRegisterMode && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required={isRegisterMode}
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? (isRegisterMode ? 'Creating account...' : 'Logging in...')
              : (isRegisterMode ? 'Create Account' : 'Login')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
