// API Configuration: Ensures absolute https:// scheme for cloud production or fallback to relative URL
let baseUrl = import.meta.env.VITE_API_URL || '';

if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
  baseUrl = `https://${baseUrl}`;
}

export const API_BASE_URL = baseUrl.replace(/\/$/, '');
