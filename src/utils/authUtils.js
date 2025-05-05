import axios from 'axios';

// Authentication utilities

/**
 * Check if the user is authenticated
 * @returns {boolean} - True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const expirationDate = localStorage.getItem('tokenExpiration');

  if (!token || !expirationDate) {
    return false;
  }

  // Check if the token is expired
  const now = new Date();
  const expiry = new Date(expirationDate);
  return now < expiry;
};

/**
 * Log out the user by removing the token from localStorage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiration');
  // Remove the Authorization header
  delete axios.defaults.headers.common['Authorization'];
};

/**
 * Get the current user's role from the token
 * @returns {string|null} - The user's role or null if not authenticated
 */
export const getUserRole = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    return tokenPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

/**
 * Set up axios to include the authentication token in all requests
 */
export const setupAxiosInterceptors = () => {
  // If token exists, add it to all requests
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Add a request interceptor to ensure token is included in every request
  axios.interceptors.request.use(
    (config) => {
      const currentToken = localStorage.getItem('token');
      if (currentToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add a response interceptor to handle 401 errors (Unauthorized)
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Clear auth info and redirect to login
        logout();
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );
};

/**
 * Get the user's details (ID, email, etc.) from the token
 * @returns {Object|null} - User details or null if not authenticated
 */
export const getUserDetails = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
      email: tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
      role: tokenPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
    };
  } catch (error) {
    console.error('Error parsing user details:', error);
    return null;
  }
}; 