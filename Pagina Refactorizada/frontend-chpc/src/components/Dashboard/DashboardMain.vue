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

<script src="./DashboardMain.js"></script>

<style src="./DashboardMain.css" scoped></style>