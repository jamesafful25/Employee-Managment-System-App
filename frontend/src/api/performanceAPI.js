import axiosInstance from './axiosInstance';

export const getMyPerformance = (params) => axiosInstance.get('/performance/my-performance', { params });
export const getAllPerformance = (params) => axiosInstance.get('/performance', { params });
export const getEmployeePerformance = (id, params) => axiosInstance.get(`/performance/employee/${id}`, { params });
export const createReview = (data) => axiosInstance.post('/performance', data);
export const updateReview = (id, data) => axiosInstance.put(`/performance/${id}`, data);
export const deleteReview = (id) => axiosInstance.delete(`/performance/${id}`);