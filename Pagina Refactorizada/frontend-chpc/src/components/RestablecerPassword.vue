<template>
  <div class="restablecer-password-container">
    <div class="restablecer-password-card">
      <!-- Verificando token -->
      <div v-if="verificandoToken" class="loading-state">
        <div class="spinner"></div>
        <p>Verificando enlace de recuperación...</p>
      </div>

      <!-- Token inválido o expirado -->
      <div v-else-if="tokenInvalido" class="error-state">
        <div class="error-icon">❌</div>
        <h2>Enlace Inválido o Expirado</h2>
        <p>{{ mensajeError }}</p>
        <router-link to="/olvide-password" class="btn-primary">
          Solicitar Nuevo Enlace
        </router-link>
        <router-link to="/login" class="link">
          Volver al inicio de sesión
        </router-link>
      </div>

      <!-- Formulario de restablecimiento -->
      <div v-else-if="!passwordRestablecido" class="form-container">
        <div class="header">
          <div class="icon">🔑</div>
          <h1>Restablecer Contraseña</h1>
          <p class="subtitle">Ingresa tu nueva contraseña</p>
        </div>

        <form @submit.prevent="restablecerPassword" class="form">
          <div class="form-group">
            <label for="newPassword">Nueva Contraseña</label>
            <div class="password-input-wrapper">
              <input
                :type="mostrarPassword ? 'text' : 'password'"
                id="newPassword"
                v-model="newPassword"
                placeholder="Mínimo 6 caracteres"
                required
                :disabled="enviando"
              />
              <button
                type="button"
                class="toggle-password"
                @click="mostrarPassword = !mostrarPassword"
                :disabled="enviando"
              >
                {{ mostrarPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <span v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</span>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmar Contraseña</label>
            <div class="password-input-wrapper">
              <input
                :type="mostrarConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                v-model="confirmPassword"
                placeholder="Repite tu contraseña"
                required
                :disabled="enviando"
              />
              <button
                type="button"
                class="toggle-password"
                @click="mostrarConfirmPassword = !mostrarConfirmPassword"
                :disabled="enviando"
              >
                {{ mostrarConfirmPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
          </div>

          <!-- Requisitos de contraseña -->
          <div class="password-requirements">
            <p class="requirements-title">La contraseña debe contener:</p>
            <ul>
              <li :class="{ valid: tieneMinimo6Caracteres }">
                {{ tieneMinimo6Caracteres ? '✓' : '○' }} Mínimo 6 caracteres
              </li>
              <li :class="{ valid: tieneLetra }">
                {{ tieneLetra ? '✓' : '○' }} Al menos una letra
              </li>
              <li :class="{ valid: tieneNumero }">
                {{ tieneNumero ? '✓' : '○' }} Al menos un número
              </li>
              <li :class="{ valid: tieneCaracterEspecial }">
                {{ tieneCaracterEspecial ? '✓' : '○' }} Al menos un carácter especial (@$!%*?&.,-_:)
              </li>
            </ul>
          </div>

          <button type="submit" class="btn-submit" :disabled="enviando || !formularioValido">
            <span v-if="!enviando">Cambiar Contraseña</span>
            <span v-else>Procesando... ⏳</span>
          </button>

          <div v-if="error" class="error-box">
            {{ error }}
          </div>
        </form>
      </div>

      <!-- Éxito -->
      <div v-else class="success-state">
        <div class="success-icon">✅</div>
        <h2>¡Contraseña Actualizada!</h2>
        <p>Tu contraseña ha sido cambiada exitosamente.</p>
        <p class="info">
          Ahora puedes iniciar sesión con tu nueva contraseña.
        </p>
        <router-link to="/login" class="btn-primary">
          Ir a Inicio de Sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export default {
  name: 'RestablecerPassword',
  data() {
    return {
      token: '',
      newPassword: '',
      confirmPassword: '',
      mostrarPassword: false,
      mostrarConfirmPassword: false,
      verificandoToken: true,
      tokenInvalido: false,
      passwordRestablecido: false,
      enviando: false,
      error: '',
      errors: {},
      mensajeError: ''
    };
  },
  computed: {
    tieneMinimo6Caracteres() {
      return this.newPassword.length >= 6;
    },
    tieneLetra() {
      return /[A-Za-z]/.test(this.newPassword);
    },
    tieneNumero() {
      return /\d/.test(this.newPassword);
    },
    tieneCaracterEspecial() {
      return /[@$!%*?&.,\-_:]/.test(this.newPassword);
    },
    passwordValida() {
      return this.tieneMinimo6Caracteres && 
             this.tieneLetra && 
             this.tieneNumero && 
             this.tieneCaracterEspecial;
    },
    passwordsCoinciden() {
      return this.newPassword === this.confirmPassword && this.confirmPassword.length > 0;
    },
    formularioValido() {
      return this.passwordValida && this.passwordsCoinciden;
    }
  },
  mounted() {
    // Obtener token de la URL
    this.token = this.$route.query.token;
    
    if (!this.token) {
      this.tokenInvalido = true;
      this.mensajeError = 'No se encontró el token de recuperación en la URL.';
      this.verificandoToken = false;
      return;
    }

    this.verificarToken();
  },
  methods: {
    async verificarToken() {
      try {
        await axios.get(`${API_BASE_URL}/auth/verify-reset-token`, {
          params: { token: this.token }
        });
        
        this.verificandoToken = false;
      } catch (err) {
        console.error('Error al verificar token:', err);
        this.tokenInvalido = true;
        this.verificandoToken = false;

        if (err.response?.status === 400) {
          this.mensajeError = err.response.data.message || 'El token de recuperación es inválido o ha expirado.';
        } else {
          this.mensajeError = 'El enlace de recuperación es inválido o ha expirado. Los enlaces son válidos por 1 hora.';
        }
      }
    },
    async restablecerPassword() {
      // Limpiar errores previos
      this.error = '';
      this.errors = {};

      // Validaciones
      if (!this.passwordValida) {
        this.errors.newPassword = 'La contraseña no cumple con los requisitos de seguridad';
        return;
      }

      if (!this.passwordsCoinciden) {
        this.errors.confirmPassword = 'Las contraseñas no coinciden';
        return;
      }

      this.enviando = true;

      try {
        await axios.post(`${API_BASE_URL}/auth/reset-password`, {
          token: this.token,
          newPassword: this.newPassword
        });

        this.passwordRestablecido = true;
      } catch (err) {
        console.error('Error al restablecer contraseña:', err);

        if (err.response?.status === 400) {
          this.error = err.response.data.message || 'El token es inválido o ha expirado.';
        } else if (err.response?.status === 500) {
          this.error = 'Error del servidor. Por favor intenta nuevamente.';
        } else {
          this.error = 'Error al cambiar la contraseña. Por favor intenta nuevamente.';
        }
      } finally {
        this.enviando = false;
      }
    }
  }
};
</script>

<style scoped>
.restablecer-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.restablecer-password-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 550px;
  width: 100%;
  padding: 40px;
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Estados de carga y error */
.loading-state,
.error-state,
.success-state {
  text-align: center;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.success-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.error-state h2,
.success-state h2 {
  font-size: 24px;
  margin: 0 0 15px 0;
}

.error-state h2 {
  color: #dc3545;
}

.success-state h2 {
  color: #28a745;
}

.error-state p,
.success-state p {
  color: #555;
  font-size: 15px;
  line-height: 1.6;
  margin: 10px 0;
}

.info {
  background-color: #e8f5e9;
  padding: 12px;
  border-radius: 8px;
  margin: 15px 0 25px 0;
}

/* Formulario */
.header {
  text-align: center;
  margin-bottom: 30px;
}

.icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.header h1 {
  font-size: 28px;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  flex: 1;
  padding: 12px 50px 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.password-input-wrapper input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.password-input-wrapper input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.toggle-password:hover:not(:disabled) {
  opacity: 1;
}

.toggle-password:disabled {
  cursor: not-allowed;
}

.error-message {
  display: block;
  color: #dc3545;
  font-size: 13px;
  margin-top: 5px;
}

.password-requirements {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.requirements-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  font-size: 13px;
  color: #666;
  padding: 5px 0;
  transition: all 0.3s ease;
}

.password-requirements li.valid {
  color: #28a745;
  font-weight: 500;
}

.btn-submit,
.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  box-sizing: border-box;
}

.btn-submit:hover:not(:disabled),
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-box {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 12px 15px;
  border-radius: 5px;
  margin-top: 20px;
  color: #856404;
  font-size: 14px;
}

.link {
  display: inline-block;
  margin-top: 15px;
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.link:hover {
  color: #764ba2;
  text-decoration: underline;
}

@media (max-width: 600px) {
  .restablecer-password-card {
    padding: 30px 20px;
  }

  .header h1 {
    font-size: 24px;
  }

  .icon {
    font-size: 50px;
  }
}
</style>
