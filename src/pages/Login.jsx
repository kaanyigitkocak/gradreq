import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import ForgotPassword from '../components/common/ForgotPassword';
import Register from '../components/common/Register';
import '../styles/main.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', email);
      
      // Call the authentication API endpoint using the URL from config
      const response = await axios.post(getApiUrl('/api/Auth/Login'), {
        email,
        password,
        authenticatorCode: '' // Optional, can be empty string if not used
      });

      console.log('Login response:', response);

      // Extract token information
      if (response.data && response.data.accessToken) {
        const { accessToken } = response.data;

        if (accessToken && accessToken.token) {
          console.log('Token received successfully');
          
          // Store token in localStorage
          localStorage.setItem('token', accessToken.token);
          localStorage.setItem('tokenExpiration', accessToken.expirationDate);
          
          // Set up axios default headers for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken.token}`;

          // Kullanıcı rolünü kontrol et (accessToken.role veya jwt token içinden)
          // Token'ı decode et
          const tokenParts = accessToken.token.split('.');
          const payload = JSON.parse(atob(tokenParts[1]));
          
          // Rolü al (Rol, JWT token içinde farklı bir anahtar adıyla saklanabilir)
          const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.role;
          
          // Rolü yerel depoya kaydet
          if (role) {
            localStorage.setItem('userRole', role);
          }
          
          // Lokal değişkenleri kontrol et ve redirect et
          console.log('Redirecting to dashboard...');
          setTimeout(() => {
            // Kullanıcıyı anasayfaya yönlendir - küçük bir gecikme ekleyerek UI'ın değişiklikleri kaydetmesini sağla
            navigate('/dashboard', { replace: true });
          }, 100);
          return; // Erken çıkış - bu önemli
        } else {
          console.error('Token structure invalid:', accessToken);
          setError('Oturum açılamadı. Lütfen daha sonra tekrar deneyin.');
        }
      } else if (response.data && response.data.requiredAuthenticatorType) {
        // Handle two-factor authentication if implemented
        console.log('2FA required:', response.data.requiredAuthenticatorType);
        alert('İki faktörlü doğrulama gerekli');
      } else {
        console.error('Unexpected response structure:', response.data);
        setError('Beklenmeyen bir yanıt alındı. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      console.error('Login failed:', err);
      
      // Kullanıcı dostu hata mesajları
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        
        // Tüm 400 ve 401 hataları için aynı kullanıcı dostu mesajı göster
        if (err.response.status === 400 || err.response.status === 401) {
          setError('Email adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
        } else if (err.response.status === 403) {
          setError('Bu hesaba erişim izniniz yok.');
        } else if (err.response.status === 429) {
          setError('Çok fazla giriş denemesi. Lütfen biraz bekleyin ve tekrar deneyin.');
        } else if (err.response.data && (err.response.data.message || err.response.data.Message || err.response.data.detail || err.response.data.Detail)) {
          // API'den gelen hata mesajını kullan
          const errorMsg = err.response.data.message || err.response.data.Message || err.response.data.detail || err.response.data.Detail;
          setError(errorMsg);
        } else {
          setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('Sunucudan yanıt alınamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        setError('Giriş başarısız oldu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Gerçek kullanıcı bilgileriyle hızlı giriş işlevi
  const handleDevLogin = () => {
    console.log('Development login - setting token');
    
    // Gerçek bir API token kullan (BackEnd tarafından sağlanan token)
    // Bu token sistem yöneticisinden alınmalı veya backend docs'dan
    const validToken = "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTUxMiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjFjZmYwNjdmLTM3ZjgtNGQ1Mi1iM2ZmLTgxNWFhZDk0NDIwMiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJzdHVkZW50MUBleGFtcGxlLmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6InN0dWRlbnQxQGV4YW1wbGUuY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIxY2ZmMDY3Zi0zN2Y4LTRkNTItYjNmZi04MTVhYWQ5NDQyMDIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJTdHVkZW50IiwiZXhwIjoxNzM0ODE1OTk3LCJpc3MiOiJOQXJjaGl0ZWN0dXJlIiwiYXVkIjoiTkFyY2hpdGVjdHVyZSJ9.ZJc4nG8h7aDfuEHoXUhXCM7jYcpOWOsRplPkxmVvjxANjJDcOoaQ4Qh86tPmRf48tBhiSaP6Jrb3HJFnB6cZRQ";
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 gün geçerli token
    
    localStorage.setItem('token', validToken);
    localStorage.setItem('tokenExpiration', expiryDate.toISOString());
    
    // Global Axios headers'a token'ı ekle
    axios.defaults.headers.common['Authorization'] = `Bearer ${validToken}`;
    
    // Kullanıcı rolünü belirle (token içinden parse edebiliriz ama basitlik için sabit atıyoruz)
    localStorage.setItem('userRole', 'Student');
    
    // Dashboard sayfasına yönlendir
    navigate('/dashboard');
  };

  // Kullanıcı başarıyla kayıt olduğunda
  const handleRegisterSuccess = () => {
    setShowRegister(false);
    // Opsiyonel: başarı mesajı göster
  };

  return (
    <div className="login-container">
      {/* DALGA ARKA PLAN */}
      <div className="wave-container">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      {/* ŞİFREMİ UNUTTUM MODALI */}
      {showForgot && <ForgotPassword onClose={() => setShowForgot(false)} />}
      
      {/* KAYIT OL MODALI */}
      {showRegister && <Register onClose={() => setShowRegister(false)} onRegisterSuccess={handleRegisterSuccess} />}

      {/* GİRİŞ KUTUSU */}
      <div className="login-box">
        <img src="/iyte-logo.png" alt="Logo" className="center-logo" />
        <h2>Graduation Management System</h2>

        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <button type="submit" disabled={loading}>
            {loading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <button
            type="button"
            onClick={() => setShowRegister(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#28a745',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            Hesap Oluştur
          </button>
          
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              fontSize: '13px',
              fontStyle: 'italic',
            }}
          >
            Şifremi Unuttum
          </button>
        </div>

        {/* DEV MODE BUTTON - REMOVE IN PRODUCTION */}
        <div style={{ marginTop: '10px' }}>
          <button
            type="button"
            onClick={handleDevLogin}
            style={{
              background: '#28a745',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              padding: '8px 12px',
              width: '100%',
              fontSize: '14px'
            }}
          >
            DEV MODE: Giriş Atla
          </button>
        </div>

        {error && <p className="error" style={{ color: 'red', fontWeight: 'bold', marginTop: '15px', textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
};

export default Login; 