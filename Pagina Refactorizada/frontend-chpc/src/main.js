import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from '../store';
import './styles/globals.css';
import './config/axiosConfig'; // Importar configuración de Axios con interceptor

// Manejo de errores globales
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

const app = createApp(App);

// Manejo de errores de Vue
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue error:', err, info);
};

app.use(router)
   .use(store)
   .mount('#app');
