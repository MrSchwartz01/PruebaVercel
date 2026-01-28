<template>
  <div class="redes-sociales-page-layout">
    <HeaderAnth
      :isAuthenticated="isAuthenticated"
      @cerrar-sesion="cerrarSesion"
    />

    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Nuestras Redes Sociales</h1>
        <p class="hero-subtitle">
          Conéctate con nosotros y mantente al día con las últimas novedades.
        </p>
      </div>
    </section>

    <div class="content-container">
      <transition-group name="fade" tag="div" class="social-grid">
        <div
          v-for="red in redesSociales"
          :key="red.nombre"
          class="social-card fade-in"
        >
          <a :href="red.url" target="_blank" rel="noopener noreferrer" class="social-link">
            <img
              :src="red.icono"
              :alt="'Ícono de ' + red.nombre"
              class="social-icon"
            />
            <h3>{{ red.nombre }}</h3>
          </a>
        </div>
      </transition-group>
    </div>

    <FooterAnth />
  </div>
</template>

  <script src="./RedesSociales.js"></script>
  <style src="./RedesSociales.css"></style>