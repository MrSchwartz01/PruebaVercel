import HeaderAnth from "../HeaderAnth/HeaderAnth.vue";

export default {
  name: "RedesSociales",
  components: {
    HeaderAnth,
  },
  data() {
    return {
      redesSociales: [
        {
          nombre: "Facebook",
          url: "https://www.facebook.com/clickherepcecuador",
          icono: "https://cdn-icons-png.flaticon.com/512/733/733547.png",
        },
        {
          nombre: "Instagram",
          url: "https://www.instagram.com/clickhere.pc?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
          icono: "https://cdn-icons-png.flaticon.com/512/733/733558.png",
        },
        {
          nombre: "TikTok",
          url: "https://www.tiktok.com/@chpctecnologia",
          icono: "https://cdn-icons-png.flaticon.com/512/3046/3046121.png",
        },
        {
          nombre: "WhatsApp",
          url: "https://wa.me/593995924867",
          icono: "https://cdn-icons-png.flaticon.com/512/733/733585.png",
        },
      ],
      isAuthenticated: false,
    };
  },
  methods: {
    cerrarSesion() {
      localStorage.removeItem("access_token");
      this.isAuthenticated = false;
      this.$router.replace("/login");
    },
  },
  created() {
    this.isAuthenticated = !!localStorage.getItem("access_token");
  },
};