import axios from 'axios';
import HeaderAnth from "../HeaderAnth/HeaderAnth.vue";
import { API_BASE_URL } from '@/config/api';
import inactivityService from '@/services/inactivityService';


export default {
  name: "SesionUsuario",
  components: {
    HeaderAnth,
  },
  data() {
    return {
      nombre_usuario: '',
      contraseña: '',
      errors: {}, // Objeto para almacenar errores específicos
      error: '', // Error general
      passwordVisible: false,
    };
  },
  methods: {
    async login() {
      // Limpiar errores previos
      this.error = '';
      this.errors = {};
      
      // Validar campos antes de enviar la solicitud
      this.validateFields();
      if (Object.keys(this.errors).length > 0) {
        return; // Detener si hay errores de validación
      }
      
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          username: this.nombre_usuario,
          password: this.contraseña,
        });
        
        // Login exitoso
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('user_rol', response.data.usuario.rol);
        localStorage.setItem('user_id', response.data.usuario.id);
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        
        // Reiniciar el monitor de inactividad después del login exitoso
        inactivityService.resetTimer();
        
        this.$router.replace('/home');
      } catch (err) {
        // Manejo detallado de errores
        if (err.response) {
          const statusCode = err.response.status;
          const errorMessage = err.response.data?.mensaje || err.response.data?.message;
          
          if (statusCode === 401) {
            // Error de autenticación - credenciales inválidas
            this.error = errorMessage || '❌ Credenciales inválidas. Verifica tu nombre de usuario y contraseña.';
          } else if (statusCode === 429) {
            // Demasiados intentos
            this.error = errorMessage || '❌ Demasiados intentos fallidos. Por favor, espera un momento.';
          } else if (statusCode >= 500) {
            // Error del servidor
            this.error = '❌ Error del servidor. Por favor, inténtalo más tarde.';
          } else {
            // Otros errores
            this.error = errorMessage || '❌ Error al iniciar sesión. Intenta de nuevo.';
          }
        } else if (err.request) {
          // Error de red - no hay respuesta del servidor
          this.error = '❌ No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else {
          // Otro tipo de error
          this.error = '❌ Error inesperado. Por favor, intenta de nuevo.';
        }
        
        // Limpiar contraseña por seguridad
        this.contraseña = '';
        
        // Enfocar en el campo de usuario para facilitar reintento
        this.$nextTick(() => {
          const usernameInput = document.getElementById('nombre_usuario');
          if (usernameInput) usernameInput.focus();
        });
      }
    },
    validateFields() {
      this.errors = {}; // Limpiar errores previos

      // Validación del nombre de usuario
      if (!this.nombre_usuario.trim()) {
        this.errors.nombre_usuario = "El nombre de usuario es obligatorio.";
      } else if (this.nombre_usuario.trim().length < 3 || this.nombre_usuario.trim().length > 80) {
        this.errors.nombre_usuario =
          "El nombre de usuario debe tener entre 3 y 80 caracteres.";
      }

      // Validación de la contraseña
      if (!this.contraseña.trim()) {
        this.errors.contraseña = "La contraseña es obligatoria.";
      } else if (this.contraseña.trim().length < 6) {
        this.errors.contraseña = "La contraseña debe tener al menos 6 caracteres.";
      }
    },
    clearError(field) {
      // Elimina el error asociado a un campo específico
      if (field) {
        delete this.errors[field];
      }
      // Limpiar error general al escribir
      this.error = '';
    },
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },
    goToRegister() {
      this.$router.push('/registro');
    },
  },
};