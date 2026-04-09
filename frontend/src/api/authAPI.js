import axiosInstance from './axiosInstance';

export const loginUser = (data) => axiosInstance.post('/auth/login', data);
export const logoutUser = () => axiosInstance.post('/auth/logout');
export const getMe = () => axiosInstance.get('/auth/me');
export const changePassword = (data) => axiosInstance.post('/auth/change-password', data);
export const forgotPassword = (data) => axiosInstance.post('/auth/forgot-password', data);
export const resetPassword = (data) => axiosInstance.post('/auth/reset-password', data);
export const registerEmployee = (data) => axiosInstance.post('/auth/register', data);
export const adminResetPassword = (id) => axiosInstance.patch(`/auth/admin/employees/${id}/reset-password`);