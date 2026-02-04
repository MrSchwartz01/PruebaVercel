import apiClient from '@/services/api';
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
      // Garantías cargadas desde la API
      garantiasPorMarca: {},
      garantiaDefault: { meses: 6, mensaje: 'Garantía de 6 meses por defecto' },
    };
  },
  computed: {
    imagenPrincipal() {
      if (this.imagenes && this.imagenes.length > 0) {
        // Usar el índice actual del carousel
        return this.imagenes[this.currentImageIndex].ruta_imagen;
      }
      return '/placeholder_product.jpg';
    },
    // Computed property para obtener la garantía según la marca
    garantiaProducto() {
      if (!this.producto || !this.producto.marca) {
        return this.garantiaDefault;
      }
      
      const marca = this.producto.marca.trim();
      
      // Buscar coincidencia exacta primero
      if (this.garantiasPorMarca[marca]) {
        return this.garantiasPorMarca[marca];
      }
      
      // Buscar coincidencia parcial (case insensitive)
      const marcaKey = Object.keys(this.garantiasPorMarca).find(key => 
        key.toLowerCase() === marca.toLowerCase() ||
        marca.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(marca.toLowerCase())
      );
      
      if (marcaKey) {
        return this.garantiasPorMarca[marcaKey];
      }
      
      // Retornar garantía por defecto
      return this.garantiaDefault;
    },
    mostrarStock() {
      if (!this.producto) return '';
      const stock = parseInt(this.producto.existenciaTotal) || 0;
      if (stock === 0) {
        return 'Sin stock';
      } else if (stock <= 5) {
        return `${stock} unidades - Quedan pocas unidades`;
      } else {
        return 'Disponible';
      }
    }
  },
  methods: {
    handleImageError(event) {
      // Prevenir loop infinito: solo cambiar si no es ya el placeholder
      if (!event.target.dataset.fallback) {
        event.target.dataset.fallback = 'true';
        event.target.src = '/placeholder_product.jpg';
      }
    },
    async cargarProducto() {
      this.isLoading = true;
      this.errorMessage = "";

      const productoCodigo = this.$route.params.id;
      try {
        // Obtener los datos del producto
        const response = await apiClient.get(`/tienda/productos/${productoCodigo}`);
        this.producto = response.data;

        // Cargar imágenes del producto
        try {
          const imagenesResponse = await apiClient.get(`/images/producto/${productoCodigo}`);
          this.imagenes = imagenesResponse.data;
        } catch (imgError) {
          console.warn('No se pudieron cargar las imágenes:', imgError);
          this.imagenes = [];
        }

        // Registrar en historial de productos vistos (Vuex + localStorage)
        if (this.$store) {
          this.$store.dispatch('registrarProductoVisto', this.producto);
        }

        // Cargar productos relacionados de la misma marca
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
      if (!this.producto || !this.producto.marca) {
        console.log('No se puede cargar productos relacionados: producto o marca no disponible');
        return;
      }

      try {
        console.log('Cargando productos relacionados de marca:', this.producto.marca);
        
        const response = await apiClient.get('/tienda/productos', {
          params: {
            marca: this.producto.marca,
          }
        });
        
        console.log('Productos obtenidos:', response.data.length);
        
        // Filtrar el producto actual y limitar a 3
        this.productosRelacionados = response.data
          .filter(p => p.codigo !== this.producto.codigo)
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
      const productoExistente = carrito.find(p => p.codigo === this.producto.codigo);
      
      if (productoExistente) {
        // Aumentar cantidad
        productoExistente.cantidad++;
        alert('Cantidad actualizada en el carrito');
      } else {
        // Agregar nuevo producto
        carrito.push({
          codigo: this.producto.codigo,
          producto: this.producto.producto,
          marca: this.producto.marca,
          costoTotal: this.producto.costoTotal,
          cantidad: 1,
          imagen_url: this.imagenPrincipal,
          medida: this.producto.medida
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
    verProducto(productoCodigo) {
      this.$router.push({
        name: 'ProductoDetalle',
        params: { id: productoCodigo }
      });
    },
    async cargarGarantias() {
      try {
        const response = await apiClient.get('/garantias/activas');
        const garantias = response.data || [];
        
        // Convertir array a objeto para búsqueda rápida por marca
        this.garantiasPorMarca = {};
        garantias.forEach(g => {
          this.garantiasPorMarca[g.marca] = {
            meses: g.meses,
            mensaje: g.mensaje
          };
        });
      } catch (error) {
        console.warn('No se pudieron cargar las garantías desde la API:', error);
        // Mantener el objeto vacío, se usará la garantía por defecto
      }
    },
  },
  async created() {
    this.isAuthenticated = !!localStorage.getItem("access_token");
    // Cargar garantías desde la API
    await this.cargarGarantias();
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