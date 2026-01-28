import axios from 'axios';

export default {
  name: 'PanelVendedores',
  data() {
    return {
      pedidos: [],
      cargando: false,
      error: null,
      filtroEstado: '',
      vistaActual: 'todos',
      usuarioId: null,
      usuarioNombre: '',
      esAdmin: false,
    };
  },
  computed: {
    pedidosFiltrados() {
      let resultado = [...this.pedidos];

      // Filtrar por estado
      if (this.filtroEstado) {
        resultado = resultado.filter(p => p.estado_gestion === this.filtroEstado);
      }

      // Filtrar por vista
      if (this.vistaActual === 'mis-pedidos') {
        resultado = resultado.filter(p => p.vendedor_id === this.usuarioId);
      } else if (this.vistaActual === 'disponibles') {
        resultado = resultado.filter(p => !p.vendedor_id);
      }

      return resultado;
    },
    estadisticas() {
      return {
        pendientes: this.pedidos.filter(p => p.estado_gestion === 'PENDIENTE').length,
        enTramite: this.pedidos.filter(p => p.estado_gestion === 'EN_TRAMITE').length,
        atendidos: this.pedidos.filter(p => p.estado_gestion === 'ATENDIDO').length,
        misPedidos: this.pedidos.filter(p => p.vendedor_id === this.usuarioId).length,
      };
    },
  },
  methods: {
    irAInicio() {
      this.$router.push('/home');
    },
    async cargarPedidos() {
      this.cargando = true;
      this.error = null;
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `${process.env.VUE_APP_API_URL || 'http://localhost:5000/api'}/ordenes/panel/todas`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.pedidos = response.data;
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
        this.error = err.response?.data?.message || 'Error al cargar los pedidos';
      } finally {
        this.cargando = false;
      }
    },
    async asignarPedido(pedidoId) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.post(
          `${process.env.VUE_APP_API_URL || 'http://localhost:5000/api'}/ordenes/${pedidoId}/asignar`,
          {
            vendedor_nombre: this.usuarioNombre,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        await this.cargarPedidos();
        this.$toast?.success('Pedido asignado exitosamente');
      } catch (err) {
        console.error('Error al asignar pedido:', err);
        alert(err.response?.data?.message || 'Error al asignar el pedido');
      }
    },
    async desasignarPedido(pedidoId) {
      if (!confirm('¿Estás seguro de que deseas liberar este pedido?')) {
        return;
      }
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(
          `${process.env.VUE_APP_API_URL || 'http://localhost:5000/api'}/ordenes/${pedidoId}/desasignar`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        await this.cargarPedidos();
        this.$toast?.success('Pedido liberado exitosamente');
      } catch (err) {
        console.error('Error al desasignar pedido:', err);
        alert(err.response?.data?.message || 'Error al liberar el pedido');
      }
    },
    async cambiarEstado(pedidoId, nuevoEstado) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.patch(
          `${process.env.VUE_APP_API_URL || 'http://localhost:5000/api'}/ordenes/${pedidoId}/estado-gestion`,
          {
            estado_gestion: nuevoEstado,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        await this.cargarPedidos();
        this.$toast?.success('Estado actualizado exitosamente');
      } catch (err) {
        console.error('Error al cambiar estado:', err);
        alert(err.response?.data?.message || 'Error al cambiar el estado');
      }
    },
    obtenerTextoEstado(estado) {
      const estados = {
        PENDIENTE: '⏳ Pendiente',
        EN_TRAMITE: '🔄 En Trámite',
        ATENDIDO: '✅ Atendido',
        CANCELADO: '❌ Cancelado',
      };
      return estados[estado] || estado;
    },
    formatearFecha(fecha) {
      return new Date(fecha).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    async cargarDatosUsuario() {
      // Primero intentar cargar desde localStorage
      const usuarioGuardado = localStorage.getItem('usuario');
      if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        this.usuarioId = usuario.id;
        this.usuarioNombre = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
        this.esAdmin = usuario.rol === 'administrador';
        return;
      }

      // Si no está en localStorage, cargar desde la API
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `${process.env.VUE_APP_API_URL || 'http://localhost:5000/api'}/usuarios/perfil`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        const usuario = response.data;
        this.usuarioId = usuario.id;
        this.usuarioNombre = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
        this.esAdmin = usuario.rol === 'administrador';
        
        // Guardar en localStorage para próximas veces
        localStorage.setItem('usuario', JSON.stringify(usuario));
        localStorage.setItem('user_id', usuario.id);
        localStorage.setItem('user_rol', usuario.rol);
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        this.error = 'No se pudieron cargar los datos del usuario';
      }
    },
  },
  async mounted() {
    await this.cargarDatosUsuario();
    this.cargarPedidos();
    // Refrescar cada 30 segundos
    this.intervalo = setInterval(() => {
      this.cargarPedidos();
    }, 30000);
  },
  beforeUnmount() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  },
};
