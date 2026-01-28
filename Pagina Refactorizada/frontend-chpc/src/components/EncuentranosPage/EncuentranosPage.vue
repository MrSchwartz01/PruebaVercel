<template>
  <div class="encuentranos-layout">
    <HeaderAnth
      :searchQuery="searchQuery"
      :isAuthenticated="isAuthenticated"
      @buscar="buscarProductos"
      @cerrar-sesion="cerrarSesion"
    />

    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Encuéntranos</h1>
        <p class="hero-subtitle">Visítanos en nuestro local </p>
      </div>
    </section>

    <div class="encuentranos-container-original">
      <div class="content-wrapper">
        <div class="info-section">
          <div class="info-card-item">
            <h3 class="card-title">Dirección</h3>
            <p>{{ direccion }}</p>
          </div>

          <div class="info-card-item">
            <h3 class="card-title">Horario de Atención</h3>
            <p>{{ horario }}</p>
          </div>

          <div class="info-card-item">
            <h3 class="card-title">Contacto</h3>
            <p>{{ telefono }}<br>{{ email }}</p>
          </div>
        </div>

        <div class="map-section">
          <div class="map-card-container">
            <h2 class="section-title-map">Cómo llegar</h2>
            <div class="map-frame">
              <iframe
                :src="googleMapsEmbedUrl"
                width="100%"
                height="400"
                style="border:0;"
                allowfullscreen=""
                loading="lazy"
              ></iframe>
            </div>
            <a :href="googleMapsLink" target="_blank" class="btn-directions">
              🧭 Ver en Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>

    <FooterAnth />
  </div>
</template>

<script src="./EncuentranosPage.js"></script>
<style src="./EncuentranosPage.css"></style>
