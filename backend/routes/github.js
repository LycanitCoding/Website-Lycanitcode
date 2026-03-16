const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const GITHUB_USERNAME = 'lycanitcoding';
const GITHUB_TOKEN = process.env.REPO_TOKEN; // (optional, for private repos)

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

// Get repositories
router.get('/repos', verifyToken, async (req, res) => {
  try {
    const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};

    // Fetch public repos
    const publicResponse = await axios.get(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`,
      { headers }
    );

    let allRepos = publicResponse.data;

    // If token is provided, fetch private repos
    if (GITHUB_TOKEN) {
      try {
        const allReposResponse = await axios.get(
          `https://api.github.com/user/repos?affiliation=owner&per_page=100`,
          { headers }
        );
        allRepos = allReposResponse.data;
      } catch (error) {
        console.log('Could not fetch private repos, using public only');
      }
    }

    // Format repositories
    const repositories = allRepos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      private: repo.private,
    }));

    // Sort by stars descending
    repositories.sort((a, b) => b.stars - a.stars);

    res.json(repositories);
  } catch (error) {
    console.error('Error fetching repositories:', error.message);
    res.status(500).json({
      message: 'Failed to fetch repositories',
      error: error.message,
    });
  }
});

module.exports = router;
