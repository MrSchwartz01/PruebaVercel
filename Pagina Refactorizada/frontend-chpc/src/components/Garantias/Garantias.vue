<template>
  <div class="garantias-page-container">
    <HeaderAnth
      :searchQuery="searchQuery"
      :isAuthenticated="isAuthenticated"
      @buscar="buscarProductos"
      @cerrar-sesion="cerrarSesion"
    />

    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Políticas de Garantía</h1>
      </div>
    </section>

    <div class="content-container">
      <section class="section-card">
        <h2 class="section-title">Garantía del Local</h2>
        <div class="section-content">
          <p>
            Nuestros productos cuentan con una vigencia de <strong>6 meses a un año</strong> a partir de la fecha de factura, cubriendo defectos de fabricación bajo condiciones normales de uso.
          </p>
        </div>
      </section>

      <section class="section-card">
        <h2 class="section-title">Garantía del Fabricante</h2>
        <div class="section-content">
          <p>
            Cada producto cuenta con la garantía oficial del fabricante. Para hacerla efectiva, es necesario conservar la factura original y seguir los protocolos de soporte oficial de la marca.
          </p>
        </div>
      </section>
    </div>

    <FooterAnth />
  </div>
</template>

<script>
import HeaderAnth from '../HeaderAnth/HeaderAnth.vue';
import FooterAnth from '../FooterAnth/FooterAnth.vue';

export default {
  // SOLUCIÓN AL ERROR: Nombre multi-palabra
  name: 'GarantiasPage', 
  components: {
    HeaderAnth,
    FooterAnth,
  },
  data() {
    return {
      isAuthenticated: false,
      searchQuery: '',
    };
  },
  created() {
    this.isAuthenticated = !!localStorage.getItem("access_token");
  },
  methods: {
    buscarProductos(query) {
      this.searchQuery = query;
      if (query.trim() !== "") {
        this.$router.push({ name: "HomePage", query: { search: query } });
      }
    },
    cerrarSesion() {
      localStorage.removeItem("access_token");
      this.isAuthenticated = false;
      this.$router.replace("/login");
    },
  },
};
</script>

<style src="./Garantias.css"></style>