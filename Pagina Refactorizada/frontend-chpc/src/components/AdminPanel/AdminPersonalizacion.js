import apiClient from '@/services/api';

export default {
  name: 'AdminPersonalizacion',
  data() {
    return {
      colores: {
        primary: '#ffa726',
        primaryDark: '#fb8c00',
        primaryLight: '#ffb74d',
        success: '#4caf50',
        error: '#f44336',
      },
      coloresOriginales: null,
      guardando: false,
      mensaje: '',
      tipoMensaje: 'success',
      paletasPredefinidas: [
        {
          nombre: 'Naranja (Default)',
          primary: '#ffa726',
          primaryDark: '#fb8c00',
          primaryLight: '#ffb74d',
          success: '#4caf50',
          error: '#f44336',
        },
        {
          nombre: 'Azul Profesional',
          primary: '#2196f3',
          primaryDark: '#1976d2',
          primaryLight: '#64b5f6',
          success: '#4caf50',
          error: '#f44336',
        },
        {
          nombre: 'Verde Natural',
          primary: '#4caf50',
          primaryDark: '#388e3c',
          primaryLight: '#81c784',
          success: '#8bc34a',
          error: '#f44336',
        },
        {
          nombre: 'Púrpura Elegante',
          primary: '#9c27b0',
          primaryDark: '#7b1fa2',
          primaryLight: '#ce93d8',
          success: '#4caf50',
          error: '#f44336',
        },
        {
          nombre: 'Rojo Intenso',
          primary: '#f44336',
          primaryDark: '#d32f2f',
          primaryLight: '#ef9a9a',
          success: '#4caf50',
          error: '#e91e63',
        },
        {
          nombre: 'Teal Moderno',
          primary: '#009688',
          primaryDark: '#00796b',
          primaryLight: '#80cbc4',
          success: '#4caf50',
          error: '#f44336',
        },
        {
          nombre: 'Rosa Vibrante',
          primary: '#e91e63',
          primaryDark: '#c2185b',
          primaryLight: '#f48fb1',
          success: '#4caf50',
          error: '#ff5722',
        },
        {
          nombre: 'Índigo Corporativo',
          primary: '#3f51b5',
          primaryDark: '#303f9f',
          primaryLight: '#7986cb',
          success: '#4caf50',
          error: '#f44336',
        },
      ],
    };
  },
  computed: {
    previewStyles() {
      return {
        '--preview-primary': this.colores.primary,
        '--preview-primary-dark': this.colores.primaryDark,
        '--preview-primary-light': this.colores.primaryLight,
        '--preview-success': this.colores.success,
        '--preview-error': this.colores.error,
      };
    },
  },
  async mounted() {
    await this.cargarColores();
  },
  methods: {
    async cargarColores() {
      try {
        const response = await apiClient.get('/configuracion/colores/tema');
        if (response.data && response.data.valor) {
          this.colores = { ...this.colores, ...response.data.valor };
          this.coloresOriginales = { ...this.colores };
        }
      } catch (error) {
        console.error('Error al cargar colores:', error);
        // Usar colores por defecto si hay error
      }
    },

    previewColor() {
      // Aplicar colores en tiempo real para vista previa global
      this.aplicarColoresCSS(this.colores);
    },

    aplicarColoresCSS(colores) {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', colores.primary);
      root.style.setProperty('--color-primary-dark', colores.primaryDark);
      root.style.setProperty('--color-primary-light', colores.primaryLight);
      root.style.setProperty('--color-success', colores.success);
      root.style.setProperty('--color-error', colores.error);
    },

    async guardarColores() {
      this.guardando = true;
      this.mensaje = '';

      try {
        await apiClient.post('/configuracion/colores/tema', this.colores);
        
        this.coloresOriginales = { ...this.colores };
        this.mensaje = '✓ Colores guardados correctamente';
        this.tipoMensaje = 'success';
        
        // Aplicar colores globalmente
        this.aplicarColoresCSS(this.colores);
        
        // Guardar también en localStorage para persistencia inmediata
        localStorage.setItem('site_colors', JSON.stringify(this.colores));
        
      } catch (error) {
        console.error('Error al guardar colores:', error);
        this.mensaje = '✗ Error al guardar los colores';
        this.tipoMensaje = 'error';
      } finally {
        this.guardando = false;
        setTimeout(() => {
          this.mensaje = '';
        }, 3000);
      }
    },

    async resetearColores() {
      if (!confirm('¿Estás seguro de restablecer los colores a los valores por defecto?')) {
        return;
      }

      this.guardando = true;
      this.mensaje = '';

      try {
        await apiClient.post('/configuracion/colores/reset');
        
        // Restaurar colores por defecto
        this.colores = {
          primary: '#ffa726',
          primaryDark: '#fb8c00',
          primaryLight: '#ffb74d',
          success: '#4caf50',
          error: '#f44336',
        };
        
        this.coloresOriginales = { ...this.colores };
        this.mensaje = '✓ Colores restablecidos correctamente';
        this.tipoMensaje = 'success';
        
        // Aplicar colores globalmente
        this.aplicarColoresCSS(this.colores);
        localStorage.setItem('site_colors', JSON.stringify(this.colores));
        
      } catch (error) {
        console.error('Error al resetear colores:', error);
        this.mensaje = '✗ Error al restablecer los colores';
        this.tipoMensaje = 'error';
      } finally {
        this.guardando = false;
        setTimeout(() => {
          this.mensaje = '';
        }, 3000);
      }
    },

    aplicarPaleta(paleta) {
      this.colores = {
        primary: paleta.primary,
        primaryDark: paleta.primaryDark,
        primaryLight: paleta.primaryLight,
        success: paleta.success,
        error: paleta.error,
      };
      this.previewColor();
      this.mensaje = `Paleta "${paleta.nombre}" aplicada. Recuerda guardar los cambios.`;
      this.tipoMensaje = 'info';
      setTimeout(() => {
        this.mensaje = '';
      }, 3000);
    },
  },
};
