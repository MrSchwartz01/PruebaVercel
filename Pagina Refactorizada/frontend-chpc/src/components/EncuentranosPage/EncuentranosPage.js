import HeaderAnth from "../HeaderAnth/HeaderAnth.vue";
import FooterAnth from "../FooterAnth/FooterAnth.vue";

export default {
  name: "EncuentranosPage",
  components: {
    HeaderAnth,
    FooterAnth,
  },
  data() {
    return {
      searchQuery: "",
      isAuthenticated: false,
      
      // Información de contacto - PERSONALIZA ESTOS DATOS
      direccion: "Calle 12 Avenida 20 Esquina, Manta, Ecuador",
      horario: "Lunes a Viernes: 8:00 AM - 6:00 PM\nSábados: 9:00 AM - 1:00 PM",
      telefono: "+593 995924867",
      email: "clickhereventas4@gmail.com",
      
      // CONFIGURA TU ENLACE DE GOOGLE MAPS AQUÍ
      // Para obtener el enlace:
      // 1. Ve a Google Maps (https://www.google.com/maps)
      // 2. Busca tu ubicación
      // 3. Haz clic en "Compartir"
      // 4. Selecciona "Insertar un mapa"
      // 5. Copia el enlace que aparece en el src del iframe
      
      // Enlace para insertar en iframe (embed)
      googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3345.168656556268!2d-80.73051352503488!3d-0.9503846990404354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902be1e51964e08d%3A0x2d0fd996be1bacb!2sCHPC%20Tecnolog%C3%ADa%20(ClickHere.Pc)!5e1!3m2!1ses-419!2sec!4v1767800000821!5m2!1ses-419!2sec",
      // Enlace directo para abrir en Google Maps
      googleMapsLink: "https://www.google.com/maps/place/CHPC+Tecnolog%C3%ADa+(ClickHere.Pc)/@-0.9503847,-80.7279386,768m/data=!3m2!1e3!4b1!4m6!3m5!1s0x902be1e51964e08d:0x2d0fd996be1bacb!8m2!3d-0.9503847!4d-80.7279386!16s%2Fg%2F11fntczjym?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoKLDEwMDc5MjA2OUgBUAM%3D", 
    };
  },
  created() {
    this.isAuthenticated = !!localStorage.getItem("access_token");
  },
  methods: {
    cerrarSesion() {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_rol");
      this.isAuthenticated = false;
      this.$router.push("/login");
    },
    buscarProductos(query) {
      this.searchQuery = query;
      this.$router.push({
        name: "TodosLosProductos",
        query: { busqueda: query },
      });
    },
  },
};
