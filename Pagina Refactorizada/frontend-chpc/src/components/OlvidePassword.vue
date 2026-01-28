<template>
  <div class="olvide-password-container">
    <div class="olvide-password-card">
      <div class="header">
        <div class="icon">🔐</div>
        <h1>¿Olvidaste tu contraseña?</h1>
        <p class="subtitle">No te preocupes, te ayudaremos a recuperarla</p>
      </div>

      <!-- Formulario de solicitud -->
      <form v-if="!emailEnviado" @submit.prevent="solicitarRestablecimiento" class="form">
        <p class="instructions">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="tucorreo@ejemplo.com"
            required
            :disabled="enviando"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <button type="submit" class="btn-submit" :disabled="enviando">
          <span v-if="!enviando">Enviar Enlace de Recuperación</span>
          <span v-else>Enviando... ⏳</span>
        </button>

        <div v-if="error" class="error-box">
          {{ error }}
        </div>
      </form>

      <!-- Mensaje de éxito -->
      <div v-else class="success-message">
        <div class="success-icon">✅</div>
        <h2>¡Correo Enviado!</h2>
        <p>
          Hemos enviado un enlace de recuperación a <strong>{{ email }}</strong>
        </p>
        <p class="info">
          Por favor revisa tu bandeja de entrada y sigue las instrucciones. 
          El enlace expirará en <strong>1 hora</strong>.
        </p>
        <p class="info-secondary">
          Si no ves el correo, revisa tu carpeta de spam o correo no deseado.
        </p>
      </div>

      <!-- Enlaces -->
      <div class="footer-links">
        <router-link to="/login" class="link">
          ← Volver al inicio de sesión
        </router-link>
        <span v-if="emailEnviado" class="separator">|</span>
        <button 
          v-if="emailEnviado" 
          @click="resetForm" 
          class="link-button"
        >
          Enviar otro correo
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export default {
  name: 'OlvidePassword',
  data() {
    return {
      email: '',
      enviando: false,
      emailEnviado: false,
      error: '',
      errors: {}
    };
  },
  methods: {
    async solicitarRestablecimiento() {
      // Limpiar errores previos
      this.error = '';
      this.errors = {};

      // Validación básica
      if (!this.email) {
        this.errors.email = 'El correo electrónico es requerido';
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.errors.email = 'Por favor ingresa un correo electrónico válido';
        return;
      }

      this.enviando = true;

      try {
        await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
          email: this.email
        });

        // Por seguridad, siempre mostramos éxito aunque el email no exista
        this.emailEnviado = true;
      } catch (err) {
        console.error('Error al solicitar restablecimiento:', err);

        if (err.response?.status === 429) {
          this.error = 'Demasiados intentos. Por favor espera unos minutos e intenta nuevamente.';
        } else if (err.response?.status === 400) {
          this.errors.email = err.response.data.message || 'Correo electrónico inválido';
        } else {
          this.error = 'Error al enviar el correo. Por favor intenta nuevamente.';
        }
      } finally {
        this.enviando = false;
      }
    },
    resetForm() {
      this.email = '';
      this.emailEnviado = false;
      this.error = '';
      this.errors = {};
      this.enviando = false;
    }
  }
};
</script>

<style scoped>
.olvide-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.olvide-password-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
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

.instructions {
  text-align: center;
  color: #555;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 25px;
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

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  display: block;
  color: #dc3545;
  font-size: 13px;
  margin-top: 5px;
}

.btn-submit {
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
  margin-top: 10px;
}

.btn-submit:hover:not(:disabled) {
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

.success-message {
  text-align: center;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.success-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.success-message h2 {
  color: #28a745;
  font-size: 24px;
  margin: 0 0 15px 0;
}

.success-message p {
  color: #555;
  font-size: 15px;
  line-height: 1.6;
  margin: 10px 0;
}

.info {
  background-color: #e8f5e9;
  padding: 12px;
  border-radius: 8px;
  margin: 15px 0;
}

.info-secondary {
  color: #777;
  font-size: 13px;
  font-style: italic;
}

.footer-links {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 0;
}

.link-button:hover {
  color: #764ba2;
  text-decoration: underline;
}

.separator {
  color: #ccc;
}

@media (max-width: 600px) {
  .olvide-password-card {
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
