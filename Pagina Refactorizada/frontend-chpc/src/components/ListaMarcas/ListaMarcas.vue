<template>
    <div>
      <HeaderAnth
        :isAuthenticated="isAuthenticated"
        @cerrar-sesion="cerrarSesion"
      />
  
      <!-- Transición para el contenedor de marcas -->
      <transition name="fade">
        <div class="marcas-container">
          <h1 class="main-title">Explora nuestras Marcas</h1>
          <p class="description">
            Aquí encontrarás las mejores marcas para tus necesidades. ¡Haz clic y conoce más!
          </p>
          <div class="marca-grid">
            <div 
              v-for="marca in marcas" 
              :key="marca.id" 
              class="marca-card"
              @click="filtrarPorMarca(marca.id)"
            >
              <img
                :src="marca.imagen_url"
                :alt="'Logo de la marca ' + marca.nombre_marca"
                class="marca-logo"
              />
              <h3>{{ marca.nombre_marca }}</h3>
            </div>
          </div>
        </div>
      </transition>
  
      <FooterAnth />
    </div>
  </template>
<script src="./ListaMarcas.js"></script>
<style src="./ListaMarcas.css"></style>  