// API Configuration for Development and Production

const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

export const API_BASE_URL = import.meta.env.VITE_API_URL || (isDevelopment 
  ? 'http://localhost:5000/api'
  : 'https://flowerbe.vercel.app/api'); // Update with your backend production URL

export const API = API_BASE_URL;

// For debugging
console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', isDevelopment ? 'Development' : 'Production');
