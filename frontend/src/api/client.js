/**
 * Darukaa Earth API Client
 * Seamlessly integrates with FastAPI backend (http://localhost:8000 or custom VITE_API_BASE_URL)
 * Provides automatic localStorage fallback when running standalone without live server.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : typeof window !== 'undefined' && window.location.port === '8000'
    ? ''
    : 'http://localhost:8000';

const STORAGE_KEY = 'darukaa_earth_state_v1';
const AUTH_USER_KEY = 'darukaa_auth_user_v1';
const AUTH_TOKEN_KEY = 'darukaa_access_token_v1';

export const DEFAULT_USER = {
  id: 1,
  name: 'Muhammad Suhail',
  email: 'iamxuhail@gmail.com',
  role: 'Admin',
  organization: 'Darukaa Earth',
  bio: 'Geospatial carbon project administrator & parcel GIS analyst.',
  created_at: '2026-01-15',
};

export function getAuthHeaders(extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

const DEFAULT_PROJECTS = [
  {
    id: 1,
    name: 'Western Ghats Agroforestry',
    owner_id: 1,
    created_at: '2026-08-12',
  },
  {
    id: 2,
    name: 'Deccan Plateau Soil Carbon',
    owner_id: 1,
    created_at: '2026-08-20',
  },
  {
    id: 3,
    name: 'Sundarbans Mangrove Buffer',
    owner_id: 1,
    created_at: '2026-09-02',
  }
];

const DEFAULT_SITES = [
  {
    id: 101,
    name: 'Shola Ridge Parcel Alpha',
    project_id: 1,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [76.652, 11.451],
          [76.689, 11.448],
          [76.702, 11.478],
          [76.671, 11.492],
          [76.643, 11.470],
          [76.652, 11.451]
        ]
      ]
    }
  },
  {
    id: 102,
    name: 'Bavali River Catchment',
    project_id: 1,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [75.845, 11.902],
          [75.892, 11.915],
          [75.918, 11.948],
          [75.867, 11.954],
          [75.832, 11.928],
          [75.845, 11.902]
        ]
      ]
    }
  },
  {
    id: 103,
    name: 'Tungabhadra Dryland Sector 4',
    project_id: 2,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [76.210, 15.280],
          [76.265, 15.275],
          [76.280, 15.312],
          [76.235, 15.328],
          [76.210, 15.280]
        ]
      ]
    }
  },
  {
    id: 104,
    name: 'Sajnekhali Tidal Zone',
    project_id: 3,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [88.752, 22.115],
          [88.798, 22.122],
          [88.810, 22.158],
          [88.761, 22.164],
          [88.752, 22.115]
        ]
      ]
    }
  }
];

const DEFAULT_ANALYTICS = [
  { id: 1, site_id: 101, metric: 'NDVI', date: '2026-08-01', value: 0.64 },
  { id: 2, site_id: 101, metric: 'NDVI', date: '2026-08-08', value: 0.67 },
  { id: 3, site_id: 101, metric: 'NDVI', date: '2026-08-15', value: 0.71 },
  { id: 4, site_id: 101, metric: 'NDVI', date: '2026-08-22', value: 0.69 },
  { id: 5, site_id: 101, metric: 'NDVI', date: '2026-08-29', value: 0.74 },
  { id: 6, site_id: 101, metric: 'NDVI', date: '2026-09-05', value: 0.78 },
  { id: 7, site_id: 101, metric: 'NDVI', date: '2026-09-12', value: 0.82 },
  { id: 8, site_id: 101, metric: 'NDVI', date: '2026-09-19', value: 0.85 },
  
  { id: 9, site_id: 101, metric: 'Soil Moisture', date: '2026-08-01', value: 34.2 },
  { id: 10, site_id: 101, metric: 'Soil Moisture', date: '2026-08-08', value: 36.8 },
  { id: 11, site_id: 101, metric: 'Soil Moisture', date: '2026-08-15', value: 41.5 },
  { id: 12, site_id: 101, metric: 'Soil Moisture', date: '2026-08-22', value: 39.1 },
  { id: 13, site_id: 101, metric: 'Soil Moisture', date: '2026-08-29', value: 44.0 },
  { id: 14, site_id: 101, metric: 'Soil Moisture', date: '2026-09-05', value: 47.3 },
  { id: 15, site_id: 101, metric: 'Soil Moisture', date: '2026-09-12', value: 45.8 },
  { id: 16, site_id: 101, metric: 'Soil Moisture', date: '2026-09-19', value: 48.9 },

  { id: 17, site_id: 101, metric: 'Biomass Index', date: '2026-08-01', value: 112.4 },
  { id: 18, site_id: 101, metric: 'Biomass Index', date: '2026-08-15', value: 118.9 },
  { id: 19, site_id: 101, metric: 'Biomass Index', date: '2026-09-01', value: 126.3 },
  { id: 20, site_id: 101, metric: 'Biomass Index', date: '2026-09-15', value: 134.8 },

  { id: 21, site_id: 102, metric: 'NDVI', date: '2026-08-10', value: 0.58 },
  { id: 22, site_id: 102, metric: 'NDVI', date: '2026-08-25', value: 0.62 },
  { id: 23, site_id: 102, metric: 'NDVI', date: '2026-09-10', value: 0.69 },

  { id: 24, site_id: 103, metric: 'Soil Moisture', date: '2026-08-05', value: 19.4 },
  { id: 25, site_id: 103, metric: 'Soil Moisture', date: '2026-08-20', value: 22.1 },
  { id: 26, site_id: 103, metric: 'Soil Moisture', date: '2026-09-05', value: 25.6 }
];

function getStoredState() {
  if (typeof window === 'undefined') {
    return { projects: DEFAULT_PROJECTS, sites: DEFAULT_SITES, analytics: DEFAULT_ANALYTICS };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = { projects: DEFAULT_PROJECTS, sites: DEFAULT_SITES, analytics: DEFAULT_ANALYTICS };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return { projects: DEFAULT_PROJECTS, sites: DEFAULT_SITES, analytics: DEFAULT_ANALYTICS };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save local state:', err);
  }
}

export const api = {
  // Projects
  async getProjects() {
    try {
      const res = await fetch(`${API_BASE_URL}/projects`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend not running locally, fallback to local persistence
    }
    return getStoredState().projects;
  },

  async createProject(name) {
    try {
      const res = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const created = await res.json();
        const state = getStoredState();
        if (!state.projects.some((p) => Number(p.id) === Number(created.id))) {
          state.projects.push(created);
          saveState(state);
        }
        return created;
      }
    } catch {
      // fallback
    }
    const state = getStoredState();
    const newProject = {
      id: Date.now(),
      name,
      owner_id: 1,
      created_at: new Date().toISOString().split('T')[0],
    };
    state.projects.push(newProject);
    saveState(state);
    return newProject;
  },

  async deleteProject(projectId) {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const state = getStoredState();
        const pId = Number(projectId);
        const sitesToDelete = state.sites.filter((s) => Number(s.project_id) === pId).map((s) => s.id);
        state.analytics = state.analytics.filter((a) => !sitesToDelete.includes(a.site_id));
        state.sites = state.sites.filter((s) => Number(s.project_id) !== pId);
        state.projects = state.projects.filter((p) => Number(p.id) !== pId);
        saveState(state);
        return true;
      }
    } catch {
      // fallback
    }
    const state = getStoredState();
    const pId = Number(projectId);
    const sitesToDelete = state.sites.filter((s) => Number(s.project_id) === pId).map((s) => s.id);
    state.analytics = state.analytics.filter((a) => !sitesToDelete.includes(a.site_id));
    state.sites = state.sites.filter((s) => Number(s.project_id) !== pId);
    state.projects = state.projects.filter((p) => Number(p.id) !== pId);
    saveState(state);
    return true;
  },

  // Sites
  async getSites(projectId) {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/sites`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    const state = getStoredState();
    return state.sites.filter((s) => Number(s.project_id) === Number(projectId));
  },

  async createSite(projectId, name, geometry) {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/sites`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, geometry }),
      });
      if (res.ok) {
        const created = await res.json();
        const state = getStoredState();
        if (!state.sites.some((s) => Number(s.id) === Number(created.id))) {
          state.sites.push(created);
          saveState(state);
        }
        return created;
      }
    } catch {
      // fallback
    }
    const state = getStoredState();
    const newSite = {
      id: Date.now(),
      name,
      project_id: Number(projectId),
      geometry,
    };
    state.sites.push(newSite);
    saveState(state);
    return newSite;
  },

  async updateSiteGeometry(siteId, geometry) {
    try {
      const res = await fetch(`${API_BASE_URL}/sites/${siteId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ geometry }),
      });
      if (res.ok) {
        const data = await res.json();
        const state = getStoredState();
        const idx = state.sites.findIndex((s) => Number(s.id) === Number(siteId));
        if (idx !== -1) {
          state.sites[idx] = { ...state.sites[idx], ...data, geometry };
          saveState(state);
        }
        return data;
      }
    } catch {
      // fallback
    }
    const state = getStoredState();
    const site = state.sites.find((s) => Number(s.id) === Number(siteId));
    if (site) {
      site.geometry = geometry;
      saveState(state);
    }
    return site;
  },

  async deleteSite(siteId) {
    try {
      const res = await fetch(`${API_BASE_URL}/sites/${siteId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const state = getStoredState();
        state.sites = state.sites.filter((s) => Number(s.id) !== Number(siteId));
        state.analytics = state.analytics.filter((a) => Number(a.site_id) !== Number(siteId));
        saveState(state);
        return true;
      }
    } catch {
      // fallback
    }
    const state = getStoredState();
    state.sites = state.sites.filter((s) => Number(s.id) !== Number(siteId));
    state.analytics = state.analytics.filter((a) => Number(a.site_id) !== Number(siteId));
    saveState(state);
    return true;
  },

  // Analytics
  async getAnalytics(siteId) {
    try {
      const res = await fetch(`${API_BASE_URL}/sites/${siteId}/analytics`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    const state = getStoredState();
    return state.analytics.filter((a) => Number(a.site_id) === Number(siteId));
  },

  async createAnalytics(siteId, metric, date, value) {
    try {
      const res = await fetch(`${API_BASE_URL}/sites/${siteId}/analytics`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ metric, date, value: Number(value) }),
      });
      if (res.ok) {
        const created = await res.json();
        const state = getStoredState();
        state.analytics.push(created);
        saveState(state);
        return created;
      }
    } catch {
      // fallback
    }
    const state = getStoredState();
    const record = {
      id: Date.now(),
      site_id: Number(siteId),
      metric,
      date,
      value: Number(value),
    };
    state.analytics.push(record);
    saveState(state);
    return record;
  },

  async updateAnalytics(recordId, metric, date, value) {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/${recordId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ metric, date, value: Number(value) }),
      });
      if (res.ok) {
        const updated = await res.json();
        const state = getStoredState();
        const idx = state.analytics.findIndex((a) => Number(a.id) === Number(recordId));
        if (idx !== -1) {
          state.analytics[idx] = { ...state.analytics[idx], ...updated };
          saveState(state);
        }
        return updated;
      }
    } catch {
      // fallback
    }
    const state = getStoredState();
    const record = state.analytics.find((a) => Number(a.id) === Number(recordId));
    if (record) {
      record.metric = metric;
      record.date = date;
      record.value = Number(value);
      saveState(state);
    }
    return record;
  },

  async deleteAnalytics(recordId) {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/${recordId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const state = getStoredState();
        state.analytics = state.analytics.filter((a) => Number(a.id) !== Number(recordId));
        saveState(state);
        return true;
      }
    } catch {
      // fallback
    }
    const state = getStoredState();
    state.analytics = state.analytics.filter((a) => Number(a.id) !== Number(recordId));
    saveState(state);
    return true;
  },

  async loadSampleAnalytics(siteId) {
    const state = getStoredState();
    const today = new Date();
    const metrics = ['NDVI', 'Soil Moisture', 'Biomass Index'];
    const generated = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i * 5);
      const dateStr = d.toISOString().split('T')[0];

      generated.push({
        id: Date.now() + Math.random(),
        site_id: Number(siteId),
        metric: 'NDVI',
        date: dateStr,
        value: Number((0.68 + (6 - i) * 0.03 + (Math.random() * 0.02 - 0.01)).toFixed(3)),
      });

      generated.push({
        id: Date.now() + Math.random() + 10,
        site_id: Number(siteId),
        metric: 'Soil Moisture',
        date: dateStr,
        value: Number((38 + (6 - i) * 1.5 + (Math.random() * 2 - 1)).toFixed(1)),
      });

      generated.push({
        id: Date.now() + Math.random() + 20,
        site_id: Number(siteId),
        metric: 'Biomass Index',
        date: dateStr,
        value: Number((115 + (6 - i) * 4 + (Math.random() * 3 - 1)).toFixed(1)),
      });
    }

    state.analytics = state.analytics.filter((a) => Number(a.site_id) !== Number(siteId));
    state.analytics.push(...generated);
    saveState(state);
    return generated;
  },

  // Authentication & User Profile
  getCurrentUser() {
    if (typeof window === 'undefined') return DEFAULT_USER;
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored === 'null') return null;
      if (!stored) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(DEFAULT_USER));
        return DEFAULT_USER;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_USER;
    }
  },

  async login(email, password) {
    // Attempt FastAPI OAuth2 / JSON Login
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      let res = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      // If /token returns 404 or 422, try JSON /login
      if (!res.ok && res.status !== 401) {
        try {
          const jsonRes = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username: email, password }),
          });
          if (jsonRes.ok) res = jsonRes;
        } catch {
          // ignore
        }
      }

      if (res.ok) {
        const data = await res.json();
        const token = data.access_token || data.token;
        if (token) {
          localStorage.setItem(AUTH_TOKEN_KEY, token);
        }
        // Fetch current user from /users/me
        try {
          const userRes = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            const formatted = {
              ...userData,
              id: userData.id || Date.now(),
              name: userData.full_name || userData.name || email.split('@')[0],
              email: userData.email || email,
              role: userData.role || 'Admin',
              organization: userData.organization || 'Darukaa Earth',
            };
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(formatted));
            return { success: true, user: formatted };
          }
        } catch {
          // fallback user
        }
      }
    } catch {
      // Backend not running on local preview, fall through to client session
    }

    // Client fallback session
    const user = {
      id: Date.now(),
      name: email.split('@')[0] || 'Suhail',
      email: email,
      role: 'Admin',
      organization: 'Darukaa Earth',
      bio: 'Geospatial carbon project administrator & parcel GIS analyst.',
      created_at: '2026-01-15',
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, `mock_jwt_token_${Date.now()}`);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
    return { success: true, user };
  },

  async register(userData) {
    const { email, password, name, organization = 'Darukaa Earth' } = userData;

    // Attempt FastAPI user registration at /users or /register
    try {
      const payload = {
        email,
        password,
        full_name: name,
        name,
        role: 'Admin',
        organization,
      };

      let res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        try {
          const altRes = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (altRes.ok) res = altRes;
        } catch {
          // ignore
        }
      }

      if (res.ok) {
        // Automatically login
        return await this.login(email, password);
      }
    } catch {
      // Backend not running yet
    }

    // Client fallback registration
    const user = {
      id: Date.now(),
      name: name || email.split('@')[0],
      email: email,
      role: 'Admin',
      organization: organization || 'Darukaa Earth',
      bio: 'Darukaa Earth workspace member.',
      created_at: new Date().toISOString().split('T')[0],
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, `mock_jwt_token_${Date.now()}`);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
    return { success: true, user };
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.setItem(AUTH_USER_KEY, 'null');
    }
    return true;
  },

  updateProfile(profileData) {
    const current = this.getCurrentUser() || DEFAULT_USER;
    const updated = { ...current, ...profileData };
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    }
    // Attempt FastAPI update
    try {
      fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      }).catch(() => {});
    } catch {
      // ignore
    }
    return updated;
  },

  switchRole(newRole) {
    const current = this.getCurrentUser() || DEFAULT_USER;
    const updated = { ...current, role: newRole };
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    }
    return updated;
  }
};
