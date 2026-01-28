import axios from "axios";
import { API_BASE_URL } from '@/config/api';

export default {
    name: "HeaderAnth",
    props: {
      searchQuery: {
        type: String,
        required: true,
      },
      isAuthenticated: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        // Aseguramos que siempre sea un string para evitar errores de trim()
        localSearchQuery: this.searchQuery ?? "",
        isVisible: false, // Control de visibilidad para animación
        showProductsMenu: false, // Control del menú desplegable de productos
        showMarcasMenu: false, // Control del menú desplegable de marcas
        cantidadCarrito: 0, // Cantidad de productos en el carrito
        sugerencias: [],
        mostrandoSugerencias: false,
        cargandoSugerencias: false,
        _sugerenciasTimeout: null,
        isAdmin: false,
        isVendedor: false,
        isTecnico: false,
        marcasDisponibles: [],
      };
    },
    mounted() {
      // Iniciar la animación tras montar el componente
      setTimeout(() => {
        this.isVisible = true;
      }, 100);
      // Cargar cantidad del carrito
      this.actualizarCantidadCarrito();
      // Verificar rol del usuario
      this.checkUserRole();
      // Cargar marcas disponibles
      this.cargarMarcas();
    },
    //metodos llamados para navegacion y busqueda
  methods: {
      buscarProductos() {
        const query = (this.localSearchQuery ?? "").toString().trim();
        if (query.length > 0) {
          // Cerrar sugerencias
          this.mostrandoSugerencias = false;
          this.sugerencias = [];
          
          // Si estamos en HomePage, emitir evento
          if (this.$route.name === 'HomePage') {
            this.$emit('buscar', query);
          } else {
            // Si estamos en otra página, redirigir a HomePage con búsqueda
            this.$router.push({ name: 'HomePage', query: { search: query } });
          }
        }
      },
      onInput() {
        this.buscarProductos();
        this.programarCargaSugerencias();
      },
      programarCargaSugerencias() {
        if (this._sugerenciasTimeout) {
          clearTimeout(this._sugerenciasTimeout);
        }
        const query = (this.localSearchQuery ?? "").toString().trim();
        if (query.length < 2) {
          this.sugerencias = [];
          this.mostrandoSugerencias = false;
          return;
        }

        this._sugerenciasTimeout = setTimeout(() => {
          this.cargarSugerencias(query);
        }, 250);
      },
      async cargarSugerencias(query) {
        this.cargandoSugerencias = true;
        try {
          const response = await axios.get(
            `${API_BASE_URL}/tienda/productos`,
            {
              params: { search: query },
            },
          );

          this.sugerencias = Array.isArray(response.data)
            ? response.data.slice(0, 8)
            : [];
          this.mostrandoSugerencias = this.sugerencias.length > 0;
        } catch (error) {
          console.error("Error al obtener sugerencias:", error);
          this.sugerencias = [];
          this.mostrandoSugerencias = false;
        } finally {
          this.cargandoSugerencias = false;
        }
      },
      seleccionarSugerencia(producto) {
        const nombre = producto.nombre_producto || producto.nombre || "";
        this.localSearchQuery = nombre;
        this.mostrandoSugerencias = false;
        this.sugerencias = [];
        this.$emit("buscar", nombre.trim());
        if (producto.id) {
          this.$router.push({ name: "ProductoDetalle", params: { id: producto.id } });
        }
      },
      cerrarSugerencias() {
        // pequeño retardo para permitir click en sugerencia antes de ocultar
        setTimeout(() => {
          this.mostrandoSugerencias = false;
        }, 150);
      },
      cerrarSesion() {
        this.$emit("cerrar-sesion");
      },
      goToLogin() {
        this.$router.push("/login");
      },
      goToRegister() {
        this.$router.push("/registro");
      },
      goToCategorias() {
        this.$router.push("/categorias");
      },
      goToCarrito() {
        this.$router.push("/carrito");
      },
      goToPerfil() {
        this.$router.push("/perfil");
      },
      goToAdminPanel() {
        this.$router.push("/admin/panel");
      },
      goToPanelVendedores() {
        this.$router.push("/panel-vendedores");
      },
      goToPanelTecnicos() {
        this.$router.push("/panel-tecnicos");
      },
      goToMarcas() {
        this.$router.push("/marcas");
      },
      async cargarMarcas() {
        try {
          console.log('Cargando marcas desde API...');
          const response = await axios.get(`${API_BASE_URL}/tienda/productos`);
          console.log('Respuesta de API:', response.data);
          
          const productos = Array.isArray(response.data) ? response.data : [];
          console.log('Total de productos:', productos.length);
          
          // Debug: Verificar si los productos tienen el campo marca
          const ejemploProducto = productos[0];
          if (ejemploProducto) {
            console.log('Ejemplo de producto:', ejemploProducto);
            console.log('Marca del primer producto:', ejemploProducto.marca);
          }
          
          // Extraer marcas únicas
          const marcasSet = new Set();
          productos.forEach(producto => {
            if (producto.marca) {
              const marcaTrimmed = producto.marca.trim();
              if (marcaTrimmed) {
                marcasSet.add(marcaTrimmed);
              }
            }
          });
          
          const marcasArray = Array.from(marcasSet).sort();
          console.log('Marcas extraídas:', marcasArray);
          console.log('Total de marcas únicas:', marcasArray.length);
          
          // Actualizar el array de marcas
          this.marcasDisponibles = marcasArray;
          
          // Forzar actualización de Vue
          this.$forceUpdate();
          
        } catch (error) {
          console.error('Error al cargar marcas:', error);
          console.error('Detalles del error:', error.response || error.message);
          this.marcasDisponibles = [];
        }
      },
      checkUserRole() {
        const role = localStorage.getItem('user_rol');
        this.isAdmin = role === 'administrador';
        this.isVendedor = role === 'vendedor';
        this.isTecnico = role === 'tecnico';
      },
      actualizarCantidadCarrito() {
        const carrito = localStorage.getItem("carrito");
        if (carrito) {
          const productos = JSON.parse(carrito);
          this.cantidadCarrito = productos.reduce((total, item) => total + item.cantidad, 0);
        }
      },
    },
  };