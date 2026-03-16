const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const GITHUB_USERNAME = 'lycanitcoding';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.REPO_TOKEN; // (optional, for private repos)

const getGithubHeaders = (includeAuth = true) => ({
  Accept: 'application/vnd.github+json',
  ...(includeAuth && GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
});

const githubGet = async (url) => {
  try {
    return await axios.get(url, { headers: getGithubHeaders(true) });
  } catch (error) {
    const status = error.response?.status;

    if (GITHUB_TOKEN && (status === 401 || status === 403)) {
      return axios.get(url, { headers: getGithubHeaders(false) });
    }

    throw error;
  }
};

const encodeGithubPath = (path) => path.split('/').map(encodeURIComponent).join('/');

const isBinaryBuffer = (buffer) => {
  const sampleLength = Math.min(buffer.length, 8000);

  for (let index = 0; index < sampleLength; index += 1) {
    if (buffer[index] === 0) {
      return true;
    }
  }

  return false;
};

const mapGithubError = (error, fallbackMessage) => {
  const status = error.response?.status;

  if (status === 404) {
    return { status: 404, message: 'Repository resource not found' };
  }

  if (status === 403) {
    return { status: 403, message: 'GitHub API rate limit reached or access denied' };
  }

  return { status: 500, message: fallbackMessage };
};

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
    res.set('Cache-Control', 'no-store');

    // Fetch public repos
    const publicResponse = await githubGet(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`
    );

    let allRepos = publicResponse.data;

    // If token is provided, fetch private repos
    if (GITHUB_TOKEN) {
      try {
        const allReposResponse = await axios.get(
          `https://api.github.com/user/repos?affiliation=owner&per_page=100`,
          { headers: getGithubHeaders(true) }
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
      fullName: repo.full_name,
      defaultBranch: repo.default_branch,
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

// Get repository tree
router.get('/repos/:repoName/tree', verifyToken, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const { repoName } = req.params;

    const repoResponse = await githubGet(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${encodeURIComponent(repoName)}`
    );

    const branch = repoResponse.data.default_branch;
    const treeResponse = await githubGet(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${encodeURIComponent(repoName)}/git/trees/${encodeURIComponent(branch)}?recursive=1`
    );

    const tree = treeResponse.data.tree
      .filter((item) => item.type === 'tree' || item.type === 'blob')
      .map((item) => ({
        path: item.path,
        type: item.type,
        size: item.size || 0,
        sha: item.sha,
      }));

    res.json({
      repository: {
        name: repoResponse.data.name,
        fullName: repoResponse.data.full_name,
        description: repoResponse.data.description,
        url: repoResponse.data.html_url,
        private: repoResponse.data.private,
        defaultBranch: branch,
      },
      tree,
    });
  } catch (error) {
    console.error('Error fetching repository tree:', error.message);
    const mappedError = mapGithubError(error, 'Failed to fetch repository tree');
    res.status(mappedError.status).json({
      message: mappedError.message,
      error: error.message,
    });
  }
});

// Get file content
router.get('/repos/:repoName/file', verifyToken, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const { repoName } = req.params;
    const { path } = req.query;

    if (!path) {
      return res.status(400).json({ message: 'File path is required' });
    }

    const fileResponse = await githubGet(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${encodeURIComponent(repoName)}/contents/${encodeGithubPath(path)}`
    );

    if (Array.isArray(fileResponse.data)) {
      return res.status(400).json({ message: 'Requested path is a directory' });
    }

    const fileData = fileResponse.data;

    if (fileData.encoding !== 'base64' || !fileData.content) {
      return res.status(422).json({
        message: 'File content is not available through the GitHub contents API',
      });
    }

    const decodedBuffer = Buffer.from(fileData.content.replace(/\n/g, ''), 'base64');

    if (isBinaryBuffer(decodedBuffer)) {
      return res.status(415).json({
        message: 'Binary files are not supported in the code viewer',
      });
    }

    res.json({
      name: fileData.name,
      path: fileData.path,
      size: fileData.size,
      sha: fileData.sha,
      htmlUrl: fileData.html_url,
      downloadUrl: fileData.download_url,
      content: decodedBuffer.toString('utf8'),
    });
  } catch (error) {
    console.error('Error fetching repository file:', error.message);
    const mappedError = mapGithubError(error, 'Failed to fetch repository file');
    res.status(mappedError.status).json({
      message: mappedError.message,
      error: error.message,
    });
  }
});

module.exports = router;
