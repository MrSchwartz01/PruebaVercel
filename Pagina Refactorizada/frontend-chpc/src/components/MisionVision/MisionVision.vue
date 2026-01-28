<template>
  <div class="mision-vision-page">
    <!-- Header -->
    <HeaderAnth
      :searchQuery="searchQuery"
      :isAuthenticated="isAuthenticated"
      @buscar="buscarProductos"
      @cerrar-sesion="cerrarSesion"
    />

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Misión y Visión</h1>
        <p class="hero-subtitle">
          Comprometidos con la excelencia en tecnología y servicio al cliente
        </p>
      </div>
    </section>

    <!-- Contenido Principal -->
    <div class="content-container">
      <!-- Misión -->
      <section class="section-card mision-section">
        <div class="icon-wrapper">
        </div>
        <h2 class="section-title">Nuestra Misión</h2>
        <div class="section-content">
          <p>
            En CHPC Tecnología, nuestra misión es ir más allá de la simple venta de equipos tecnológicos. Nos dedicamos a crear
        experiencias únicas mediante la combinación de innovación, calidad y servicio personalizado. Lo que nos hace
        especiales es nuestro enfoque centrado en el cliente: analizamos profundamente sus desafíos, diseñamos soluciones
        a medida y brindamos un acompañamiento continuo. Cada producto que ofrecemos refleja nuestro compromiso con la
        excelencia y la tecnología de punta. Nos destacamos por integrar sostenibilidad en cada etapa del proceso, desde
        la selección de productos hasta la gestión de residuos electrónicos, asegurando que nuestra huella tecnológica sea
        positiva para nuestros clientes, la industria y el planeta.
          </p>
        </div>
      </section>

      <!-- Visión -->
      <section class="section-card vision-section">
        <div class="icon-wrapper">
        </div>
        <h2 class="section-title">Nuestra Visión</h2>
        <div class="section-content">
          <p>
            Convertirnos en la referencia global en soluciones tecnológicas integrales, distinguiéndonos por nuestra capacidad
        de anticipar las necesidades del mercado y ofrecer productos y servicios que redefinan la experiencia tecnológica.
        Nos visualizamos liderando un ecosistema innovador donde cada equipo y solución que ofrecemos no solo resuelve
        problemas, sino que transforma la manera en que las personas y las empresas interactúan con la tecnología. En CHPC
        Tecnología, creemos que la verdadera innovación no es solo adelantarse al futuro, sino construirlo de la mano de
        nuestros clientes, con un enfoque en sostenibilidad, inclusión y excelencia operativa.
          </p>
        </div>
      </section>
    </div>
    <!-- Footer -->
    <FooterAnth />
  </div>
</template>

<script>
import HeaderAnth from '../HeaderAnth/HeaderAnth.vue';
import FooterAnth from '../FooterAnth/FooterAnth.vue';

export default {
  name: 'MisionVision',
  components: {
    HeaderAnth,
    FooterAnth,
  },
  data() {
    return {
      searchQuery: '',
      isAuthenticated: false,
    };
  },
  mounted() {
    this.isAuthenticated = !!localStorage.getItem('access_token');
  },
  methods: {
    buscarProductos(query) {
      this.searchQuery = query;
      this.$router.push({ path: '/home', query: { search: query } });
    },
    cerrarSesion() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_rol');
      this.isAuthenticated = false;
      this.$router.push('/login');
    },
    goToProducts() {
      this.$router.push('/home');
    },
    goToContact() {
      this.$router.push('/encuentranos');
    },
  },
};
</script>

<style src="./MisionVision.css"></style>
