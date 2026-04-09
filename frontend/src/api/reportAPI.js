import axiosInstance from './axiosInstance';

export const downloadAttendanceReport = (params) =>
    axiosInstance.get('/reports/attendance', { params, responseType: 'blob' });

export const downloadLeaveReport = (params) =>
    axiosInstance.get('/reports/leave', { params, responseType: 'blob' });

export const downloadPayrollReport = (params) =>
    axiosInstance.get('/reports/payroll', { params, responseType: 'blob' });

export const downloadPerformanceReport = (params) =>
    axiosInstance.get('/reports/performance', { params, responseType: 'blob' });