<template>
  <div class="panel-vendedores">
    <!-- Encabezado -->
    <div class="panel-header">
      <h1>Panel de Gestión de Pedidos</h1>
      <div class="header-stats">
        <div class="stat-card">
          <span class="stat-label">Pendientes</span>
          <span class="stat-value">{{ estadisticas.pendientes }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">En Trámite</span>
          <span class="stat-value">{{ estadisticas.enTramite }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Atendidos</span>
          <span class="stat-value">{{ estadisticas.atendidos }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Mis Pedidos</span>
          <span class="stat-value">{{ estadisticas.misPedidos }}</span>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filtros">
      <button @click="irAInicio" class="btn-volver-inicio">
        ← Volver al Inicio
      </button>
      <div class="filtro-grupo">
        <label>Filtrar por estado:</label>
        <select v-model="filtroEstado" class="filtro-select">
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_TRAMITE">En Trámite</option>
          <option value="ATENDIDO">Atendido</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>
      <div class="filtro-grupo">
        <label>Vista:</label>
        <select v-model="vistaActual" class="filtro-select">
          <option value="todos">Todos los pedidos</option>
          <option value="mis-pedidos">Mis pedidos asignados</option>
          <option value="disponibles">Pedidos disponibles</option>
        </select>
      </div>
      <button @click="cargarPedidos" class="btn-refrescar">
        🔄 Refrescar
      </button>
    </div>

    <!-- Spinner de carga -->
    <div v-if="cargando" class="spinner-container">
      <div class="spinner"></div>
      <p>Cargando pedidos...</p>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="mensaje-error">
      {{ error }}
    </div>

    <!-- Lista de pedidos -->
    <div v-if="!cargando && !error" class="pedidos-lista">
      <div
        v-for="pedido in pedidosFiltrados"
        :key="pedido.id"
        class="pedido-card"
        :class="'estado-' + pedido.estado_gestion.toLowerCase()"
      >
        <!-- Encabezado del pedido -->
        <div class="pedido-header">
          <div class="pedido-info-principal">
            <h3>{{ pedido.codigo }}</h3>
            <span class="pedido-fecha">
              {{ formatearFecha(pedido.createdAt) }}
            </span>
          </div>
          <div class="pedido-badges">
            <span class="badge" :class="'badge-' + pedido.estado_gestion.toLowerCase()">
              {{ obtenerTextoEstado(pedido.estado_gestion) }}
            </span>
            <span v-if="pedido.vendedor_nombre" class="badge badge-vendedor">
              👤 {{ pedido.vendedor_nombre }}
            </span>
          </div>
        </div>

        <!-- Información del cliente -->
        <div class="pedido-cliente">
          <p><strong>Cliente:</strong> {{ pedido.nombre_cliente }}</p>
          <p><strong>Email:</strong> {{ pedido.email_cliente }}</p>
          <p v-if="pedido.telefono"><strong>Teléfono:</strong> {{ pedido.telefono }}</p>
          <p><strong>Dirección:</strong> {{ pedido.direccion_envio }}</p>
        </div>

        <!-- Productos -->
        <div class="pedido-productos">
          <h4>Productos ({{ pedido.totalItems }})</h4>
          <div class="producto-item" v-for="item in pedido.items" :key="item.id">
            <span class="producto-nombre">{{ item.nombre }}</span>
            <span class="producto-cantidad">x{{ item.cantidad }}</span>
            <span class="producto-precio">${{ item.precio.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Total -->
        <div class="pedido-total">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${{ pedido.subtotal.toFixed(2) }}</span>
          </div>
          <div v-if="pedido.descuento > 0" class="total-row">
            <span>Descuento:</span>
            <span>-${{ pedido.descuento.toFixed(2) }}</span>
          </div>
          <div class="total-row total-final">
            <span>Total:</span>
            <span>${{ pedido.total.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Observaciones -->
        <div v-if="pedido.observaciones" class="pedido-observaciones">
          <strong>Observaciones:</strong>
          <p>{{ pedido.observaciones }}</p>
        </div>

        <!-- Acciones -->
        <div class="pedido-acciones">
          <!-- Botón para asignar/tomar pedido -->
          <button
            v-if="!pedido.vendedor_id"
            @click="asignarPedido(pedido.id)"
            class="btn btn-primary"
          >
            📌 Tomar Pedido
          </button>

          <!-- Botón para desasignar -->
          <button
            v-if="pedido.vendedor_id && (esAdmin || pedido.vendedor_id === usuarioId)"
            @click="desasignarPedido(pedido.id)"
            class="btn btn-secondary"
          >
            🔓 Liberar Pedido
          </button>

          <!-- Selector de estado (solo para pedidos asignados al vendedor o admin) -->
          <div
            v-if="pedido.vendedor_id && (esAdmin || pedido.vendedor_id === usuarioId)"
            class="estado-selector"
          >
            <label>Cambiar estado:</label>
            <select
              :value="pedido.estado_gestion"
              @change="cambiarEstado(pedido.id, $event.target.value)"
              class="estado-select"
            >
              <option value="PENDIENTE">⏳ Pendiente</option>
              <option value="EN_TRAMITE">🔄 En Trámite</option>
              <option value="ATENDIDO">✅ Atendido</option>
              <option value="CANCELADO">❌ Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay pedidos -->
      <div v-if="pedidosFiltrados.length === 0" class="sin-pedidos">
        <p>📭 No hay pedidos que mostrar con los filtros seleccionados</p>
      </div>
    </div>
  </div>
</template>
<script>
  import axios from 'axios';
  
  export default {
    name: 'PanelVendedores',
    data() {
      return {
        pedidos: [],
        cargando: false,
        error: null,
        filtroEstado: '',
        vistaActual: 'todos',
        usuarioId: null,
        usuarioNombre: '',
        esAdmin: false,
        intervalo: null,
      };
    },
    computed: {
      pedidosFiltrados() {
        let resultado = [...this.pedidos];
  
        // Filtrar por estado
        if (this.filtroEstado) {
          resultado = resultado.filter(p => p.estado_gestion === this.filtroEstado);
        }
  
        // Filtrar por vista
        if (this.vistaActual === 'mis-pedidos') {
          resultado = resultado.filter(p => p.vendedor_id === this.usuarioId);
        } else if (this.vistaActual === 'disponibles') {
          resultado = resultado.filter(p => !p.vendedor_id);
        }
  
        return resultado;
      },
      estadisticas() {
        return {
          pendientes: this.pedidos.filter(p => p.estado_gestion === 'PENDIENTE').length,
          enTramite: this.pedidos.filter(p => p.estado_gestion === 'EN_TRAMITE').length,
          atendidos: this.pedidos.filter(p => p.estado_gestion === 'ATENDIDO').length,
          misPedidos: this.pedidos.filter(p => p.vendedor_id === this.usuarioId).length,
        };
      },
    },
    methods: {
      irAInicio() {
        this.$router.push('/home');
      },
      async cargarPedidos() {
        this.cargando = true;
        this.error = null;
        try {
          const token = localStorage.getItem('access_token');
          const response = await axios.get(
            `${process.env.VUE_APP_API_URL || 'http://localhost:5000/api'}/ordenes/panel/todas`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          this.pedidos = response.data;
        } catch (err) {
          console.error('Error al cargar pedidos:', err);
          this.error = err.response?.data?.message || 'Error al cargar los pedidos';
        } finally {
          this.cargando = false;
        }
      },
      async asignarPedido(pedidoId) {
        try {
          const token = localStorage.getItem('access_token');
          await axios.post(
            `${process.env.VUE_APP_API_URL || 'http://localhost:5000/api'}/ordenes/${pedidoId}/asignar`,
            {
              vendedor_nombre: this.usuarioNombre,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          await this.cargarPedidos();
          this.$toast?.success('Pedido asignado exitosamente');
        } catch (err) {
          console.error('Error al asignar pedido:', err);
          alert(err.response?.data?.message || 'Error al asignar el pedido');
        }
      },
      async desasignarPedido(pedidoId) {
        if (!confirm('¿Estás seguro de que deseas liberar este pedido?')) {
          return;
        }
        try {
          const token = localStorage.getItem('access_token');
          await axios.delete(
            `${process.env.VUE_APP_API_URL || 'http://localhost:5000/api'}/ordenes/${pedidoId}/desasignar`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          await this.cargarPedidos();
          this.$toast?.success('Pedido liberado exitosamente');
        } catch (err) {
          console.error('Error al desasignar pedido:', err);
          alert(err.response?.data?.message || 'Error al liberar el pedido');
        }
      },
      async cambiarEstado(pedidoId, nuevoEstado) {
        try {
          const token = localStorage.getItem('access_token');
          await axios.patch(
            `${process.env.VUE_APP_API_URL || 'http://localhost:5000/api'}/ordenes/${pedidoId}/estado-gestion`,
            {
              estado_gestion: nuevoEstado,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          await this.cargarPedidos();
          this.$toast?.success('Estado actualizado exitosamente');
        } catch (err) {
          console.error('Error al cambiar estado:', err);
          alert(err.response?.data?.message || 'Error al cambiar el estado');
        }
      },
      obtenerTextoEstado(estado) {
        const estados = {
          PENDIENTE: '⏳ Pendiente',
          EN_TRAMITE: '🔄 En Trámite',
          ATENDIDO: '✅ Atendido',
          CANCELADO: '❌ Cancelado',
        };
        return estados[estado] || estado;
      },
      formatearFecha(fecha) {
        return new Date(fecha).toLocaleString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
      async cargarDatosUsuario() {
        // Primero intentar cargar desde localStorage
        const usuarioGuardado = localStorage.getItem('usuario');
        if (usuarioGuardado) {
          const usuario = JSON.parse(usuarioGuardado);
          this.usuarioId = usuario.id;
          this.usuarioNombre = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
          this.esAdmin = usuario.rol === 'administrador';
          return;
        }
  
        // Si no está en localStorage, cargar desde la API
        try {
          const token = localStorage.getItem('access_token');
          const response = await axios.get(
            `${process.env.VUE_APP_API_URL || 'http://localhost:5000/api'}/usuarios/perfil`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          const usuario = response.data;
          this.usuarioId = usuario.id;
          this.usuarioNombre = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
          this.esAdmin = usuario.rol === 'administrador';
          
          // Guardar en localStorage para próximas veces
          localStorage.setItem('usuario', JSON.stringify(usuario));
          localStorage.setItem('user_id', usuario.id);
          localStorage.setItem('user_rol', usuario.rol);
        } catch (error) {
          console.error('Error al cargar datos del usuario:', error);
          this.error = 'No se pudieron cargar los datos del usuario';
        }
      },
    },
    async mounted() {
      await this.cargarDatosUsuario();
      this.cargarPedidos();
      // Refrescar cada 30 segundos
      this.intervalo = setInterval(() => {
        this.cargarPedidos();
      }, 45000);
    },
    beforeUnmount() {
      if (this.intervalo) {
        clearInterval(this.intervalo);
      }
    },
  };
  
</script>
<style src="./PanelVendedores.css" scoped></style>