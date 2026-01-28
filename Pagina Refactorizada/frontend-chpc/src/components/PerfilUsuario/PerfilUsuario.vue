<template>
  <div>
    <HeaderAnth
      :searchQuery="searchQuery"
      :isAuthenticated="isAuthenticated"
      @buscar="buscarProductos"
      @cerrar-sesion="cerrarSesion"
    />

    <div class="perfil-usuario-container">
      <div class="perfil-header">
        <h1>Mi Perfil</h1>
        <p class="breadcrumb">
          <router-link to="/home">Inicio</router-link> /
          <span>Mi Perfil</span>
        </p>
      </div>

      <div class="perfil-content">
        <!-- Menú lateral -->
        <aside class="perfil-sidebar">
          <nav class="perfil-nav">
            <button 
              :class="['nav-item', { active: vistaActual === 'datos' }]"
              @click="vistaActual = 'datos'"
            >
              👤 Datos Personales
            </button>
            <button 
              :class="['nav-item', { active: vistaActual === 'seguridad' }]"
              @click="vistaActual = 'seguridad'"
            >
              🔒 Seguridad
            </button>
            <button 
              :class="['nav-item', { active: vistaActual === 'pedidos' }]"
              @click="vistaActual = 'pedidos'"
            >
              📦 Mis Pedidos
            </button>
          </nav>
        </aside>

        <!-- Contenido principal -->
        <div class="perfil-main">
          <!-- Datos Personales -->
          <div v-if="vistaActual === 'datos'" class="seccion-contenido">
            <h2>Datos Personales</h2>
            <form @submit.prevent="actualizarDatos" class="perfil-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="nombre">Nombre *</label>
                  <input
                    type="text"
                    id="nombre"
                    v-model="formData.nombre"
                    required
                    :disabled="!modoEdicion"
                  />
                </div>
                <div class="form-group">
                  <label for="apellido">Apellido *</label>
                  <input
                    type="text"
                    id="apellido"
                    v-model="formData.apellido"
                    required
                    :disabled="!modoEdicion"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="username">Nombre de Usuario *</label>
                  <input
                    type="text"
                    id="username"
                    v-model="formData.username"
                    required
                    :disabled="!modoEdicion"
                  />
                </div>
                <div class="form-group">
                  <label for="email">Correo Electrónico *</label>
                  <input
                    type="email"
                    id="email"
                    v-model="formData.email"
                    required
                    :disabled="!modoEdicion"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="telefono">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    v-model="formData.telefono"
                    :disabled="!modoEdicion"
                    placeholder="0999999999"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="direccion">Dirección</label>
                <textarea
                  id="direccion"
                  v-model="formData.direccion"
                  :disabled="!modoEdicion"
                  rows="3"
                  placeholder="Ingresa tu dirección completa"
                ></textarea>
              </div>

              <div class="form-actions">
                <button
                  v-if="!modoEdicion"
                  type="button"
                  @click="habilitarEdicion"
                  class="btn-editar"
                >
                  ✏️ Editar Información
                </button>
                <template v-else>
                  <button type="submit" class="btn-guardar" :disabled="guardando">
                    {{ guardando ? 'Guardando...' : '💾 Guardar Cambios' }}
                  </button>
                  <button type="button" @click="cancelarEdicion" class="btn-cancelar">
                    ❌ Cancelar
                  </button>
                </template>
              </div>

              <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
                {{ mensaje }}
              </div>
            </form>
          </div>

          <!-- Seguridad -->
          <div v-if="vistaActual === 'seguridad'" class="seccion-contenido">
            <h2>Cambiar Contraseña</h2>
            <form @submit.prevent="cambiarContrasena" class="perfil-form">
              <div class="form-group">
                <label for="passwordActual">Contraseña Actual *</label>
                <input
                  type="password"
                  id="passwordActual"
                  v-model="passwordData.actual"
                  required
                />
              </div>

              <div class="form-group">
                <label for="passwordNueva">Nueva Contraseña *</label>
                <input
                  type="password"
                  id="passwordNueva"
                  v-model="passwordData.nueva"
                  required
                  minlength="6"
                />
                <small>Mínimo 6 caracteres</small>
              </div>

              <div class="form-group">
                <label for="passwordConfirmar">Confirmar Nueva Contraseña *</label>
                <input
                  type="password"
                  id="passwordConfirmar"
                  v-model="passwordData.confirmar"
                  required
                />
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-guardar" :disabled="guardando">
                  {{ guardando ? 'Guardando...' : '🔒 Cambiar Contraseña' }}
                </button>
              </div>

              <div v-if="mensajePassword" :class="['mensaje', mensajePasswordTipo]">
                {{ mensajePassword }}
              </div>
            </form>
          </div>

          <!-- Mis Pedidos -->
          <div v-if="vistaActual === 'pedidos'" class="seccion-contenido">
            <h2>Historial de Pedidos</h2>
            
            <div v-if="cargandoPedidos" class="loading">
              <p>Cargando pedidos...</p>
            </div>

            <div v-else-if="pedidos.length === 0" class="no-pedidos">
              <p>Aún no has realizado ningún pedido.</p>
              <router-link to="/productos" class="btn-comprar">
                🛍️ Comenzar a Comprar
              </router-link>
            </div>

            <div v-else class="pedidos-lista">
              <div v-for="pedido in pedidos" :key="pedido.id" class="pedido-card">
                <div class="pedido-header">
                  <h3>Pedido #{{ pedido.codigo }}</h3>
                  <span :class="['estado-badge', getEstadoClass(pedido.status)]">
                    {{ getEstadoTexto(pedido.status) }}
                  </span>
                </div>
                <div class="pedido-info">
                  <p><strong>Fecha:</strong> {{ formatearFecha(pedido.createdAt) }}</p>
                  <p><strong>Total:</strong> ${{ pedido.total.toFixed(2) }}</p>
                  <p><strong>Artículos:</strong> {{ pedido.totalItems }}</p>
                  <p><strong>Método de pago:</strong> {{ getMetodoPago(pedido.paymentMethod) }}</p>
                </div>
                <button @click="verDetallePedido(pedido.id)" class="btn-ver-detalle">
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <FooterAnth />
  </div>
</template>

<script src="./PerfilUsuario.js"></script>
<style src="./PerfilUsuario.css"></style>
