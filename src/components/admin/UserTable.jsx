import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 
import axios from 'axios';
import { getApiUrl } from '../../config/api'; // Updated import path

const UserTable = ({ users, onDelete, onEdit, loading }) => {
  // Ensure users is always an array
  const safeUsers = Array.isArray(users) ? users : [];
  
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('User List', 14, 10);
    
    // Backend API kullanımı örneği
    // const handleDelete = (id) => {
    //   axios.delete(getApiUrl(`/api/users/${id}`))
    //     .then(() => console.log('Deleted'))
    //     .catch(err => console.error(err));
    // };

    const tableColumn = ['Name', 'Email', 'Role'];
    const tableRows = safeUsers.map((user) => [
      user.name || user.userName || '',
      user.email,
      user.role || '',
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [155, 27, 27] },
    });

    doc.save('user-list.pdf');
  };

  if (loading && safeUsers.length === 0) {
    return <div>Loading users...</div>;
  }

  if (!safeUsers.length) {
    return <div>No users found.</div>;
  }

  return (
    <div>
      {/* Export Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button 
          onClick={exportToPDF} 
          style={exportBtnStyle}
          disabled={loading || !safeUsers.length}
        >
          Export to PDF
        </button>
      </div>

      {/* User Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {safeUsers.map((user, i) => (
              <tr key={user.id || i}>
                <td style={tdStyle}>{user.name || user.userName || ''}</td>
                <td style={tdStyle}>{user.email}</td>
                <td style={tdStyle}>{user.role || ''}</td>
                <td style={tdStyle}>
                  <div style={actionButtonsContainer}>
                    <button 
                      onClick={() => onEdit(i)} 
                      style={editButtonStyle}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onDelete(i)} 
                      style={deleteButtonStyle}
                      disabled={loading}
                    >
                      Delete
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

export default UserTable; 