import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

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
        nombre_producto: '',
        descripcion: '',
        precio: 0,
        stock: 0,
        marca: '',
        color: '',
        categoria: '',
        subcategoria: '',
        modelo: '',
        sku: '',
        especificaciones: '',
        garantia: '',
        imagen_url: '/placeholder.jpg', // Imagen por defecto
        destacado: false,
        activo: true,
      };
    },

    async cargarProductos() {
      try {
        this.cargando = true;
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE_URL}/tienda/productos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Mostrar todos los productos, incluso inactivos
        this.productos = response.data;
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
          await axios.put(
            `${API_BASE_URL}/tienda/productos/${this.productoActual.id}`,
            this.formProducto,
            { headers }
          );
          alert('Producto actualizado correctamente');
        } else {
          // Crear nuevo producto
          await axios.post(`${API_BASE_URL}/tienda/productos`, this.formProducto, {
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
        await axios.put(
          `${API_BASE_URL}/tienda/productos/${producto.id}`,
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
      await this.cargarImagenes(producto.id);
    },

    async cargarImagenes(productoId) {
      try {
        this.cargandoImagenes = true;
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE_URL}/images/producto/${productoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', this.archivoSeleccionado);
        formData.append('es_principal', this.imagenPrincipal);
        formData.append('orden', this.imagenes.length);

        await axios.post(
          `${API_BASE_URL}/images/upload/${this.productoActual.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        alert('Imagen subida correctamente');
        this.archivoSeleccionado = null;
        this.imagenPrincipal = false;
        this.$refs.fileInput.value = '';
        await this.cargarImagenes(this.productoActual.id);
      } catch (error) {
        console.error('Error al subir imagen:', error);
        alert('Error al subir imagen: ' + (error.response?.data?.message || error.message));
      } finally {
        this.subiendoImagen = false;
      }
    },

    async marcarPrincipal(imagenId) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.put(
          `${API_BASE_URL}/images/${imagenId}/principal`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await this.cargarImagenes(this.productoActual.id);
        alert('Imagen marcada como principal');
      } catch (error) {
        console.error('Error al marcar imagen principal:', error);
        alert('Error al marcar imagen como principal');
      }
    },

    async eliminarImagen(imagenId) {
      if (!confirm('¿Está seguro de eliminar esta imagen?')) return;

      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`${API_BASE_URL}/images/${imagenId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await this.cargarImagenes(this.productoActual.id);
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
