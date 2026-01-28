export default {
  name: "HistorialProductosVistos",
  computed: {
    historial() {
      return this.$store.getters.historialProductosVistos;
    },
  },
  methods: {
    verDetalle(id) {
      this.$router.push({ name: "ProductoDetalle", params: { id } });
    },
    formatPrice(price) {
      const value = Number(price);
      if (Number.isNaN(value)) return "0.00";
      return value.toFixed(2);
    },
    tiempoRelativo(timestamp) {
      const ahora = Date.now();
      const diffMs = ahora - timestamp;
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "menos de un minuto";
      if (diffMin < 60) return `${diffMin} min`;
      const diffHoras = Math.floor(diffMin / 60);
      if (diffHoras < 24) return `${diffHoras} h`;
      const diffDias = Math.floor(diffHoras / 24);
      return `${diffDias} d`;
    },
  },
};
