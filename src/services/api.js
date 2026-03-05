import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const getUstachilik = () => API.get('/ustachilik');
export const getNimstansiyalar = (uId) => API.get(`/nimstansiya/${uId}`);
export const getLiniyalar = (nId) => API.get(`/liniya/${nId}`);
export const getTransformatorlar = (lId) => API.get(`/transformator/${lId}`);