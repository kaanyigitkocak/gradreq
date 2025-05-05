import React from 'react';

const AdminHeader = ({ onLogout }) => {
  return (
    <header style={headerStyle}>
      <div style={leftStyle}>
        <img src="/iyte-logo.png" alt="Logo" style={logoStyle} />
      </div>

      <h1 style={titleStyle}>Graduation Management System</h1>

      <div style={rightStyle}>
        <button onClick={onLogout} style={logoutBtnStyle}>Log Out</button>
      </div>
    </header>
  );
};

const headerStyle = {
  background: 'linear-gradient(to right, #7b1fa2, #a0181b)',
  color: 'white',
  padding: '10px 30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
};

const leftStyle = {
  display: 'flex',
  alignItems: 'center',
  flexBasis: '20%',
};

const titleStyle = {
  flexGrow: 1,
  textAlign: 'center',
  fontSize: '20px',
  fontWeight: '600',
  margin: 0,
};

const rightStyle = {
  flexBasis: '20%',
  textAlign: 'right',
};

const logoStyle = {
  height: '40px',
};

const logoutBtnStyle = {
    width: '100px',
    height: '50px',
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid white',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };
  

export default AdminHeader; 