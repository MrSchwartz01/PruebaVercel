<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3>Productos Más Vendidos</h3>
      <div class="chart-filters">
        <select v-model="limite" @change="cargarDatos">
          <option value="5">Top 5</option>
          <option value="10">Top 10</option>
          <option value="15">Top 15</option>
        </select>
      </div>
    </div>
    <div class="chart-content">
      <div v-if="cargando" class="loading">Cargando datos...</div>
      <Bar v-else :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default {
  name: 'ProductosTop',
  components: { Bar },
  data() {
    return {
      limite: 10,
      cargando: true,
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Unidades Vendidas',
            data: [],
            backgroundColor: [
              'rgba(255, 167, 38, 0.8)',
              'rgba(251, 140, 0, 0.8)',
              'rgba(255, 152, 0, 0.8)',
              'rgba(255, 193, 7, 0.8)',
              'rgba(255, 202, 40, 0.8)',
              'rgba(255, 214, 88, 0.8)',
              'rgba(255, 224, 130, 0.8)',
              'rgba(255, 236, 179, 0.8)',
              'rgba(255, 243, 204, 0.8)',
              'rgba(255, 249, 230, 0.8)'
            ],
            borderColor: [
              '#ffa726',
              '#fb8c00',
              '#ff9800',
              '#ffc107',
              '#ffca28',
              '#ffd658',
              '#ffe082',
              '#ffecb3',
              '#fff3cc',
              '#fff9e6'
            ],
            borderWidth: 2,
            borderRadius: 8,
            barThickness: 40
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(44, 62, 80, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            borderColor: '#ffa726',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              label: (context) => `Vendidos: ${context.parsed.x} unidades`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: {
              font: { size: 12 },
              color: '#6c757d',
              precision: 0
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              font: { size: 12 },
              color: '#495057',
              autoSkip: false
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
          `http://localhost:5000/analytics/productos/top?limite=${this.limite}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        this.chartData.labels = response.data.productos;
        this.chartData.datasets[0].data = response.data.cantidades;
      } catch (error) {
        console.error('Error al cargar productos top:', error);
        // Datos de ejemplo
        this.chartData.labels = [
          'Laptop Gaming Asus ROG',
          'Mouse Logitech G502',
          'Teclado Mecánico Razer',
          'Monitor LG 27"',
          'Headset HyperX'
        ];
        this.chartData.datasets[0].data = [45, 38, 32, 28, 25];
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
  animation: fadeIn 0.6s ease-out 0.1s backwards;
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
  height: 400px;
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
    height: 320px;
  }
}
</style>
