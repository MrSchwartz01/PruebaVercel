<template>
  <div class="admin-productos">
    <div class="productos-header">
      <h2>Gestión de Productos</h2>
      <button @click="showCreateModal = true" class="btn btn-primary">
        + Nuevo Producto
      </button>
    </div>

    <!-- Lista de productos -->
    <div v-if="cargando" class="loading">⏳ Cargando productos...</div>

    <div v-else class="productos-grid">
      <div
        v-for="producto in productos"
        :key="producto.id"
        class="producto-card"
        :class="{ inactivo: !producto.activo }"
      >
        <div class="producto-imagen">
          <img
            :src="producto.imagen_url || '/placeholder.jpg'"
            :alt="producto.nombre_producto"
          />
          <span v-if="!producto.activo" class="badge-inactivo">Inactivo</span>
        </div>

        <div class="producto-info">
          <h3>{{ producto.nombre_producto }}</h3>
          <p class="categoria">{{ producto.categoria }} - {{ producto.subcategoria }}</p>
          <p class="precio">${{ producto.precio }}</p>
          <p class="stock">
            Stock: <strong>{{ producto.stock }}</strong>
          </p>
        </div>

        <div class="producto-actions">
          <button @click="editarProducto(producto)" class="btn-icon" title="Editar">
            ✏️
          </button>
          <button
            @click="gestionarImagenes(producto)"
            class="btn-icon"
            title="Gestionar Imágenes"
          >
            🖼️
          </button>
          <button
            @click="toggleActivo(producto)"
            :class="['btn-icon', producto.activo ? 'btn-danger' : 'btn-success']"
            :title="producto.activo ? 'Desactivar' : 'Activar'"
          >
            {{ producto.activo ? '🚫' : '✅' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Editar Producto -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="cerrarEditModal">
      <div class="modal-content large">
        <div class="modal-header">
          <h3>{{ editando ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
          <button class="btn-close" @click="cerrarEditModal">×</button>
        </div>

        <form @submit.prevent="guardarProducto" class="producto-form">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre del Producto *</label>
              <input
                v-model="formProducto.nombre_producto"
                type="text"
                required
                placeholder="Ej: Laptop ASUS ROG"
              />
            </div>

            <div class="form-group">
              <label>SKU</label>
              <input
                v-model="formProducto.sku"
                type="text"
                placeholder="Código único"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Descripción *</label>
            <textarea
              v-model="formProducto.descripcion"
              rows="4"
              required
              placeholder="Descripción detallada del producto"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Precio *</label>
              <input
                v-model.number="formProducto.precio"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div class="form-group">
              <label>Stock *</label>
              <input
                v-model.number="formProducto.stock"
                type="number"
                min="0"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Marca</label>
              <input v-model="formProducto.marca" type="text" />
            </div>

            <div class="form-group">
              <label>Color</label>
              <input v-model="formProducto.color" type="text" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Categoría</label>
              <select v-model="formProducto.categoria">
                <option value="">Seleccione...</option>
                <option value="Laptops">Laptops</option>
                <option value="Componentes">Componentes</option>
                <option value="Perifericos">Periféricos</option>
                <option value="Almacenamiento">Almacenamiento</option>
                <option value="Redes">Redes</option>
                <option value="Audio">Audio</option>
              </select>
            </div>

            <div class="form-group">
              <label>Subcategoría</label>
              <input v-model="formProducto.subcategoria" type="text" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Modelo</label>
              <input v-model="formProducto.modelo" type="text" />
            </div>

            <div class="form-group">
              <label>Garantía</label>
              <input v-model="formProducto.garantia" type="text" placeholder="Ej: 1 año" />
            </div>
          </div>

          <div class="form-group">
            <label>Especificaciones Técnicas</label>
            <textarea
              v-model="formProducto.especificaciones"
              rows="3"
              placeholder="Detalles técnicos del producto"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group checkbox-group">
              <label>
                <input v-model="formProducto.destacado" type="checkbox" />
                Producto Destacado
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input v-model="formProducto.activo" type="checkbox" />
                Producto Activo
              </label>
            </div>
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn btn-primary" :disabled="guardando">
              {{ guardando ? 'Guardando...' : 'Guardar Producto' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="cerrarEditModal">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Gestión de Imágenes -->
    <div v-if="showImagenesModal" class="modal-overlay" @click.self="cerrarImagenesModal">
      <div class="modal-content large">
        <div class="modal-header">
          <h3>Imágenes de {{ productoActual?.nombre_producto }}</h3>
          <button class="btn-close" @click="cerrarImagenesModal">×</button>
        </div>

        <div class="imagenes-manager">
          <!-- Subir nueva imagen -->
          <div class="upload-section">
            <h4>Subir Nueva Imagen</h4>
            <div class="upload-area">
              <input
                type="file"
                ref="fileInput"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                @change="handleFileSelected"
                style="display: none"
              />
              <button @click="$refs.fileInput.click()" class="btn btn-upload">
                📁 Seleccionar Imagen
              </button>
              <p v-if="archivoSeleccionado" class="file-name">
                {{ archivoSeleccionado.name }}
              </p>
            </div>

            <div v-if="archivoSeleccionado" class="upload-options">
              <label>
                <input v-model="imagenPrincipal" type="checkbox" />
                Marcar como imagen principal
              </label>
              <button
                @click="subirImagen"
                class="btn btn-primary"
                :disabled="subiendoImagen"
              >
                {{ subiendoImagen ? 'Subiendo...' : 'Subir Imagen' }}
              </button>
            </div>
          </div>

          <!-- Lista de imágenes existentes -->
          <div class="imagenes-list">
            <h4>Imágenes Actuales ({{ imagenes.length }})</h4>
            <div v-if="cargandoImagenes" class="loading-small">Cargando...</div>
            <div v-else-if="imagenes.length === 0" class="empty-state">
              No hay imágenes. Sube la primera.
            </div>
            <div v-else class="imagenes-grid">
              <div
                v-for="imagen in imagenes"
                :key="imagen.id"
                class="imagen-item"
                :class="{ principal: imagen.es_principal }"
              >
                <img :src="imagen.ruta_imagen" :alt="`Imagen ${imagen.orden + 1}`" />
                <div class="imagen-overlay">
                  <span v-if="imagen.es_principal" class="badge-principal">Principal</span>
                  <div class="imagen-actions">
                    <button
                      v-if="!imagen.es_principal"
                      @click="marcarPrincipal(imagen.id)"
                      class="btn-icon-small"
                      title="Marcar como principal"
                    >
                      ⭐
                    </button>
                    <button
                      @click="eliminarImagen(imagen.id)"
                      class="btn-icon-small btn-danger"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="cerrarImagenesModal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./AdminProductos.js"></script>
<style src="./AdminProductos.css"></style>
