import axios from 'axios';

const api = axios.create({
  baseURL:     import.meta.env.VITE_API_URL || '/api',
  timeout:     15000,
  withCredentials: true,  // Send cookies on every request
});

api.interceptors.response.use(
  r => r,
  err => {
    console.error('[API]', err.config?.url, err.response?.data?.message || err.message);
    return Promise.reject(err);
  }
);

/* ── AUTH ─────────────────────────────────────────────────────────────────── */
export const signup = body => api.post('/auth/signup', body);
export const login  = body => api.post('/auth/login',  body);
export const logout = ()   => api.post('/auth/logout');
export const getMe  = ()   => api.get('/auth/me');

/* ── PRODUCERS ────────────────────────────────────────────────────────────── */
export const getProducers   = (type, sort) => api.get('/producers', { params: { type, sort } });
export const getProducer    = id           => api.get(`/producers/${id}`);
export const createProducer = body         => api.post('/producers', body);

/* ── TRADES ───────────────────────────────────────────────────────────────── */
export const getTrades   = (status, limit) => api.get('/trades', { params: { status, limit } });
export const createTrade = body            => api.post('/trades', body);

/* ── BUY REQUESTS ─────────────────────────────────────────────────────────── */
export const getBuyRequests   = ()   => api.get('/buy-requests');
export const createBuyRequest = body => api.post('/buy-requests', body);

/* ── CONNECTIONS ──────────────────────────────────────────────────────────── */
export const getConnections   = ()   => api.get('/connections');
export const createConnection = body => api.post('/connections', body);

/* ── COMMUNITIES ──────────────────────────────────────────────────────────── */
export const getStats       = ()         => api.get('/stats');
export const getCommunities = ()         => api.get('/communities');
export const joinCommunity  = (id, body) => api.post(`/communities/${id}/join`, body);

/* ── SUPPORT ──────────────────────────────────────────────────────────────── */
export const submitSupport = body       => api.post('/support', body);
export const getSupport    = ()         => api.get('/support');
export const updateSupport = (id, body) => api.patch(`/support/${id}`, body);

/* ── ENERGY MAP ───────────────────────────────────────────────────────────── */
export const getEnergyMap = () => api.get('/energy-map');

/* ── ADMIN ────────────────────────────────────────────────────────────────── */
export const adminGetProducers   = ()         => api.get('/admin/producers');
export const adminUpdateProducer = (id, body) => api.patch(`/admin/producers/${id}`, body);
export const adminGetUsers       = ()         => api.get('/admin/users');
export const adminGetBuyRequests = ()         => api.get('/admin/buy-requests');
export const adminUpdateBuyReq   = (id, body) => api.patch(`/admin/buy-requests/${id}`, body);
export const adminGetConnections = ()         => api.get('/admin/connections');

export default api;
