import axios from 'axios'
import { API_BASE_URL } from '@/config/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000 // 10 segundos de timeout
  // NO definir Content-Type por defecto para permitir FormData
})

// Agregar interceptor para incluir el token de autenticación automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    
    // Debug: Log para verificar token y URL
    console.log('🔐 Request a:', config.url)
    console.log('🔑 Token presente:', token ? 'Sí' : 'No')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Para requests que NO son FormData, establecer Content-Type JSON
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    // Debug: Log de headers finales
    console.log('📤 Headers:', config.headers)
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de respuesta para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Error 401 - No autorizado. URL:', error.config?.url)
      console.error('❌ Headers enviados:', error.config?.headers)
    }
    return Promise.reject(error)
  }
)

export default apiClient

