<template>
  <div>
    <HeaderAnth
      :searchQuery="searchQuery"
      :isAuthenticated="isAuthenticated"
      @buscar="buscarProductos"
      @cerrar-sesion="cerrarSesion"
    />

    <div class="todos-productos-container">
      <div class="page-header">
        <h1>Todos los Productos</h1>
        <p class="breadcrumb">
          <router-link to="/home">Inicio</router-link> /
          <span>Productos</span>
        </p>
      </div>

      <div class="productos-layout">
        <!-- Panel lateral de filtros -->
        <aside class="filtros-sidebar">
          <div class="filtros-header">
            <h2>Filtros</h2>
            <button @click="limpiarFiltros" class="limpiar-btn">Limpiar filtros</button>
          </div>

          <!-- Filtro por Marca -->
          <div class="filtro-seccion">
            <h3>Marca</h3>
            <div class="filtro-opciones">
              <label v-for="marca in marcasDisponibles" :key="marca" class="checkbox-label">
                <input
                  type="checkbox"
                  :value="marca"
                  v-model="filtros.marcas"
                  @change="aplicarFiltros"
                />
                <span>{{ marca }}</span>
              </label>
            </div>
          </div>

          <!-- Filtro por Color -->
          <div class="filtro-seccion">
            <h3>Color</h3>
            <div class="filtro-opciones">
              <label v-for="color in coloresDisponibles" :key="color" class="checkbox-label">
                <input
                  type="checkbox"
                  :value="color"
                  v-model="filtros.colores"
                  @change="aplicarFiltros"
                />
                <span>{{ color }}</span>
              </label>
            </div>
          </div>

          <!-- Filtro por Subcategoría -->
          <div class="filtro-seccion">
            <h3>Categoría</h3>
            <div class="filtro-opciones">
              <label v-for="subcategoria in subcategoriasDisponibles" :key="subcategoria" class="checkbox-label categoria-checkbox">
                <input
                  type="checkbox"
                  :value="subcategoria"
                  v-model="filtros.subcategorias"
                  @change="aplicarFiltros"
                />
                <span class="categoria-label-content">
                  <span v-html="obtenerIconoCategoria(subcategoria)" class="categoria-icon-wrapper"></span>
                  <span class="categoria-nombre">{{ subcategoria }}</span>
                </span>
              </label>
            </div>
          </div>

          <!-- Filtro por Rango de Precio -->
          <div class="filtro-seccion">
            <h3>Precio</h3>
            <div class="precio-inputs">
              <input
                type="number"
                v-model.number="filtros.precioMin"
                placeholder="Mínimo"
                @input="aplicarFiltros"
                class="precio-input"
              />
              <span class="precio-separador">-</span>
              <input
                type="number"
                v-model.number="filtros.precioMax"
                placeholder="Máximo"
                @input="aplicarFiltros"
                class="precio-input"
              />
            </div>
            <div class="precio-info">
              <span>Rango: ${{ precioMinimo }} - ${{ precioMaximo }}</span>
            </div>
          </div>

          <!-- Filtro por Stock -->
          <div class="filtro-seccion">
            <h3>Disponibilidad</h3>
            <div class="filtro-opciones">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="filtros.soloDisponibles"
                  @change="aplicarFiltros"
                />
                <span>Solo con stock</span>
              </label>
            </div>
          </div>
        </aside>

        <!-- Grid de productos -->
        <div class="productos-main">
          <div class="productos-toolbar">
            <div class="resultados-info">
              <span>{{ productosFiltrados.length }} productos encontrados</span>
            </div>
            <div class="vista-opciones">
              <button 
                :class="['vista-btn', { active: vistaActual === 'cuadricula' }]" 
                @click="vistaActual = 'cuadricula'"
                title="Vista Cuadrícula"
              >
                ⊞
              </button>
              <button 
                :class="['vista-btn', { active: vistaActual === 'lista' }]" 
                @click="vistaActual = 'lista'"
                title="Vista Lista"
              >
                ☰
              </button>
            </div>
            <div class="ordenar-section">
              <label>Ordenar por:</label>
              <select v-model="ordenamiento" @change="aplicarOrdenamiento" class="ordenar-select">
                <option value="relevancia">Relevancia</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre-asc">Nombre: A-Z</option>
                <option value="nombre-desc">Nombre: Z-A</option>
              </select>
            </div>
          </div>

          <div v-if="cargando" class="loading">
            <p>Cargando productos...</p>
          </div>

          <div v-else-if="productosFiltrados.length === 0" class="no-productos">
            <p>No se encontraron productos con los filtros seleccionados.</p>
          </div>

          <div v-else :class="['productos-grid', vistaActual === 'lista' ? 'vista-lista' : 'vista-cuadricula']">
            <div
              v-for="producto in productosPaginados"
              :key="producto.id"
              class="producto-card"
            >
              <div class="producto-imagen">
                <img 
                  :src="producto.imagen_url || '/placeholder.jpg'" 
                  :alt="producto.nombre_producto"
                  @error="handleImageError"
                />
                <span v-if="producto.stock === 0" class="badge sin-stock">Sin Stock</span>
                <span v-else-if="producto.stock < 10" class="badge poco-stock">Pocas unidades</span>
              </div>
              <div class="producto-info">
                <span v-if="producto.marca" class="marca-tag">{{ producto.marca }}</span>
                <h3>{{ producto.nombre_producto }}</h3>
                <p class="descripcion">{{ truncarDescripcion(producto.descripcion) }}</p>
                <div class="producto-footer">
                  <div class="precio-info">
                    <p class="precio">${{ formatearPrecio(producto.precio) }}</p>
                    <p style="font-size: 0.75em; color: #999; margin: 0;">incluido IVA</p>
                  </div>
                  <p class="stock" :class="{ 'sin-stock': producto.stock === 0, 'pocas-unidades': producto.stock > 0 && producto.stock <= 5 }">
                    {{ obtenerTextoStock(producto.stock) }}
                  </p>
                </div>
                <div class="producto-acciones">
                  <button @click="verDetalle(producto.id)" class="ver-btn">
                    Ver Detalles
                  </button>
                  <button 
                    v-if="producto.stock > 0"
                    @click="agregarAlCarrito(producto)" 
                    class="agregar-btn"
                    title="Agregar al carrito"
                  >
                    🛒
                  </button>
                </div>
              </div>
            n</div>
          </div>

          <!-- Paginación -->
          <div v-if="totalPaginas > 1" class="paginacion">
            <button 
              @click="cambiarPagina(paginaActual - 1)" 
              :disabled="paginaActual === 1"
              class="pagina-btn"
            >
              ← Anterior
            </button>
            <span class="pagina-info">Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button 
              @click="cambiarPagina(paginaActual + 1)" 
              :disabled="paginaActual === totalPaginas"
              class="pagina-btn"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    </div>

    <ContactoAsesor />
    <FooterAnth />
  </div>
</template>

<script src="./TodosLosProductos.js"></script>
<style src="./TodosLosProductos.css"></style>
