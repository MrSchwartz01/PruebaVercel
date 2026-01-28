<template>
    <transition name="fade">
      <header v-bind:class="{ 'fade-in': isVisible }" class="header">
        <div class="main-header">
          <!-- Logo -->
          <div class="logo">
            <a href="/">
              <img src="@/images/logo/logo.png" alt="Logo de la página" />
            </a>
          </div>
  
          <!-- Barra de búsqueda -->
          <div class="search-bar">
            <input
              type="text"
              v-model="localSearchQuery"
              placeholder="¿Qué estás buscando hoy?"
              @input="onInput"
              @focus="programarCargaSugerencias"
              @blur="cerrarSugerencias"
              aria-label="Buscar productos"
            />
            <button @click="buscarProductos" aria-label="Buscar" class="btn-buscar">
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    class="search-icon" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
</button>

            <!-- Dropdown de sugerencias -->
            <div
              v-if="mostrandoSugerencias && sugerencias.length"
              class="sugerencias-container"
            >
              <div
                v-for="producto in sugerencias"
                :key="producto.id"
                class="sugerencia-item"
                @mousedown.prevent="seleccionarSugerencia(producto)"
              >
                <span class="sugerencia-nombre">
                  {{ producto.nombre_producto || producto.nombre }}
                </span>
                <span v-if="producto.precio != null" class="sugerencia-precio">
                  ${{ Number(producto.precio).toFixed(2) }}
                  <span style="font-size: 0.8em; color: #999; margin-left: 4px;">IVA incl.</span>
                </span>
              </div>
            </div>
          </div>
  
          <!-- Acciones de usuario -->
          <div class="user-actions">
            <button class="carrito-button" @click="goToCarrito" title="Carrito de compras">
              <svg xmlns="http://www.w3.org/2000/svg" class="carrito-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span v-if="cantidadCarrito > 0" class="carrito-badge">{{ cantidadCarrito }}</span>
            </button>
            <template v-if="!isAuthenticated">
              <button class="action-button" @click="goToLogin">Ingresar</button>
              <button class="action-button" @click="goToRegister">Hacerse cliente</button>
            </template>
            <template v-else>
              <button 
                class="action-button perfil-button" 
                @click="goToPerfil"
                title="Mi Perfil"
              >
                Mi Perfil
              </button>
              <button 
                v-if="isAdmin || isVendedor" 
                class="action-button pedidos-button" 
                @click="goToPanelVendedores"
                title="Panel de Pedidos"
              >
                Pedidos
              </button>
              <button 
                v-if="isAdmin || isTecnico" 
                class="action-button tecnicos-button" 
                @click="goToPanelTecnicos"
                title="Panel de Técnicos"
              >
                Técnicos
              </button>
              <button 
                v-if="isAdmin || isVendedor" 
                class="action-button admin-button" 
                @click="goToAdminPanel"
                title="Panel de Administración"
              >
                Panel Admin
              </button>
              <button class="action-button" @click="cerrarSesion">Cerrar Sesión</button>
            </template>
          </div>
        </div>
  
        <!-- Menú de navegación -->
        <nav class="main-menu">
          <ul>
            <li><a href="/home">Inicio</a></li>
            <li 
              class="dropdown-menu"
              @mouseenter="showProductsMenu = true"
              @mouseleave="showProductsMenu = false"
              @dblclick="goToCategorias"
            >
                <a href="#" @click.prevent>Productos</a>
                <transition name="dropdown-fade">
                  <div v-if="showProductsMenu" class="dropdown-wrapper">
                  <ul class="dropdown-content">
                    <li class="divider"></li>
                    <li><a href="/productos/categoria/laptops">Laptops</a></li>
                    <li><a href="/productos/categoria/componentes">Componentes</a></li>
                    <li><a href="/productos/categoria/perifericos">Periféricos</a></li>
                    <li><a href="/productos/categoria/almacenamiento">Almacenamiento</a></li>
                    <li><a href="/productos/categoria/redes">Redes</a></li>
                    <li><a href="/productos/categoria/audio">Audio</a></li>
                    <li><a href="/productos/categoria/redes">Equipos de Red</a></li>
                  </ul>
                  </div>  
                </transition>
              </li> 
            <li><a href="/promociones">Promociones</a></li>
            <li 
              class="dropdown-menu"
              @mouseenter="showMarcasMenu = true"
              @mouseleave="showMarcasMenu = false"
              @dblclick="goToMarcas"
            >
              <a href="#" @click.prevent>Marcas</a>
              <transition name="dropdown-fade">
                <div v-if="showMarcasMenu" class="dropdown-wrapper">
                <ul class="dropdown-content">
                  <li class="ver-todos-item"><a href="/marcas"><strong>Ver Todas las Marcas</strong></a></li>
                  <li class="divider"></li>
                  <li v-if="marcasDisponibles.length === 0" style="padding: 4px 12px; color: #999; font-size: 12px;">
                    Cargando marcas...
                  </li>
                  <li v-for="marca in marcasDisponibles" :key="marca" class="marca-item">
                    <a :href="`/productos/marca/${marca}`">
                      <span class="marca-nombre">{{ marca }}</span>
                    </a>
                  </li>
                </ul>
                </div>
              </transition>
            </li>
            <li><a href="/servicio-tecnico">Servicio Técnico</a></li>
            <li><a href="/garantias">Garantías</a></li>
            <li><a href="/redes-sociales">Contáctanos</a></li>
            <li><a href="/encuentranos">Encuéntranos</a></li>
            <li><a href="/mision-vision">Misión y Visión</a></li>
          </ul>
        </nav>

      </header>
    </transition>
  </template>
  <script src="./HeaderAnth.js"></script>
  <style src="./HeaderAnth.css"></style> 