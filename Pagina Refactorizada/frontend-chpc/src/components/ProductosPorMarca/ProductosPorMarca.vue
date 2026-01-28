<template>
    <div>
      <HeaderAnth :isAuthenticated="isAuthenticated" @cerrar-sesion="cerrarSesion" />
  
      <div class="productos-container">
        <div class="home-container">
          <h1 class="animated-title">Productos de {{ nombreMarca }}</h1>
          <p class="animated-subtitle">Explora nuestra selección exclusiva.</p>
          
          <!-- Estado de carga -->
          <div v-if="cargando" class="cargando">
            <p>⏳ Cargando productos...</p>
          </div>
          
          <!-- Mensaje de error -->
          <div v-else-if="error" class="error-message">
            <p>⚠️ {{ error }}</p>
            <button @click="$router.push('/marcas')" class="btn-volver">
              Volver a Marcas
            </button>
          </div>
          
          <!-- Grid de productos -->
          <div v-else-if="productos.length > 0" class="product-grid">
            <div
              v-for="producto in productos"
              :key="producto.id"
              class="product-card"
            >
              <div class="product-image">
                <img
                  :src="producto.imagen_url"
                  :alt="producto.nombre_producto"
                  loading="lazy"
                />
              </div>
    <h3>{{ producto.nombre_producto }}</h3>
    <p>{{ producto.descripcion }}</p>
    <p class="precio">Precio: ${{ producto.precio }}</p>
    <p style="font-size: 0.75em; color: #999; margin: 0;">incluido IVA</p>
    
    <!-- Mostrar stock disponible -->
    <p class="stock" :class="{ 'sin-stock': producto.stock === 0, 'pocas-unidades': producto.stock > 0 && producto.stock <= 5 }">
      <strong>Stock:</strong> {{ obtenerTextoStock(producto.stock) }}
    </p>
  
    <button @click="verDetalle(producto.id)">Ver Detalles</button>
  </div>
  
          </div>
          
          <!-- Sin resultados -->
          <div v-else class="sin-resultados">
            <p>🔍 No hay productos disponibles de esta marca actualmente.</p>
          </div>
          
        </div>
      </div>
  
      <ContactoAsesor />
      <FooterAnth />
    </div>
  </template>
  <script src="./ProductosPorMarca.js"></script>
  <style src="./ProductosPorMarca.css"></style>