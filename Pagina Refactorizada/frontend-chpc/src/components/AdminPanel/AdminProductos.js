import apiClient from '@/services/api';

export default {
  name: 'AdminProductos',
  data() {
    return {
      productos: [],
      imagenes: [],
      cargando: true,
      cargandoImagenes: false,
      guardando: false,
      subiendoImagen: false,
      showEditModal: false,
      showCreateModal: false,
      showImagenesModal: false,
      editando: false,
      productoActual: null,
      archivoSeleccionado: null,
      imagenPrincipal: false,
      formProducto: this.getEmptyForm(),
    };
  },
  async mounted() {
    await this.cargarProductos();
  },
  methods: {
    getEmptyForm() {
      return {
        codigo: '',
        producto: '',
        marca: '',
        medida: '',
        almacen: '',
        garantia: '',
        costoTotal: 0,
        existenciaTotal: '0',
      };
    },

    async cargarProductos() {
      try {
        this.cargando = true;
        const token = localStorage.getItem('access_token');
        const response = await apiClient.get('/tienda/productos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // La API devuelve { data: [...], total, page, limit, totalPages }
        // Mostrar todos los productos, incluso inactivos
        this.productos = response.data.data || response.data;
      } catch (error) {
        console.error('Error al cargar productos:', error);
        alert('Error al cargar productos');
      } finally {
        this.cargando = false;
      }
    },

    editarProducto(producto) {
      this.editando = true;
      this.productoActual = producto;
      this.formProducto = { ...producto };
      this.showEditModal = true;
    },

    async guardarProducto() {
      try {
        this.guardando = true;
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };

        if (this.editando) {
          // Actualizar producto existente
          await apiClient.put(
            `/tienda/productos/${this.productoActual.codigo}`,
            this.formProducto,
            { headers }
          );
          alert('Producto actualizado correctamente');
        } else {
          // Crear nuevo producto
          await apiClient.post('/tienda/productos', this.formProducto, {
            headers,
          });
          alert('Producto creado correctamente');
        }

        await this.cargarProductos();
        this.cerrarEditModal();
      } catch (error) {
        console.error('Error al guardar producto:', error);
        alert('Error al guardar producto: ' + (error.response?.data?.message || error.message));
      } finally {
        this.guardando = false;
      }
    },

    async toggleActivo(producto) {
      const accion = producto.activo ? 'desactivar' : 'activar';
      if (!confirm(`¿Está seguro de ${accion} este producto?`)) return;

      try {
        const token = localStorage.getItem('access_token');
        await apiClient.put(
          `/tienda/productos/${producto.id}`,
          { activo: !producto.activo },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await this.cargarProductos();
        alert(`Producto ${accion === 'desactivar' ? 'desactivado' : 'activado'} correctamente`);
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        alert('Error al cambiar estado del producto');
      }
    },

    async gestionarImagenes(producto) {
      this.productoActual = producto;
      this.showImagenesModal = true;
      await this.cargarImagenes(producto.codigo);
    },

    async cargarImagenes(productoCodigo) {
      try {
        this.cargandoImagenes = true;
        const response = await apiClient.get(`/images/producto/${productoCodigo}`);
        this.imagenes = response.data;
      } catch (error) {
        console.error('Error al cargar imágenes:', error);
        this.imagenes = [];
      } finally {
        this.cargandoImagenes = false;
      }
    },

    handleFileSelected(event) {
      const file = event.target.files[0];
      if (file) {
        // Validar tipo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert('Solo se permiten archivos JPG, PNG o WEBP');
          return;
        }

        // Validar tamaño (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          alert('El archivo no debe superar 5MB');
          return;
        }

        this.archivoSeleccionado = file;
      }
    },

    async subirImagen() {
      if (!this.archivoSeleccionado || !this.productoActual) return;

      try {
        this.subiendoImagen = true;
        const formData = new FormData();
        
        // Agregar archivo - probar con diferentes nombres de campo comunes
        formData.append('file', this.archivoSeleccionado);
        formData.append('es_principal', this.imagenPrincipal ? 'true' : 'false');
        formData.append('orden', (this.imagenes.length + 1).toString());
        
        // Debug: mostrar contenido del FormData
        console.log('📦 FormData contenido:');
        for (let [key, value] of formData.entries()) {
          console.log(`   ${key}:`, value);
        }
        console.log('📦 Producto Codigo:', this.productoActual.codigo);

        const response = await apiClient.post(`/images/upload/${this.productoActual.codigo}`,
          formData
        );
        
        console.log('✅ Respuesta:', response.data);

        alert('Imagen subida correctamente');
        this.archivoSeleccionado = null;
        this.imagenPrincipal = false;
        this.$refs.fileInput.value = '';
        await this.cargarImagenes(this.productoActual.codigo);
      } catch (error) {
        console.error('Error al subir imagen:', error);
        console.error('Respuesta del servidor:', error.response?.data);
        alert('Error al subir imagen: ' + (error.response?.data?.message || error.response?.data?.detail || error.message));
      } finally {
        this.subiendoImagen = false;
      }
    },

    async marcarPrincipal(imagen) {
      try {
        const token = localStorage.getItem('access_token');
        await apiClient.put(
          `/images/${imagen.id}/principal`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await this.cargarImagenes(this.productoActual.codigo);
        alert('Imagen marcada como principal');
      } catch (error) {
        console.error('Error al marcar imagen principal:', error);
        alert('Error al marcar imagen como principal');
      }
    },

    async eliminarImagen(imagen) {
      if (!confirm('¿Está seguro de eliminar esta imagen?')) return;

      try {
        await apiClient.delete(`/images/${imagen.id}`);
        await this.cargarImagenes(this.productoActual.codigo);
        alert('Imagen eliminada correctamente');
      } catch (error) {
        console.error('Error al eliminar imagen:', error);
        alert('Error al eliminar imagen');
      }
    },

    cerrarEditModal() {
      this.showEditModal = false;
      this.showCreateModal = false;
      this.editando = false;
      this.productoActual = null;
      this.formProducto = this.getEmptyForm();
    },

    cerrarImagenesModal() {
      this.showImagenesModal = false;
      this.productoActual = null;
      this.imagenes = [];
      this.archivoSeleccionado = null;
      this.imagenPrincipal = false;
    },
  },
  watch: {
    showCreateModal(val) {
      if (val) {
        this.editando = false;
        this.productoActual = null;
        this.formProducto = this.getEmptyForm();
        this.showEditModal = true;
      }
    },
  },
};
