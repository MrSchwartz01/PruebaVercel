import axios from 'axios';
import HeaderAnth from "../HeaderAnth/HeaderAnth.vue";import { API_BASE_URL } from '@/config/api';

export default {
  name: 'RegistroUsuario',
  components: {
    HeaderAnth,
  },
  data() {
    return {
      nombre: '',
      apellido: '',
      nombre_usuario: '',
      email: '',
      telefono: '',
      direccion: '',
      contraseña: '',
      errors: {},
      error: '',
      success: '',
      passwordVisible: false,
    };
  },
  methods: {
    async register() {
      this.validateFields();
      if (Object.keys(this.errors).length > 0) {
        return;
      }
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/registro`, {
          nombre: this.nombre,
          apellido: this.apellido,
          username: this.nombre_usuario,
          email: this.email,
          telefono: this.telefono || undefined,
          direccion: this.direccion || undefined,
          password: this.contraseña,
        });
        this.success = response.data.mensaje;
        this.error = '';
        this.clearForm();
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.$router.push('/login');
        }, 2000);
      } catch (err) {
        this.error =
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'Error en el registro. Intenta de nuevo.';
        this.success = '';
      }
    },
    validateFields() {
      this.errors = {};
      
      if (!this.nombre || this.nombre.length < 2 || this.nombre.length > 50) {
        this.errors.nombre = 'El nombre debe tener entre 2 y 50 caracteres.';
      }
      
      if (!this.apellido || this.apellido.length < 2 || this.apellido.length > 50) {
        this.errors.apellido = 'El apellido debe tener entre 2 y 50 caracteres.';
      }
      
      if (this.nombre_usuario.length < 3 || this.nombre_usuario.length > 80) {
        this.errors.nombre_usuario = 'El nombre de usuario debe tener entre 3 y 80 caracteres.';
      }
      
      if (!/^[a-zA-Z0-9_.-]+$/.test(this.nombre_usuario)) {
        this.errors.nombre_usuario = 'El nombre de usuario solo puede contener letras, números, guiones, puntos y guiones bajos.';
      }
      
      if (!this.email.includes('@')) {
        this.errors.email = 'El correo electrónico debe tener un formato válido.';
      }
      
      if (this.telefono && (this.telefono.length < 10 || this.telefono.length > 20)) {
        this.errors.telefono = 'El teléfono debe tener entre 10 y 20 caracteres.';
      }
      
      if (this.direccion && (this.direccion.length < 10 || this.direccion.length > 200)) {
        this.errors.direccion = 'La dirección debe tener entre 10 y 200 caracteres.';
      }
      
      if (!this.contraseña.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&.,\-_:])[A-Za-z\d@$!%*?&.,\-_:]{6,}$/)) {
        this.errors.contraseña = 'La contraseña debe tener al menos 6 caracteres, incluir una letra, un número y un carácter especial (@$!%*?&.,-_:).';
      }
    },
    clearError(field) {
      delete this.errors[field];
    },
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },
    clearForm() {
      this.nombre = '';
      this.apellido = '';
      this.nombre_usuario = '';
      this.email = '';
      this.telefono = '';
      this.direccion = '';
      this.contraseña = '';
      this.errors = {};
    },
  },
};