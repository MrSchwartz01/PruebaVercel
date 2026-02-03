import apiClient from '@/services/api';

export default {
  name: 'AdminGarantias',
  data() {
    return {
      garantias: [],
      marcasDisponibles: [],
      cargando: false,
      error: null,
      mostrarModal: false,
      modoEdicion: false,
      guardando: false,
      mostrarModalEliminar: false,
      garantiaAEliminar: null,
      eliminando: false,
      formGarantia: {
        id: null,
        marca: '',
        meses: 6,
        mensaje: '',
        activo: true,
      },
    };
  },
  mounted() {
    this.cargarGarantias();
    this.cargarMarcasDisponibles();
  },
  methods: {
    async cargarGarantias() {
      this.cargando = true;
      this.error = null;
      try {
        const response = await apiClient.get('/garantias');
        this.garantias = response.data || [];
      } catch (err) {
        console.error('Error al cargar garantías:', err);
        if (err.response?.status === 401) {
          this.error = 'No tienes permisos para acceder a esta sección o el módulo no está disponible.';
        } else if (err.response?.status === 404) {
          this.error = 'El módulo de garantías no está disponible. Verifica que el backend esté desplegado.';
        } else {
          this.error = 'Error al cargar las garantías. Por favor, intenta de nuevo.';
        }
        this.garantias = [];
      } finally {
        this.cargando = false;
      }
    },

    async cargarMarcasDisponibles() {
      try {
        const response = await apiClient.get('/garantias/marcas-productos');
        this.marcasDisponibles = response.data || [];
      } catch (err) {
        console.warn('Error al cargar marcas:', err);
        this.marcasDisponibles = [];
      }
    },

    abrirModalNueva() {
      this.modoEdicion = false;
      this.formGarantia = {
        id: null,
        marca: '',
        meses: 6,
        mensaje: '',
        activo: true,
      };
      this.mostrarModal = true;
    },

    editarGarantia(garantia) {
      this.modoEdicion = true;
      this.formGarantia = {
        id: garantia.id,
        marca: garantia.marca,
        meses: garantia.meses,
        mensaje: garantia.mensaje,
        activo: garantia.activo,
      };
      this.mostrarModal = true;
    },

    cerrarModal() {
      this.mostrarModal = false;
      this.formGarantia = {
        id: null,
        marca: '',
        meses: 6,
        mensaje: '',
        activo: true,
      };
    },

    async guardarGarantia() {
      if (!this.formGarantia.marca || !this.formGarantia.mensaje) {
        this.error = 'Por favor, completa todos los campos requeridos.';
        return;
      }

      this.guardando = true;
      this.error = null;

      try {
        const datos = {
          marca: this.formGarantia.marca.trim(),
          meses: this.formGarantia.meses,
          mensaje: this.formGarantia.mensaje.trim(),
          activo: this.formGarantia.activo,
        };

        if (this.modoEdicion) {
          await apiClient.patch(`/garantias/${this.formGarantia.id}`, datos);
        } else {
          await apiClient.post('/garantias', datos);
        }

        this.cerrarModal();
        await this.cargarGarantias();
      } catch (err) {
        console.error('Error al guardar garantía:', err);
        if (err.response?.data?.message) {
          this.error = err.response.data.message;
        } else {
          this.error = 'Error al guardar la garantía. Por favor, intenta de nuevo.';
        }
      } finally {
        this.guardando = false;
      }
    },

    confirmarEliminar(garantia) {
      this.garantiaAEliminar = garantia;
      this.mostrarModalEliminar = true;
    },

    cancelarEliminar() {
      this.garantiaAEliminar = null;
      this.mostrarModalEliminar = false;
    },

    async eliminarGarantia() {
      if (!this.garantiaAEliminar) return;

      this.eliminando = true;
      this.error = null;

      try {
        await apiClient.delete(`/garantias/${this.garantiaAEliminar.id}`);
        this.cancelarEliminar();
        await this.cargarGarantias();
      } catch (err) {
        console.error('Error al eliminar garantía:', err);
        this.error = 'Error al eliminar la garantía. Por favor, intenta de nuevo.';
        this.cancelarEliminar();
      } finally {
        this.eliminando = false;
      }
    },
  },
};
