import HeaderAnth from '../HeaderAnth/HeaderAnth.vue';
import FooterAnth from '../FooterAnth/FooterAnth.vue';
import VentasTotales from './DashboardCharts/VentasTotales.vue';
import ProductosTop from './DashboardCharts/ProductosTop.vue';
import VentasPorCategoria from './DashboardCharts/VentasPorCategoria.vue';
import NotificationsBell from '../NotificationsPanel/NotificationsBell.vue';
import apiClient from '@/services/api';

export default {
  name: 'DashboardMain',
  components: {
    HeaderAnth,
    FooterAnth,
    VentasTotales,
    ProductosTop,
    VentasPorCategoria,
    NotificationsBell,
  },
  data() {
    return {
      searchQuery: '',
      isAuthenticated: false,
      ventasTotales: 45230.50,
      totalOrdenes: 328,
      productosVendidos: 1247,
      clientesActivos: 156,
      ordenesRecientes: []
    };
  },
  async created() {
    this.isAuthenticated = !!localStorage.getItem('access_token');
    
    // Verificar que el usuario sea admin
    const userRol = localStorage.getItem('user_rol');
    if (userRol !== 'administrador') {
      this.$router.push('/home');
      return;
    }

    await this.cargarDatosKPI();
    await this.cargarOrdenesRecientes();
  },
  methods: {
    async cargarDatosKPI() {
      try {
        const response = await apiClient.get('/analytics/kpis');
        
        this.ventasTotales = response.data.ventasTotales || this.ventasTotales;
        this.totalOrdenes = response.data.totalOrdenes || this.totalOrdenes;
        this.productosVendidos = response.data.productosVendidos || this.productosVendidos;
        this.clientesActivos = response.data.clientesActivos || this.clientesActivos;
      } catch (error) {
        console.error('Error al cargar KPIs:', error);
      }
    },
    async cargarOrdenesRecientes() {
      try {
        const response = await apiClient.get('/analytics/ordenes/recientes');
        
        this.ordenesRecientes = response.data;
      } catch (error) {
        console.error('Error al cargar órdenes recientes:', error);
        // Datos de ejemplo
        this.ordenesRecientes = [
          { id: 1, codigo: 'CHPC-000125', cliente: 'Juan Pérez', fecha: new Date(), total: 1250.00, status: 'COMPLETED' },
          { id: 2, codigo: 'CHPC-000124', cliente: 'María García', fecha: new Date(), total: 850.50, status: 'PENDING' },
          { id: 3, codigo: 'CHPC-000123', cliente: 'Carlos López', fecha: new Date(), total: 2100.00, status: 'SHIPPED' }
        ];
      }
    },
    formatearNumero(numero) {
      return new Intl.NumberFormat('es-EC', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numero);
    },
    formatearFecha(fecha) {
      return new Date(fecha).toLocaleDateString('es-EC', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    buscarProductos(query) {
      this.searchQuery = query;
      this.$router.push({ path: '/productos', query: { search: query } });
    },
    cerrarSesion() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_rol');
      this.isAuthenticated = false;
      this.$router.push('/login');
    },
    verTodasOrdenes() {
      this.$router.push('/ordenes');
    }
  }
};