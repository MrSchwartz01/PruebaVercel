<template>
    <HeaderAnth
      :searchQuery="searchQuery"
      :isAuthenticated="isAuthenticated"
      @buscar="buscarProductos"
      @cerrar-sesion="cerrarSesion"
    />
    <br />
    <br />
    <br />
  
    <div class="producto-contenedor">
      <!-- Mensaje de carga -->
      <div v-if="isLoading" class="mensaje-carga">
        <p>Cargando detalles del producto...</p>
      </div>
  
      <!-- Mensaje de error con botón de recarga -->
      <div v-if="errorMessage && !isLoading" class="mensaje-error">
        <p>{{ errorMessage }}</p>
        <button @click="recargarProducto" class="boton-recargar">Reintentar</button>
      </div>
  
      <!-- Mensaje de no autenticado -->
      <div v-if="!isAuthenticated" class="mensaje-error">
        <p>Por favor, inicie sesión para ver los detalles del producto.</p>
        <button @click="redirigirLogin" class="boton-recargar">Iniciar sesión</button>
      </div>
  
  <!-- Detalles del producto -->
  <div
    v-if="producto && !isLoading && !errorMessage && isAuthenticated"
    class="producto-detalles"
  >
    <div class="detalle-contenedor">
      <!-- Imagen del producto (Izquierda) -->
      <div class="imagen-producto-wrapper">
        <!-- Carousel de imágenes -->
        <div class="carousel-container">
          <img
            :src="imagenPrincipal"
            :alt="producto.producto"
            class="imagen-producto-principal"
            @click="abrirZoom"
            @error="handleImageError"
            style="cursor: zoom-in;"
          />
          
          <!-- Botones de navegación (solo si hay más de 1 imagen) -->
          <div v-if="imagenes.length > 1" class="carousel-controls">
            <button @click="imagenAnterior" class="carousel-btn prev-btn" aria-label="Imagen anterior">
              &#8249;
            </button>
            <button @click="siguienteImagen" class="carousel-btn next-btn" aria-label="Siguiente imagen">
              &#8250;
            </button>
          </div>

          <!-- Indicadores de posición -->
          <div v-if="imagenes.length > 1" class="carousel-indicators">
            <span 
              v-for="(img, index) in imagenes" 
              :key="index"
              :class="['indicator', { active: index === currentImageIndex }]"
              @click="seleccionarImagen(index)"
            ></span>
          </div>
        </div>

        <!-- Miniaturas de imágenes -->
        <div v-if="imagenes.length > 1" class="imagenes-thumbnails">
          <div 
            v-for="(img, index) in imagenes" 
            :key="index"
            :class="['thumbnail', { active: index === currentImageIndex }]"
            @click="seleccionarImagen(index)"
          >
            <img :src="img.ruta_imagen" :alt="`Vista ${index + 1}`" />
          </div>
        </div>

        <p class="zoom-hint">Clic para ampliar</p>
      </div>

      <!-- Información del producto (Derecha) -->
      <div class="informacion-producto">
        <h1 class="nombre-producto">{{ producto.producto }}</h1>
        
        <!-- Recuadro unificado de detalles -->
        <div class="detalles-compactos">
          <div class="detalle-item-compacto" v-if="producto.codigo">
            <strong>Código:</strong>
            <span>{{ producto.codigo }}</span>
          </div>

          <div class="detalle-item-compacto" v-if="producto.marca">
            <strong>Marca:</strong>
            <span>{{ producto.marca }}</span>
          </div>

          <div class="detalle-item-garantia">
            <strong>Garantía:</strong>
            <div class="garantia-detalle">
              <span class="garantia-tiempo">
                {{ garantiaProducto.meses >= 12 
                   ? Math.floor(garantiaProducto.meses / 12) + (Math.floor(garantiaProducto.meses / 12) === 1 ? ' año' : ' años')
                   : garantiaProducto.meses + ' meses' 
                }}
              </span>
              <p class="garantia-mensaje">{{ garantiaProducto.mensaje }}</p>
            </div>
          </div>

          <div class="detalle-item-compacto" v-if="producto.medida">
            <strong>Medida:</strong>
            <span>{{ producto.medida }}</span>
          </div>

          <div class="detalle-item-compacto stock-info">
            <strong>Stock:</strong>
            <span :class="{'stock-disponible': parseInt(producto.existenciaTotal) > 0, 'stock-agotado': parseInt(producto.existenciaTotal) === 0, 'pocas-unidades': parseInt(producto.existenciaTotal) > 0 && parseInt(producto.existenciaTotal) <= 5}">
              {{ mostrarStock }}
            </span>
          </div>
        </div>

        <!-- Precio y Botones de acción -->
        <div class="precio-y-acciones">
          <!-- Precio -->
          <div class="precio-contenedor">
            <div class="precio-wrapper">
              <span class="precio-label">Precio:</span>
              <span class="precio-valor">USD ${{ formatPrice(producto.costoTotal) }}</span>
            </div>
            <p style="font-size: 0.7em; color: rgba(255,255,255,0.9); margin: 2px 0 0 0; text-align: center;">incluido IVA</p>
          </div>

          <!-- Botones de acción -->
          <div class="botones-accion">
          <button 
            @click="agregarAlCarrito" 
            class="boton-agregar-carrito"
            :disabled="parseInt(producto.existenciaTotal) <= 0"
          >
            <i class="fas fa-shopping-cart"></i> 
            {{ parseInt(producto.existenciaTotal) > 0 ? 'Agregar al Carrito' : 'Sin Stock' }}
          </button>
          <a href="https://wa.me/593995924867" target="_blank" class="boton-whatsapp">
            <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
          </a>
        </div>
        </div>
      </div>
    </div>
  </div>
  </div>
  
    <!-- Modal de zoom para imagen -->
    <div v-if="zoomActivo" class="modal-zoom" @click="cerrarZoom">
      <div class="modal-zoom-contenido">
        <button class="btn-cerrar-zoom" @click="cerrarZoom">&times;</button>
        <img :src="imagenPrincipal" :alt="producto.producto" class="imagen-zoom" />
      </div>
    </div>

    <br>
    <br>

    <!-- Productos Relacionados -->
    <div v-if="producto && productosRelacionados && productosRelacionados.length > 0" class="productos-relacionados-container">
      <div class="productos-relacionados-section">
        <h3 class="titulo-relacionados">Productos Relacionados</h3>
        <div class="productos-relacionados-grid">
          <div 
            v-for="productoRel in productosRelacionados" 
            :key="productoRel.codigo"
            class="producto-relacionado-card"
            @click="verProducto(productoRel.codigo)"
          >
            <img 
              :src="productoRel.imagen_url || '/Productos/placeholder-product.png'" 
              :alt="productoRel.producto"
              class="producto-relacionado-img"
            />
            <div class="producto-relacionado-info">
              <h4 class="producto-relacionado-nombre">{{ productoRel.producto }}</h4>
              <p class="producto-relacionado-precio">USD ${{ formatPrice(productoRel.costoTotal) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <br>
    <br>
  
    <ContactoAsesor />
    <FooterAnth />
  </template>
  
  <script src="./ProductoDetalle.js"></script>
  <style src="./ProductoDetalle.css"></style>  