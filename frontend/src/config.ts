// API Configuration: Ensures absolute public HTTPS URL for cloud production (Render) or relative URL for local Docker
let baseUrl = (import.meta.env.VITE_API_URL || '').trim();

if (baseUrl) {
  if (!baseUrl.includes('.')) {
    // Render internal host name like 'meteo-backend-wmdy' without TLD extension
    baseUrl = `${baseUrl}.onrender.com`;
  }
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }
}

export const API_BASE_URL = baseUrl.replace(/\/$/, '');
