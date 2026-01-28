import HeaderAnth from '../HeaderAnth/HeaderAnth.vue';
import FooterAnth from '../FooterAnth/FooterAnth.vue';
import ContactoAsesor from '../ContactoAsesor/ContactoAsesor.vue';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export default {
  name: 'TodosLosProductos',
  components: {
    HeaderAnth,
    FooterAnth,
    ContactoAsesor,
  },
  data() {
    return {
      productos: [],
      productosFiltrados: [],
      cargando: true,
      searchQuery: '',
      isAuthenticated: false,
      
      // Filtros
      filtros: {
        marcas: [],
        colores: [],
        subcategorias: [],
        precioMin: null,
        precioMax: null,
        soloDisponibles: false
      },
      
      // Opciones disponibles
      marcasDisponibles: [],
      coloresDisponibles: [],
      subcategoriasDisponibles: [],
      precioMinimo: 0,
      precioMaximo: 0,
      
      // Ordenamiento
      ordenamiento: 'relevancia',
      
      // Vista
      vistaActual: 'cuadricula', // 'cuadricula' o 'lista'
      
      // Paginación
      paginaActual: 1,
      productosPorPagina: 15,
      
      // Iconos de categorías (igual que HomePage)
      iconosCategorias: {
        'Laptops': '<svg xmlns="http://www.w3.org/2000/svg" class="categoria-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>',
        'Componentes': '<svg xmlns="http://www.w3.org/2000/svg" class="categoria-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
        'Periféricos': '<svg xmlns="http://www.w3.org/2000/svg" class="categoria-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="20" height="12" rx="2" ry="2"></rect><path d="M6 13h.01"></path><path d="M10 13h.01"></path><path d="M14 13h.01"></path><path d="M18 13h.01"></path><path d="M6 17h.01"></path><path d="M10 17h.01"></path><path d="M14 17h.01"></path><path d="M18 17h.01"></path></svg>',
        'Almacenamiento': '<svg xmlns="http://www.w3.org/2000/svg" class="categoria-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>',
        'Redes': '<svg xmlns="http://www.w3.org/2000/svg" class="categoria-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
        'Audio': '<svg xmlns="http://www.w3.org/2000/svg" class="categoria-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>',
        'Tablets': '<svg xmlns="http://www.w3.org/2000/svg" class="categoria-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',
        'Accesorios': '<svg xmlns="http://www.w3.org/2000/svg" class="categoria-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
      }
    };
  },
  computed: {
    productosPaginados() {
      const inicio = (this.paginaActual - 1) * this.productosPorPagina;
      const fin = inicio + this.productosPorPagina;
      return this.productosFiltrados.slice(inicio, fin);
    },
    totalPaginas() {
      return Math.ceil(this.productosFiltrados.length / this.productosPorPagina);
    }
  },
  async mounted() {
    this.verificarAutenticacion();
    await this.cargarProductos();
  },
  methods: {
    verificarAutenticacion() {
      const token = localStorage.getItem('access_token');
      this.isAuthenticated = !!token;
    },
    
    async cargarProductos() {
      try {
        this.cargando = true;
        const response = await axios.get(`${API_BASE_URL}/tienda/productos`);
        this.productos = response.data;
        this.productosFiltrados = [...this.productos];
        
        this.extraerOpcionesFiltros();
        this.calcularRangoPrecio();
        
        this.cargando = false;
      } catch (error) {
        console.error('Error al cargar productos:', error);
        this.cargando = false;
      }
    },
    
    extraerOpcionesFiltros() {
      // Extraer marcas únicas
      const marcasSet = new Set();
      this.productos.forEach(p => {
        if (p.marca) marcasSet.add(p.marca);
      });
      this.marcasDisponibles = Array.from(marcasSet).sort();
      
      // Extraer colores únicos
      const coloresSet = new Set();
      this.productos.forEach(p => {
        if (p.color) coloresSet.add(p.color);
      });
      this.coloresDisponibles = Array.from(coloresSet).sort();
      
      // Extraer subcategorías únicas
      const subcategoriasSet = new Set();
      this.productos.forEach(p => {
        if (p.subcategoria) subcategoriasSet.add(p.subcategoria);
      });
      this.subcategoriasDisponibles = Array.from(subcategoriasSet).sort();
    },
    
    calcularRangoPrecio() {
      if (this.productos.length === 0) return;
      
      const precios = this.productos.map(p => parseFloat(p.precio));
      this.precioMinimo = Math.floor(Math.min(...precios));
      this.precioMaximo = Math.ceil(Math.max(...precios));
      
      if (!this.filtros.precioMin) this.filtros.precioMin = this.precioMinimo;
      if (!this.filtros.precioMax) this.filtros.precioMax = this.precioMaximo;
    },
    
    aplicarFiltros() {
      let resultado = [...this.productos];
      
      // Filtro por marca
      if (this.filtros.marcas.length > 0) {
        resultado = resultado.filter(p => 
          this.filtros.marcas.includes(p.marca)
        );
      }
      
      // Filtro por color
      if (this.filtros.colores.length > 0) {
        resultado = resultado.filter(p => 
          this.filtros.colores.includes(p.color)
        );
      }
      
      // Filtro por subcategoría
      if (this.filtros.subcategorias.length > 0) {
        resultado = resultado.filter(p => 
          this.filtros.subcategorias.includes(p.subcategoria)
        );
      }
      
      // Filtro por precio
      if (this.filtros.precioMin !== null) {
        resultado = resultado.filter(p => 
          parseFloat(p.precio) >= this.filtros.precioMin
        );
      }
      if (this.filtros.precioMax !== null) {
        resultado = resultado.filter(p => 
          parseFloat(p.precio) <= this.filtros.precioMax
        );
      }
      
      // Filtro por stock
      if (this.filtros.soloDisponibles) {
        resultado = resultado.filter(p => p.stock > 0);
      }
      
      this.productosFiltrados = resultado;
      this.paginaActual = 1; // Resetear a la primera página
      this.aplicarOrdenamiento();
    },
    
    aplicarOrdenamiento() {
      switch (this.ordenamiento) {
        case 'precio-asc':
          this.productosFiltrados.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
          break;
        case 'precio-desc':
          this.productosFiltrados.sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
          break;
        case 'nombre-asc':
          this.productosFiltrados.sort((a, b) => 
            a.nombre_producto.localeCompare(b.nombre_producto)
          );
          break;
        case 'nombre-desc':
          this.productosFiltrados.sort((a, b) => 
            b.nombre_producto.localeCompare(a.nombre_producto)
          );
          break;
        default:
          // Relevancia - mantener orden original
          break;
      }
    },
    
    limpiarFiltros() {
      this.filtros = {
        marcas: [],
        colores: [],
        subcategorias: [],
        precioMin: this.precioMinimo,
        precioMax: this.precioMaximo,
        soloDisponibles: false
      };
      this.ordenamiento = 'relevancia';
      this.aplicarFiltros();
    },
    
    cambiarPagina(pagina) {
      if (pagina >= 1 && pagina <= this.totalPaginas) {
        this.paginaActual = pagina;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    
    verDetalle(id) {
      this.$router.push(`/producto/${id}`);
    },
    
    agregarAlCarrito(producto) {
      const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      const existente = carrito.find(item => item.id === producto.id);
      
      if (existente) {
        existente.cantidad += 1;
      } else {
        carrito.push({
          id: producto.id,
          nombre_producto: producto.nombre_producto,
          precio: producto.precio,
          imagen_url: producto.imagen_url,
          cantidad: 1,
          stock: producto.stock
        });
      }
      
      localStorage.setItem('carrito', JSON.stringify(carrito));
      alert('Producto agregado al carrito');
    },
    
    buscarProductos(query) {
      this.searchQuery = query;
      // Implementar búsqueda si es necesario
    },
    
    cerrarSesion() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      this.isAuthenticated = false;
      this.$router.push('/login');
    },
    
    formatearPrecio(precio) {
      return parseFloat(precio).toFixed(2);
    },
    
    truncarDescripcion(descripcion, maxLength = 100) {
      if (!descripcion) return '';
      return descripcion.length > maxLength 
        ? descripcion.substring(0, maxLength) + '...' 
        : descripcion;
    },
    
    handleImageError(event) {
      event.target.src = '/placeholder.jpg';
    },
    
    obtenerIconoCategoria(nombreCategoria) {
      // Buscar icono por coincidencia exacta o parcial
      const categoriaKey = Object.keys(this.iconosCategorias).find(key => 
        key.toLowerCase() === nombreCategoria?.toLowerCase() ||
        nombreCategoria?.toLowerCase().includes(key.toLowerCase())
      );
      
      return categoriaKey ? this.iconosCategorias[categoriaKey] : 
        '<svg xmlns="http://www.w3.org/2000/svg" class="categoria-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>';
    },
    
    obtenerTextoStock(stock) {
      if (stock === 0) {
        return 'Sin stock';
      } else if (stock <= 5) {
        return `${stock} unidades - Quedan pocas unidades`;
      } else {
        return 'Disponible';
      }
    }
  }
};
