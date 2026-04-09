import axiosInstance from './axiosInstance';

export const getMyPayroll = (params) => axiosInstance.get('/payroll/my-payroll', { params });
export const getAllPayroll = (params) => axiosInstance.get('/payroll', { params });
export const generatePayroll = (data) => axiosInstance.post('/payroll/generate', data);
export const updatePayroll = (id, data) => axiosInstance.put(`/payroll/${id}`, data);
export const markAsPaid = (id) => axiosInstance.patch(`/payroll/${id}/mark-paid`);
export const getEmployeePayroll = (id, params) => axiosInstance.get(`/payroll/employee/${id}`, { params });