<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1>ASUS TUF GAMING F15</h1>
            <div class="warranty-badge">
              <svg width="60" height="60" fill="none" stroke="#ffa726" stroke-width="2">
                <path d="M30 10L35 20L45 22L37.5 30L39 40L30 35L21 40L22.5 30L15 22L25 20L30 10Z"/>
              </svg>
              <div class="warranty-text">
                <span class="warranty-years">2</span>
                <span class="warranty-label">AÑOS<br/>DE GARANTÍA</span>
              </div>
            </div>
            <p class="hero-description">Potencia extrema para gaming profesional con las últimas tecnologías</p>
            <div class="hero-buttons">
              <router-link to="/productos" class="btn btn-primary-large">Ver Productos</router-link>
              <button class="btn btn-secondary-large">Más Información</button>
            </div>
          </div>
          <div class="hero-image">
            <img src="/modern-gaming-laptop-asus-tuf-with-rgb-keyboard-on.jpg" alt="ASUS TUF Gaming F15" />
          </div>
        </div>
      </div>
    </section>

    <!-- Welcome Section -->
    <section class="welcome-section">
      <div class="container">
        <h2>Bienvenidos a Nuestra Tienda</h2>
        <p>Explora nuestros productos y encuentra lo que necesitas.</p>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="products-section">
      <div class="container">
        <div class="product-grid">
          <div 
            v-for="(product, index) in products" 
            :key="product.id"
            class="product-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <span v-if="product.discount" class="discount-badge">-{{ product.discount }}%</span>
            </div>
            <h3>{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-price">
              <span v-if="product.oldPrice" class="old-price">${{ product.oldPrice }}</span>
              <span class="current-price">${{ product.price }}</span>
            </div>
            <button class="btn btn-add-cart">Agregar al Carrito</button>
          </div>
        </div>

        <button class="cargar-mas">Cargar Más Productos</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const products = ref([
  {
    id: 1,
    name: 'Laptop Gaming ASUS ROG',
    description: 'Intel Core i7, RTX 3060, 16GB RAM',
    price: '1299.99',
    oldPrice: '1499.99',
    discount: 13,
    image: '/gaming-laptop.png'
  },
  {
    id: 2,
    name: 'Monitor UltraWide 34"',
    description: '3440x1440, 144Hz, IPS',
    price: '599.99',
    image: '/ultrawide-monitor-setup.png'
  },
  {
    id: 3,
    name: 'Teclado Mecánico RGB',
    description: 'Cherry MX Red, Retroiluminado',
    price: '129.99',
    image: '/mechanical-keyboard-rgb.jpg'
  },
  {
    id: 4,
    name: 'Mouse Gaming Inalámbrico',
    description: '16000 DPI, RGB, Recargable',
    price: '79.99',
    oldPrice: '99.99',
    discount: 20,
    image: '/gaming-mouse.png'
  }
])
</script>
