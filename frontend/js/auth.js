export function checkAuth() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user && token) {
        return JSON.parse(user);
    }
    return null;
}

export function login(user, token) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    window.location.href = 'dashboard.html';
}

export function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

export function requireAuth() {
    const user = checkAuth();
    if (!user) {
        window.location.href = 'login.html';
    }
    return user;
}
