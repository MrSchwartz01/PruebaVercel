<template>
  <div>
    <HeaderAnth
      :searchQuery="searchQuery"
      :isAuthenticated="isAuthenticated"
      @buscar="buscarProductos"
      @cerrar-sesion="cerrarSesion"
    />

    <div class="categorias-container">
      <!-- Sección de productos más vendidos -->
      <div class="top-products-section">
        <h2>Productos Más Vendidos</h2>
        <div class="top-products-grid">
          <div
            v-for="producto in topProductos"
            :key="producto.id"
            class="top-product-card"
          >
            <div class="badge">TOP {{ producto.ranking }}</div>
            <img :src="producto.imagen_url" :alt="producto.nombre" />
            <h3>{{ producto.nombre }}</h3>
            <p class="brand">{{ producto.marca }}</p>
            <p class="price">${{ producto.precio }}</p>
            <p style="font-size: 0.7em; color: #999; margin: 0;">incluido IVA</p>
            <button @click="verDetalle(producto.id)" class="ver-detalle-btn">
              Ver Detalles
            </button>
          </div>
        </div>
      </div>

      <!-- Sección de categorías -->
      <div class="categorias-section">
        <h1>Explora por Categorías</h1>
        <p class="description">
          Encuentra los mejores productos organizados por categorías
        </p>
        <div class="categorias-grid">
          <div
            v-for="categoria in categorias"
            :key="categoria.id"
            class="categoria-card"
            @click="irACategoria(categoria.slug)"
          >
            <div class="categoria-icon" v-html="categoria.icono"></div>
            <h3>{{ categoria.nombre }}</h3>
            <p>{{ categoria.cantidad }} productos</p>
          </div>
        </div>
      </div>
    </div>

    <FooterAnth />
  </div>
</template>

<script src="./CategoriasProductos.js"></script>
<style src="./CategoriasProductos.css"></style>
