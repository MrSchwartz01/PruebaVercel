import HeaderAnth from "../HeaderAnth/HeaderAnth.vue";
import FooterAnth from "../FooterAnth/FooterAnth.vue";

export default {
  name: "CategoriasProductos",
  components: {
    HeaderAnth,
    FooterAnth,
  },
  data() {
    return {
      searchQuery: "",
      isAuthenticated: false,
      categorias: [
        {
          id: 1,
          nombre: "Laptops",
          slug: "laptops",
          icono: '<svg xmlns="http://www.w3.org/2000/svg" class="categoria-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>',
          cantidad: 4,
        },
        {
          id: 2,
          nombre: "Componentes",
          slug: "componentes",
          icono: '<svg xmlns="http://www.w3.org/2000/svg" class="categoria-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
          cantidad: 4,
        },
        {
          id: 3,
          nombre: "Periféricos",
          slug: "perifericos",
          icono: '<svg xmlns="http://www.w3.org/2000/svg" class="categoria-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="20" height="12" rx="2" ry="2"></rect><path d="M6 13h.01"></path><path d="M10 13h.01"></path><path d="M14 13h.01"></path><path d="M18 13h.01"></path><path d="M6 17h.01"></path><path d="M10 17h.01"></path><path d="M14 17h.01"></path><path d="M18 17h.01"></path></svg>',
          cantidad: 4,
        },
        {
          id: 4,
          nombre: "Almacenamiento",
          slug: "almacenamiento",
          icono: '<svg xmlns="http://www.w3.org/2000/svg" class="categoria-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>',
          cantidad: 4,
        },
        {
          id: 5,
          nombre: "Redes",
          slug: "redes",
          icono: '<svg xmlns="http://www.w3.org/2000/svg" class="categoria-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
          cantidad: 4,
        },
        {
          id: 6,
          nombre: "Audio",
          slug: "audio",
          icono: '<svg xmlns="http://www.w3.org/2000/svg" class="categoria-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>',
          cantidad: 4,
        },
      ],
      topProductos: [
        {
          id: "top-1",
          ranking: 1,
          nombre: "MacBook Pro 16\" M3",
          marca: "Apple",
          precio: "2499.99",
          imagen_url: "/Productos/placeholder-product.png",
        },
        {
          id: "top-2",
          ranking: 2,
          nombre: "Dell XPS 15",
          marca: "Dell",
          precio: "1899.99",
          imagen_url: "/Productos/placeholder-product.png",
        },
        {
          id: "top-3",
          ranking: 3,
          nombre: "Logitech MX Master 3S",
          marca: "Logitech",
          precio: "99.99",
          imagen_url: "/Productos/placeholder-product.png",
        },
      ],
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
    buscarProductos(query) {
      this.searchQuery = query;
      // Implementar lógica de búsqueda
    },
    irACategoria(slug) {
      this.$router.push({ name: "ProductosPorCategoria", params: { categoria: slug } });
    },
    verDetalle(id) {
      this.$router.push({ name: "ProductoDetalle", params: { id } });
    },
  },
};
