import HeaderAnth from "../HeaderAnth/HeaderAnth.vue";
import FooterAnth from "../FooterAnth/FooterAnth.vue";

export default {
  name: "PromocionesPage",
  components: {
    HeaderAnth,
    FooterAnth,
  },
  data() {
    return {
      isAuthenticated: false,
    };
  },
  created() {
    this.isAuthenticated = !!localStorage.getItem("access_token");
  },
  methods: {
    cerrarSesion() {
      localStorage.removeItem("access_token");
      this.isAuthenticated = false;
      this.$router.replace("/login");
    },
  },
};
