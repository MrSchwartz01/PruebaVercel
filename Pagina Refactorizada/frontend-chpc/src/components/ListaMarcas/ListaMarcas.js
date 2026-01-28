import HeaderAnth from "../HeaderAnth/HeaderAnth.vue";
import FooterAnth from "../FooterAnth/FooterAnth.vue";

export default {
  name: "ListaMarcas",
  components: {
    HeaderAnth,
    FooterAnth,
  },
  data() {
    return {
      marcas: [
        {
          id: 1,
          nombre_marca: "ASUS",
          imagen_url: "/Marcas/asus.png",
        },
        {
          id: 2,
          nombre_marca: "MSI",
          imagen_url: "/Marcas/msi.png",
        },
        {
          id: 3,
          nombre_marca: "AMD",
          imagen_url: "/Marcas/amd.png",
        },
        {
          id: 4,
          nombre_marca: "Intel",
          imagen_url: "/Marcas/intel.png",
        },
        {
          id: 5,
          nombre_marca: "NVIDIA",
          imagen_url: "/Marcas/nvidia.png",
        },
        {
          id: 6,
          nombre_marca: "Corsair",
          imagen_url: "/Marcas/corsair.png",
        },
        {
          id: 7,
          nombre_marca: "Kingston",
          imagen_url: "/Marcas/kingston.png",
        },
        {
          id: 8,
          nombre_marca: "Logitech",
          imagen_url: "/Marcas/logitech.png",
        },
        {
          id: 9,
          nombre_marca: "Razer",
          imagen_url: "/Marcas/razer.png",
        },
        {
          id: 10,
          nombre_marca: "Samsung",
          imagen_url: "/Marcas/samsung.png",
        },
        {
          id: 11,
          nombre_marca: "Western Digital",
          imagen_url: "/Marcas/wd.png",
        },
        {
          id: 12,
          nombre_marca: "Seagate",
          imagen_url: "/Marcas/seagate.png",
        },
        {
          id: 13,
          nombre_marca: "TP-Link",
          imagen_url: "/Marcas/tplink.png",
        },
        {
          id: 14,
          nombre_marca: "Cisco",
          imagen_url: "/Marcas/cisco.png",
        },
        {
          id: 15,
          nombre_marca: "Sony",
          imagen_url: "/Marcas/sony.png",
        },
        {
          id: 16,
          nombre_marca: "JBL",
          imagen_url: "/Marcas/jbl.png",
        },
      ],
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
    filtrarPorMarca(marcaId) {
      this.$router.push({ name: "ProductosPorMarca", params: { id: marcaId } });
    },
  },
};