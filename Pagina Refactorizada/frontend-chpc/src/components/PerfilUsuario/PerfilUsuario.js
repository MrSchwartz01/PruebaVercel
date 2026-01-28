import HeaderAnth from '../HeaderAnth/HeaderAnth.vue';
import FooterAnth from '../FooterAnth/FooterAnth.vue';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export default {
  name: 'PerfilUsuario',
  components: {
    HeaderAnth,
    FooterAnth
  },
  data() {
    return {
      searchQuery: '',
      isAuthenticated: false,
      vistaActual: 'datos',
      modoEdicion: false,
      guardando: false,
      
      // Datos del usuario
      formData: {
        nombre: '',
        apellido: '',
        username: '',
        email: '',
        telefono: '',
        direccion: ''
      },
      
      // Respaldo para cancelar edición
      formDataOriginal: {},
      
      // Cambio de contraseña
      passwordData: {
        actual: '',
        nueva: '',
        confirmar: ''
      },
      
      // Pedidos
      pedidos: [],
      cargandoPedidos: false,
      
      // Mensajes
      mensaje: '',
      mensajeTipo: '',
      mensajePassword: '',
      mensajePasswordTipo: '',
      
      userId: null
    };
  },
  async mounted() {
    this.verificarAutenticacion();
    if (this.isAuthenticated) {
      await this.cargarDatosUsuario();
    }
  },
  methods: {
    verificarAutenticacion() {
      const token = localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id');
      
      if (token && userId) {
        this.isAuthenticated = true;
        this.userId = userId;
      } else {
        this.isAuthenticated = false;
      }
    },
    
    async cargarDatosUsuario() {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE_URL}/usuarios/perfil`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const usuario = response.data;
        this.formData = {
          nombre: usuario.nombre || '',
          apellido: usuario.apellido || '',
          username: usuario.username || '',
          email: usuario.email || '',
          telefono: usuario.telefono || '',
          direccion: usuario.direccion || ''
        };
        
        this.formDataOriginal = { ...this.formData };
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        this.mostrarMensaje('Error al cargar los datos del usuario', 'error');
      }
    },
    
    habilitarEdicion() {
      this.modoEdicion = true;
      this.formDataOriginal = { ...this.formData };
      this.mensaje = '';
    },
    
    cancelarEdicion() {
      this.modoEdicion = false;
      this.formData = { ...this.formDataOriginal };
      this.mensaje = '';
    },
    
    async actualizarDatos() {
      try {
        this.guardando = true;
        this.mensaje = '';
        
        const token = localStorage.getItem('access_token');

        // Solo enviar los campos que el backend soporta para /usuarios/perfil
        const payload = {};
        if (this.formData.telefono && this.formData.telefono.trim() !== '') {
          payload.telefono = this.formData.telefono.trim();
        }
        if (this.formData.direccion && this.formData.direccion.trim() !== '') {
          payload.direccion = this.formData.direccion.trim();
        }

        await axios.patch(
          `${API_BASE_URL}/usuarios/perfil`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        
        this.modoEdicion = false;
        this.formDataOriginal = { ...this.formData };
        this.mostrarMensaje('✅ Datos actualizados correctamente', 'success');
        
      } catch (error) {
        console.error('Error al actualizar datos:', error);
        const mensajeError = error.response?.data?.message || 'Error al actualizar los datos';
        this.mostrarMensaje('❌ ' + mensajeError, 'error');
      } finally {
        this.guardando = false;
      }
    },
    
    async cambiarContrasena() {
      if (this.passwordData.nueva !== this.passwordData.confirmar) {
        this.mostrarMensajePassword('❌ Las contraseñas no coinciden', 'error');
        return;
      }
      
      if (this.passwordData.nueva.length < 6) {
        this.mostrarMensajePassword('❌ La contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }
      
      if (!this.passwordData.nueva.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&.,\-_:])[A-Za-z\d@$!%*?&.,\-_:]{6,}$/)) {
        this.mostrarMensajePassword('❌ La contraseña debe incluir al menos una letra, un número y un carácter especial (@$!%*?&.,-_:)', 'error');
        return;
      }
      
      try {
        this.guardando = true;
        this.mensajePassword = '';
        
        const token = localStorage.getItem('access_token');
        await axios.patch(
          `${API_BASE_URL}/usuarios/cambiar-password`,
          {
            nuevaPassword: this.passwordData.nueva,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        
        this.mostrarMensajePassword('✅ Contraseña cambiada correctamente', 'success');
        this.passwordData = {
          actual: '',
          nueva: '',
          confirmar: ''
        };
        
      } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        const mensajeError = error.response?.data?.message || 'Error al cambiar la contraseña';
        this.mostrarMensajePassword('❌ ' + mensajeError, 'error');
      } finally {
        this.guardando = false;
      }
    },
    
    async cargarPedidos() {
      if (this.vistaActual !== 'pedidos' || this.pedidos.length > 0) return;
      
      try {
        this.cargandoPedidos = true;
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE_URL}/ordenes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.pedidos = response.data;
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
        this.pedidos = [];
      } finally {
        this.cargandoPedidos = false;
      }
    },
    
    mostrarMensaje(texto, tipo) {
      this.mensaje = texto;
      this.mensajeTipo = tipo;
      setTimeout(() => {
        this.mensaje = '';
      }, 5000);
    },
    
    mostrarMensajePassword(texto, tipo) {
      this.mensajePassword = texto;
      this.mensajePasswordTipo = tipo;
      setTimeout(() => {
        this.mensajePassword = '';
      }, 5000);
    },
    
    getEstadoTexto(status) {
      const estados = {
        'PENDING': 'Pendiente',
        'PAID': 'Pagado',
        'SHIPPED': 'Enviado',
        'COMPLETED': 'Completado',
        'CANCELLED': 'Cancelado'
      };
      return estados[status] || status;
    },
    
    getEstadoClass(status) {
      return status.toLowerCase();
    },
    
    getMetodoPago(metodo) {
      const metodos = {
        'CASH': 'Efectivo',
        'CARD': 'Tarjeta',
        'TRANSFER': 'Transferencia'
      };
      return metodos[metodo] || metodo;
    },
    
    formatearFecha(fecha) {
      return new Date(fecha).toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    verDetallePedido(pedidoId) {
      // Aquí puedes implementar la lógica para ver el detalle del pedido
      alert(`Ver detalle del pedido #${pedidoId}`);
    },
    
    buscarProductos(query) {
      this.searchQuery = query;
    },
    
    cerrarSesion() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_rol');
      this.isAuthenticated = false;
      this.$router.push('/login');
    }
  },
  watch: {
    vistaActual(newVal) {
      if (newVal === 'pedidos') {
        this.cargarPedidos();
      }
    }
  }
};
