<template>
  <div>
    <HeaderAnth
      :searchQuery="searchQuery"
      :isAuthenticated="isAuthenticated"
      @buscar="buscarProductos"
      @cerrar-sesion="cerrarSesion"
    />

    <div class="dashboard-container">
      <!-- Header del dashboard -->
      <div class="dashboard-header">
        <div>
          <h1>Dashboard de Ventas</h1>
          <p>Análisis y métricas de tu negocio</p>
        </div>
        <NotificationsBell v-if="isAuthenticated" />
      </div>

      <!-- KPIs principales -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);">
            💰
          </div>
          <div class="kpi-content">
            <h3>Ventas Totales</h3>
            <p class="kpi-value">${{ formatearNumero(ventasTotales) }}</p>
            <span class="kpi-change positive">+12.5% vs mes anterior</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);">
            🛒
          </div>
          <div class="kpi-content">
            <h3>Órdenes</h3>
            <p class="kpi-value">{{ totalOrdenes }}</p>
            <span class="kpi-change positive">+8.3% vs mes anterior</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);">
            📦
          </div>
          <div class="kpi-content">
            <h3>Productos Vendidos</h3>
            <p class="kpi-value">{{ productosVendidos }}</p>
            <span class="kpi-change positive">+15.7% vs mes anterior</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon" style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);">
            👥
          </div>
          <div class="kpi-content">
            <h3>Clientes Activos</h3>
            <p class="kpi-value">{{ clientesActivos }}</p>
            <span class="kpi-change negative">-2.1% vs mes anterior</span>
          </div>
        </div>
      </div>

      <!-- Gráficos principales -->
      <div class="charts-grid">
        <div class="chart-full">
          <VentasTotales />
        </div>

        <div class="chart-half">
          <ProductosTop />
        </div>

        <div class="chart-half">
          <VentasPorCategoria />
        </div>
      </div>

      <!-- Tabla de órdenes recientes -->
      <div class="recent-orders">
        <div class="section-header">
          <h2>Órdenes Recientes</h2>
          <button class="btn-view-all" @click="verTodasOrdenes">Ver todas</button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="orden in ordenesRecientes" :key="orden.id">
                <td><strong>{{ orden.codigo }}</strong></td>
                <td>{{ orden.cliente }}</td>
                <td>{{ formatearFecha(orden.fecha) }}</td>
                <td><strong>${{ formatearNumero(orden.total) }}</strong></td>
                <td><span :class="['status-badge', orden.status.toLowerCase()]">{{ orden.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <FooterAnth />
  </div>
</template>

<script>
import HeaderAnth from '../HeaderAnth/HeaderAnth.vue';
import FooterAnth from '../FooterAnth/FooterAnth.vue';
import VentasTotales from './DashboardCharts/VentasTotales.vue';
import ProductosTop from './DashboardCharts/ProductosTop.vue';
import VentasPorCategoria from './DashboardCharts/VentasPorCategoria.vue';
import NotificationsBell from '../NotificationsPanel/NotificationsBell.vue';
import axios from 'axios';

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
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:5000/analytics/kpis', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
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
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:5000/analytics/ordenes/recientes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
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
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 30px;
  animation: fadeIn 0.6s ease-out;
}

.dashboard-header {
  margin-bottom: 40px;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.dashboard-header p {
  font-size: 1.1rem;
  color: #6c757d;
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 20px;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.6s ease-out backwards;
}

.kpi-card:nth-child(1) { animation-delay: 0.1s; }
.kpi-card:nth-child(2) { animation-delay: 0.2s; }
.kpi-card:nth-child(3) { animation-delay: 0.3s; }
.kpi-card:nth-child(4) { animation-delay: 0.4s; }

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.kpi-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.kpi-content h3 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6c757d;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 6px 0;
}

.kpi-change {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.kpi-change.positive {
  color: #27ae60;
  background-color: rgba(46, 204, 113, 0.1);
}

.kpi-change.negative {
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 40px;
}

.chart-full {
  grid-column: 1 / -1;
}

.chart-half {
  min-height: 450px;
}

@media (min-width: 1024px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Recent Orders Table */
.recent-orders {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.6s ease-out 0.5s backwards;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.btn-view-all {
  padding: 8px 16px;
  background-color: #f8f9fa;
  color: #495057;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-view-all:hover {
  background-color: #ffa726;
  color: white;
  border-color: #ffa726;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #f8f9fa;
}

th {
  padding: 12px 16px;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.95rem;
  color: #495057;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.completed {
  background-color: rgba(46, 204, 113, 0.15);
  color: #27ae60;
}

.status-badge.pending {
  background-color: rgba(241, 196, 15, 0.15);
  color: #f39c12;
}

.status-badge.shipped {
  background-color: rgba(52, 152, 219, 0.15);
  color: #2980b9;
}

.status-badge.cancelled {
  background-color: rgba(231, 76, 60, 0.15);
  color: #c0392b;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 20px 15px;
  }

  .dashboard-header h1 {
    font-size: 2rem;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .table-container {
    overflow-x: scroll;
  }

  table {
    min-width: 600px;
  }
}
</style>
