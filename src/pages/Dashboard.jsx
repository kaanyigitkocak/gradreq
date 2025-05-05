import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, getApiHeaders } from '../config/api';
import StudentTable from '../components/common/StudentTable';
import StudentForm from '../components/common/StudentForm';

const Dashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Öğrenci ekleme ve düzenleme formu state'leri
  const [showAddForm, setShowAddForm] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  
  // Düzenlenecek öğrenci bilgileri
  const [studentToEdit, setStudentToEdit] = useState(null);

  const [isHovering, setIsHovering] = useState(false);

  const handleLogout = () => {
    // Kullanıcı doğrulaması yap
    if (window.confirm('Oturumu kapatmak istediğinizden emin misiniz?')) {
      // Tüm localStorage verilerini temizle
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
      
      // Axios Authorization header'ı temizle
      delete axios.defaults.headers.common['Authorization'];
      
      // Login sayfasına yönlendir
    navigate('/');
    }
  };

  // Fakülte ve bölüm verilerini getir
  const fetchFacultiesAndDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fakülteleri getir - PageSize=100 parametresi eklendi
      const facultiesResponse = await axios({
        method: 'get',
        url: getApiUrl('/api/Faculties?PageSize=100'),
        headers: getApiHeaders(token),
        timeout: 15000
      });
      
      console.log('Fakülteler API yanıtı:', facultiesResponse.data);
      
      // Bölümleri getir - PageSize=100 parametresi eklendi
      const departmentsResponse = await axios({
        method: 'get',
        url: getApiUrl('/api/Departments?PageSize=100'),
        headers: getApiHeaders(token),
        timeout: 15000
      });
      
      console.log('Bölümler API yanıtı:', departmentsResponse.data);
      
      // Fakülte ve bölümlerin API yapısını kontrol et
      let facultiesData = [];
      if (facultiesResponse.data) {
        if (Array.isArray(facultiesResponse.data)) {
          facultiesData = facultiesResponse.data;
        } else if (facultiesResponse.data.items && Array.isArray(facultiesResponse.data.items)) {
          facultiesData = facultiesResponse.data.items;
        } else if (typeof facultiesResponse.data === 'object') {
          // Eğer beklenmeyen bir formatta geldiyse
          console.warn('Fakülte verileri beklenmeyen formatta:', facultiesResponse.data);
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
          // Eğer beklenmeyen bir formatta geldiyse
          console.warn('Bölüm verileri beklenmeyen formatta:', departmentsResponse.data);
          departmentsData = Object.values(departmentsResponse.data).filter(item => typeof item === 'object');
        }
      }
      
      // Debug için detaylı veri içeriği
      console.log('İşlenmiş Fakülte verileri:', facultiesData);
      console.log('İşlenmiş Bölüm verileri:', departmentsData);
      
      // Veri yapılarını standartlaştır
      facultiesData = facultiesData.map(faculty => ({
        id: faculty.id,
        name: faculty.name || faculty.facultyName || ''
      }));
      
      departmentsData = departmentsData.map(dept => ({
        id: dept.id,
        name: dept.name || dept.departmentName || '',
        facultyId: dept.facultyId
      }));
      
      // Fakülte ve bölüm adlarını konsola yazdir
      console.log('=== FAKÜLTELER ===');
      facultiesData.forEach((faculty, index) => {
        console.log(`${index + 1}. ${faculty.name} (ID: ${faculty.id})`);
      });
      
      console.log('=== BÖLÜMLER ===');
      departmentsData.forEach((dept, index) => {
        const parentFaculty = facultiesData.find(f => f.id === dept.facultyId);
        console.log(`${index + 1}. ${dept.name} (ID: ${dept.id}) - Fakülte: ${parentFaculty?.name || 'Bilinmiyor'}`);
      });
      
      // ID'lerin tiplerini kontrol et
      facultiesData.forEach(f => {
        console.log(`Fakülte: ${f.name}, ID: ${f.id}, ID tipi: ${typeof f.id}`);
      });
      
      departmentsData.forEach(d => {
        console.log(`Bölüm: ${d.name}, ID: ${d.id}, facultyId: ${d.facultyId}, facultyId tipi: ${typeof d.facultyId}`);
      });
      
      setFaculties(facultiesData);
      setDepartments(departmentsData);
      
    } catch (err) {
      console.error('Fakülte ve bölüm verileri getirme hatası:', err);
      if (err.response) {
        console.error('API hata detayları:', err.response.status, err.response.data);
      }
    }
  };

  // Öğrenci verilerini doğru yapıya dönüştüren yardımcı fonksiyon
  const processStudentData = (students) => {
    return students.map(student => {
      // Öğrenci için isim oluştur
      let displayName = 'Student';
      if (student.firstName && student.lastName) {
        displayName = `${student.firstName} ${student.lastName}`;
      } else if (student.name) {
        displayName = student.name;
      } else if (student.userName) {
        displayName = student.userName;
      } else if (student.displayName) {
        displayName = student.displayName;
      } else if (student.studentNumber) {
        displayName = `Student ${student.studentNumber}`;
      } else if (student.studentId) {
        displayName = `Student ${student.studentId}`;
      } else if (student.id) {
        displayName = `Student ${student.id}`;
      }
      
      // E-posta oluştur
      const email = student.email || 
        `${student.studentNumber || student.studentId || 'student'}@university.edu`;
      
      return {
        ...student,
        email,
        displayName
      };
    });
  };

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // API URL'ini consola yazdır
      const apiUrl = getApiUrl(`/api/Students?PageIndex=${pageIndex}&PageSize=${pageSize}`);
      console.log('API URL:', apiUrl);
      console.log('Token:', token ? 'Mevcut' : 'Yok');
      
      // API çağrısı - yeni headers yapılandırmasını kullan
      const response = await axios({
        method: 'get',
        url: apiUrl,
        headers: getApiHeaders(token),
        responseType: 'json',
        timeout: 15000 // 15 saniye timeout
      });
      
      console.log('API Response Status:', response.status);
      console.log('API Response Type:', typeof response.data);
      
      // HTML yanıtı kontrolü
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.log('HTML yanıtı alındı, bu bir Ngrok uyarısı olabilir');
        setError('API HTML yanıtı döndü. Ngrok uyarısı atlatılamadı.');
        setStudents([]);
        setLoading(false);
        return;
      }
      
      // Kısa bir veri önizlemesi göster (çok büyük değilse)
      if (typeof response.data === 'string' && response.data.length < 1000) {
        console.log('API Raw Response:', response.data);
      } else if (typeof response.data === 'object') {
        console.log('API Response Object:', typeof response.data === 'object' ? 'Object received' : 'Not an object');
      }
      
      let processedData = response.data;
      
      // Yanıt bir string ise JSON olarak ayrıştırmayı dene
      if (typeof response.data === 'string') {
        try {
          console.log('Response is string, trying to parse as JSON');
          processedData = JSON.parse(response.data);
          console.log('Parsed data:', processedData ? 'Available' : 'Empty');
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          setError('API JSON parsing error: ' + parseError.message);
          setStudents([]);
          setLoading(false);
          return;
        }
      }
      
      // Handle different response formats
      if (processedData) {
        if (Array.isArray(processedData)) {
          // Direct array response
          console.log('Response contains direct array with', processedData.length, 'items');
          const resultData = processStudentData(processedData);
          setStudents(resultData);
          setTotalCount(processedData.length);
          setTotalPages(Math.ceil(processedData.length / pageSize));
          setError(null);
        } else if (processedData.items && Array.isArray(processedData.items)) {
          // Paginated response with items array
          console.log('Response contains paginated items array with', processedData.items.length, 'items');
          const resultData = processStudentData(processedData.items);
          setStudents(resultData);
          setTotalPages(processedData.pages || 1);
          setTotalCount(processedData.count || 0);
          setError(null);
        } else if (Array.isArray(processedData.data)) {
          // Alternatif API yanıtı formatı
          console.log('Response contains data array with', processedData.data.length, 'items');
          const resultData = processStudentData(processedData.data);
          setStudents(resultData);
          setTotalCount(processedData.data.length);
          setTotalPages(Math.ceil(processedData.data.length / pageSize));
          setError(null);
        } else {
          console.error('Unexpected API response format:', typeof processedData);
          setStudents([]);
          setTotalCount(0);
          setTotalPages(1);
          setError('Unexpected data format received from server');
        }
      } else {
        console.log('No data in response');
        setStudents([]);
        setTotalCount(0);
        setTotalPages(1);
        setError('No data received from server');
      }
    } catch (err) {
      console.error('API call failed:', err);
      console.error('Error details:', err.message);
      if (err.response) {
        console.error('Error response:', err.response.status, err.response.data);
        setDebugInfo({
          errorStatus: err.response.status,
          errorData: JSON.stringify(err.response.data)
        });
      }
      
      setStudents([]);
      setTotalCount(0);
      setTotalPages(1);
      setError(`API Hatası: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students when component mounts or pagination changes
  useEffect(() => {
    fetchStudents();
  }, [pageIndex, pageSize]);

  // Fakülte ve bölüm verilerini sayfa yüklendiğinde bir kez getir
  useEffect(() => {
    fetchFacultiesAndDepartments();
  }, []);

  // Handle pagination change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPageIndex(newPage);
    }
  };

  // Öğrenci düzenleme işlemini başlat
  const handleEditStudent = (student) => {
    setStudentToEdit(student);
    setShowAddForm(true);
    // Sayfayı form kısmına scroll yap
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Form kapatıldığında
  const handleFormClose = () => {
    setShowAddForm(false);
    setStudentToEdit(null);
  };

  return (
    <div style={container}>
      <header style={header}>
        <img src="/iyte-logo.png" alt="Logo" style={logoStyle} />
        <h1 style={titleStyle}>Öğrenci Yönetim Sistemi</h1>
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
        {/* Öğrenci Ekle Butonu */}
        <div style={addButtonContainer}>
          <button 
            onClick={() => {
              setStudentToEdit(null); // Yeni öğrenci moduna geç
              setShowAddForm(!showAddForm);
            }}
            style={addButtonStyle}
          >
            {showAddForm ? 'Formu Kapat ↑' : '+ Yeni Öğrenci Ekle'}
          </button>
          
          {showAddForm && (
            <button 
              onClick={handleFormClose}
              style={closeButtonStyle}
            >
              İptal
            </button>
          )}
        </div>

        {error && (
          <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', margin: '10px', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        
        {debugInfo && (
          <div style={{ backgroundColor: '#e2f3ff', color: '#0c5460', padding: '10px', margin: '10px', borderRadius: '4px', fontSize: '12px' }}>
            <strong>Debug Info:</strong>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        
        {/* Öğrenci Ekleme/Düzenleme Formu */}
        {showAddForm && (
          <StudentForm 
            onStudentAdded={() => {
              fetchStudents();
              // Başarılı kaydetme sonrası formu kapat (isteğe bağlı)
              // setShowAddForm(false);
              // setStudentToEdit(null);
            }} 
            faculties={faculties} 
            departments={departments}
            studentToEdit={studentToEdit}
          />
        )}
        
        {/* Öğrenci Tablosu */}
        <StudentTable 
          students={students} 
          loading={loading} 
          onEdit={handleEditStudent}
          onRefresh={fetchStudents}
        />
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button 
              onClick={() => handlePageChange(pageIndex - 1)} 
              disabled={pageIndex === 0 || loading}
              style={{ margin: '0 10px', padding: '5px 10px' }}
            >
              Önceki
            </button>
            <span style={{ margin: '0 10px', padding: '5px 10px' }}>
              Sayfa {pageIndex + 1} / {totalPages} ({totalCount} öğrenci)
            </span>
            <button 
              onClick={() => handlePageChange(pageIndex + 1)} 
              disabled={pageIndex === totalPages - 1 || loading}
              style={{ margin: '0 10px', padding: '5px 10px' }}
            >
              Sonraki
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

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

// Çıkış butonuna hover efekti
const hoverLogoutBtnStyle = {
  ...logoutBtnStyle,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
};

const main = {
  padding: '20px',
  maxWidth: '1300px',
  margin: '0 auto',
};

// Yeni öğrenci ekleme butonu container stili
const addButtonContainer = {
  display: 'flex',
  justifyContent: 'center',
  margin: '20px 0',
  padding: '10px',
  backgroundColor: '#f0f0f0',
  borderRadius: '8px',
  gap: '10px'
};

// Yeni öğrenci ekleme butonu stili
const addButtonStyle = {
  padding: '15px 30px',
  fontSize: '16px',
  fontWeight: 'bold',
  backgroundColor: '#9C27B0',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  transition: 'all 0.3s ease',
};

// İptal butonu stili
const closeButtonStyle = {
  padding: '15px 30px',
  fontSize: '16px',
  fontWeight: 'bold',
  backgroundColor: '#f44336',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  transition: 'all 0.3s ease',
};

export default Dashboard; 