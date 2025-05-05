import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './utils/reportWebVitals';
import axios from 'axios';

// Axios varsayılan konfigürasyonu
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
axios.defaults.responseType = 'json';

// JWT token için göndermeden önce token kontrolü yap
axios.interceptors.request.use(request => {
  // localStorage'dan token'ı al
  const token = localStorage.getItem('token');
  
  // Token varsa ve Authorization header'ı yoksa ekle
  if (token && !request.headers.Authorization) {
    request.headers.Authorization = `Bearer ${token}`;
    console.log('Interceptor: Token eklendi');
  }
  
  return request;
}, error => {
  console.error('Axios request interceptor error:', error);
  return Promise.reject(error);
});

// Axios interceptor ekleyerek string yanıtı JSON'a çevir ve HTML yanıtlarını işle
axios.interceptors.response.use(response => {
  // HTML yanıtı kontrol et
  if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
    console.error('Interceptor: HTML yanıtı alındı. Ngrok uyarı sayfası olabilir.');
    // Boş bir veri dizisi döndür
    response.data = [];
    return response;
  }
  
  // JSON string kontrolü
  if (typeof response.data === 'string' && (response.data.trim().startsWith('{') || response.data.trim().startsWith('['))) {
    try {
      console.log('Interceptor: String yanıt JSON\'a çevriliyor');
      response.data = JSON.parse(response.data);
      console.log('Interceptor: JSON dönüşümü başarılı');
    } catch (e) {
      console.error('Interceptor: JSON ayrıştırma hatası:', e);
    }
  }
  return response;
}, error => {
  // 401 Unauthorized veya 403 Forbidden hataları için token'ı temizle
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    console.error('Yetkilendirme hatası, token geçersiz olabilir.');
    // Token'ı sıfırla ve login sayfasına yönlendirmeyi düşünebiliriz
    // localStorage.removeItem('token');
    // window.location.href = '/';
  }
  
  console.error('Axios interceptor hata yakaladı:', error);
  return Promise.reject(error);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
