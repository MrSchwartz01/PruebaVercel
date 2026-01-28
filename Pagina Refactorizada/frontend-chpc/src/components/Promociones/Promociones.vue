<template>
  <div class="promociones-layout">
    <HeaderAnth
      :searchQuery="searchQuery"
      :isAuthenticated="isAuthenticated"
      @buscar="buscarProductos"
      @cerrar-sesion="cerrarSesion"
    />

    <section class="promo-hero">
      <h1>Ofertas Exclusivas</h1>
      <p>Equípate con lo mejor de la tecnología a precios imbatibles.</p>
    </section>

    <!-- Mensaje de carga -->
    <div v-if="isLoading" class="mensaje-carga">
      <p>Cargando promociones...</p>
    </div>

    <!-- Mensaje de error -->
    <div v-if="errorMessage && !isLoading" class="mensaje-error">
      <p>{{ errorMessage }}</p>
      <button @click="cargarPromociones" class="btn-reintentar">Reintentar</button>
    </div>

    <!-- Mensaje sin promociones -->
    <div v-if="!isLoading && !errorMessage && promocionesActivas.length === 0" class="sin-promociones">
      <p>No hay promociones activas en este momento.</p>
      <p>¡Vuelve pronto para encontrar increíbles ofertas!</p>
      <button @click="$router.push('/home')" class="btn-promo">Ver Productos</button>
    </div>

    <!-- Grid de promociones -->
    <div v-if="!isLoading && promocionesActivas.length > 0" class="promociones-grid-container">
      <div 
        v-for="promo in promocionesActivas" 
        :key="promo.id"
        class="promo-card"
        @click="verDetalleProducto(promo.producto.id)"
        style="cursor: pointer;"
      >
        <div class="promo-badge">{{ promo.porcentaje_descuento }}% OFF</div>
        <img
            :src="obtenerImagenProducto(promo.producto)" 
            :alt="promo.producto.nombre_producto" 
            class="promo-img"
            @error="manejarErrorImagen"
          />
        <div class="promo-info">
          <h3>{{ promo.producto.nombre_producto }}</h3>
          <p class="promo-descripcion">{{ promo.producto.descripcion || 'Oferta especial por tiempo limitado' }}</p>
          
          <!-- Precios -->
          <div v-if="isAuthenticated" class="precios-container">
            <div class="precio-original">
              <span class="label-precio">Antes:</span>
              <span class="valor-tachado">USD ${{ formatPrice(promo.producto.precio) }}</span>
            </div>
            <div class="precio-promo">
              <span class="label-precio">Ahora:</span>
              <span class="valor-descuento">USD ${{ calcularPrecioConDescuento(promo.producto.precio, promo.porcentaje_descuento) }}</span>
            </div>
            <div class="ahorro">
              <span class="label-ahorro">Ahorras: USD ${{ calcularAhorro(promo.producto.precio, promo.porcentaje_descuento) }}</span>
            </div>
          </div>
          <div v-else class="login-mensaje">
            <p>Inicia sesión para ver precios</p>
          </div>

          <!-- Validez de la promoción -->
          <div class="validez-promo">
            <small>Válido hasta: {{ formatearFecha(promo.fecha_fin) }}</small>
          </div>
        </div>
      </div>
    </div>
    
    <FooterAnth></FooterAnth>
  </div>
</template>

<script>
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import HeaderAnth from "../HeaderAnth/HeaderAnth.vue";
import FooterAnth from "../FooterAnth/FooterAnth.vue";

export default {
  name: "PromocionesPage",
  components: {
    HeaderAnth,
    FooterAnth,
  },
  data() {
    return {
      isAuthenticated: false,
      searchQuery: '',
      promocionesActivas: [],
      isLoading: true,
      errorMessage: '',
    };
  },
  async created() {
    this.isAuthenticated = !!localStorage.getItem("access_token");
    await this.cargarPromociones();
  },
  methods: {
    async cargarPromociones() {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const response = await axios.get(`${API_BASE_URL}/promociones/activas`);
        // Procesar las promociones para asignar la imagen correcta
        this.promocionesActivas = response.data.map(promo => ({
          ...promo,
          producto: {
            ...promo.producto,
            imagen_url: this.procesarImagenProducto(promo.producto)
          }
        }));
        console.log('Promociones cargadas:', this.promocionesActivas);
      } catch (error) {
        console.error('Error al cargar promociones:', error);
        this.errorMessage = 'No se pudieron cargar las promociones. Por favor, intenta nuevamente.';
      } finally {
        this.isLoading = false;
      }
    },
    
    procesarImagenProducto(producto) {
      // Prioridad: productImages con es_principal, primera imagen, imagen_url, placeholder
      if (producto.productImages && producto.productImages.length > 0) {
        const imagenPrincipal = producto.productImages.find(img => img.es_principal);
        return imagenPrincipal ? imagenPrincipal.ruta_imagen : producto.productImages[0].ruta_imagen;
      }
      return producto.imagen_url || '/Productos/placeholder-product.png';
    },
    
    verDetalleProducto(productoId) {
      this.$router.push({
        name: 'ProductoDetalle',
        params: { id: productoId }
      });
    },
    
    obtenerImagenProducto(producto) {
      return producto.imagen_url || '/Productos/placeholder-product.png';
    },
    
    manejarErrorImagen(event) {
      event.target.src = '/Productos/placeholder-product.png';
    },
    
    formatPrice(price) {
      return parseFloat(price).toFixed(2);
    },
    
    calcularPrecioConDescuento(precio, porcentajeDescuento) {
      const descuento = precio * (porcentajeDescuento / 100);
      const precioFinal = precio - descuento;
      return this.formatPrice(precioFinal);
    },
    
    calcularAhorro(precio, porcentajeDescuento) {
      const ahorro = precio * (porcentajeDescuento / 100);
      return this.formatPrice(ahorro);
    },
    
    formatearFecha(fecha) {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    },
    
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

<style src="./Promociones.css"></style>