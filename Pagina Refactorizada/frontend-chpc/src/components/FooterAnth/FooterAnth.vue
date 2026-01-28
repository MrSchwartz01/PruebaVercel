<template>
  <footer class="footer-container">
    <div class="footer-main">
    <div class="footer-brand" id="redes-sociales">
      <div class="footer-logo">CH<span>pc</span></div>
      <p class="footer-tagline">
      Tu tienda de confianza para tecnología de vanguardia y productos gaming de alta calidad.
      </p>
      <div class="footer-social-row">
      <a
        v-for="red in redesSociales"
        :key="red.nombre"
        :href="red.url"
        target="_blank"
        rel="noopener noreferrer"
    >
        <img :src="red.icono" :alt="red.nombre" class="social-icon" />
      </a>
      </div>
    </div>

    <div class="footer-columns">
      <div class="footer-column">
      <h4>Productos</h4>
      <ul>
        <li><a href="/productos/categoria/laptops">Laptops</a></li>
        <li><a href="/productos/categoria/monitores">Monitores</a></li>
        <li><a href="/productos/categoria/perifericos">Periféricos</a></li>
        <li><a href="/productos/categoria/componentes">Componentes</a></li>
      </ul>
      </div>
      <div class="footer-column">
      <h4>Soporte</h4>
      <ul>
        <li><a href="/servicio-tecnico">Servicio Técnico</a></li>
        <li><a href="/garantias">Garantías</a></li>
        <li><a href="/faq">FAQ</a></li>
        <li><a href="#redes-sociales">Contacto</a></li>
      </ul>
      </div>
      <div class="footer-column">
      <h4>Empresa</h4>
      <ul>
        <li><a href="/mision-vision">Sobre Nosotros</a></li>
        <li><a href="/mision-vision">Misión y Visión</a></li>
        <li><a href="/encuentranos">Encuéntranos</a></li>
        <li><a href="/marcas">Marcas</a></li>
      </ul>
      </div>
    </div>
    </div>

    <div class="footer-bottom">
    <div class="footer-bottom-left">
      <span>&copy; 2025 CHpc TECNOLOGÍA. Todos los derechos reservados.</span>
    </div>
    <div class="footer-bottom-right">
      <a href="/terminos">Términos</a>
      <a href="/privacidad">Privacidad</a>
      <a href="/cookies">Cookies</a>
    </div>
    </div>
  </footer>
  </template>

<script src="./FooterAnth.js"></script>
<style src="./FooterAnth.css"></style>