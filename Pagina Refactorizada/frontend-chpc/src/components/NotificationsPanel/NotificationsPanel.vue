<template>
  <div class="notifications-panel">
    <div class="notifications-header">
      <h2>
        <span class="icon">🔔</span>
        Notificaciones
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </h2>
      <button 
        v-if="notifications.length > 0" 
        @click="markAllAsRead" 
        class="btn-mark-all"
      >
        Marcar todas como leídas
      </button>
    </div>

    <div class="notifications-list">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando notificaciones...</p>
      </div>

      <div v-else-if="notifications.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No hay notificaciones</h3>
        <p>Aquí aparecerán las notificaciones de nuevos pedidos</p>
      </div>

      <div 
        v-else 
        v-for="notification in notifications" 
        :key="notification.id"
        :class="['notification-item', { 'unread': !notification.leida }]"
        @click="markAsRead(notification.id)"
      >
        <div class="notification-icon">
          <span v-if="notification.tipo === 'NUEVO_PEDIDO'">🛒</span>
          <span v-else-if="notification.tipo === 'PEDIDO_ACTUALIZADO'">📦</span>
          <span v-else-if="notification.tipo === 'PEDIDO_COMPLETADO'">✅</span>
          <span v-else-if="notification.tipo === 'PEDIDO_CANCELADO'">❌</span>
        </div>
        
        <div class="notification-content">
          <h4>{{ notification.titulo }}</h4>
          <p>{{ notification.mensaje }}</p>
          <div class="notification-footer">
            <span class="time">{{ formatTime(notification.createdAt) }}</span>
            <button 
              v-if="notification.orderCodigo" 
              @click.stop="viewOrder(notification.orderId)"
              class="btn-view-order"
            >
              Ver Pedido
            </button>
          </div>
        </div>

        <div v-if="!notification.leida" class="unread-indicator"></div>
      </div>
    </div>
  </div>
</template>

<script src="./NotificationsPanel.js"></script>
<style src="./NotificationsPanel.css"></style>
