import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl, getApiHeaders } from '../../config/api';

const Register = ({ onClose, onRegisterSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [code, setCode] = useState('');

  const [step, setStep] = useState(1); // 1: Email, 2: Doğrulama Kodu, 3: Kayıt Formu, 4: Tamamlandı
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fakülte ve bölümleri getir - sadece 3. adımda çağrılacak
  useEffect(() => {
    if (step === 3) {
      fetchFacultiesAndDepartments();
    }
  }, [step]);

  // Fakülte değiştiğinde ilgili bölümleri filtrele
  useEffect(() => {
    if (facultyId) {
      const filtered = departments.filter(dept => dept.facultyId === facultyId);
      setFilteredDepartments(filtered);
      
      // Eğer seçili bölüm bu fakülteye ait değilse, seçimi temizle
      if (departmentId && !filtered.some(dept => dept.id === departmentId)) {
        setDepartmentId('');
      }
    } else {
      setFilteredDepartments([]);
      setDepartmentId('');
    }
  }, [facultyId, departments, departmentId]);

  const fetchFacultiesAndDepartments = async () => {
    try {
      setLoading(true);
      console.log('Fakülte ve bölüm verileri getiriliyor...');
      
      // Fakülteleri getir
      const facultiesResponse = await axios({
        method: 'get',
        url: getApiUrl('/api/Faculties?PageIndex=0&PageSize=100'),
        headers: getApiHeaders(),
        timeout: 15000
      });
      
      console.log('Fakülteler yanıt:', facultiesResponse.data);
      
      // Bölümleri getir
      const departmentsResponse = await axios({
        method: 'get',
        url: getApiUrl('/api/Departments?PageIndex=0&PageSize=100'),
        headers: getApiHeaders(),
        timeout: 15000
      });
      
      console.log('Bölümler yanıt:', departmentsResponse.data);
      
      let facultiesData = [];
      if (facultiesResponse.data) {
        if (Array.isArray(facultiesResponse.data)) {
          facultiesData = facultiesResponse.data;
        } else if (facultiesResponse.data.items && Array.isArray(facultiesResponse.data.items)) {
          facultiesData = facultiesResponse.data.items;
        } else if (typeof facultiesResponse.data === 'object') {
          facultiesData = Object.values(facultiesResponse.data).filter(item => typeof item === 'object');
        }
      }
      
      let departmentsData = [];
      if (departmentsResponse.data) {
        if (Array.isArray(departmentsResponse.data)) {
          departmentsData = departmentsResponse.data;
        } else if (departmentsResponse.data.items && Array.isArray(departmentsResponse.data.items)) {
          departmentsData = departmentsResponse.data.items;
        } else if (typeof departmentsResponse.data === 'object') {
          departmentsData = Object.values(departmentsResponse.data).filter(item => typeof item === 'object');
        }
      }
      
      // Veri yapılarını standartlaştır ve dönüştür
      facultiesData = facultiesData.map(faculty => ({
        id: faculty.id,
        name: faculty.name || faculty.facultyName || ''
      }));
      
      departmentsData = departmentsData.map(dept => ({
        id: dept.id,
        name: dept.name || dept.departmentName || '',
        facultyId: dept.facultyId
      }));
      
      console.log('İşlenmiş Fakülteler:', facultiesData);
      console.log('İşlenmiş Bölümler:', departmentsData);
      
      setFaculties(facultiesData);
      setDepartments(departmentsData);
      
      if (facultiesData.length === 0) {
        console.warn('Hiç fakülte verisi bulunamadı!');
        setError('Fakülte bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
      }
      
      if (departmentsData.length === 0) {
        console.warn('Hiç bölüm verisi bulunamadı!');
        setError('Bölüm bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
      }
      
    } catch (error) {
      console.error('Fakülte ve bölüm verileri getirme hatası:', error);
      if (error.response) {
        console.error('API hata detayları:', error.response.status, error.response.data);
      }
      setError('Fakülte ve bölüm bilgileri yüklenemedi. Ağ bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = () => {
    if (!email) {
      setError('Lütfen email adresinizi girin.');
      return false;
    }
    
    // Basit email doğrulama
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Geçerli bir email adresi girin.');
      return false;
    }
    
    return true;
  };

  const validateRegistrationForm = () => {
    if (!password || !confirmPassword || !firstName || !lastName || !phoneNumber || !studentNumber || !departmentId || !facultyId) {
      setError('Lütfen tüm alanları doldurun.');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return false;
    }
    
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return false;
    }
    
    // Telefon numarası kontrolü - sadece sayı olmalı
    if (!/^\d+$/.test(phoneNumber)) {
      setError('Telefon numarası sadece rakamlardan oluşmalıdır.');
      return false;
    }
    
    // Öğrenci numarası kontrolü - sadece sayı olmalı
    if (!/^\d+$/.test(studentNumber)) {
      setError('Öğrenci numarası sadece rakamlardan oluşmalıdır.');
      return false;
    }
    
    return true;
  };

  const extractErrorMessage = (error) => {
    // Varsayılan hata mesajı
    let errorMessage = 'Bir hata oluştu.';
    
    if (!error.response || !error.response.data) {
      return errorMessage;
    }
    
    const responseData = error.response.data;
    console.error('API hata detayları:', error.response.status, responseData);
    
    // Validation hatası durumu (yeni format)
    if (responseData.Title === "Validation error(s)" && responseData.Errors && Array.isArray(responseData.Errors)) {
      // Tüm property hatalarını topla
      const errorDetails = [];
      
      responseData.Errors.forEach(errorItem => {
        // Hangi alan için hata olduğunu belirtelim
        const fieldName = errorItem.Property ? errorItem.Property.split('.').pop() : '';
        let fieldErrors = [];
        
        if (errorItem.Errors && Array.isArray(errorItem.Errors)) {
          // Tüm hata mesajlarını ekle
          fieldErrors = [...errorItem.Errors];
        }
        
        // Alan adlarını daha okunabilir hale getir
        let readableFieldName = fieldName;
        switch (fieldName) {
          case 'Email': readableFieldName = 'Email'; break;
          case 'Password': readableFieldName = 'Şifre'; break;
          case 'FirstName': readableFieldName = 'Ad'; break;
          case 'LastName': readableFieldName = 'Soyad'; break;
          case 'PhoneNumber': readableFieldName = 'Telefon'; break;
          case 'StudentNumber': readableFieldName = 'Öğrenci Numarası'; break;
          case 'DepartmentId': readableFieldName = 'Bölüm'; break;
          case 'FacultyId': readableFieldName = 'Fakülte'; break;
          default: break;
        }
        
        // Hata alanını ve mesajlarını ekle
        if (fieldName && fieldErrors.length > 0) {
          errorDetails.push(`${readableFieldName}: ${fieldErrors.join(', ')}`);
        }
      });
      
      // Tüm hataları birleştir
      if (errorDetails.length > 0) {
        errorMessage = `Doğrulama hatası: ${errorDetails.join(' | ')}`;
      } else {
        errorMessage = responseData.Detail || 'Formu doldurmada bazı hatalar oluştu.';
      }
    }
    // Business Rule hatası (yeni format)
    else if (responseData.Type && responseData.Type.includes("/probs/business") && responseData.Detail) {
      errorMessage = responseData.Detail;
    }
    // BusinessException durumu (eski format)
    else if (typeof responseData === 'string' && responseData.includes('Exception')) {
      const match = responseData.match(/Exception: (.+?)(\r|\n|$)/);
      if (match && match[1]) {
        errorMessage = match[1];
      }
    }
    // Diğer JSON hata durumları
    else if (responseData.Detail || responseData.detail || responseData.message || responseData.Title) {
      errorMessage = responseData.Detail || responseData.detail || responseData.message || responseData.Title;
    }
    
    // Yaygın hata mesajlarını kullanıcı dostu hale getir
    if (errorMessage.includes("User mail already exists")) {
      errorMessage = "Bu email adresi zaten kayıtlı.";
    } else if (errorMessage.includes("department not found")) {
      errorMessage = "Seçilen bölüm bulunamadı.";
    } else if (errorMessage.includes("faculty not found")) {
      errorMessage = "Seçilen fakülte bulunamadı.";
    } else if (errorMessage.includes("Invalid verification code")) {
      errorMessage = "Doğrulama kodu geçersiz.";
    } else if (errorMessage.includes("Verification code expired")) {
      errorMessage = "Doğrulama kodunun süresi dolmuş. Yeni kod alın.";
    } else if (errorMessage.includes("Password validation")) {
      errorMessage = "Şifre gereksinimlerini karşılamıyor. En az 6 karakter, 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir.";
    }
    
    return errorMessage;
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Email doğrulama kodu gönder
      await axios.post(getApiUrl('/api/Auth/send-email-validation'), { email });
      
      setMessage('Doğrulama kodu email adresinize gönderildi.');
      setStep(2); // Kod doğrulama adımına geç
    } catch (error) {
      console.error('Email doğrulama hatası:', error);
      setError(extractErrorMessage(error) || 'Email doğrulama kodu gönderilemedi.');
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
      // Doğrulama kodunu kontrol et
      await axios.post(getApiUrl('/api/Auth/verify-code'), { 
        email, 
        code, 
        validationType: 2 // Email doğrulama için 2 kullanılıyor
      });
      
      setMessage('Email adresiniz doğrulandı. Lütfen kayıt formunu doldurun.');
      setStep(3); // Kayıt formu adımına geç
    } catch (error) {
      console.error('Kod doğrulama hatası:', error);
      setError(extractErrorMessage(error) || 'Doğrulama kodu hatalı veya süresi dolmuş.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateRegistrationForm()) return;
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Kullanıcı kaydını tamamla
      await axios.post(getApiUrl('/api/Auth/Register'), {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        studentNumber,
        departmentId,
        facultyId
      });
      
      setMessage('Kayıt işlemi başarıyla tamamlandı! Giriş yapabilirsiniz.');
      setStep(4); // Tamamlandı adımına geç
      
      // 3 saniye sonra kapat ve başarılı callback'i çağır
      setTimeout(() => {
        onRegisterSuccess && onRegisterSuccess();
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Kayıt hatası:', error);
      setError(extractErrorMessage(error) || 'Kayıt işlemi sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Sadece sayı girişine izin veren handler
  const handleNumericInput = (e, setter) => {
    const value = e.target.value;
    // Sadece sayısal değerlere izin ver (regex ile kontrol)
    if (value === '' || /^\d+$/.test(value)) {
      setter(value);
    }
  };

  const renderStep = () => {
    // Fakülte ve bölüm verileri yüklenirken gösterilen yükleme mesajı
    if (loading && step === 3 && (!faculties.length || !departments.length)) {
      return (
        <div className="loading-container">
          <h3>Veriler Yükleniyor</h3>
          <p>Fakülte ve bölüm bilgileri getiriliyor...</p>
          <div className="spinner"></div>
        </div>
      );
    }

    switch(step) {
      case 1: // Email giriş
        return (
          <form onSubmit={handleSendEmail}>
            <h3>Hesap Oluşturma - Email Doğrulama</h3>
            <p>Kayıt olmak için önce email adresinizi doğrulamanız gerekiyor.</p>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Email adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
            </button>
          </form>
        );
        
      case 2: // Doğrulama kodu girişi
        return (
          <form onSubmit={handleVerifyCode}>
            <h3>Email Doğrulama</h3>
            <p>{email} adresine gönderilen doğrulama kodunu girin.</p>
            
            <div className="form-group">
              <label>Doğrulama Kodu</label>
              <input
                type="text"
                placeholder="Doğrulama Kodu"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Doğrulanıyor...' : 'Kodu Doğrula'}
            </button>
            
            <div style={{ marginTop: '15px' }}>
              <button type="button" 
                onClick={() => setStep(1)} 
                style={{ backgroundColor: 'transparent', color: '#666', width: 'auto', padding: '0', marginTop: '0' }}
              >
                &laquo; Email Adresini Değiştir
              </button>
            </div>
          </form>
        );
        
      case 3: // Kayıt bilgileri girişi
        return (
          <form onSubmit={handleRegister}>
            <h3>Kayıt Bilgilerini Tamamlayın</h3>
            <p>Email adresiniz doğrulandı. Şimdi diğer bilgilerinizi girin.</p>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="disabled-input"
              />
            </div>
            
            <div className="form-group">
              <label>Ad</label>
              <input
                type="text"
                placeholder="Adınız"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Soyad</label>
              <input
                type="text"
                placeholder="Soyadınız"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Telefon</label>
              <input
                type="tel"
                placeholder="Telefon numaranız"
                value={phoneNumber}
                onChange={(e) => handleNumericInput(e, setPhoneNumber)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Öğrenci Numarası</label>
              <input
                type="text"
                placeholder="Öğrenci numaranız"
                value={studentNumber}
                onChange={(e) => handleNumericInput(e, setStudentNumber)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Fakülte</label>
              <select 
                value={facultyId} 
                onChange={(e) => setFacultyId(e.target.value)}
                required
              >
                <option value="">Fakülte Seçin</option>
                {faculties.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Bölüm</label>
              <select 
                value={departmentId} 
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={!facultyId}
                required
              >
                <option value="">Bölüm Seçin</option>
                {filteredDepartments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Şifre</label>
              <input
                type="password"
                placeholder="Şifreniz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Şifre Tekrar</label>
              <input
                type="password"
                placeholder="Şifrenizi tekrar girin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kaydı Tamamla'}
            </button>
          </form>
        );
        
      case 4: // Tamamlandı
        return (
          <div className="success-message">
            <h3>Kayıt Tamamlandı</h3>
            <p>Hesabınız başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.</p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div style={modalStyle}>
      <div style={formStyle} className="register-form">
        {renderStep()}
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        
        {step !== 4 && (
          <button 
            onClick={onClose} 
            type="button" 
            style={closeButtonStyle}
          >
            Kapat
          </button>
        )}
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
  minWidth: '500px',
  maxWidth: '750px',
  maxHeight: '85vh',
  overflowY: 'auto',
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

export default Register; 