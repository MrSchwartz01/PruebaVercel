<template>
    <div>
      <!-- Header con opción para ir a la página principal -->
      <HeaderAnth
        :searchQuery="searchQuery"
        :isAuthenticated="isAuthenticated"
        @buscar="buscarProductos"
        @cerrar-sesion="cerrarSesion"
      />
  
      <!-- Contenedor de inicio de sesión -->
      <div class="login-container">
        <h2>Iniciar Sesión</h2>
        
        <!-- Mensaje de error general -->
        <div v-if="error" class="error-message-box">
          {{ error }}
        </div>
        
        <form @submit.prevent="login">
          <div class="input-group">
            <label for="nombre_usuario">Nombre de usuario *</label>
            <input
              v-model="nombre_usuario"
              id="nombre_usuario"
              type="text"
              placeholder="Nombre de usuario"
              required
              @input="clearError('nombre_usuario')"
            />
            <p v-if="errors.nombre_usuario" class="error">{{ errors.nombre_usuario }}</p>
          </div>
  
          <div class="input-group">
            <label for="contraseña">Contraseña *</label>
            <div class="password-container">
              <input
                v-model="contraseña"
                id="contraseña"
                :type="passwordVisible ? 'text' : 'password'"
                placeholder="Contraseña"
                required
                @input="clearError('contraseña')"
              />
              <span class="toggle-password" @click="togglePasswordVisibility">
                {{ passwordVisible ? '👁️' : '🙈' }}
              </span>
            </div>
            <p v-if="errors.contraseña" class="error">{{ errors.contraseña }}</p>
          </div>
  
          <button type="submit" class="login-button">Iniciar sesión</button>
          
          <div class="forgot-password-container">
            <router-link to="/olvide-password" class="forgot-password-link">
              ¿Olvidaste tu contraseña?
            </router-link>
          </div>

          <p class="account-info">
            ¿No tiene una cuenta? 
            <button class="create-account-link" @click="goToRegister">
              Regístrese aquí
            </button>
          </p>
        </form>
      </div>
    </div>
  </template>
  <script src="./SesionUsuario.js"></script>
  <style src="./SesionUsuario.css"></style>