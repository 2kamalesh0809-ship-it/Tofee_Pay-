const PROD_API_URL = 'https://tofee-pay.onrender.com/api';
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : PROD_API_URL;

export async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    // Check if offline
    if (!navigator.onLine) {
        throw new Error('You are currently offline. Please check your internet connection.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. The server is taking too long to respond.');
        }
        throw error;
    }
}

export const api = {
    auth: {
        login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
        register: (details) => request('/auth/register', { method: 'POST', body: JSON.stringify(details) }),
        getProfile: () => request('/auth/profile'),
        updateProfile: (details) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(details) }),
    },
    dashboard: {
        getStats: () => request('/transactions/stats'),
    },
    groups: {
        getAll: () => request('/groups'),
        getOne: (id) => request(`/groups/${id}`),
        getPublic: (id) => request(`/groups/${id}/public`),
        add: (data) => request('/groups', { method: 'POST', body: JSON.stringify(data) }),
        delete: (id) => request(`/groups/${id}`, { method: 'DELETE' }),
    },
    members: {
        getAll: (groupId) => request(`/members${groupId ? `?group_id=${groupId}` : ''}`),
        add: (data) => request('/members', { method: 'POST', body: JSON.stringify(data) }),
        delete: (id) => request(`/members/${id}`, { method: 'DELETE' }),
    },
    payments: {
        initiate: (token, data) => request(`/payment-links/${token}/pay`, { method: 'POST', body: JSON.stringify(data) }),
        verify: (id, data) => request(`/payment-links/verify/${id}`, { method: 'POST', ...(data && { body: JSON.stringify(data) }) }),
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
        verify: (id, data) => request(`/payment-links/verify/${id}`, { method: 'POST', ...(data && { body: JSON.stringify(data) }) }),
        delete: (id) => request(`/payment-links/${id}`, { method: 'DELETE' }),
    },
    organizations: {
        get: () => request('/organizations/my'),
        updateProfile: (data) => request('/organizations/my', { method: 'PUT', body: JSON.stringify({ name: data.organization_name }) }),
        updateRazorpay: (data) => request('/organizations/my', { method: 'PUT', body: JSON.stringify(data) }),
    }
};
