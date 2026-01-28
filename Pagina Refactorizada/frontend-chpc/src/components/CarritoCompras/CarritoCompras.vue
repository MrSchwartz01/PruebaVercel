<template>
  <div>
    <HeaderAnth
      :searchQuery="searchQuery"
      :isAuthenticated="isAuthenticated"
      @buscar="buscarProductos"
      @cerrar-sesion="cerrarSesion"
    />

    <div class="carrito-wrapper">
      <!-- Header del carrito -->
      <div class="carrito-header">
        <div class="carrito-header-content">
          <h1>Carrito de Compras</h1>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="carrito-container">
        <!-- Carrito vacío -->
        <div v-if="productosCarrito.length === 0" class="carrito-vacio">
          <div class="vacio-icon">🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p>Agrega productos para comenzar tu compra</p>
          <button @click="irAInicio" class="btn-explorar">
            Continuar Comprando
          </button>
        </div>

        <!-- Carrito con productos -->
        <div v-else class="carrito-content">
          <!-- Sección de productos -->
          <div class="productos-section">
            <div class="productos-header">
              <span>Tienes {{ productosCarrito.length }} {{ productosCarrito.length === 1 ? 'artículo' : 'artículos' }} en tu carrito</span>
            </div>

            <div class="productos-list">
              <div
                v-for="item in productosCarrito"
                :key="item.id"
                class="producto-item"
              >
                <div class="item-image-wrapper">
                  <img :src="item.imagen_url" :alt="item.nombre" class="item-image" />
                </div>

                <div class="item-details">
                  <h3 class="item-name">{{ item.nombre }}</h3>
                  <p class="item-brand">{{ item.marca }}</p>
                  <p class="item-meta">Disponible</p>
                  <p class="item-price">${{ item.precio }}</p>
                </div>

                <div class="item-actions">
                  <div class="quantity-control">
                    <button @click="disminuirCantidad(item.id)" class="qty-btn" title="Disminuir cantidad">−</button>
                    <span class="qty-display">{{ item.cantidad }}</span>
                    <button @click="aumentarCantidad(item.id)" class="qty-btn" title="Aumentar cantidad">+</button>
                  </div>

                  <div class="action-buttons">
                    <button @click="eliminarProducto(item.id)" class="btn-action delete-btn">
                      Eliminar
                    </button>
                    <button class="btn-action save-btn">
                      Guardar para después
                    </button>
                  </div>
                </div>

                <div class="item-subtotal">
                  <p class="subtotal-value">${{ calcularSubtotal(item) }}</p>
                </div>
              </div>
            </div>

            <!-- Sección de información adicional -->
            <div class="info-boxes">
              <div class="info-card">
                <h3>Información de Envío</h3>
                <p>Envío gratis en compras mayores a $100</p>
                <p>Entrega en 2-5 días hábiles</p>
              </div>

              <div class="info-card">
                <h3>Métodos de Pago</h3>
                <p>Aceptamos todas las tarjetas de crédito y débito</p>
                <p>Transferencias bancarias</p>
              </div>
            </div>
          </div>

          <!-- Resumen de compra (sidebar) -->
          <div class="resumen-section">
            <div class="resumen-card">
              <h2>Subtotal del pedido</h2>

              <div class="resumen-rows">
                <div class="resumen-linea">
                  <span>Subtotal:</span>
                  <span>${{ subtotal.toFixed(2) }}</span>
                </div>

                <div class="resumen-linea">
                  <span>IVA (15%):</span>
                  <span>${{ iva.toFixed(2) }}</span>
                </div>

                <div class="resumen-linea">
                  <span>Envío:</span>
                  <span>${{ envio.toFixed(2) }}</span>
                </div>

                <div class="resumen-linea total">
                  <span>Total:</span>
                  <span>${{ total.toFixed(2) }}</span>
                </div>
              </div>

              <button @click="procederCompra" class="btn-checkout">
                Proceder al Pago
              </button>

              <button @click="vaciarCarrito" class="btn-vaciar">
                Vaciar Carrito
              </button>

              <p class="disclaimer">
                Los precios incluyen IVA. El costo del envío se calcula en el siguiente paso.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Checkout -->
      <div v-if="mostrarCheckout" class="checkout-modal" @click.self="cancelarCheckout">
        <div class="checkout-content">
          <div class="checkout-header">
            <h2>Completar Pedido</h2>
            <button @click="cancelarCheckout" class="btn-cerrar">✕</button>
          </div>

          <form @submit.prevent="finalizarCompra" class="checkout-form">
            <div class="form-section">
              <h3>Información de Envío</h3>

              <div class="form-group">
                <label>Nombre Completo *</label>
                <input 
                  v-model="datosEnvio.nombre_cliente" 
                  type="text" 
                  required 
                  placeholder="Juan Pérez"
                />
              </div>

              <div class="form-group">
                <label>Email *</label>
                <input 
                  v-model="datosEnvio.email_cliente" 
                  type="email" 
                  required 
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div class="form-group">
                <label>Teléfono</label>
                <input 
                  v-model="datosEnvio.telefono" 
                  type="tel" 
                  placeholder="0999-999-999"
                />
              </div>

              <div class="form-group">
                <label>Dirección de Envío *</label>
                <textarea 
                  v-model="datosEnvio.direccion_envio" 
                  required 
                  rows="3"
                  placeholder="Calle, número, ciudad, provincia"
                ></textarea>
              </div>
            </div>

            <div class="info-box">
              <div class="info-icon">📞</div>
              <div class="info-content">
                <h4>Atención Personalizada</h4>
                <p>Tu pedido será procesado por uno de nuestros vendedores, quien se pondrá en contacto contigo para coordinar el pago y la entrega.</p>
              </div>
            </div>

            <div class="checkout-resumen">
              <h3>Resumen del Pedido</h3>
              <div class="resumen-linea">
                <span>Subtotal:</span>
                <span>${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="resumen-linea">
                <span>IVA (15%):</span>
                <span>${{ iva.toFixed(2) }}</span>
              </div>
              <div class="resumen-linea">
                <span>Envío:</span>
                <span>${{ envio.toFixed(2) }}</span>
              </div>
              <div class="resumen-linea total">
                <span>TOTAL:</span>
                <span>${{ total.toFixed(2) }}</span>
              </div>
            </div>

            <div class="checkout-actions">
              <button type="submit" class="btn-confirmar" :disabled="procesandoPago">
                {{ procesandoPago ? 'Enviando Pedido...' : 'Confirmar Pedido' }}
              </button>
              <button type="button" @click="cancelarCheckout" class="btn-cancelar">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <FooterAnth />
  </div>
</template>

<script src="./CarritoCompras.js"></script>
<style src="./CarritoCompras.css"></style>