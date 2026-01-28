import HeaderAnth from "../HeaderAnth/HeaderAnth.vue";
import FooterAnth from "../FooterAnth/FooterAnth.vue";
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export default {
  name: "CarritoCompras",
  components: {
    HeaderAnth,
    FooterAnth,
  },
  data() {
    return {
      searchQuery: "",
      isAuthenticated: false,
      productosCarrito: [],
      tasaIVA: 0.15, // Tasa de IVA para referencia (los precios ya incluyen IVA)
      costoEnvio: 5.00,
      mostrarCheckout: false,
      procesandoPago: false,
      datosEnvio: {
        nombre_cliente: '',
        email_cliente: '',
        telefono: '',
        direccion_envio: ''
      }
    };
  },
  computed: {
    subtotalConIVA() {
      // Total de productos con IVA incluido
      return this.productosCarrito.reduce((total, item) => {
        return total + (parseFloat(item.precio) * item.cantidad);
      }, 0);
    },
    subtotal() {
      // Subtotal sin IVA (precio base antes del IVA)
      return this.subtotalConIVA / (1 + this.tasaIVA);
    },
    iva() {
      // IVA calculado sobre el subtotal sin IVA
      return this.subtotal * this.tasaIVA;
    },
    envio() {
      // Envío gratis si el subtotal con IVA es mayor a $100
      return this.subtotalConIVA > 100 ? 0 : this.costoEnvio;
    },
    total() {
      // Total = subtotal sin IVA + IVA + envío
      return this.subtotal + this.iva + this.envio;
    },
  },
  created() {
    this.isAuthenticated = !!localStorage.getItem("access_token");
    this.cargarCarrito();
    if (this.isAuthenticated) {
      this.cargarDatosUsuario();
    }
  },
  methods: {
    async cargarDatosUsuario() {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE_URL}/usuarios/perfil`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.datosEnvio.nombre_cliente = response.data.nombre || '';
        this.datosEnvio.email_cliente = response.data.email || '';
        this.datosEnvio.telefono = response.data.telefono || '';
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      }
    },
    cerrarSesion() {
      localStorage.removeItem("access_token");
      this.isAuthenticated = false;
      this.$router.replace("/login");
    },
    buscarProductos(query) {
      this.searchQuery = query;
    },
    cargarCarrito() {
      // Cargar carrito desde localStorage
      const carritoGuardado = localStorage.getItem("carrito");
      if (carritoGuardado) {
        this.productosCarrito = JSON.parse(carritoGuardado);
      }
    },
    guardarCarrito() {
      localStorage.setItem("carrito", JSON.stringify(this.productosCarrito));
    },
    calcularSubtotal(item) {
      return (parseFloat(item.precio) * item.cantidad).toFixed(2);
    },
    aumentarCantidad(id) {
      const producto = this.productosCarrito.find((p) => p.id === id);
      if (producto) {
        producto.cantidad++;
        this.guardarCarrito();
      }
    },
    disminuirCantidad(id) {
      const producto = this.productosCarrito.find((p) => p.id === id);
      if (producto && producto.cantidad > 1) {
        producto.cantidad--;
        this.guardarCarrito();
      }
    },
    eliminarProducto(id) {
      this.productosCarrito = this.productosCarrito.filter((p) => p.id !== id);
      this.guardarCarrito();
    },
    vaciarCarrito() {
      if (confirm("¿Estás seguro de que deseas vaciar el carrito?")) {
        this.productosCarrito = [];
        this.guardarCarrito();
      }
    },
    procederCompra() {
      if (!this.isAuthenticated) {
        alert("Debes iniciar sesión para continuar con la compra");
        this.$router.push("/login");
      } else {
        this.mostrarCheckout = true;
      }
    },
    
    async finalizarCompra() {
      // Validar datos
      if (!this.datosEnvio.nombre_cliente || !this.datosEnvio.email_cliente || !this.datosEnvio.direccion_envio) {
        alert('Por favor completa todos los campos requeridos');
        return;
      }

      this.procesandoPago = true;

      try {
        const token = localStorage.getItem('access_token');
        
        // Preparar items para el backend
        const items = this.productosCarrito.map(producto => ({
          productId: parseInt(producto.id),
          cantidad: producto.cantidad
        }));

        // Crear orden
        const orderData = {
          items,
          paymentMethod: 'CASH', // Efectivo - será coordinado por el vendedor
          nombre_cliente: this.datosEnvio.nombre_cliente,
          email_cliente: this.datosEnvio.email_cliente,
          telefono: this.datosEnvio.telefono || '',
          direccion_envio: this.datosEnvio.direccion_envio,
          observaciones: 'Pedido pendiente de coordinación con vendedor' // Nota automática
        };

        const response = await axios.post(
          `${API_BASE_URL}/ordenes`,
          orderData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // Éxito
        const mensajeExito = `
¡Pedido enviado exitosamente!

📦 Código de Pedido: ${response.data.codigo}
💰 Total: $${response.data.total.toFixed(2)}

👤 Un vendedor se pondrá en contacto contigo pronto para:
   • Coordinar el método de pago
   • Confirmar la dirección de entrega
   • Responder tus preguntas

📧 Recibirás un email de confirmación en breve.

¡Gracias por tu preferencia!
        `;
        
        alert(mensajeExito);
        
        // Limpiar carrito
        this.productosCarrito = [];
        this.guardarCarrito();
        this.mostrarCheckout = false;
        
        // Redirigir a home
        this.$router.push('/home');

      } catch (error) {
        console.error('Error al crear orden:', error);
        alert('Error al procesar la orden: ' + (error.response?.data?.message || error.message));
      } finally {
        this.procesandoPago = false;
      }
    },
    
    cancelarCheckout() {
      this.mostrarCheckout = false;
    },
    irAInicio() {
      this.$router.push("/home");
    },
  },
};