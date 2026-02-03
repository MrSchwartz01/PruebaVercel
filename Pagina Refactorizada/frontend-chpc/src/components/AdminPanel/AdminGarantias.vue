<template>
  <div class="admin-garantias">
    <div class="garantias-header">
      <h2>Gestión de Garantías por Marca</h2>
      <button class="btn-nueva-garantia" @click="abrirModalNueva">
        <i class="fas fa-plus"></i> Nueva Garantía
      </button>
    </div>

    <!-- Mensaje de carga -->
    <div v-if="cargando" class="loading-message">
      <i class="fas fa-spinner fa-spin"></i> Cargando garantías...
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i> {{ error }}
    </div>

    <!-- Tabla de garantías -->
    <div v-if="!cargando && garantias.length > 0" class="garantias-table-container">
      <table class="garantias-table">
        <thead>
          <tr>
            <th>Marca</th>
            <th>Meses de Garantía</th>
            <th>Mensaje</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="garantia in garantias" :key="garantia.id" :class="{ 'inactiva': !garantia.activo }">
            <td class="marca-cell">{{ garantia.marca }}</td>
            <td class="meses-cell">{{ garantia.meses }} meses</td>
            <td class="mensaje-cell">{{ garantia.mensaje }}</td>
            <td class="estado-cell">
              <span :class="['estado-badge', garantia.activo ? 'activo' : 'inactivo']">
                {{ garantia.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="acciones-cell">
              <button class="btn-editar" @click="editarGarantia(garantia)" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-eliminar" @click="confirmarEliminar(garantia)" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mensaje cuando no hay garantías -->
    <div v-if="!cargando && garantias.length === 0" class="no-garantias">
      <i class="fas fa-shield-alt"></i>
      <p>No hay garantías configuradas</p>
      <p class="sub-mensaje">Haz clic en "Nueva Garantía" para agregar una</p>
    </div>

    <!-- Modal para crear/editar garantía -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-garantia">
        <div class="modal-header">
          <h3>{{ modoEdicion ? 'Editar Garantía' : 'Nueva Garantía' }}</h3>
          <button class="btn-cerrar" @click="cerrarModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="guardarGarantia" class="form-garantia">
          <div class="form-group">
            <label for="marca">Marca *</label>
            <div class="marca-input-container">
              <input
                type="text"
                id="marca"
                v-model="formGarantia.marca"
                list="marcas-sugeridas"
                placeholder="Selecciona o escribe una marca"
                required
                :disabled="modoEdicion"
              />
              <datalist id="marcas-sugeridas">
                <option v-for="marca in marcasDisponibles" :key="marca" :value="marca" />
              </datalist>
            </div>
          </div>

          <div class="form-group">
            <label for="meses">Meses de Garantía *</label>
            <input
              type="number"
              id="meses"
              v-model.number="formGarantia.meses"
              min="0"
              max="120"
              required
              placeholder="Ej: 6"
            />
          </div>

          <div class="form-group">
            <label for="mensaje">Mensaje de Garantía *</label>
            <textarea
              id="mensaje"
              v-model="formGarantia.mensaje"
              rows="4"
              required
              placeholder="Ej: Este producto cuenta con 6 meses de garantía directa con la marca..."
              maxlength="500"
            ></textarea>
            <span class="char-count">{{ formGarantia.mensaje.length }}/500</span>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formGarantia.activo" />
              <span class="checkmark"></span>
              Garantía activa
            </label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancelar" @click="cerrarModal">
              Cancelar
            </button>
            <button type="submit" class="btn-guardar" :disabled="guardando">
              <i v-if="guardando" class="fas fa-spinner fa-spin"></i>
              {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="mostrarModalEliminar" class="modal-overlay" @click.self="cancelarEliminar">
      <div class="modal-confirmar">
        <div class="modal-header">
          <h3>Confirmar Eliminación</h3>
        </div>
        <div class="modal-body">
          <i class="fas fa-exclamation-triangle warning-icon"></i>
          <p>¿Estás seguro de que deseas eliminar la garantía para <strong>{{ garantiaAEliminar?.marca }}</strong>?</p>
          <p class="sub-mensaje">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancelar" @click="cancelarEliminar">
            Cancelar
          </button>
          <button class="btn-eliminar-confirmar" @click="eliminarGarantia" :disabled="eliminando">
            <i v-if="eliminando" class="fas fa-spinner fa-spin"></i>
            {{ eliminando ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./AdminGarantias.js"></script>
<style scoped src="./AdminGarantias.css"></style>
