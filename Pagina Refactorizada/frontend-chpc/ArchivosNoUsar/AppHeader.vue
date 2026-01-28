<template>
  <header class="app-header">
    <div class="header-top">
      <div class="container">
        <router-link to="/" class="logo">
          <span class="logo-ch">CH</span><span class="logo-pc">pc</span>
          <span class="logo-tech">TECNOLOGÍA</span>
        </router-link>
        
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="¿Qué estás buscando hoy?"
            @keyup.enter="handleSearch"
          />
          <button @click="handleSearch" class="search-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="9" r="7"/>
              <path d="M14 14l5 5"/>
            </svg>
          </button>
        </div>

        <div class="header-actions">
          <button class="cart-btn">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6m0 0h14m-14 0c-.828 0-1.5.672-1.5 1.5S4.672 22 5.5 22M21 19c-.828 0-1.5.672-1.5 1.5S20.172 22 21 22c.828 0 1.5-.672 1.5-1.5S21.828 19 21 19z"/>
            </svg>
            <span class="cart-count">0</span>
          </button>
          <router-link to="/login" class="btn btn-primary">Ingresar</router-link>
          <router-link to="/registro" class="btn btn-secondary">Hacerse cliente</router-link>
        </div>
      </div>
    </div>

    <nav class="main-nav">
      <div class="container">
        <router-link to="/" :class="{ active: isActive('/') }">Inicio</router-link>
        <router-link to="/productos" :class="{ active: isActive('/productos') }">Productos</router-link>
        <router-link to="/promociones" :class="{ active: isActive('/promociones') }">Promociones</router-link>
        <a href="#" @click.prevent>Servicio Técnico</a>
        <router-link to="/redes-sociales" :class="{ active: isActive('/redes-sociales') }">Redes Sociales</router-link>
        <a href="#" @click.prevent>Marcas</a>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/productos', query: { search: searchQuery.value } })
  }
}

const isActive = (path) => {
  return route.path === path
}
</script>

<style src="./AppHeader.css"></style>
