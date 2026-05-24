import axios from 'axios';

const API_URL = 'https://api.vaultline.uk';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    register: (data: { email: string; password: string; full_name: string }) =>
        api.post('/api/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/api/auth/login', data),
    profile: () => api.get('/api/auth/profile'),
};

export const accountService = {
    getAccounts: () => api.get('/api/accounts'),
    getAccount: (id: string) => api.get(`/api/accounts/${id}`),
};

export const transactionService = {
    getTransactions: (accountId: string, limit = 20, offset = 0) =>
        api.get(`/api/transactions?account_id=${accountId}&limit=${limit}&offset=${offset}`),
};

export const transferService = {
    createTransfer: (data: {
        from_account_id: string;
        to_account_id: string;
        amount: number;
        description?: string;
    }) => api.post('/api/transfers', data),
    getTransfers: () => api.get('/api/transfers'),
};

export default api;