import axiosInstance from './axiosInstance';
//atteandance APIs
export const clockIn = () => axiosInstance.post('/attendance/clock-in');
export const clockOut = () => axiosInstance.post('/attendance/clock-out');
export const getMyAttendance = (params) => axiosInstance.get('/attendance/my-attendance', { params });
export const getAllAttendance = (params) => axiosInstance.get('/attendance', { params });
export const getAttendanceReport = (params) => axiosInstance.get('/attendance/report', { params });