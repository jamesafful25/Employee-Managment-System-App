import axios from 'axios';

// This is your backend base URL
const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// REQUEST interceptor — runs before every request is sent
// It grabs the token from localStorage and attaches it automatically
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE interceptor — runs after every response comes back
// If the server says 401 (token expired/invalid), we log the user out

//axiosInstance.interceptors.response.use(
//(response) => response,
//(error) => {
//if (error.response ? .status === 401) {
//localStorage.removeItem('token');
//localStorage.removeItem('employee');
//window.location.href = '/login';
//}
//return Promise.reject(error);
//}
//);
//export default axiosInstance;

// RESPONSE interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response && error.response.status;
        if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('employee');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
export default axiosInstance;