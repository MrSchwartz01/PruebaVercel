<template>
  <div>
    <HeaderAnth
      :searchQuery="searchQuery"
      :isAuthenticated="isAuthenticated"
      @buscar="buscarProductos"
      @cerrar-sesion="cerrarSesion"
    />

    <div class="productos-por-categoria-container">
      <div class="categoria-header">
        <h1>{{ nombreCategoria }}</h1>
        <p class="breadcrumb">
          <router-link to="/home">Inicio</router-link> /
          <router-link to="/categorias">Categorías</router-link> /
          {{ nombreCategoria }}
        </p>
      </div>

      <!-- Layout con productos y filtros -->
      <div class="content-layout">
        <!-- Grid de productos a la izquierda -->
        <div class="productos-section">
          <div class="productos-grid">
        <div
          v-for="producto in productosFiltrados"
          :key="producto.id"
          class="producto-card"
        >
          <img 
            :src="producto.imagen_url" 
            :alt="producto.nombre_producto" 
            @click="verDetalle(producto.id)"
            style="cursor: pointer;"
          />
          <div class="producto-info">
            <span class="marca-tag">{{ producto.marca }}</span>
            <h3>{{ producto.nombre_producto }}</h3>
            <p class="descripcion">{{ producto.descripcion }}</p>
            <div class="producto-footer">
              <div>
                <p class="precio" v-if="isAuthenticated">${{ producto.precio }}</p>
                <p class="precio" v-else>Inicia sesión para ver precio</p>
                <p v-if="isAuthenticated" style="font-size: 0.75em; color: #999; margin: 0;">incluido IVA</p>
              </div>
              <p class="stock" :class="{ 'sin-stock': producto.stock === 0, 'pocas-unidades': producto.stock > 0 && producto.stock <= 5 }">
                {{ obtenerTextoStock(producto.stock) }}
              </p>
            </div>
            <button @click="verDetalle(producto.id)" class="ver-btn">
              Ver Detalles
            </button>
          </div>
        </div>
          </div>

          <div v-if="productosFiltrados.length === 0" class="no-productos">
            <p>No hay productos disponibles en esta categoría.</p>
          </div>
        </div>

        <!-- Filtros en sidebar a la derecha -->
        <aside class="filtros-sidebar" v-if="marcasDisponibles.length > 0">
          <div class="filtros-container">
            <h3 class="filtros-title">Filtros</h3>
            
            <!-- Filtro por Categoría -->
            <div class="filtro-group">
              <button class="filtro-header" @click="toggleSection('category')">
                <span>Categoría</span>
                <span class="arrow" :class="{ 'arrow-up': sectionsOpen.category }">▼</span>
              </button>
              <div v-if="sectionsOpen.category" class="filtro-content">
                <label class="checkbox-label">
                  <input type="checkbox" />
                  <span>Accesorios</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" checked />
                  <span>Laptops</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" />
                  <span>PC de Escritorio</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" />
                  <span>Routers y Repetidores</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" />
                  <span>Impresoras y Escáneres</span>
                </label>
              </div>
            </div>

            <!-- Filtro por Subcategoría -->
            <div class="filtro-group">
              <button class="filtro-header" @click="toggleSection('subcategory')">
                <span>Subcategoría</span>
                <span class="arrow" :class="{ 'arrow-up': sectionsOpen.subcategory }">▼</span>
              </button>
              <div v-if="sectionsOpen.subcategory" class="filtro-content">
                <label class="checkbox-label">
                  <input type="checkbox" />
                  <span>Mouses</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" />
                  <span>Adaptadores Y Antenas WiFi</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" />
                  <span>Monitores</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" />
                  <span>Tintas</span>
                </label>
              </div>
            </div>

            <!-- Filtro por Marca -->
            <div class="filtro-group">
              <button class="filtro-header" @click="toggleSection('brand')">
                <span>Marca</span>
                <span class="arrow" :class="{ 'arrow-up': sectionsOpen.brand }">▼</span>
              </button>
              <div v-if="sectionsOpen.brand" class="filtro-content">
                <label class="checkbox-label" v-for="marca in marcasDisponibles" :key="marca.nombre">
                  <input 
                    type="checkbox" 
                    :checked="marcaSeleccionada === marca.nombre"
                    @change="filtrarPorMarca(marcaSeleccionada === marca.nombre ? null : marca.nombre)"
                  />
                  <span>{{ marca.nombre }}</span>
                </label>
              </div>
            </div>

            <!-- Filtro por Almacenamiento -->
            <div class="filtro-group">
              <button class="filtro-header" @click="toggleSection('storage')">
                <span>Almacenamiento</span>
                <span class="arrow" :class="{ 'arrow-up': sectionsOpen.storage }">▼</span>
              </button>
              <div v-if="sectionsOpen.storage" class="filtro-content">
                <label class="checkbox-label">
                  <input type="checkbox" />
                  <span>256 GB</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" />
                  <span>512 GB</span>
                </label>
              </div>
            </div>

            <!-- Filtro por Bluetooth -->
            <div class="filtro-group">
              <button class="filtro-header" @click="toggleSection('bluetooth')">
                <span>Bluetooth</span>
                <span class="arrow" :class="{ 'arrow-up': sectionsOpen.bluetooth }">▼</span>
              </button>
              <div v-if="sectionsOpen.bluetooth" class="filtro-content">
                <label class="checkbox-label">
                  <input type="checkbox" />
                  <span>Sí</span>
                </label>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <ContactoAsesor />
    <FooterAnth />
  </div>
</template>

<script src="./ProductosPorCategoria.js"></script>
<style src="./ProductosPorCategoria.css"></style>
