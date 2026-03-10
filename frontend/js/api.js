// Change this to your deployed backend URL when going live (e.g., 'https://tofee-backend.onrender.com/api')
const PROD_API_URL = 'https://easypay-9tdi.onrender.com/api';
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : PROD_API_URL;

export async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
}

export const api = {
    auth: {
        login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
        register: (details) => request('/auth/register', { method: 'POST', body: JSON.stringify(details) }),
        getProfile: () => request('/auth/profile'),
        updateProfile: (details) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(details) }),
    },
    groups: {
        getAll: () => request('/groups'),
        getOne: (id) => request(`/groups/${id}`),
        create: (data) => request('/groups', { method: 'POST', body: JSON.stringify(data) }),
        delete: (id) => request(`/groups/${id}`, { method: 'DELETE' }),
    },
    members: {
        getAll: (groupId) => request(`/members${groupId ? `?group_id=${groupId}` : ''}`),
        add: (data) => request('/members', { method: 'POST', body: JSON.stringify(data) }),
        delete: (id) => request(`/members/${id}`, { method: 'DELETE' }),
    },
    transactions: {
        getAll: (params) => {
            const searchParams = new URLSearchParams(params);
            return request(`/transactions?${searchParams.toString()}`);
        },
        getStats: () => request('/transactions/stats'),
    },
    paymentLinks: {
        getAll: () => request('/payment-links'),
        getOne: (token) => request(`/payment-links/${token}`),
        create: (data) => request('/payment-links', { method: 'POST', body: JSON.stringify(data) }),
        initiate: (token, data) => request(`/payment-links/${token}/pay`, { method: 'POST', body: JSON.stringify(data) }),
    },
    organizations: {
        getMy: () => request('/organizations/my'),
        updateMy: (details) => request('/organizations/my', { method: 'PUT', body: JSON.stringify(details) }),
    }
};
