import axios from 'axios';

const configuredApiUrl = process.env.REACT_APP_API_URL;
const baseURL = configuredApiUrl && !configuredApiUrl.includes('your-domain.com')
  ? configuredApiUrl
  : '/api';

const api = axios.create({
  baseURL,
});

export default api;