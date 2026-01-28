<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3>Ventas Totales</h3>
      <div class="chart-filters">
        <select v-model="periodo" @change="cargarDatos">
          <option value="7dias">Últimos 7 días</option>
          <option value="30dias">Últimos 30 días</option>
          <option value="3meses">Últimos 3 meses</option>
          <option value="año">Último año</option>
        </select>
      </div>
    </div>
    <div class="chart-content">
      <div v-if="cargando" class="loading">Cargando datos...</div>
      <Line v-else :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script>
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default {
  name: 'VentasTotales',
  components: { Line },
  data() {
    return {
      periodo: '30dias',
      cargando: true,
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Ventas ($)',
            data: [],
            borderColor: '#ffa726',
            backgroundColor: 'rgba(255, 167, 38, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: '#ffa726',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 7
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 14, weight: '600' },
              color: '#2c3e50',
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(44, 62, 80, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            borderColor: '#ffa726',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              label: (context) => `Ventas: $${context.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: {
              font: { size: 12 },
              color: '#6c757d',
              callback: (value) => `$${value}`
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 12 },
              color: '#6c757d'
            }
          }
        }
      }
    };
  },
  async mounted() {
    await this.cargarDatos();
  },
  methods: {
    async cargarDatos() {
      this.cargando = true;
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `http://localhost:5000/analytics/ventas/por-periodo?periodo=${this.periodo}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        this.chartData.labels = response.data.labels;
        this.chartData.datasets[0].data = response.data.ventas;
      } catch (error) {
        console.error('Error al cargar datos de ventas:', error);
        // Datos de ejemplo si falla
        this.chartData.labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        this.chartData.datasets[0].data = [1200, 1900, 1500, 2100, 1800, 2400];
      } finally {
        this.cargando = false;
      }
    }
  }
};
</script>

<style scoped>
.chart-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.6s ease-out;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.chart-filters select {
  padding: 8px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;
  outline: none;
}

.chart-filters select:hover,
.chart-filters select:focus {
  border-color: #ffa726;
  background-color: #fff;
}

.chart-content {
  height: 350px;
  position: relative;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  font-size: 1rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .chart-content {
    height: 280px;
  }
}
</style>
