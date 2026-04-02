import axios from 'axios';

// API ni export qilamiz, shunda boshqa fayllarda API.post(...) deb ishlatish mumkin bo'ladi
export const API = axios.create({ 
  baseURL: 'http://localhost:5000/api' 
});

export const getUstachilik = () => API.get('/ustachilik');
export const getNimstansiyalar = (uId) => API.get(`/nimstansiya/${uId}`);
export const getLiniyalar = (nId) => API.get(`/liniya/${nId}`);
export const getTransformatorlar = (lId) => API.get(`/transformator/${lId}`);
export const getIshlar = () => API.get('/ish');