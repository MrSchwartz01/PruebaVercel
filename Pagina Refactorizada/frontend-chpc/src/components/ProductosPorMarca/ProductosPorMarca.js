import HeaderAnth from "../HeaderAnth/HeaderAnth.vue";
import FooterAnth from "../FooterAnth/FooterAnth.vue";
import ContactoAsesor from '../ContactoAsesor/ContactoAsesor.vue';
import axios from "axios";
import { API_BASE_URL } from '@/config/api';

export default {
  name: "ProductosPorMarca",
  components: {
    HeaderAnth,
    FooterAnth,
    ContactoAsesor,
  },
  data() {
    return {
      productos: [],
      nombreMarca: "",
      isAuthenticated: false,
      cargando: true,
      error: null,
      marcasMap: {
        1: "ASUS",
        2: "MSI",
        3: "AMD",
        4: "Intel",
        5: "NVIDIA",
        6: "Corsair",
        7: "Kingston",
        8: "Logitech",
        9: "Razer",
        10: "Samsung",
        11: "Western Digital",
        12: "Seagate",
        13: "TP-Link",
        14: "Cisco",
        15: "Sony",
        16: "JBL",
        17: "Dell",
        18: "HP",
        19: "Lenovo",
        20: "Apple",
      },
    };
  },
  async created() {
    this.isAuthenticated = !!localStorage.getItem("access_token");
    const marcaId = this.$route.params.id;
    
    // Obtener nombre de la marca desde el map
    this.nombreMarca = this.marcasMap[marcaId] || "Marca";
    
    // Cargar productos reales de la base de datos
    await this.cargarProductosPorMarca(this.nombreMarca);
  },
  methods: {
    cerrarSesion() {
      localStorage.removeItem("access_token");
      this.isAuthenticated = false;
      this.$router.replace("/login");
    },
    verDetalle(id) {
      this.$router.push({ name: "ProductoDetalle", params: { id } });
    },
    async cargarProductosPorMarca(marca) {
      try {
        this.cargando = true;
        this.error = null;
        
        const response = await axios.get(
          `${API_BASE_URL}/tienda/productos`,
          {
            params: { marca: marca }
          }
        );
        
        this.productos = response.data;
        
        if (this.productos.length === 0) {
          this.error = `No se encontraron productos de la marca ${marca}`;
        }
      } catch (error) {
        console.error('Error al cargar productos por marca:', error);
        this.error = 'Error al cargar los productos. Por favor, intenta nuevamente.';
        this.productos = [];
      } finally {
        this.cargando = false;
      }
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
  mounted() {
    // Scroll hacia arriba al cargar el componente
    window.scrollTo(0, 0);
  },
  watch: {
    '$route.params.id': {
      immediate: false,
      handler() {
        // Scroll hacia arriba cuando cambia la marca
        window.scrollTo(0, 0);
        const marcaId = this.$route.params.id;
        const marca = this.marcasMap[marcaId] || "Marca";
        this.nombreMarca = marca;
        this.cargarProductosPorMarca(marca);
      }
    }
  }
};