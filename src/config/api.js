// Backend API Configuration

// Base URL for all API calls
export const API_BASE_URL = 'https://388b-193-140-250-85.ngrok-free.app';

// API istekleri için ortak headers
export const getApiHeaders = (token) => {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Token yenileme kontrol fonksiyonu - gerekirse
export const isTokenExpired = () => {
  try {
    const expirationDate = localStorage.getItem('tokenExpiration');
    if (!expirationDate) return true;
    
    return new Date(expirationDate) < new Date();
  } catch (error) {
    console.error('Token expiration check error:', error);
    return true; // Hata durumunda, token'ı geçersiz kabul et
  }
};

// Function to get full API URL
export const getApiUrl = (endpoint) => {
  // Ngrok güvenlik kontrolünü bypass etmek için "skip_browser_warning=1" parametresi ekle
  const separator = endpoint.includes('?') ? '&' : '?';
  const endpointWithParam = `${endpoint}${separator}skip_browser_warning=1`;
  
  return `${API_BASE_URL}${endpointWithParam.startsWith('/') ? endpointWithParam : '/' + endpointWithParam}`;
}; 