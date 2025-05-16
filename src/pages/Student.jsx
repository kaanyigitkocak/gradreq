import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/main.css';

const Student = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  
  useEffect(() => {
    // Token kontrolü yap
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Rol kontrolü yap
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'Student') {
      navigate('/dashboard');
      return;
    }
    
    // Token'dan kullanıcı bilgilerini al
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const name = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || 'Değerli Öğrenci';
        setStudentName(name);
      }
    } catch (error) {
      console.error('Token çözümleme hatası:', error);
    }
  }, [navigate]);

  const handleLogout = () => {
    // Kullanıcı doğrulaması yap
    if (window.confirm('Oturumu kapatmak istediğinizden emin misiniz?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiration');
      localStorage.removeItem('userRole');
      delete axios.defaults.headers.common['Authorization'];
      navigate('/login');
    }
  };

  return (
    <div style={container}>
      <header style={header}>
        <img src="/iyte-logo.png" alt="Logo" style={logoStyle} />
        <h1 style={titleStyle}>Öğrenci Mezuniyet Sistemi</h1>
        <button 
          onClick={handleLogout} 
          style={isHovering ? hoverLogoutBtnStyle : logoutBtnStyle}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          Çıkış Yap
        </button>
      </header>

      <main style={main}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2>Hoş geldiniz, {studentName}</h2>
          <p>Öğrenci panelinize hoş geldiniz. Bu sayfadan mezuniyet başvurularınızı takip edebilir ve gerekli işlemleri gerçekleştirebilirsiniz.</p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3>Mezuniyet İşlemleri</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li style={{ 
              padding: '1rem', 
              margin: '0.5rem 0', 
              background: '#f8f9fa', 
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>Mezuniyet Başvurusu Oluştur</li>
            <li style={{ 
              padding: '1rem', 
              margin: '0.5rem 0', 
              background: '#f8f9fa', 
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>Aktif Başvurularım</li>
            <li style={{ 
              padding: '1rem', 
              margin: '0.5rem 0', 
              background: '#f8f9fa', 
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>Mezuniyet Belgelerim</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

// Dashboard ile aynı stiller
const container = {
  fontFamily: 'Arial, sans-serif',
};

const header = {
  background: 'linear-gradient(to right, #7b1fa2, #a0181b)',
  color: 'white',
  padding: '10px 30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
};

const logoStyle = {
  height: '40px',
  marginRight: '20px',
};

const titleStyle = {
  margin: 0,
  fontSize: '1.8rem',
  fontWeight: '500',
};

const logoutBtnStyle = {
  padding: '8px 16px',
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  color: 'white',
  border: '1px solid white',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '12px',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  width: '80px',
  height: '30px',
};

const hoverLogoutBtnStyle = {
  ...logoutBtnStyle,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
};

const main = {
  padding: '20px',
  maxWidth: '1300px',
  margin: '0 auto',
};

export default Student; 