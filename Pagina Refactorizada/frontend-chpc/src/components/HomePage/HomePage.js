import axios from "axios";
import { API_BASE_URL } from '@/config/api';
import HeaderAnth from "../HeaderAnth/HeaderAnth.vue";
import FooterAnth from "../FooterAnth/FooterAnth.vue";
import CarouselBanner from "../CarouselBanner/CarouselBanner.vue";
import HistorialProductosVistos from "../HistorialProductosVistos/HistorialProductosVistos.vue";

export default {
  name: "HomePage",
  components: {
    HeaderAnth,
    CarouselBanner,
    FooterAnth,
    HistorialProductosVistos,
  },
  data() {
    return {
      banners: [],
      productos: [],
      productosMostrados: [],
      promociones: [],
      searchQuery: "",
      isAuthenticated: false,
      limiteProductos: 10,
      selectedPriceRange: "", // '', 'low', 'mid', 'high'
      
      // Video destacado - PERSONALIZA ESTOS DATOS
      videoDestacado: "https://www.youtube.com/embed/r-DF3-FS_6k?si=DW930ua3fe_K9GjD&autoplay=1&mute=1&loop=1&playlist=r-DF3-FS_6k", // Video con autoplay y loop


      
      videoTitulo: "Laptop Gaming de Última Generación",
      videoDescripcion: "Conoce las características y rendimiento de nuestro producto estrella",
      
      // Datos de categorías más visitadas (placeholder)
      categoriasMasVisitadas: [
        { 
          id: 1, 
          nombre: 'Laptops', 
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>', 
          visitas: 1250, 
          productos: 45 
        },
        { 
          id: 2, 
          nombre: 'Componentes', 
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>', 
          visitas: 980, 
          productos: 120 
        },
        { 
          id: 3, 
          nombre: 'Periféricos', 
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="20" height="12" rx="2" ry="2"></rect><path d="M6 13h.01"></path><path d="M10 13h.01"></path><path d="M14 13h.01"></path><path d="M18 13h.01"></path><path d="M6 17h.01"></path><path d="M10 17h.01"></path><path d="M14 17h.01"></path><path d="M18 17h.01"></path></svg>', 
          visitas: 850, 
          productos: 85 
        },
        { 
          id: 4, 
          nombre: 'Almacenamiento', 
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>', 
          visitas: 720, 
          productos: 60 
        },
        { 
          id: 5, 
          nombre: 'Redes', 
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>', 
          visitas: 650, 
          productos: 38 
        },
        { 
          id: 6, 
          nombre: 'Audio', 
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>', 
          visitas: 540, 
          productos: 52 
        },
      ],
      
      // Mapeo de categorías a marcas (para simular productos por categoría)
      categoriaMapping: {
        'Laptops': ['Dell', 'HP', 'Lenovo', 'Asus'],
        'Componentes': ['Intel', 'AMD', 'NVIDIA', 'Corsair'],
        'Periféricos': ['Logitech', 'Razer', 'HyperX', 'SteelSeries'],
        'Almacenamiento': ['Kingston', 'Samsung', 'WD', 'Seagate'],
        'Redes': ['TP-Link', 'Cisco', 'Ubiquiti', 'Netgear'],
        'Audio': ['Sony', 'JBL', 'Bose', 'Audio-Technica'],
      },
    };
  },
  async created() {
    this.isAuthenticated = !!localStorage.getItem("access_token");

    try {
      // Cargar Banners desde la API
      try {
        const bannersResponse = await axios.get(`${API_BASE_URL}/tienda/banners`);
        this.banners = bannersResponse.data.data || bannersResponse.data || [];
        console.log('Banners cargados:', this.banners.length);
      } catch (bannerError) {
        console.error('Error al cargar banners:', bannerError);
        // Fallback a banners estáticos si falla la API
        this.banners = [
          { id: 1, titulo: "Banner 1", imagen_url: "/Banners/banner1.webp" },
          { id: 2, titulo: "Banner 2", imagen_url: "/Banners/banner2.avif" },
        ];
      }

      // Cargar Productos
      const productosResponse = await axios.get(`${API_BASE_URL}/tienda/productos`);
      this.productos = productosResponse.data.map((producto) => ({
        ...producto,
        imagen_url:
          producto.media?.length > 0
            ? `http://localhost:5000${producto.media[0].url}`
            : producto.imagen_url || "ruta-imagen-default.png",
      }));
      
      console.log('Total de productos cargados:', this.productos.length);
      console.log('Ejemplo de producto:', this.productos[0]);
      
      // Debug: Ver categorías únicas
      const categoriasUnicas = [...new Set(this.productos.map(p => p.categoria).filter(Boolean))];
      console.log('Categorías únicas encontradas:', categoriasUnicas);
      
      // Cargar Promociones Activas
      const promocionesResponse = await axios.get(`${API_BASE_URL}/promociones/activas`);
      this.promociones = promocionesResponse.data;
      
      // Combinar promociones con productos
      this.aplicarPromocionesAProductos();
      
      this.cargarMasProductos();
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }

    // Procesar la búsqueda inicial (si existe)
    const search = this.$route.query.search;
    if (search) {
      this.buscarProductos(search);
    }
  },
  computed: {
    productosDestacados() {
      if (!this.productos || this.productos.length === 0) return [];

      const destacados = this.productos.filter((p) => p.destacado);
      const base = destacados.length > 0 ? destacados : this.productos;

      // Tomamos los primeros 8 para la grilla de destacados
      return base.slice(0, 8);
    },
  },
  methods: {
    aplicarPromocionesAProductos() {
      // Agregar información de promoción a cada producto
      this.productos = this.productos.map(producto => {
        const promocion = this.promociones.find(p => p.producto_id === producto.id);
        if (promocion) {
          const precioOriginal = producto.precio;
          const precioConDescuento = precioOriginal - (precioOriginal * promocion.porcentaje_descuento / 100);
          return {
            ...producto,
            tienePromocion: true,
            promocion: {
              porcentaje: promocion.porcentaje_descuento,
              precioOriginal: precioOriginal,
              precioConDescuento: precioConDescuento.toFixed(2),
              fechaFin: promocion.fecha_fin
            }
          };
        }
        return {
          ...producto,
          tienePromocion: false
        };
      });
    },
    aplicarFiltros() {
      const query = this.searchQuery.trim().toLowerCase();

      let lista = [...this.productos];

      // Filtrado por rango de precio
      if (this.selectedPriceRange) {
        lista = lista.filter((producto) => {
          const precio = Number(producto.precio ?? 0);
          if (this.selectedPriceRange === "low") {
            return precio < 100;
          }
          if (this.selectedPriceRange === "mid") {
            return precio >= 101 && precio <= 399;
          }
          if (this.selectedPriceRange === "high") {
            return precio >= 400;
          }
          return true;
        });
      }

      // Filtrado por texto
      if (query !== "") {
        lista = lista.filter(
          (producto) => {
            const nombre = (producto.nombre_producto || "").toLowerCase();
            const descripcion = (producto.descripcion || "").toLowerCase();
            const marca = (producto.marca || "").toLowerCase();
            const categoria = (producto.categoria || "").toLowerCase();
            const sku = (producto.sku || "").toLowerCase();
            
            return nombre.includes(query) ||
                   descripcion.includes(query) ||
                   marca.includes(query) ||
                   categoria.includes(query) ||
                   sku.includes(query);
          }
        );
      }

      if (query !== "" || this.selectedPriceRange) {
        // Cuando hay filtros activos, mostramos toda la lista filtrada
        this.productosMostrados = lista;
      } else {
        // Sin filtros, aplicamos paginación básica
        this.productosMostrados = lista.slice(0, this.limiteProductos);
      }
    },
    cargarMasProductos() {
      if (this.searchQuery.trim() !== "" || this.selectedPriceRange) return;

      const siguienteBloque = this.productos.slice(
        this.productosMostrados.length,
        this.productosMostrados.length + this.limiteProductos
      );

      this.productosMostrados = [...this.productosMostrados, ...siguienteBloque];
    },
    verDetalle(id) {
      this.$router.push({ name: "ProductoDetalle", params: { id } });
    },
    buscarProductos(query) {
      this.searchQuery = query.trim();
      this.aplicarFiltros();
      // Scroll al inicio para ver los resultados
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    cambiarRangoPrecio(rango) {
      this.selectedPriceRange = rango;
      this.aplicarFiltros();
    },
    cerrarSesion() {
      localStorage.removeItem("access_token");
      this.isAuthenticated = false;
      this.$router.replace("/login");
    },
    redirigirLogin() {
      this.$router.push("/login");
    },
    navegarACategoria(nombreCategoria) {
      // Navegar a la página de productos por categoría
      this.$router.push({ 
        name: 'ProductosPorCategoria', 
        params: { categoria: nombreCategoria } 
      });
    },
    agregarAlCarrito(producto) {
      if (!producto) return;

      // Obtener carrito del localStorage
      let carrito = [];
      const carritoGuardado = localStorage.getItem('carrito');
      if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
      }

      // Verificar si el producto ya está en el carrito
      const productoExistente = carrito.find(p => p.id === producto.id);
      
      if (productoExistente) {
        // Aumentar cantidad
        productoExistente.cantidad++;
        alert('Cantidad actualizada en el carrito');
      } else {
        // Agregar nuevo producto
        carrito.push({
          id: producto.id,
          nombre: producto.nombre_producto,
          marca: producto.marca,
          precio: producto.precio,
          cantidad: 1,
          imagen_url: producto.imagen_url
        });
        alert('Producto agregado al carrito');
      }

      // Guardar en localStorage
      localStorage.setItem('carrito', JSON.stringify(carrito));
    },
    filtrarPorCategoria(nombreCategoria) {
      // Convertir el nombre de categoría a slug (minúsculas sin espacios)
      const categoriaSlug = nombreCategoria.toLowerCase().replace(/\s+/g, '-');
      
      // Navegar a la página de productos por categoría
      this.$router.push({ 
        name: 'ProductosPorCategoria', 
        params: { categoria: categoriaSlug } 
      });
    },
    getProductosPorCategoria(nombreCategoria) {
      // Intentar encontrar productos cuya categoría coincida (insensible a mayúsculas)
      let productosFiltrados = this.productos.filter((producto) =>
        producto.categoria?.toLowerCase() === nombreCategoria.toLowerCase()
      );

      // Si no hay coincidencia exacta, probar coincidencia parcial en la categoría
      if (productosFiltrados.length === 0) {
        productosFiltrados = this.productos.filter((producto) =>
          producto.categoria?.toLowerCase().includes(nombreCategoria.toLowerCase())
        );
      }

      // Si aún así no hay productos para esa categoría, usamos un fallback
      if (productosFiltrados.length === 0) {
        productosFiltrados = this.productos.slice(0, 6);
      }

      // Agregar ventas "simuladas" y ranking para mostrar como más vendidos
      productosFiltrados = productosFiltrados.map((producto, index) => ({
        ...producto,
        ventas: Math.floor(Math.random() * 500) + 100,
        ranking: index + 1,
      }));

      // Ordenar por ventas y tomar los top 3 para la tarjeta
      return productosFiltrados
        .sort((a, b) => b.ventas - a.ventas)
        .slice(0, 3);
    },
  },
};
