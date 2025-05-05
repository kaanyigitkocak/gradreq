import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Uncommented for backend connection
import { getApiUrl } from '../../config/api'; // Updated import path

const AddUserForm = ({ onAdd, userToEdit }) => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    role: 'Student',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userToEdit) setFormData(prev => ({
      ...prev,
      ...userToEdit,
      password: '', // Clear password field for security when editing
    }));
  }, [userToEdit]);

  const roles = [
    'Student', 
    'Admin', 
    'Advisor', 
    'FacultySecretary'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onAdd(formData);
      
      // Reset form after successful submission
      setFormData({
        userName: '',
        email: '',
        password: '',
        role: 'Student'
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
      <input 
        type="text" 
        name="userName" 
        placeholder="Username" 
        value={formData.userName} 
        onChange={handleChange} 
        required 
      />
      <input 
        type="email" 
        name="email" 
        placeholder="Email" 
        value={formData.email} 
        onChange={handleChange} 
        required 
      />
      <input 
        type="password" 
        name="password" 
        placeholder={userToEdit ? "Leave blank to keep current password" : "Password"} 
        value={formData.password} 
        onChange={handleChange} 
        required={!userToEdit}  // Only required for new users
      />
      
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '12px 15px',
          margin: '10px 0',
          borderRadius: '8px',
          border: '1px solid #ccc',
          fontSize: '14px',
          boxSizing: 'border-box',
          backgroundColor: 'white',
        }}
      >
        {roles.map((role, i) => (
          <option key={i} value={role}>
            {role}
          </option>
        ))}
      </select>

      <button 
        type="submit" 
        style={{ marginTop: '10px' }}
        disabled={loading}
      >
        {loading ? (userToEdit ? 'Updating...' : 'Adding...') : (userToEdit ? 'Update' : 'Add')}
      </button>
    </form>
  );
};

export default AddUserForm; 