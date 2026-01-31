<template>
  <div class="page-layout">
    <HeaderAnth
      :searchQuery="searchQuery"
      :isAuthenticated="isAuthenticated"
      @buscar="buscarProductos"
      @cerrar-sesion="cerrarSesion"
    />

    <!-- Hero Section -->
    <section class="hero-section">
      <h1 class="hero-title">Explora Nuestras Categorías</h1>
      <p class="hero-subtitle">Encuentra los mejores productos organizados para ti</p>
    </section>

    <div class="categorias-container">
      <!-- Sección de productos más vendidos -->
      <div class="top-products-section">
        <div class="section-header">
          <span class="section-badge">🔥 Trending</span>
          <h2>Productos Más Vendidos</h2>
          <p>Los favoritos de nuestros clientes</p>
        </div>
        <div class="top-products-grid">
          <div
            v-for="producto in topProductos"
            :key="producto.id"
            class="top-product-card"
          >
            <div class="badge">TOP {{ producto.ranking }}</div>
            <div class="product-image-wrapper">
              <img :src="producto.imagen_url" :alt="producto.nombre" />
            </div>
            <div class="product-info">
              <span class="brand">{{ producto.marca }}</span>
              <h3>{{ producto.nombre }}</h3>
              <div class="price-container">
                <p class="price">${{ producto.precio }}</p>
                <span class="iva-text">IVA incluido</span>
              </div>
              <button @click="verDetalle(producto.id)" class="ver-detalle-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Ver Detalles
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de categorías -->
      <div class="categorias-section">
        <div class="section-header">
          <span class="section-badge">📦 Categorías</span>
          <h2>Navega por Categoría</h2>
          <p>Selecciona una categoría para explorar productos</p>
        </div>
        <div class="categorias-grid">
          <div
            v-for="categoria in categorias"
            :key="categoria.id"
            class="categoria-card"
            @click="irACategoria(categoria.slug)"
          >
            <div class="categoria-icon-wrapper">
              <div class="categoria-icon" v-html="categoria.icono"></div>
            </div>
            <div class="categoria-info">
              <h3>{{ categoria.nombre }}</h3>
              <span class="producto-count">{{ categoria.cantidad }} productos</span>
            </div>
            <div class="categoria-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <FooterAnth />
  </div>
</template>

<script src="./CategoriasProductos.js"></script>
<style src="./CategoriasProductos.css"></style>
