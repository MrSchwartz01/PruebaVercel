  // src/store.js
import { createStore } from 'vuex';

  const HISTORIAL_KEY = 'historial_productos_vistos';
  const VENTANA_MS_48H = 48 * 60 * 60 * 1000;

  function cargarHistorialInicial() {
    try {
      const raw = localStorage.getItem(HISTORIAL_KEY);
      if (!raw) return [];
      const ahora = Date.now();
      const datos = JSON.parse(raw);
      if (!Array.isArray(datos)) return [];
      return datos.filter((item) =>
        typeof item.vistoEn === 'number' &&
        ahora - item.vistoEn <= VENTANA_MS_48H,
      );
    } catch {
      return [];
    }
  }

  function guardarHistorial(historial) {
    try {
      localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
    } catch {
      // ignorar errores de almacenamiento
    }
  }

  const store = createStore({
    state: {
      carrito: [],
      historialProductosVistos: cargarHistorialInicial(),
    },
    mutations: {
      agregarAlCarrito(state, producto) {
        state.carrito.push(producto);
      },
      eliminarDelCarrito(state, productoId) {
        state.carrito = state.carrito.filter((producto) => producto.id !== productoId);
      },
      registrarProductoVisto(state, producto) {
        const ahora = Date.now();
        const existenteIndex = state.historialProductosVistos.findIndex(
          (p) => p.id === producto.id,
        );

        const entrada = {
          id: producto.id,
          nombre: producto.nombre_producto || producto.nombre || '',
          imagen_url: producto.imagen_url || '',
          precio: producto.precio ?? null,
          vistoEn: ahora,
        };

        if (existenteIndex !== -1) {
          state.historialProductosVistos.splice(existenteIndex, 1);
        }

        state.historialProductosVistos.unshift(entrada);

        const limite = 50;
        if (state.historialProductosVistos.length > limite) {
          state.historialProductosVistos = state.historialProductosVistos.slice(0, limite);
        }

        const filtrado = state.historialProductosVistos.filter(
          (p) => ahora - p.vistoEn <= VENTANA_MS_48H,
        );

        state.historialProductosVistos = filtrado;
        guardarHistorial(filtrado);
      },
    },
    actions: {
      agregarAlCarrito({ commit }, producto) {
        commit('agregarAlCarrito', producto);
      },
      eliminarDelCarrito({ commit }, productoId) {
        commit('eliminarDelCarrito', productoId);
      },
      registrarProductoVisto({ commit }, producto) {
        commit('registrarProductoVisto', producto);
      },
    },
    getters: {
      carrito: (state) => state.carrito,
      historialProductosVistos: (state) => state.historialProductosVistos,
    },
  });

  export default store;
