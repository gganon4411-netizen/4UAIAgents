/**
 * 4U Backend API client.
 * Uses VITE_API_URL and optional Bearer token from auth context.
 */

const BASE = import.meta.env.VITE_API_URL || 'https://4uaiagents-production.up.railway.app';

function getToken() {
  try {
    const raw = localStorage.getItem('4u_session');
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data.access_token || null;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = options.token !== undefined ? options.token : getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!res.ok) {
    const err = new Error(body?.message || body?.error || res.statusText || 'Request failed');
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),

  auth: {
    getNonce: (walletAddress) => api.get(`/api/auth/nonce/${encodeURIComponent(walletAddress)}`),
    signInWithWallet: (walletAddress, message, signature) =>
      api.post('/api/auth/wallet', { walletAddress, message, signature }),
    me: () => api.get('/api/auth/me'),
  },
  requests: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return api.get(`/api/requests${q ? `?${q}` : ''}`).then((r) => r.requests || []);
    },
    get: (id) => api.get(`/api/requests/${id}`),
    create: (data) => api.post('/api/requests', data),
    updateStatus: (id, status) => api.patch(`/api/requests/${id}`, { status }),
  },
  agents: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return api.get(`/api/agents${q ? `?${q}` : ''}`).then((r) => r.agents || []);
    },
    get: (id) => api.get(`/api/agents/${id}`),
  },
  pitches: {
    list: (requestId) =>
      api.get(`/api/pitches?request_id=${encodeURIComponent(requestId)}`).then((r) => r.pitches || []),
    create: (data) => api.post('/api/pitches', data),
  },
  hire: {
    escrowInfo: () => api.get('/api/hire/escrow-info'),
    getBuild: (requestId) =>
      api.get(`/api/hire/${encodeURIComponent(requestId)}`).catch((err) => {
        if (err.status === 404) return null;
        throw err;
      }),
    hire: (requestId, pitchId, txSignature) =>
      api.post('/api/hire', { requestId, pitchId, txSignature }),
    accept: (buildId) => api.post(`/api/hire/${encodeURIComponent(buildId)}/accept`),
    cancel: (buildId) => api.post(`/api/hire/${encodeURIComponent(buildId)}/cancel`),
    dispute: (buildId, reason) => api.post(`/api/hire/${encodeURIComponent(buildId)}/dispute`, { reason }),
    requestRevision: (buildId) => api.post(`/api/hire/${encodeURIComponent(buildId)}/request-revision`),
  },
  keys: {
    list: () => api.get('/api/keys').then((r) => r.keys || []),
    create: (body) => api.post('/api/keys', body),
    revoke: (id) => api.delete(`/api/keys/${id}`),
    buildJobs: () => api.get('/api/keys/build-jobs').then((r) => r.jobs || []),
  },
  dashboard: {
    stats: () => api.get('/api/dashboard/stats'),
    platformStats: () => api.get('/api/dashboard/platform-stats'),
    activity: () => api.get('/api/dashboard/activity').then((r) => r.activity || []),
    myAgents: () => api.get('/api/dashboard/my-agents').then((r) => r.agents || []),
    updateMyAgent: (id, body) => api.patch(`/api/dashboard/my-agents/${id}`, body),
  },
};

export default api;
