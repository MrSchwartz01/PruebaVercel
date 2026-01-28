// Configuración de la API
// Para acceso desde red local, define VUE_APP_API_URL en archivo .env
// o cambia manualmente la IP aquí

// Detectar automáticamente si se está accediendo desde red local
function getApiBaseUrl() {
  // SIEMPRE usar la URL absoluta de Railway para evitar problemas de URL relativas
  const backendUrl = 'https://chpc-webpage-back.vercel.app/api';
  
  // Si hay variable de entorno definida, usarla (debe ser una URL completa)
  if (process.env.VUE_APP_API_URL) {
    // Verificar que la URL comience con http para evitar URLs relativas
    const envUrl = process.env.VUE_APP_API_URL;
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
      return envUrl;
    }
    // Si la variable de entorno no es una URL completa, usar backend de Vercel como fallback
    console.warn('VUE_APP_API_URL no es una URL completa, usando backend de Vercel como fallback');
    return backendUrl;
  }
  
  // En cualquier otro caso, usar backend de Vercel
  return backendUrl;
}

const API_BASE_URL = getApiBaseUrl();

// Log para debugging - esto te ayudará a verificar la URL en la consola
console.log('🔗 API_BASE_URL configurada:', API_BASE_URL);

export { API_BASE_URL };
