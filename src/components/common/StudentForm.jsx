import React, { useEffect } from 'react';
import axios from 'axios';
import { getApiUrl, getApiHeaders } from '../../config/api';

const StudentForm = ({ onStudentAdded, faculties, departments, studentToEdit }) => {
  const [student, setStudent] = React.useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    studentNumber: '',
    gpa: 0,
    totalECTS: 0,
    departmentId: '',
    facultyId: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);
  const [filteredDepartments, setFilteredDepartments] = React.useState([]);
  const isEditMode = Boolean(studentToEdit);

  // Konsola fakülte ve bölüm verilerini yazdır
  useEffect(() => {
    console.log("Fakülteler:", faculties);
    console.log("Bölümler:", departments);
  }, [faculties, departments]);

  // Düzenleme modu için verileri yükle
  useEffect(() => {
    if (studentToEdit) {
      setStudent({
        id: studentToEdit.id || '',
        firstName: studentToEdit.firstName || '',
        lastName: studentToEdit.lastName || '',
        email: studentToEdit.email || '',
        password: '', // Şifre alanını düzenleme modunda temizle
        phoneNumber: studentToEdit.phoneNumber || '',
        studentNumber: studentToEdit.studentNumber || '',
        gpa: studentToEdit.gpa || 0,
        totalECTS: studentToEdit.totalECTS || 0,
        departmentId: studentToEdit.departmentId || '',
        facultyId: studentToEdit.facultyId || ''
      });
    }
  }, [studentToEdit]);

  // Fakülte değiştiğinde uygun bölümleri filtrele
  useEffect(() => {
    if (student.facultyId) {
      console.log("Seçilen fakülte ID:", student.facultyId);
      console.log("Fakülte ID tipi:", typeof student.facultyId);
      
      const filtered = departments.filter(dept => {
        console.log("Bölüm:", dept.name, "Bölüm fakultyId:", dept.facultyId, "Karşılaştırılan ID:", student.facultyId);
        // Stringse direkt karşılaştır, değilse stringe çevirip karşılaştır
        return String(dept.facultyId) === String(student.facultyId);
      });
      
      console.log("Filtrelenen bölümler:", filtered);
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments([]);
    }
  }, [student.facultyId, departments]);

  // Form alanı değişikliği
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudent({
      ...student,
      [name]: value
    });
  };

  // Fakülte seçildiğinde ilgili bölümleri getir
  const handleFacultyChange = (e) => {
    const facultyId = e.target.value;
    console.log("Fakülte seçildi:", facultyId);
    setStudent({
      ...student,
      facultyId: facultyId,
      departmentId: '' // Fakülte değiştiğinde bölüm seçimini sıfırla
    });
  };

  // Öğrenci ekleme veya güncelleme işlemi
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const token = localStorage.getItem('token');
      let response;
      
      // Öğrenci veri modeli oluştur - password alanını API için kaldır
      const studentData = { ...student };
      
      if (!isEditMode) {
        delete studentData.id;
        delete studentData.gpa;
        delete studentData.totalECTS;
      
        // Yeni öğrenci ekleme API isteği - POST metodu
        response = await axios({
          method: 'post',
          url: getApiUrl('/api/Students'),
          headers: getApiHeaders(token),
          data: studentData,
          timeout: 15000
        });
      } else {
        // Düzenleme modunda sadece fakülte ve bölüm bilgilerini güncelle
        const editData = {
          id: student.id,
          facultyId: student.facultyId,
          departmentId: student.departmentId,
          // Değişmesi gereken diğer alanları buraya ekleyebilirsiniz
          // API'nin gerektirdiği diğer zorunlu alanlar
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          studentNumber: student.studentNumber,
          phoneNumber: student.phoneNumber,
          gpa: student.gpa,
          totalECTS: student.totalECTS
        };
        
        // Şifreyi update gönderiminden çıkar
        delete editData.password;
        
        // Öğrenci güncelleme API isteği - PUT metodu
        response = await axios({
          method: 'put',
          url: getApiUrl('/api/Students'),
          headers: getApiHeaders(token),
          data: editData,
          timeout: 15000
        });
      }
      
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        
        if (!isEditMode) {
          // Yeni öğrenci ekleme modunda formu temizle
          setStudent({
            id: '',
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phoneNumber: '',
            studentNumber: '',
            gpa: 0,
            totalECTS: 0,
            departmentId: '',
            facultyId: ''
          });
        }
        
        // Ebeveyn bileşeni bilgilendir
        if (onStudentAdded) {
          onStudentAdded();
        }
      }
    } catch (err) {
      console.error('İşlem hatası:', err);
      setError(`İşlem sırasında bir hata oluştu: ${err.message}`);
      if (err.response) {
        console.error('Hata detayları:', err.response.status, err.response.data);
        
        // Daha detaylı hata mesajı göster
        if (err.response.data && err.response.data.message) {
          setError(`Sunucu hatası: ${err.response.data.message}`);
        } else if (err.response.data && err.response.data.errors) {
          const errorMessages = Object.values(err.response.data.errors).flat().join(', ');
          setError(`Doğrulama hatası: ${errorMessages}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={formContainer}>
      <h2 style={{ color: '#7b1fa2', marginBottom: '20px' }}>
        {isEditMode ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}
      </h2>
      
      {success && (
        <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', marginBottom: '20px', borderRadius: '4px' }}>
          Öğrenci başarıyla {isEditMode ? 'güncellendi' : 'eklendi'}!
        </div>
      )}
      
      {error && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', marginBottom: '20px', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={formRow}>
          <div style={formGroup}>
            <label htmlFor="firstName" style={formLabel}>Ad</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={student.firstName}
              onChange={handleInputChange}
              style={isEditMode ? {...formInput, backgroundColor: '#f5f5f5'} : formInput}
              required
              readOnly={isEditMode} // Düzenleme modunda salt okunur
            />
          </div>
          <div style={formGroup}>
            <label htmlFor="lastName" style={formLabel}>Soyad</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={student.lastName}
              onChange={handleInputChange}
              style={isEditMode ? {...formInput, backgroundColor: '#f5f5f5'} : formInput}
              required
              readOnly={isEditMode} // Düzenleme modunda salt okunur
            />
          </div>
        </div>

        <div style={formRow}>
          <div style={formGroup}>
            <label htmlFor="email" style={formLabel}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={student.email}
              onChange={handleInputChange}
              style={isEditMode ? {...formInput, backgroundColor: '#f5f5f5'} : formInput}
              required
              readOnly={isEditMode} // Düzenleme modunda salt okunur
            />
          </div>
          <div style={formGroup}>
            <label htmlFor="password" style={formLabel}>Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder={isEditMode ? "Şifre değiştirilemez" : "Şifre"}
              value={student.password}
              onChange={handleInputChange}
              style={isEditMode ? {...formInput, backgroundColor: '#f5f5f5'} : formInput}
              required={!isEditMode} // Yeni kayıtta zorunlu
              disabled={isEditMode} // Düzenleme modunda devre dışı
            />
          </div>
        </div>

        <div style={formRow}>
          <div style={formGroup}>
            <label htmlFor="studentNumber" style={formLabel}>Öğrenci Numarası</label>
            <input
              type="text"
              id="studentNumber"
              name="studentNumber"
              value={student.studentNumber}
              onChange={handleInputChange}
              style={isEditMode ? {...formInput, backgroundColor: '#f5f5f5'} : formInput}
              required
              readOnly={isEditMode} // Düzenleme modunda salt okunur
            />
          </div>
          <div style={formGroup}>
            <label htmlFor="phoneNumber" style={formLabel}>Telefon</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={student.phoneNumber}
              onChange={handleInputChange}
              style={isEditMode ? {...formInput, backgroundColor: '#f5f5f5'} : formInput}
              required
              readOnly={isEditMode} // Düzenleme modunda salt okunur
            />
          </div>
        </div>

        {isEditMode && (
          <div style={formRow}>
            <div style={formGroup}>
              <label htmlFor="gpa" style={formLabel}>GPA</label>
              <input
                type="number"
                id="gpa"
                name="gpa"
                value={student.gpa}
                onChange={handleInputChange}
                style={{...formInput, backgroundColor: '#f5f5f5'}}
                step="0.01"
                min="0"
                max="4"
                readOnly={true}
                disabled={true}
              />
            </div>
            <div style={formGroup}>
              <label htmlFor="totalECTS" style={formLabel}>Toplam ECTS</label>
              <input
                type="number"
                id="totalECTS"
                name="totalECTS"
                value={student.totalECTS}
                onChange={handleInputChange}
                style={{...formInput, backgroundColor: '#f5f5f5'}}
                min="0"
                readOnly={true}
                disabled={true}
              />
            </div>
          </div>
        )}

        <div style={formRow}>
          <div style={formGroup}>
            <label htmlFor="facultyId" style={formLabel}>Fakülte</label>
            <div style={customSelectContainer}>
              <select
                id="facultyId"
                name="facultyId"
                value={student.facultyId}
                onChange={handleFacultyChange}
                style={customSelectStyle}
                required
              >
                <option value="">Fakülte Seçin</option>
                {faculties && faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
              <span style={selectArrow}>▼</span>
            </div>
            {/* Debug bilgisi */}
            <div style={debugInfoStyle}>
              <small>Toplam {faculties?.length || 0} fakülte</small>
            </div>
          </div>
          <div style={formGroup}>
            <label htmlFor="departmentId" style={formLabel}>Bölüm</label>
            <div style={customSelectContainer}>
              <select
                id="departmentId"
                name="departmentId"
                value={student.departmentId}
                onChange={handleInputChange}
                style={customSelectStyle}
                required
                disabled={!student.facultyId}
              >
                <option value="">Bölüm Seçin</option>
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))
                ) : (
                  student.facultyId && <option value="" disabled>Bu fakülteye ait bölüm bulunamadı</option>
                )}
              </select>
              <span style={selectArrow}>▼</span>
            </div>
            {/* Debug bilgisi */}
            <div style={debugInfoStyle}>
              <small>Filtrelenen bölüm sayısı: {filteredDepartments?.length || 0}</small>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <button 
            type="submit" 
            style={submitButtonStyle}
            disabled={loading}
          >
            {loading 
              ? (isEditMode ? 'Güncelleniyor...' : 'Kaydediliyor...') 
              : (isEditMode ? 'Öğrenciyi Güncelle' : 'Öğrenci Ekle')}
          </button>
        </div>
      </form>
    </div>
  );
};

// Form stilleri
const formContainer = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '30px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const formRow = {
  display: 'flex',
  flexDirection: 'row',
  marginBottom: '15px',
  gap: '20px',
};

const formGroup = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
};

const formLabel = {
  marginBottom: '5px',
  fontWeight: 'bold',
  fontSize: '14px',
  color: '#333',
};

const formInput = {
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  fontSize: '14px',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
};

// Özel dropdown stilleri
const customSelectContainer = {
  position: 'relative',
  display: 'inline-block',
  width: '100%',
};

const customSelectStyle = {
  ...formInput,
  width: '100%',
  cursor: 'pointer',
  paddingRight: '30px', // Ok için yer ayırma
  backgroundColor: 'white',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
};

const selectArrow = {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  color: '#888',
  fontSize: '12px',
};

const debugInfoStyle = {
  fontSize: '10px',
  color: '#888',
  marginTop: '2px',
};

const submitButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#7b1fa2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '16px',
  minWidth: '200px',
};

export default StudentForm; 