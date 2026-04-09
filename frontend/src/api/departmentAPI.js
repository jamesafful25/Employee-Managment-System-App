import axiosInstance from './axiosInstance';

export const getAllDepartments = (params) => axiosInstance.get('/departments', { params });
export const getDepartmentById = (id) => axiosInstance.get(`/departments/${id}`);
export const createDepartment = (data) => axiosInstance.post('/departments', data);
export const updateDepartment = (id, data) => axiosInstance.patch(`/departments/${id}`, data);
export const deleteDepartment = (id) => axiosInstance.delete(`/departments/${id}`);
export const assignManager = (id, employeeId) => axiosInstance.patch(`/departments/${id}/assign-manager`, { employeeId });
export const assignEmployee = (id, employeeId) =>
    axiosInstance.patch(`/departments/${id}/assign-employee`, { employeeId });