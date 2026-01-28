<template>
  <div class="crear-work-order">
    <!-- Encabezado -->
    <div class="header-section">
      <button @click="volverAlPanel" class="btn-volver">
        ← Volver al Panel de Técnicos
      </button>
      <h1>Crear Nueva Orden de Servicio Técnico</h1>
      <p class="subtitle">Complete el formulario con los datos del equipo y el problema reportado</p>
    </div>

    <!-- Mensaje de éxito -->
    <div v-if="mensajeExito" class="mensaje-exito">
      <span class="icono-exito">✓</span>
      <div class="mensaje-contenido">
        <strong>¡Orden creada exitosamente!</strong>
        <p>Tracking ID: <strong>{{ trackingIdCreado }}</strong></p>
        <p>{{ mensajeExito }}</p>
      </div>
      <button @click="resetFormulario" class="btn-crear-otra">
        Crear otra orden
      </button>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="mensaje-error">
      <span class="icono-error">✕</span>
      {{ error }}
    </div>

    <!-- Formulario -->
    <form v-if="!mensajeExito" @submit.prevent="crearOrden" class="formulario">
      <!-- Sección: Datos del Cliente -->
      <div class="seccion-form">
        <h2 class="titulo-seccion">
          <span class="icono-seccion">👤</span>
          Datos del Cliente
        </h2>
        <div class="form-grid">
          <div class="form-group">
            <label for="cliente_nombre">Nombre Completo *</label>
            <input
              type="text"
              id="cliente_nombre"
              v-model="formulario.cliente_nombre"
              placeholder="Ej: Juan Pérez García"
              required
              :disabled="cargando"
            />
          </div>

          <div class="form-group">
            <label for="cliente_telefono">Teléfono *</label>
            <input
              type="tel"
              id="cliente_telefono"
              v-model="formulario.cliente_telefono"
              placeholder="Ej: 555-0123"
              required
              :disabled="cargando"
            />
          </div>

          <div class="form-group full-width">
            <label for="cliente_email">Email (opcional)</label>
            <input
              type="email"
              id="cliente_email"
              v-model="formulario.cliente_email"
              placeholder="Ej: cliente@ejemplo.com"
              :disabled="cargando"
            />
          </div>
        </div>
      </div>

      <!-- Sección: Datos del Equipo -->
      <div class="seccion-form">
        <h2 class="titulo-seccion">
          <span class="icono-seccion">💻</span>
          Datos del Equipo
        </h2>
        <div class="form-grid">
          <div class="form-group">
            <label for="marca_equipo">Marca *</label>
            <input
              type="text"
              id="marca_equipo"
              v-model="formulario.marca_equipo"
              placeholder="Ej: HP, Dell, Lenovo"
              required
              :disabled="cargando"
            />
          </div>

          <div class="form-group">
            <label for="modelo_equipo">Modelo *</label>
            <input
              type="text"
              id="modelo_equipo"
              v-model="formulario.modelo_equipo"
              placeholder="Ej: Pavilion 15, Inspiron 14"
              required
              :disabled="cargando"
            />
          </div>

          <div class="form-group full-width">
            <label for="numero_serie">Número de Serie (opcional)</label>
            <input
              type="text"
              id="numero_serie"
              v-model="formulario.numero_serie"
              placeholder="Ej: SN123456789"
              :disabled="cargando"
            />
          </div>
        </div>
      </div>

      <!-- Sección: Problema Reportado -->
      <div class="seccion-form">
        <h2 class="titulo-seccion">
          <span class="icono-seccion">🔧</span>
          Descripción del Problema
        </h2>
        <div class="form-group full-width">
          <label for="descripcion_problema">Problema Reportado *</label>
          <textarea
            id="descripcion_problema"
            v-model="formulario.descripcion_problema"
            placeholder="Describa detalladamente el problema: síntomas, cuándo ocurrió, si hay mensajes de error, etc."
            rows="6"
            required
            :disabled="cargando"
          ></textarea>
          <small class="help-text">
            Sea lo más específico posible para ayudar al técnico a diagnosticar mejor el problema
          </small>
        </div>
      </div>

      <!-- Sección: Costos -->
      <div class="seccion-form">
        <h2 class="titulo-seccion">
          <span class="icono-seccion">💰</span>
          Costo Estimado
        </h2>
        <div class="form-group">
          <label for="costo_estimado">Costo Estimado (USD) *</label>
          <input
            type="number"
            id="costo_estimado"
            v-model.number="formulario.costo_estimado"
            placeholder="0.00"
            step="0.01"
            min="0"
            required
            :disabled="cargando"
          />
          <small class="help-text">
            Este es un costo estimado que puede variar después del diagnóstico
          </small>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="botones-accion">
        <button type="button" @click="volverAlPanel" class="btn-cancelar" :disabled="cargando">
          Cancelar
        </button>
        <button type="submit" class="btn-crear" :disabled="cargando">
          <span v-if="!cargando">
            <span class="icono-btn">✓</span>
            Crear Orden de Servicio
          </span>
          <span v-else class="spinner-btn">Creando...</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script src="./CrearWorkOrder.js"></script>
<style src="./CrearWorkOrder.css"></style>
