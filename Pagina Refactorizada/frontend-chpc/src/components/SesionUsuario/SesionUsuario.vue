<template>
  <div class="page-layout">
    <!-- Header -->
    <HeaderAnth
      :searchQuery="searchQuery"
      :isAuthenticated="isAuthenticated"
      @buscar="buscarProductos"
      @cerrar-sesion="cerrarSesion"
    />

    <!-- Hero Section -->
    <section class="hero-section">
      <h1 class="hero-title">Iniciar Sesión</h1>
      <p class="hero-subtitle">Accede a tu cuenta para continuar</p>
    </section>

    <!-- Contenido Principal -->
    <div class="content-container narrow">
      <div class="auth-card">
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
              <button type="button" class="toggle-password" @click="togglePasswordVisibility" aria-label="Mostrar/ocultar contraseña">
                <!-- Ojo abierto (visible) -->
                <svg v-if="passwordVisible" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <!-- Ojo cerrado (oculto) -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
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
            <router-link to="/registro" class="create-account-link">
              Regístrese aquí
            </router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
  <script src="./SesionUsuario.js"></script>
  <style src="./SesionUsuario.css"></style>