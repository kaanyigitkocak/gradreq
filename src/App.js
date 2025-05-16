import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { isAuthenticated, setupAxiosInterceptors, getUserRole } from './utils/authUtils';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Student from './pages/Student';

// Styles
import './styles/App.css';

// Protected route component - basitleştirildi, rol kontrolü kaldırıldı
const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const isAuth = isAuthenticated();
  const userRole = getUserRole();
  
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }
  
  // Eğer allowedRoles belirtilmişse ve kullanıcı rolü bu rollerde değilse
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Kullanıcının rolüne göre yönlendirme yap
    const redirectPath = userRole === 'Student' ? '/student' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

function App() {
  useEffect(() => {
    // Set up axios interceptors on app load
    setupAxiosInterceptors();
    
    // Check if token is present and set Authorization header
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Admin Dashboard - Sadece Admin kullanıcılar için */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Öğrenci Dashboard - Sadece Student kullanıcılar için */}
        <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRoles={['Student']}>
              <Student />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin URL'i artık doğrudan dashboard sayfasına yönlendirilecek */}
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        
        {/* Diğer tüm URL'ler için */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
