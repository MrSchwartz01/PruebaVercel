<template>
  <div class="historial-container" v-if="historial && historial.length">
    <h2 class="historial-titulo">Vistos recientemente</h2>
    <div class="historial-grid">
      <div
        v-for="producto in historial"
        :key="producto.id"
        class="historial-card"
        @click="verDetalle(producto.id)"
      >
        <img
          class="historial-imagen"
          :src="producto.imagen_url || 'ruta-imagen-default.png'"
          :alt="producto.nombre || 'Producto visto recientemente'"
        />
        <div class="historial-info">
          <p class="historial-nombre">{{ producto.nombre || 'Producto' }}</p>
          <p v-if="producto.precio !== null" class="historial-precio">
            ${{ formatPrice(producto.precio) }}
          </p>
          <p v-if="producto.precio !== null" style="font-size: 0.7em; color: #999; margin: 0;">incluido IVA</p>
          <p class="historial-fecha">Visto hace {{ tiempoRelativo(producto.vistoEn) }}</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="historial-vacio"></div>
</template>

<script src="./HistorialProductosVistos.js"></script>
<style src="./HistorialProductosVistos.css"></style>
