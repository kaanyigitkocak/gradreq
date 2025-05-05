import React, { useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config/api';

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post(getApiUrl('/api/Auth/send-password-reset'), { email });
      setMessage('Sıfırlama kodu email adresinize gönderildi.');
      setStep(2); // Kod doğrulama adımına geç
    } catch (error) {
      setError('Email gönderiminde hata oluştu.');
      console.error('POST /send-password-reset hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post(getApiUrl('/api/Auth/verify-code'), { 
        email, 
        code, 
        validationType: 1 
      });
      
      setMessage('Kod doğrulandı. Lütfen yeni şifrenizi belirleyin.');
      setStep(3); // Şifre değiştirme adımına geç
    } catch (error) {
      setError('Kod doğrulama hatası. Lütfen tekrar deneyin.');
      console.error('POST /verify-code hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(getApiUrl('/api/Auth/reset-password'), { 
        email, 
        newPassword 
      });
      
      setMessage('Şifreniz başarıyla değiştirildi. Giriş yapabilirsiniz.');
      setTimeout(() => {
        onClose(); // 3 saniye sonra kapat
      }, 3000);
    } catch (error) {
      setError('Şifre değiştirme işlemi başarısız oldu.');
      console.error('POST /reset-password hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <form onSubmit={handleSendEmail}>
            <h3>Şifremi Unuttum</h3>
            <p>Lütfen email adresinizi girin. Size sıfırlama kodu göndereceğiz.</p>
            <input
              type="email"
              placeholder="Email adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Gönderiliyor...' : 'Sıfırlama Kodu Gönder'}
            </button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleVerifyCode}>
            <h3>Doğrulama Kodu</h3>
            <p>Email adresinize gönderilen kodu girin.</p>
            <input
              type="text"
              placeholder="Doğrulama Kodu"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Doğrulanıyor...' : 'Kodu Doğrula'}
            </button>
          </form>
        );
      case 3:
        return (
          <form onSubmit={handleResetPassword}>
            <h3>Yeni Şifre</h3>
            <p>Lütfen yeni şifrenizi belirleyin.</p>
            <input
              type="password"
              placeholder="Yeni Şifre"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Şifre Tekrar"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Şifre Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div style={modalStyle}>
      <div style={formStyle}>
        {renderStep()}
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <button 
          onClick={onClose} 
          type="button" 
          style={closeButtonStyle}
        >
          Kapat
        </button>
      </div>
    </div>
  );
};

const modalStyle = {
  position: 'fixed',
  top: 0, left: 0,
  width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const formStyle = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  textAlign: 'center',
  minWidth: '350px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
};

const closeButtonStyle = {
  marginTop: '10px',
  padding: '8px 15px',
  backgroundColor: '#f2f2f2',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default ForgotPassword; 