<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <router-view /> <!-- Muestra el componente basado en la ruta actual -->
    <WhatsAppWidget /> <!-- Widget flotante de WhatsApp -->
  </div>
</template>

<script>
import WhatsAppWidget from './components/WhatsAppWidget/WhatsAppWidget.vue';
import inactivityService from './services/inactivityService';

export default {
  name: 'App',
  components: {
    WhatsAppWidget
  },
  data() {
    return {
      isDarkMode: false,
      inactivityTimer: null,
      inactivityTimeout: 3600000, // 1 hora en milisegundos (60 * 60 * 1000)
      activityEvents: ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'],
    };
  },
  created() {
    // Cargar preferencia de tema desde localStorage
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();

    // Escuchar cambios de tema
    window.addEventListener('theme-changed', this.handleThemeChange);

    // Registrar función de reseteo en el servicio global
    inactivityService.registerResetFunction(this.resetInactivityTimer);

    // Iniciar monitoreo de inactividad
    this.initInactivityMonitor();
  },
  beforeUnmount() {
    window.removeEventListener('theme-changed', this.handleThemeChange);
    
    // Limpiar monitoreo de inactividad
    this.cleanupInactivityMonitor();
    
    // Limpiar servicio global
    inactivityService.cleanup();
  },
  methods: {
    handleThemeChange(event) {
      this.isDarkMode = event.detail.isDark;
      this.applyTheme();
    },
    applyTheme() {
      if (this.isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    },
    
    // Sistema de monitoreo de inactividad
    initInactivityMonitor() {
      // Solo activar si hay un usuario autenticado
      if (!this.isUserAuthenticated()) {
        return;
      }

      // Configurar timer inicial
      this.resetInactivityTimer();

      // Agregar listeners para detectar actividad
      this.activityEvents.forEach(event => {
        window.addEventListener(event, this.resetInactivityTimer, true);
      });
    },

    cleanupInactivityMonitor() {
      // Limpiar el timer
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
        this.inactivityTimer = null;
      }

      // Remover todos los listeners de eventos
      this.activityEvents.forEach(event => {
        window.removeEventListener(event, this.resetInactivityTimer, true);
      });
    },

    resetInactivityTimer() {
      // Solo resetear si hay un usuario autenticado
      if (!this.isUserAuthenticated()) {
        return;
      }

      // Limpiar timer existente
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
      }

      // Configurar nuevo timer
      this.inactivityTimer = setTimeout(() => {
        this.handleInactivityLogout();
      }, this.inactivityTimeout);
    },

    isUserAuthenticated() {
      return !!localStorage.getItem('access_token');
    },

    handleInactivityLogout() {
      // Verificar una última vez que el usuario esté autenticado
      if (!this.isUserAuthenticated()) {
        return;
      }

      // Limpiar datos de sesión
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_rol');
      localStorage.removeItem('user_nombre');
      localStorage.removeItem('carrito');

      // Limpiar listeners
      this.cleanupInactivityMonitor();

      // Mostrar alerta al usuario
      alert('Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.');

      // Redirigir al login
      if (this.$route.path !== '/login') {
        this.$router.push('/login');
      }
    },
  },
};
</script>

<style>
/* Estilos personalizados para el componente raíz */
* {
  transition: background-color 0.3s ease, color 0.3s ease;
}

body {
  background-color: #f8f9fa;
  color: #2c3e50;
}

body.dark-mode {
  background-color: #1a1a1a;
  color: #ecf0f1;
}

#app.dark-mode {
  background-color: #1a1a1a;
  color: #ecf0f1;
}
</style>
