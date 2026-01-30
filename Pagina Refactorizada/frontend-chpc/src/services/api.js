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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Para requests que NO son FormData, establecer Content-Type JSON
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default apiClient

