<template>
  <div class="contacto-asesor">
    <div class="contacto-asesor-content">
      <div class="icon">❓</div>
      <h3>¿No encontraste lo que estás buscando?</h3>
      <p>
        Si no encontraste el producto o solución que buscabas, contáctate con alguno de nuestros 
        <a :href="whatsappLink" target="_blank" rel="noopener noreferrer" class="link-asesor">
          asesores
        </a>
      </p>
      <a :href="whatsappLink" target="_blank" rel="noopener noreferrer" class="btn-whatsapp">
        <span class="whatsapp-icon">💬</span>
        Chatear con un Asesor
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactoAsesor',
  props: {
    mensaje: {
      type: String,
      default: '¡Hola! Necesito ayuda para encontrar un producto.'
    }
  },
  computed: {
    whatsappLink() {
      // Número de WhatsApp de la empresa (reemplaza con el número real)
      const numeroWhatsApp = '593995924867'; // Formato: código país + número sin +
      const mensajeEncoded = encodeURIComponent(this.mensaje);
      return `https://wa.me/${numeroWhatsApp}?text=${mensajeEncoded}`;
    }
  }
};
</script>

<style scoped>
.contacto-asesor {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
  margin: 40px 0 0 0;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.contacto-asesor-content {
  max-width: 600px;
  margin: 0 auto;
}

.icon {
  font-size: 48px;
  margin-bottom: 15px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.contacto-asesor h3 {
  color: #2c3e50;
  font-size: 24px;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.contacto-asesor p {
  color: #5a6c7d;
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 25px 0;
}

.link-asesor {
  color: #25d366;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 2px solid #25d366;
  transition: all 0.3s ease;
}

.link-asesor:hover {
  color: #128c7e;
  border-bottom-color: #128c7e;
}

.btn-whatsapp {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
}

.btn-whatsapp:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
  background: linear-gradient(135deg, #128c7e 0%, #075e54 100%);
}

.btn-whatsapp:active {
  transform: translateY(0);
}

.whatsapp-icon {
  font-size: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .contacto-asesor {
    padding: 30px 15px;
    margin: 30px 0 0 0;
  }

  .icon {
    font-size: 36px;
  }

  .contacto-asesor h3 {
    font-size: 20px;
  }

  .contacto-asesor p {
    font-size: 14px;
  }

  .btn-whatsapp {
    font-size: 14px;
    padding: 12px 24px;
  }
}
</style>
