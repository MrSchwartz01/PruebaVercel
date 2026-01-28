export default {
  name: 'WhatsAppWidget',
  data() {
    return {
      phoneNumber: '+593995924867',
      defaultMessage: 'Hola! Me gustaría obtener información sobre sus productos.',
      isHovered: false,
      showMessage: false
    };
  },
  computed: {
    whatsappLink() {
      const encodedMessage = encodeURIComponent(this.defaultMessage);
      return `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
    }
  },
  mounted() {
    // Mostrar mensaje de bienvenida después de 3 segundos
    setTimeout(() => {
      this.showMessage = true;
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        this.showMessage = false;
      }, 5000);
    }, 3000);
  }
};
