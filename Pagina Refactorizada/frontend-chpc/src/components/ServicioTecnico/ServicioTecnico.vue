<template>
    <div>
      <HeaderAnth
        :isAuthenticated="isAuthenticated"
        @cerrar-sesion="cerrarSesion"
      />
  
      <div class="service-container">
        <h1 class="main-title">Servicio Técnico Especializado</h1>
        <p class="description">
          Descubre los servicios que ofrecemos para garantizar el funcionamiento óptimo de tus equipos.
        </p>
  
        <div class="services-grid">
          <!-- Ejemplo con VIDEO LOCAL -->
          <div class="service-card" @click="showVideoModal('/Videos/video prueba ensamblaje.mp4')">
            <video class="service-image" autoplay muted loop playsinline>
              <source src="/Videos/video prueba ensamblaje.mp4" type="video/mp4">
              Tu navegador no soporta el elemento de video.
            </video>
            <h3>Ensamblaje</h3>
            <p>Montaje, instalación y configuración de equipos segun tus necesidades para proteger tu inversión.</p>
          </div>

          <!-- Ejemplo con VIDEO -->
          <div class="service-card" @click="showImageModal('https://fundacioncarlosslim.org/wp-content/uploads/2020/06/curso-reparacion-laptops-1.jpg')">
            <img src="https://fundacioncarlosslim.org/wp-content/uploads/2020/06/curso-reparacion-laptops-1.jpg" class="service-image" alt="Reparación de laptops"/>
            <h3>Reparación de laptops</h3>
            <p>Solución de problemas de hardware y software para equipos de todas las marcas.</p>
          </div>

          <!-- Ejemplo con IMAGEN -->
          <div class="service-card" @click="showImageModal('https://mediaserver.goepson.com/ImConvServlet/imconv/dd177c7dba57e75ff8038d0cbce730e8f7cf55f1/1200Wx1200H?use=banner&hybrisId=B2C&assetDescr=EcoTank-L3250-690x460-6')">
            <img src="https://mediaserver.goepson.com/ImConvServlet/imconv/dd177c7dba57e75ff8038d0cbce730e8f7cf55f1/1200Wx1200H?use=banner&hybrisId=B2C&assetDescr=EcoTank-L3250-690x460-6" alt="Mantenimiento de impresoras" class="service-image" />
            <h3>Mantenimiento de impresoras</h3>
            <p>Servicios de limpieza y reparación para impresoras láser y de inyección de tinta.</p>
          </div>

          <!-- Ejemplo con VIDEO -->
          <div class="service-card" @click="showVideoModal('https://ekipos.com/inventarios-img/201202-120233_eee.jpg')">
            <img src="https://ekipos.com/inventarios-img/201202-120233_eee.jpg" alt="cambio" class="service-image"/>
            <h3>Reemplazo de pantallas</h3>
            <p>Cambio de pantallas y bisagras dañadas en laptops y equipos All-in-One.</p>
          </div>

          <div class="service-card" @click="showImageModal('https://geekflare.com/es/wp-content/uploads/sites/24/2020/05/best-pc-optimizers.jpg')">
            <img src="https://geekflare.com/es/wp-content/uploads/sites/24/2020/05/best-pc-optimizers.jpg" alt="Optimización de PC" class="service-image" />
            <h3>Optimización de PC</h3>
            <p>Mejoramos el rendimiento de tu computadora con actualizaciones y limpieza profunda para que puedas mantener tus equipos funcionando sin preocupaciones.</p>
          </div>
          <div class="service-card" @click="showImageModal('https://informaticarubinos.com/wp-content/uploads/2021/01/InfoRubi_datos.png')">
            <img src="https://informaticarubinos.com/wp-content/uploads/2021/01/InfoRubi_datos.png" alt="Recuperación de datos" class="service-image" />
            <h3>Recuperación de datos</h3>
            <p>Recuperamos información perdida de discos duros, SSDs y dispositivos externos.</p>
          </div>
        </div>

        <div v-if="isModalVisible" class="modal-overlay" @click="hideImageModal">
          <div class="modal-content" @click.stop>
            <!-- Mostrar imagen o video según el tipo -->
            <img v-if="modalType === 'image'" :src="modalImage" alt="Imagen ampliada" class="modal-image" />
            <video v-else-if="modalType === 'video'" class="modal-image" controls autoplay loop>
              <source :src="modalImage" type="video/mp4">
              Tu navegador no soporta el elemento de video.
            </video>
            <button class="close-button" @click="hideImageModal">&times;</button>
          </div>
        </div>
  
        <div class="contact-section">
          <p>¿Necesitas más información? Contáctanos directamente en WhatsApp:</p>
          <a href="https://wa.me/593995924867" target="_blank" rel="noopener noreferrer" class="whatsapp-link">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" class="whatsapp-icon" />
            <span>Escríbenos en WhatsApp</span>
          </a>
        </div>

        <!-- Botón para mostrar encuesta -->
        <div class="survey-button-container">
          <button class="survey-button" @click="showSurvey">
            ¿Qué te pareció nuestro servicio? Ayudanos a mejorar
          </button>
        </div>
      </div>

      <!-- Modal de Encuesta -->
      <div v-if="isSurveyVisible" class="survey-overlay" @click="hideSurvey">
        <div class="survey-modal" @click.stop>
          <button class="survey-close-btn" @click="hideSurvey">&times;</button>
          
          <h2 class="survey-title">Encuesta de Satisfacción</h2>
          <p class="survey-subtitle">Tu opinión nos ayuda a mejorar nuestros servicios</p>

          <form @submit.prevent="submitSurvey" class="survey-form">
            <!-- Pregunta 1: Calidad del servicio -->
            <div class="survey-question">
              <label class="question-label">¿Cómo calificarías la calidad de nuestro servicio técnico?</label>
              <div class="rating-container">
                <button v-for="star in 5" :key="star" type="button"
                  @click="survey.quality = star" 
                  :class="['star', { active: survey.quality >= star }]"
                  :title="`${star} estrella${star > 1 ? 's' : ''}`">
                  ★
                </button>
              </div>
            </div>

            <!-- Pregunta 2: Tiempo de respuesta -->
            <div class="survey-question">
              <label class="question-label">¿Esta satisfecho con la atención recibida?</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input type="radio" v-model="survey.response" value="excelente" />
                  <span>Excelente</span>
                </label>
                <label class="radio-option">
                  <input type="radio" v-model="survey.response" value="bueno" />
                  <span>Bueno</span>
                </label>
                <label class="radio-option">
                  <input type="radio" v-model="survey.response" value="regular" />
                  <span>Regular</span>
                </label>
                <label class="radio-option">
                  <input type="radio" v-model="survey.response" value="malo" />
                  <span>Malo</span>
                </label>
              </div>
            </div>

            <!-- Pregunta 3: Precio -->
            <div class="survey-question">
              <label class="question-label">¿Consideras que el precio fue justo?</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input type="radio" v-model="survey.price" value="si" />
                  <span>Sí</span>
                </label>
                <label class="radio-option">
                  <input type="radio" v-model="survey.price" value="no" />
                  <span>No</span>
                </label>
                <label class="radio-option">
                  <input type="radio" v-model="survey.price" value="neutral" />
                  <span>Neutral</span>
                </label>
              </div>
            </div>

            <!-- Pregunta 4: Recomendación -->
            <div class="survey-question">
              <label class="question-label">¿Recomendarías nuestros servicios?</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input type="radio" v-model="survey.recommend" value="definitivamente" />
                  <span>Definitivamente</span>
                </label>
                <label class="radio-option">
                  <input type="radio" v-model="survey.recommend" value="probablemente" />
                  <span>Probablemente</span>
                </label>
                <label class="radio-option">
                  <input type="radio" v-model="survey.recommend" value="no" />
                  <span>No</span>
                </label>
              </div>
            </div>

            <!-- Pregunta 5: Comentarios -->
            <div class="survey-question">
              <label class="question-label">Comentarios adicionales (opcional)</label>
              <textarea v-model="survey.comments" 
                class="survey-textarea" 
                placeholder="Cuéntanos qué podemos mejorar..."
                rows="4"></textarea>
            </div>

            <!-- Email opcional -->
            <div class="survey-question">
              <label class="question-label">Tu correo (opcional, para seguimiento)</label>
              <input v-model="survey.email" 
                type="email" 
                class="survey-input" 
                placeholder="tu@email.com" />
            </div>

            <!-- Botones -->
            <div class="survey-buttons">
              <button type="button" @click="hideSurvey" class="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-submit">Enviar Encuesta</button>
            </div>
          </form>

          <!-- Mensaje de éxito -->
          <div v-if="surveySubmitted" class="success-message">
            ✓ ¡Gracias por tu feedback! Tu respuesta ha sido registrada.
          </div>
        </div>
      </div>

      <FooterAnth />
    </div>
  </template>
<script src="./ServicioTecnico.js"></script>
<style src="./ServicioTecnico.css"></style>