<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3>Ventas por Categoría</h3>
    </div>
    <div class="chart-content">
      <div v-if="cargando" class="loading">Cargando datos...</div>
      <Doughnut v-else :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script>
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

export default {
  name: 'VentasPorCategoria',
  components: { Doughnut },
  data() {
    return {
      cargando: true,
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Ventas por Categoría',
            data: [],
            backgroundColor: [
              'rgba(255, 167, 38, 0.8)',
              'rgba(251, 140, 0, 0.8)',
              'rgba(52, 152, 219, 0.8)',
              'rgba(46, 204, 113, 0.8)',
              'rgba(155, 89, 182, 0.8)',
              'rgba(231, 76, 60, 0.8)',
              'rgba(241, 196, 15, 0.8)',
              'rgba(149, 165, 166, 0.8)'
            ],
            borderColor: '#fff',
            borderWidth: 3,
            hoverOffset: 10
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: { size: 13, weight: '600' },
              color: '#2c3e50',
              padding: 15,
              boxWidth: 15,
              boxHeight: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(44, 62, 80, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            borderColor: '#ffa726',
            borderWidth: 1,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: $${value} (${percentage}%)`;
              }
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
          'http://localhost:5000/analytics/ventas/por-categoria',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        this.chartData.labels = response.data.categorias;
        this.chartData.datasets[0].data = response.data.ventas;
      } catch (error) {
        console.error('Error al cargar ventas por categoría:', error);
        // Datos de ejemplo
        this.chartData.labels = [
          'Laptops',
          'Monitores',
          'Teclados',
          'Mouses',
          'Accesorios',
          'Impresoras'
        ];
        this.chartData.datasets[0].data = [12500, 8300, 5200, 3800, 6500, 4200];
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
  animation: fadeIn 0.6s ease-out 0.2s backwards;
}

.chart-header {
  margin-bottom: 20px;
}

.chart-header h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.chart-content {
  height: 350px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
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
  .chart-content {
    height: 300px;
  }
}
</style>
