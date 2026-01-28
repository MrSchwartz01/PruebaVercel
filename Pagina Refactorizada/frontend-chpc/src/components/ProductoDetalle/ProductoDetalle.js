import axios from "axios";
import { API_BASE_URL } from '@/config/api';
import HeaderAnth from "../HeaderAnth/HeaderAnth.vue";
import FooterAnth from "../FooterAnth/FooterAnth.vue";
import ContactoAsesor from '../ContactoAsesor/ContactoAsesor.vue';

export default {
  name: "ProductoDetalle",
  components: {
    HeaderAnth,
    FooterAnth,
    ContactoAsesor,
  },
  data() {
    return {
      producto: null,
      imagenes: [],
      productosRelacionados: [],
      errorMessage: "",
      isLoading: true,
      isAuthenticated: false,
      searchQuery: "",
      zoomActivo: false,
      currentImageIndex: 0,
      carouselInterval: null,
    };
  },
  computed: {
    imagenPrincipal() {
      if (this.imagenes && this.imagenes.length > 0) {
        // Usar el índice actual del carousel
        return this.imagenes[this.currentImageIndex].ruta_imagen;
      }
      return '/Productos/placeholder-product.png';
    },
    mostrarStock() {
      if (!this.producto) return '';
      if (this.producto.stock === 0) {
        return 'Sin stock';
      } else if (this.producto.stock <= 5) {
        return `${this.producto.stock} unidades - Quedan pocas unidades`;
      } else {
        return 'Disponible';
      }
    }
  },
  methods: {
    async cargarProducto() {
      this.isLoading = true;
      this.errorMessage = "";

      const productoId = this.$route.params.id;
      try {
        // Obtener los datos del producto
        const response = await axios.get(
          `${API_BASE_URL}/tienda/productos/${productoId}`
        );
        this.producto = response.data;

        // Cargar imágenes del producto
        try {
          const imagenesResponse = await axios.get(
            `${API_BASE_URL}/images/producto/${productoId}`
          );
          this.imagenes = imagenesResponse.data;
        } catch (imgError) {
          console.warn('No se pudieron cargar las imágenes:', imgError);
          this.imagenes = [];
        }

        // Registrar en historial de productos vistos (Vuex + localStorage)
        if (this.$store) {
          this.$store.dispatch('registrarProductoVisto', this.producto);
        }

        // Cargar productos relacionados de la misma categoría
        await this.cargarProductosRelacionados();
      } catch (error) {
        console.error('Error al cargar producto:', error);
        this.errorMessage =
          error.response?.data?.message || "Hubo un problema al cargar el producto.";
      } finally {
        this.isLoading = false;
      }
    },
    async cargarProductosRelacionados() {
      if (!this.producto || !this.producto.categoria) {
        console.log('No se puede cargar productos relacionados: producto o categoría no disponible');
        return;
      }

      try {
        console.log('Cargando productos relacionados de categoría:', this.producto.categoria);
        
        const response = await axios.get(`${API_BASE_URL}/tienda/productos`, {
          params: {
            categoria: this.producto.categoria,
          }
        });
        
        console.log('Productos obtenidos:', response.data.length);
        
        // Filtrar el producto actual y limitar a 3
        this.productosRelacionados = response.data
          .filter(p => p.id !== this.producto.id)
          .slice(0, 3);
          
        console.log('Productos relacionados filtrados:', this.productosRelacionados.length);
          
      } catch (error) {
        console.error('Error al cargar productos relacionados:', error);
        this.productosRelacionados = [];
      }
    },
    recargarProducto() {
      this.cargarProducto();
    },
    buscarProductos(query) {
      this.searchQuery = query;
      if (query.trim() !== "") {
        this.$router.push({ name: "HomePage", query: { search: query } });
      }
    },
    formatPrice(price) {
      return parseFloat(price).toFixed(2);
    },
    cerrarSesion() {
      localStorage.removeItem("access_token");
      this.isAuthenticated = false;
      this.$router.push("/login");
    },
    redirigirLogin() {
      this.$router.push("/login");
    },
    agregarAlCarrito() {
      if (!this.producto) return;

      // Obtener carrito del localStorage
      let carrito = [];
      const carritoGuardado = localStorage.getItem('carrito');
      if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
      }

      // Verificar si el producto ya está en el carrito
      const productoExistente = carrito.find(p => p.id === this.producto.id);
      
      if (productoExistente) {
        // Aumentar cantidad
        productoExistente.cantidad++;
        alert('Cantidad actualizada en el carrito');
      } else {
        // Agregar nuevo producto
        carrito.push({
          id: this.producto.id,
          nombre: this.producto.nombre_producto,
          marca: this.producto.marca,
          precio: this.producto.precio,
          cantidad: 1,
          imagen_url: this.imagenPrincipal
        });
        alert('Producto agregado al carrito');
      }

      // Guardar en localStorage
      localStorage.setItem('carrito', JSON.stringify(carrito));
    },
    abrirZoom() {
      this.zoomActivo = true;
      document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    },
    cerrarZoom() {
      this.zoomActivo = false;
      document.body.style.overflow = ''; // Restaurar scroll
    },
    // Métodos del carousel
    siguienteImagen() {
      if (this.imagenes.length > 1) {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.imagenes.length;
      }
    },
    imagenAnterior() {
      if (this.imagenes.length > 1) {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.imagenes.length) % this.imagenes.length;
      }
    },
    seleccionarImagen(index) {
      this.currentImageIndex = index;
      this.detenerAutoplay();
    },
    iniciarAutoplay() {
      if (this.imagenes.length > 1) {
        this.carouselInterval = setInterval(() => {
          this.siguienteImagen();
        }, 4000); // Cambiar cada 4 segundos
      }
    },
    detenerAutoplay() {
      if (this.carouselInterval) {
        clearInterval(this.carouselInterval);
        this.carouselInterval = null;
      }
    },
    verProducto(productoId) {
      this.$router.push({
        name: 'ProductoDetalle',
        params: { id: productoId }
      });
    },
  },
  async created() {
    this.isAuthenticated = !!localStorage.getItem("access_token");
    // El watch de $route.params.id se encargará de cargar el producto
    // con immediate: true
  },
  mounted() {
    // Scroll hacia arriba al cargar el componente
    window.scrollTo(0, 0);
    // El watch y el método cargarProducto se encargan del autoplay
  },
  beforeUnmount() {
    // Limpiar el intervalo cuando se destruya el componente
    this.detenerAutoplay();
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler() {
        // Scroll hacia arriba cuando cambia el producto
        window.scrollTo(0, 0);
        this.currentImageIndex = 0;
        this.imagenes = [];
        this.productosRelacionados = [];
        this.detenerAutoplay();
        this.cargarProducto();
      }
    },
    imagenes: {
      handler(newImagenes) {
        // Reiniciar autoplay cuando se carguen las imágenes
        if (newImagenes && newImagenes.length > 0) {
          this.detenerAutoplay();
          this.iniciarAutoplay();
        } else {
          this.detenerAutoplay();
        }
      }
    }
  }
};