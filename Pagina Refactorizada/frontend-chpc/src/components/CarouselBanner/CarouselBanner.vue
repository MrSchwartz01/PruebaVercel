<template>
    <div class="carousel-banner">
      <div v-if="banners.length" class="carousel">
        <div
          v-for="(banner, index) in banners"
          :key="banner.id"
          class="carousel-item"
          :class="{ active: activeBanner === index, clickable: banner.producto_id }"
          @click="handleBannerClick(banner)"
        >
          <img
            :src="banner.imagen_url"
            :alt="banner.titulo"
            class="banner-image"
            @load="handleImageLoad"
          />
          <!-- Indicador visual de que es clickeable -->
          <div v-if="banner.producto_id" class="click-indicator">
            <span class="click-icon">🛒</span>
            <span class="click-text">Click para ver producto</span>
          </div>
        </div>
  
        <!-- Controles del carrusel -->
        <button class="carousel-arrow left" @click="prevBanner">&#10094;</button>
        <button class="carousel-arrow right" @click="nextBanner">&#10095;</button>
  
        <!-- Indicadores -->
        <div class="carousel-indicators">
          <span
            v-for="(banner, index) in banners"
            :key="index"
            :class="{ active: activeBanner === index }"
            @click="setBanner(index)"
          ></span>
        </div>
      </div>
  
      <div v-else class="no-banners">
        <p>No hay banners disponibles.</p>
      </div>
    </div>
  </template>

<script>
export default {
  name: "CarouselBanner",
  props: {
    banners: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      activeBanner: 0,
      intervalId: null,
    };
  },
  watch: {
    banners: {
      handler(newBanners) {
        if (newBanners && newBanners.length > 0) {
          this.stopCarousel();
          this.activeBanner = 0;
          this.startCarousel();
        }
      },
      immediate: false,
    },
  },
  mounted() {
    this.startCarousel();
  },
  beforeUnmount() {
    this.stopCarousel();
  },
  methods: {
    startCarousel() {
      if (this.banners && this.banners.length > 0) {
        this.intervalId = setInterval(() => {
          this.nextBanner();
        }, 5000); // Cambiar cada 5 segundos
      }
    },
    stopCarousel() {
      if (this.intervalId) clearInterval(this.intervalId);
    },
    prevBanner() {
      this.activeBanner =
        (this.activeBanner - 1 + this.banners.length) % this.banners.length;
    },
    nextBanner() {
      this.activeBanner = (this.activeBanner + 1) % this.banners.length;
    },
    setBanner(index) {
      this.activeBanner = index;
    },
    handleImageLoad(event) {
      event.target.classList.add("loaded");
    },
    /**
     * Maneja el click en un banner y redirige al producto si existe
     */
    handleBannerClick(banner) {
      if (banner.producto_id) {
        // Detener el carrusel temporalmente para mejor UX
        this.stopCarousel();
        // Redirigir a la página del producto
        this.$router.push({
          name: 'ProductoDetalle',
          params: { id: banner.producto_id },
        });
      }
    },
  },
};
</script>

<style src="./CarouselBanner.css"></style>