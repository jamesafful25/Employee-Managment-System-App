import axiosInstance from './axiosInstance';

export const uploadFile = (formData) =>
    axiosInstance.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });