import axiosInstance from './axiosInstance';

export const getAllEmployees = (params) => axiosInstance.get('/employees', { params });
export const getEmployeeById = (id) => axiosInstance.get(`/employees/${id}`);
export const updateEmployee = (id, data) => axiosInstance.patch(`/employees/${id}`, data);
export const deactivateEmployee = (id) => axiosInstance.patch(`/employees/${id}/deactivate`);
export const activateEmployee = (id) => axiosInstance.patch(`/employees/${id}/activate`);
export const deleteEmployee = (id) => axiosInstance.delete(`/employees/${id}`);
export const changeRole = (id, role) => axiosInstance.patch(`/employees/${id}/role`, { role });