import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from '../store';
import './styles/globals.css';
import './config/axiosConfig'; // Importar configuración de Axios con interceptor

createApp(App)
	.use(router)
	.use(store)
	.mount('#app');
