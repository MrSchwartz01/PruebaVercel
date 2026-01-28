import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export default {
  name: 'NotificationsPanel',
  data() {
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      eventSource: null,
    };
  },
  mounted() {
    this.loadNotifications();
    this.connectToNotificationStream();
  },
  beforeUnmount() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  },
  methods: {
    async loadNotifications() {
      this.loading = true;
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        this.notifications = response.data;
        this.updateUnreadCount();
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
      } finally {
        this.loading = false;
      }
    },

    async loadUnreadCount() {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        this.unreadCount = response.data.count;
      } catch (error) {
        console.error('Error al cargar contador:', error);
      }
    },

    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.leida).length;
    },

    async markAsRead(notificationId) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.patch(
          `${API_BASE_URL}/notifications/${notificationId}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // Actualizar localmente
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.leida = true;
          this.updateUnreadCount();
        }
      } catch (error) {
        console.error('Error al marcar como leída:', error);
      }
    },

    async markAllAsRead() {
      try {
        const token = localStorage.getItem('access_token');
        await axios.post(
          `${API_BASE_URL}/notifications/mark-all-read`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // Actualizar todas localmente
        this.notifications.forEach(n => n.leida = true);
        this.updateUnreadCount();
      } catch (error) {
        console.error('Error al marcar todas como leídas:', error);
      }
    },

    viewOrder(orderId) {
      // Redirigir a la vista de detalles del pedido
      this.$router.push(`/admin/orders/${orderId}`);
    },

    connectToNotificationStream() {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // Conectar a Server-Sent Events
      this.eventSource = new EventSource(
        `${API_BASE_URL}/notifications/stream`,
        { withCredentials: true }
      );

      this.eventSource.addEventListener('notification', (event) => {
        try {
          const data = JSON.parse(event.data);
          // Agregar nueva notificación al principio
          this.notifications.unshift({
            ...data.notification,
            leida: false,
          });
          this.updateUnreadCount();
          
          // Mostrar notificación del navegador si está permitido
          this.showBrowserNotification(data.notification);
        } catch (error) {
          console.error('Error al procesar notificación:', error);
        }
      });

      this.eventSource.addEventListener('count', (event) => {
        try {
          const data = JSON.parse(event.data);
          this.unreadCount = data.count;
        } catch (error) {
          console.error('Error al procesar contador:', error);
        }
      });

      this.eventSource.onerror = () => {
        console.error('Error en la conexión SSE');
        // Reconectar después de 5 segundos
        setTimeout(() => {
          this.connectToNotificationStream();
        }, 5000);
      };
    },

    showBrowserNotification(notification) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.titulo, {
          body: notification.mensaje,
          icon: '/favicon.ico',
        });
      }
    },

    formatTime(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Ahora';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours}h`;
      if (diffDays < 7) return `Hace ${diffDays}d`;
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    },
  },
};
