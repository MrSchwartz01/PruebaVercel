<template>
    <div>
      <HeaderAnth
        :isAuthenticated="isAuthenticated"
        @cerrar-sesion="cerrarSesion"
      />
  
      <!-- Transición para el contenedor de marcas -->
      <transition name="fade">
        <div v-show="true" class="marcas-container">
          <h1 class="main-title">Explora nuestras Marcas</h1>
          <p class="description">
            Aquí encontrarás las mejores marcas para tus necesidades. ¡Haz clic y conoce más!
          </p>
          
          <!-- Indicador de carga -->
          <div v-if="cargando" class="loading-marcas">
            <p>Cargando marcas...</p>
          </div>
          
          <!-- Grid de marcas -->
          <div v-else-if="marcas.length > 0" class="marca-grid">
            <div 
              v-for="marca in marcas" 
              :key="marca.nombre_marca" 
              class="marca-card"
              @click="filtrarPorMarca(marca.nombre_marca)"
            >
              <img
                :src="marca.imagen_url"
                :alt="'Logo de la marca ' + marca.nombre_marca"
                class="marca-logo"
                @error="handleImageError"
              />
              <h3>{{ marca.nombre_marca }}</h3>
            </div>
          </div>
          
          <!-- Sin marcas -->
          <div v-else class="no-marcas">
            <p>No hay marcas disponibles en este momento.</p>
          </div>
        </div>
      </transition>
  
      <FooterAnth />
    </div>
  </template>
<script src="./ListaMarcas.js"></script>
<style src="./ListaMarcas.css"></style>  