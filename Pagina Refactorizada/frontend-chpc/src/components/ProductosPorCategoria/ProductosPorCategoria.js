import HeaderAnth from "../HeaderAnth/HeaderAnth.vue";
import FooterAnth from "../FooterAnth/FooterAnth.vue";
import ContactoAsesor from '../ContactoAsesor/ContactoAsesor.vue';
import apiClient from '@/services/api';

export default {
  name: "ProductosPorCategoria",
  components: {
    HeaderAnth,
    FooterAnth,
    ContactoAsesor,
  },
  data() {
    return {
      searchQuery: "",
      isAuthenticated: false,
      nombreCategoria: "",
      marcaSeleccionada: null,
      productos: [],
      categoriasInfo: {
        laptops: "Laptops",
        desktops: "Computadoras de Escritorio",
        monitores: "Monitores",
        teclados: "Teclados",
        mouses: "Mouses",
        impresoras: "Impresoras",
        camaras: "Cámaras de Seguridad",
        tablets: "Tablets",
        accesorios: "Accesorios",
        redes: "Redes",
        componentes: "Componentes",
        perifericos: "Periféricos",
        almacenamiento: "Almacenamiento",
        audio: "Audio",
        // Soporte para categorías con guiones
        'periféricos': "Periféricos",
      },
      // Control de secciones de filtros abiertas/cerradas
      sectionsOpen: {
        category: true,
        subcategory: true,
        brand: true,
        storage: false,
        bluetooth: false,
      },
    };
  },
  computed: {
    productosFiltrados() {
      if (this.marcaSeleccionada === null) {
        return this.productos;
      }
      return this.productos.filter(
        (p) => p.marca?.toLowerCase() === this.marcaSeleccionada.toLowerCase()
      );
    },
    marcasDisponibles() {
      // Extraer marcas únicas de los productos cargados
      const marcas = [...new Set(this.productos.map(p => p.marca).filter(Boolean))];
      return marcas.map(marca => ({ nombre: marca }));
    },
  },
  created() {
    this.isAuthenticated = !!localStorage.getItem("access_token");
    const categoriaSlug = this.$route.params.categoria;
    this.nombreCategoria =
      this.categoriasInfo[categoriaSlug] || "Categoría Desconocida";
    this.cargarProductos(categoriaSlug);
  },
  methods: {
    cerrarSesion() {
      localStorage.removeItem("access_token");
      this.isAuthenticated = false;
      this.$router.replace("/login");
    },
    buscarProductos(query) {
      this.searchQuery = query;
      // Implementar lógica de búsqueda
    },
    async cargarProductos(categoria) {
      try {
        console.log('🔍 [DEBUG] Categoría slug recibida:', categoria);
        
        // Obtener el nombre de categoría formateado del mapping (ahora buscaremos por marca)
        const categoriaFormateada = this.categoriasInfo[categoria] || 
          categoria.charAt(0).toUpperCase() + categoria.slice(1);
        
        console.log('📦 [DEBUG] Buscando por marca:', categoriaFormateada);
        
        // Ahora buscamos por marca ya que el nuevo esquema no tiene categoría
        const url = `/tienda/productos?marca=${encodeURIComponent(categoriaFormateada)}`;
        console.log('🌐 [DEBUG] URL de petición:', url);
        
        const response = await apiClient.get(url);
        
        console.log('✅ [DEBUG] Respuesta del servidor:', {
          status: response.status,
          totalProductos: response.data.length,
          primerProducto: response.data[0]
        });
        
        this.productos = response.data.map(producto => ({
          ...producto,
          imagen_url: producto.productImages?.length > 0
            ? producto.productImages.find(img => img.es_principal)?.ruta_imagen || producto.productImages[0].ruta_imagen
            : producto.imagen_url || "/Productos/placeholder-product.png"
        }));
        
        console.log(`✅ Productos cargados para ${categoriaFormateada}:`, this.productos.length);
        
        if (this.productos.length === 0) {
          console.warn('⚠️ No se encontraron productos para esta marca');
          // Intentar cargar TODOS los productos para ver qué marcas existen
          const todosResponse = await apiClient.get('/tienda/productos');
          // La API devuelve { data: [...], total, page, limit, totalPages }
          const todosProductos = todosResponse.data.data || todosResponse.data;
          const marcasExistentes = [...new Set(todosProductos.map(p => p.marca))];
          console.log('📋 Marcas disponibles en la BD:', marcasExistentes);
        }
      } catch (error) {
        console.error("❌ Error al cargar productos:", error);
        console.error("❌ Detalles del error:", error.response?.data || error.message);
        this.productos = [];
      }
    },
    filtrarPorMarca(marca) {
      this.marcaSeleccionada = marca;
    },
    toggleSection(section) {
      this.sectionsOpen[section] = !this.sectionsOpen[section];
    },
    verDetalle(codigo) {
      this.$router.push({ name: "ProductoDetalle", params: { id: codigo } });
    },
    obtenerTextoStock(stock) {
      if (stock === 0) {
        return 'Sin stock';
      } else if (stock <= 5) {
        return `${stock} unidades - Quedan pocas unidades`;
      } else {
        return 'Disponible';
      }
    },
  },
};
