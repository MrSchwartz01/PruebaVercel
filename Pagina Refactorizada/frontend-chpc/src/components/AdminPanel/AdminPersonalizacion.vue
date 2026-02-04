<template>
  <div class="admin-personalizacion">
    <h2>Personalización de la página</h2>
    <p class="descripcion">
      Personaliza los colores de énfasis de tu tienda.
      Los cambios se aplicarán inmediatamente en todo el sitio.
    </p>

    <div class="colores-section">
      <h3>Colores de Énfasis</h3>
      
      <div class="colores-grid">
        <!-- Color Primario -->
        <div class="color-item">
          <label>Color Primario</label>
          <p class="color-desc">Usado en botones principales, enlaces y elementos destacados</p>
          <div class="color-input-wrapper">
            <input 
              type="color" 
              v-model="colores.primary"
              @input="previewColor"
            />
            <input 
              type="text" 
              v-model="colores.primary"
              @input="previewColor"
              class="hex-input"
              placeholder="#ffa726"
            />
          </div>
        </div>

        <!-- Color Primario Oscuro -->
        <div class="color-item">
          <label>Primario Oscuro</label>
          <p class="color-desc">Usado en estados hover y acentos</p>
          <div class="color-input-wrapper">
            <input 
              type="color" 
              v-model="colores.primaryDark"
              @input="previewColor"
            />
            <input 
              type="text" 
              v-model="colores.primaryDark"
              @input="previewColor"
              class="hex-input"
              placeholder="#fb8c00"
            />
          </div>
        </div>

        <!-- Color Primario Claro -->
        <div class="color-item">
          <label>Primario Claro</label>
          <p class="color-desc">Usado en fondos suaves y elementos secundarios</p>
          <div class="color-input-wrapper">
            <input 
              type="color" 
              v-model="colores.primaryLight"
              @input="previewColor"
            />
            <input 
              type="text" 
              v-model="colores.primaryLight"
              @input="previewColor"
              class="hex-input"
              placeholder="#ffb74d"
            />
          </div>
        </div>

        <!-- Color Éxito -->
        <div class="color-item">
          <label>Color de Éxito</label>
          <p class="color-desc">Usado en mensajes de éxito y confirmaciones</p>
          <div class="color-input-wrapper">
            <input 
              type="color" 
              v-model="colores.success"
              @input="previewColor"
            />
            <input 
              type="text" 
              v-model="colores.success"
              @input="previewColor"
              class="hex-input"
              placeholder="#4caf50"
            />
          </div>
        </div>

        <!-- Color Error -->
        <div class="color-item">
          <label>Color de Error</label>
          <p class="color-desc">Usado en mensajes de error y alertas</p>
          <div class="color-input-wrapper">
            <input 
              type="color" 
              v-model="colores.error"
              @input="previewColor"
            />
            <input 
              type="text" 
              v-model="colores.error"
              @input="previewColor"
              class="hex-input"
              placeholder="#f44336"
            />
          </div>
        </div>
      </div>

      <!-- Vista previa -->
      <div class="preview-section">
        <h3>Vista Previa</h3>
        <div class="preview-container" :style="previewStyles">
          <button class="preview-btn primary" :style="{ backgroundColor: colores.primary }">
            Botón Primario
          </button>
          <button class="preview-btn primary-dark" :style="{ backgroundColor: colores.primaryDark }">
            Botón Hover
          </button>
          <button class="preview-btn success" :style="{ backgroundColor: colores.success }">
            ✓ Éxito
          </button>
          <button class="preview-btn error" :style="{ backgroundColor: colores.error }">
            ✗ Error
          </button>
          <div class="preview-link" :style="{ color: colores.primary }">
            Enlace de ejemplo
          </div>
          <div class="preview-badge" :style="{ backgroundColor: colores.primaryLight, color: colores.primaryDark }">
            Etiqueta
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="actions-section">
        <button 
          class="btn btn-primary" 
          @click="guardarColores"
          :disabled="guardando"
        >
          {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
        <button 
          class="btn btn-secondary" 
          @click="resetearColores"
          :disabled="guardando"
        >
          Restablecer Valores por Defecto
        </button>
      </div>

      <!-- Mensaje -->
      <div v-if="mensaje" :class="['mensaje', tipoMensaje]">
        {{ mensaje }}
      </div>
    </div>

    <!-- Paletas predefinidas -->
    <div class="paletas-section">
      <h3>Paletas Predefinidas</h3>
      <p class="descripcion">Selecciona una paleta de colores predefinida para aplicar rápidamente.</p>
      
      <div class="paletas-grid">
        <div 
          v-for="paleta in paletasPredefinidas" 
          :key="paleta.nombre"
          class="paleta-card"
          @click="aplicarPaleta(paleta)"
        >
          <div class="paleta-preview">
            <span :style="{ backgroundColor: paleta.primary }"></span>
            <span :style="{ backgroundColor: paleta.primaryDark }"></span>
            <span :style="{ backgroundColor: paleta.primaryLight }"></span>
          </div>
          <span class="paleta-nombre">{{ paleta.nombre }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./AdminPersonalizacion.js"></script>
<style src="./AdminPersonalizacion.css"></style>
