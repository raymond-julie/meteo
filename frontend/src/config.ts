// API Configuration: Uses VITE_API_URL in production (Render) or relative URL in local Docker
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
