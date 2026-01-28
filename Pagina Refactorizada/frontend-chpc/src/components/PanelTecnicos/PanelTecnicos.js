import axios from 'axios';

export default {
  name: 'PanelTecnicos',
  data() {
    return {
      ordenes: [],
      cargando: false,
      error: null,
      filtroEstado: '',
      vistaActual: 'todos',
      usuarioId: null,
      usuarioNombre: '',
      esAdmin: false,
      intervalo: null,
    };
  },
  computed: {
    ordenesFiltradas() {
      let resultado = [...this.ordenes];

      // Filtrar por estado
      if (this.filtroEstado) {
        resultado = resultado.filter(o => o.estado === this.filtroEstado);
      }

      // Filtrar por vista
      if (this.vistaActual === 'mis-ordenes') {
        resultado = resultado.filter(o => o.tecnico_id === this.usuarioId);
      } else if (this.vistaActual === 'disponibles') {
        resultado = resultado.filter(o => !o.tecnico_id);
      }

      return resultado;
    },
    estadisticas() {
      return {
        enEspera: this.ordenes.filter(o => o.estado === 'EN_ESPERA').length,
        enRevision: this.ordenes.filter(o => o.estado === 'EN_REVISION').length,
        reparados: this.ordenes.filter(o => o.estado === 'REPARADO' || o.estado === 'ENTREGADO').length,
        misEquipos: this.ordenes.filter(o => o.tecnico_id === this.usuarioId).length,
      };
    },
  },
  methods: {
    irAInicio() {
      this.$router.push('/home');
    },
    irACrearOrden() {
      this.$router.push('/crear-work-order');
    },
    async cargarOrdenes() {
      this.cargando = true;
      this.error = null;
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `${process.env.VUE_APP_API_URL || 'http://192.168.2.117:5000/api'}/work-orders`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.ordenes = response.data;
      } catch (err) {
        console.error('Error al cargar órdenes de trabajo:', err);
        this.error = err.response?.data?.message || 'Error al cargar las órdenes de trabajo';
      } finally {
        this.cargando = false;
      }
    },
    async asignarOrden(ordenId) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.post(
          `${process.env.VUE_APP_API_URL || 'http://192.168.2.117:5000/api'}/work-orders/${ordenId}/asignar`,
          {
            tecnico_nombre: this.usuarioNombre,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        await this.cargarOrdenes();
        this.$toast?.success('Orden asignada exitosamente');
      } catch (err) {
        console.error('Error al asignar orden:', err);
        alert(err.response?.data?.message || 'Error al asignar la orden');
      }
    },
    async desasignarOrden(ordenId) {
      if (!confirm('¿Estás seguro de que deseas liberar esta orden?')) {
        return;
      }
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(
          `${process.env.VUE_APP_API_URL || 'http://192.168.2.117:5000/api'}/work-orders/${ordenId}/desasignar`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        await this.cargarOrdenes();
        this.$toast?.success('Orden liberada exitosamente');
      } catch (err) {
        console.error('Error al desasignar orden:', err);
        alert(err.response?.data?.message || 'Error al liberar la orden');
      }
    },
    async cambiarEstado(ordenId, nuevoEstado) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.patch(
            `${process.env.VUE_APP_API_URL || 'http://192.168.2.117:5000/api'}/work-orders/${ordenId}/estado`,
          {
            estado: nuevoEstado,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        await this.cargarOrdenes();
        this.$toast?.success('Estado actualizado exitosamente');
      } catch (err) {
        console.error('Error al cambiar estado:', err);
        alert(err.response?.data?.message || 'Error al cambiar el estado');
      }
    },
    obtenerTextoEstado(estado) {
      const estados = {
        EN_ESPERA: '⏳ En Espera',
        EN_REVISION: '🔍 En Revisión',
        REPARADO: '✅ Reparado',
        ENTREGADO: '📦 Entregado',
        SIN_REPARACION: '❌ Sin Reparación',
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
          `${process.env.VUE_APP_API_URL || 'http://192.168.2.117:5000/api'}/usuarios/perfil`,
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
    this.cargarOrdenes();
    // Refrescar cada 30 segundos
    this.intervalo = setInterval(() => {
      this.cargarOrdenes();
    }, 30000);
  },
  beforeUnmount() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  },
};