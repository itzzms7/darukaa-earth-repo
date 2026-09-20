const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||  'http://localhost:8000';

const AUTH_TOKEN_KEY = 'darukaa_access_token_v1';
const AUTH_USER_KEY = 'darukaa_auth_user_v1';

export const getAuthHeaders = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  async login(email, password) {
    const formData = new URLSearchParams();

    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Login failed');
    }

    const data = await response.json();

    localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);

    const user = {
      email,
      id: null,
      name: email.split('@')[0],
      role: 'Admin',
      organization: 'Darukaa Earth',
    };

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

    return {
      success: true,
      user,
    };
  },

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Registration failed');
    }

    const data = await response.json();

    localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);

    const user = {
      email: userData.email,
      id: null,
      name: userData.name || userData.email.split('@')[0],
      role: 'Admin',
      organization: userData.organization || 'Darukaa Earth',
    };

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

    return {
      success: true,
      user,
    };
  },

  getCurrentUser() {
    const stored = localStorage.getItem(AUTH_USER_KEY);

    if (!stored || stored === 'null') {
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },

  async getProjects() {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to load projects');
    }

    return response.json();
  },

  async createProject(name) {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error('Failed to create project');
    }

    return response.json();
  },

  async getSites(projectId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/sites`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to load sites');
    }

    return response.json();
  },

  async createSite(projectId, name, geometry) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/sites`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        geometry,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create site');
    }

    return response.json();
  },

  async getAnalytics(siteId) {
    const response = await fetch(`${API_BASE_URL}/sites/${siteId}/analytics`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to load analytics');
    }

    return response.json();
  },

  async createAnalytics(siteId, metric, date, value) {
    const response = await fetch(`${API_BASE_URL}/sites/${siteId}/analytics`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        metric,
        date,
        value: Number(value),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create analytics');
    }

    return response.json();
  },
};