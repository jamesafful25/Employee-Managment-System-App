import axiosInstance from './axiosInstance';

export const applyLeave = (data) => axiosInstance.post('/leaves/apply', data);
export const getMyLeaves = (params) => axiosInstance.get('/leaves/my-leaves', { params });
export const getLeaveBalance = () => axiosInstance.get('/leaves/balance');
export const getAllLeaves = (params) => axiosInstance.get('/leaves', { params });
export const approveLeave = (id) => axiosInstance.patch(`/leaves/${id}/approve`);
export const rejectLeave = (id) => axiosInstance.patch(`/leaves/${id}/reject`);
export const cancelLeave = (id) => axiosInstance.delete(`/leaves/cancel/${id}`);