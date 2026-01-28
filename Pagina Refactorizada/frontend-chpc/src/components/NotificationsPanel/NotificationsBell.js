import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export default {
  name: 'NotificationsBell',
  data() {
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      showDropdown: false,
      eventSource: null,
    };
  },
  computed: {
    recentNotifications() {
      return this.notifications.slice(0, 5);
    },
  },
  mounted() {
    this.loadNotifications();
    this.connectToNotificationStream();
    this.requestNotificationPermission();
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

    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.leida).length;
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
        
        this.notifications.forEach(n => n.leida = true);
        this.updateUnreadCount();
      } catch (error) {
        console.error('Error al marcar como leídas:', error);
      }
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
        
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.leida = true;
          this.updateUnreadCount();
        }
      } catch (error) {
        console.error('Error al marcar como leída:', error);
      }
    },

    handleNotificationClick(notification) {
      this.markAsRead(notification.id);
      
      if (notification.orderId) {
        this.$router.push(`/admin/orders/${notification.orderId}`);
      }
      
      this.closeDropdown();
    },

    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },

    closeDropdown() {
      this.showDropdown = false;
    },

    viewAllNotifications() {
      this.$router.push('/admin/notifications');
      this.closeDropdown();
    },

    connectToNotificationStream() {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // Crear EventSource con headers de autenticación
      // Nota: EventSource no soporta headers personalizados directamente
      // Pasamos el token en la URL como alternativa
      this.eventSource = new EventSource(
        `${API_BASE_URL}/notifications/stream`,
        { withCredentials: true }
      );

      this.eventSource.addEventListener('notification', (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifications.unshift({
            ...data.notification,
            leida: false,
          });
          this.updateUnreadCount();
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
        setTimeout(() => this.connectToNotificationStream(), 5000);
      };
    },

    requestNotificationPermission() {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    },

    showBrowserNotification(notification) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.titulo, {
          body: notification.mensaje,
          icon: '/favicon.ico',
          tag: `notification-${notification.id}`,
        });
      }
    },

    truncateMessage(message) {
      return message.length > 60 ? message.substring(0, 60) + '...' : message;
    },

    formatTime(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffMins = Math.floor((now - date) / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Ahora';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    },
  },
};
