import axios from 'axios'
import { API_BASE_URL } from '@/config/api'

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000 // 15 segundos de timeout
  // NO definir Content-Type por defecto para permitir FormData
})

// Agregar interceptor para incluir el token de autenticación automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    
    // Debug: Log para verificar token y URL (reducido para producción)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Request a:', config.url)
      console.log('🔑 Token presente:', token ? 'Sí (' + token.substring(0, 20) + '...)' : 'No')
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Para FormData, ELIMINAR Content-Type para que el navegador lo establezca
    // automáticamente con el boundary correcto
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de respuesta para manejar errores de autenticación y refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si el error es 401 y no hemos intentado refrescar el token aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.error('❌ Error 401 - No autorizado. URL:', error.config?.url)
      
      if (isRefreshing) {
        // Si ya se está refrescando, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            return apiClient(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        // No hay refresh token, redirigir al login
        console.error('❌ No hay refresh token disponible')
        isRefreshing = false
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Intentar refrescar el token usando una instancia axios limpia (sin interceptor)
        console.log('🔄 Intentando refrescar token...')
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })

        const { access_token, refresh_token: newRefreshToken } = response.data

        // Guardar los nuevos tokens
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', newRefreshToken)
        console.log('✅ Token refrescado exitosamente')

        // Actualizar el header de la petición original
        originalRequest.headers['Authorization'] = 'Bearer ' + access_token

        // Procesar la cola de peticiones pendientes
        processQueue(null, access_token)
        isRefreshing = false

        // Reintentar la petición original
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Error al refrescar el token, limpiar y redirigir al login
        console.error('❌ Error al refrescar token:', refreshError)
        processQueue(refreshError, null)
        isRefreshing = false
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

