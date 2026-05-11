export function checkAuth() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user && token) {
        return JSON.parse(user);
    }
    return null;
}

export function login(user, token) {
    return new Promise((resolve) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        
        // Give the browser a moment to ensure persistence is locked in
        // This prevents the "refresh required" issue on the dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
            resolve();
        }, 150); // Slightly increased for extra stability in live environments
    });
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
