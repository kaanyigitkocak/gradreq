import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import { getApiUrl, getApiHeaders } from '../../config/api';

const StudentTable = ({ students, loading, onEdit, onRefresh }) => {
  // Ensure students is always an array
  const safeStudents = Array.isArray(students) ? students : [];
  
  // Debugging info
  console.log('StudentTable received:', safeStudents.length, 'students');
  if (safeStudents.length > 0) {
    console.log('First student example:', safeStudents[0]);
    // Öğrenci verilerinin yapısını incelemek için daha detaylı debug
    Object.keys(safeStudents[0]).forEach(key => {
      console.log(`Field: ${key}, Value:`, safeStudents[0][key]);
    });
  }
  
  const exportToPDF = async () => {
    // Create a loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.textContent = 'PDF hazırlanıyor...';
    loadingDiv.style.position = 'fixed';
    loadingDiv.style.top = '50%';
    loadingDiv.style.left = '50%';
    loadingDiv.style.transform = 'translate(-50%, -50%)';
    loadingDiv.style.padding = '20px';
    loadingDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
    loadingDiv.style.color = 'white';
    loadingDiv.style.borderRadius = '8px';
    loadingDiv.style.zIndex = '9999';
    document.body.appendChild(loadingDiv);
    
    try {
      // Fetch all students from API
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl(`/api/Students?PageSize=1000`); // Increased page size to 1000
      
      const response = await axios({
        method: 'get',
        url: apiUrl,
        headers: getApiHeaders(token),
        responseType: 'json',
        timeout: 30000 // Increased timeout for larger data
      });
      
      // Process the response to get all students
      let allStudents = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          allStudents = response.data;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          allStudents = response.data.items;
        } else if (Array.isArray(response.data.data)) {
          allStudents = response.data.data;
        }
      }
      
      console.log(`PDF için ${allStudents.length} öğrenci verisi alındı`);
      
      // If no students were fetched, use the current table data
      if (allStudents.length === 0) {
        allStudents = safeStudents;
        console.log('API\'den veri alınamadı, mevcut tablo verileri kullanılıyor');
      }
      
      const doc = new jsPDF();
      doc.text('Öğrenci Listesi', 14, 10);
      
      const tableColumn = ['Ad Soyad', 'Öğrenci No', 'Bölüm', 'Fakülte', 'GPA', 'ECTS'];
      const tableRows = allStudents.map((student) => [
        `${student.firstName || ''} ${student.lastName || ''}`,
        student.studentNumber || '',
        student.department?.name || '',
        student.faculty?.name || '',
        student.gpa || '',
        student.totalECTS || '',
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'grid',
        headStyles: { fillColor: [155, 27, 27] },
      });

      doc.save('ogrenci-listesi.pdf');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken bir hata oluştu: ' + error.message);
    } finally {
      // Remove loading indicator
      document.body.removeChild(loadingDiv);
    }
  };

  // Öğrenciyi düzenleme modalını aç
  const handleEditStudent = (student) => {
    console.log('Öğrenci düzenleniyor:', student);
    if (onEdit) {
      onEdit(student);
    }
  };

  // Öğrenciyi sil
  const handleDeleteStudent = async (studentId) => {
    if (!studentId) {
      console.error('Öğrenci ID bulunamadı:', studentId);
      return;
    }
    
    if (window.confirm('Bu öğrenciyi silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = getApiUrl(`/api/Students/${studentId}`);
        
        const response = await axios({
          method: 'delete',
          url: apiUrl,
          headers: getApiHeaders(token),
          timeout: 15000
        });
        
        if (response.status === 200 || response.status === 204) {
          alert('Öğrenci başarıyla silindi');
          // Tabloyu yenile
          if (onRefresh) {
            onRefresh();
          }
        }
      } catch (err) {
        console.error('Öğrenci silme hatası:', err);
        alert(`Öğrenci silinirken bir hata oluştu: ${err.message}`);
        if (err.response) {
          console.error('Hata detayları:', err.response.status, err.response.data);
        }
      }
    }
  };

  if (loading) {
    return <div>Öğrenciler yükleniyor...</div>;
  }

  if (!safeStudents.length) {
    return <div>Öğrenci bulunamadı. Lütfen API bağlantısını kontrol edin veya sistem yöneticisiyle iletişime geçin.</div>;
  }

  return (
    <div>
      {/* Export Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button 
          onClick={exportToPDF} 
          style={exportBtnStyle}
          disabled={loading || !safeStudents.length}
        >
          PDF'e Aktar
        </button>
      </div>

      {/* Student Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Ad Soyad</th>
              <th style={thStyle}>Öğrenci No</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Bölüm</th>
              <th style={thStyle}>Fakülte</th>
              <th style={thStyle}>GPA</th>
              <th style={thStyle}>ECTS</th>
              <th style={thStyle}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {safeStudents.map((student, i) => (
              <tr key={student.id || i}>
                <td style={tdStyle}>{`${student.firstName || ''} ${student.lastName || ''}`}</td>
                <td style={tdStyle}>{student.studentNumber || ''}</td>
                <td style={tdStyle}>{student.email || ''}</td>
                <td style={tdStyle}>{student.department?.name || ''}</td>
                <td style={tdStyle}>{student.faculty?.name || ''}</td>
                <td style={tdStyle}>{student.gpa || ''}</td>
                <td style={tdStyle}>{student.totalECTS || ''}</td>
                <td style={tdStyle}>
                  <div style={actionButtonsContainer}>
                    <button 
                      style={editButtonStyle} 
                      onClick={() => handleEditStudent(student)}
                      title="Öğrenciyi Düzenle"
                    >
                      Düzenle
                    </button>
                    <button 
                      style={deleteButtonStyle} 
                      onClick={() => handleDeleteStudent(student.id)}
                      title="Öğrenciyi Sil"
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Table Styles
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '2rem',
  fontFamily: 'Arial, sans-serif',
};

const thStyle = {
  backgroundColor: '#9B1B1B',
  color: 'white',
  fontWeight: 'bold',
  padding: '12px',
  border: '1px solid black',
  textAlign: 'left',
};

const tdStyle = {
  backgroundColor: '#e0e0e0',
  padding: '12px',
  border: '1px solid black',
  textAlign: 'left',
};

const exportBtnStyle = {
  width: '200px',
  height: '50px',
  padding: '10px 16px',
  backgroundColor: '#7b1fa2',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const actionButtonsContainer = {
  display: 'flex',
  gap: '10px',
  justifyContent: 'center',
};

const editButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#7b1fa2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  minWidth: '80px',
};

const deleteButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#9C27B0',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  minWidth: '80px',
};

export default StudentTable; 