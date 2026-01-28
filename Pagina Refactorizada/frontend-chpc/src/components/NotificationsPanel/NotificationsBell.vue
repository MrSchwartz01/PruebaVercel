<template>
  <div class="notifications-bell">
    <button @click="toggleDropdown" class="bell-button">
      🔔
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>

    <div v-if="showDropdown" class="notifications-dropdown">
      <div class="dropdown-header">
        <h3>Notificaciones</h3>
        <button @click="markAllAsRead" class="btn-mark-all-mini">
          ✓
        </button>
      </div>

      <div class="notifications-list">
        <div v-if="loading" class="loading-mini">
          <div class="spinner-mini"></div>
        </div>

        <div v-else-if="notifications.length === 0" class="empty-mini">
          <p>No hay notificaciones</p>
        </div>

        <div 
          v-else
          v-for="notification in recentNotifications" 
          :key="notification.id"
          :class="['notification-mini', { 'unread': !notification.leida }]"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon-mini">
            <span v-if="notification.tipo === 'NUEVO_PEDIDO'">🛒</span>
            <span v-else-if="notification.tipo === 'PEDIDO_ACTUALIZADO'">📦</span>
            <span v-else-if="notification.tipo === 'PEDIDO_COMPLETADO'">✅</span>
            <span v-else-if="notification.tipo === 'PEDIDO_CANCELADO'">❌</span>
          </div>
          
          <div class="notification-content-mini">
            <h4>{{ notification.titulo }}</h4>
            <p>{{ truncateMessage(notification.mensaje) }}</p>
            <span class="time-mini">{{ formatTime(notification.createdAt) }}</span>
          </div>

          <div v-if="!notification.leida" class="unread-dot"></div>
        </div>
      </div>

      <div class="dropdown-footer">
        <button @click="viewAllNotifications" class="btn-view-all">
          Ver todas las notificaciones
        </button>
      </div>
    </div>

    <!-- Overlay para cerrar el dropdown -->
    <div 
      v-if="showDropdown" 
      class="dropdown-overlay" 
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script src="./NotificationsBell.js"></script>
<style src="./NotificationsBell.css"></style>
