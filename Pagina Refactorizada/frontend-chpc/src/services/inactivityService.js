/**
 * Servicio global de manejo de inactividad
 * Permite reiniciar el timer de inactividad desde cualquier componente
 */

class InactivityService {
  constructor() {
    this.resetCallback = null;
  }

  // Registrar la función de reseteo del App.vue
  registerResetFunction(callback) {
    this.resetCallback = callback;
  }

  // Resetear el timer de inactividad
  resetTimer() {
    if (this.resetCallback && typeof this.resetCallback === 'function') {
      this.resetCallback();
    }
  }

  // Limpiar el servicio
  cleanup() {
    this.resetCallback = null;
  }
}

// Exportar una instancia única (singleton)
export default new InactivityService();
