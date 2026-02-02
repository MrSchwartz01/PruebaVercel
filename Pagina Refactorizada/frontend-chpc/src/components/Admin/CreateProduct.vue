<template>
  <div class="create-product-container">
    <h2>Crear Nuevo Producto</h2>
    <form @submit.prevent="createProduct" class="product-form">
      <div class="form-group">
        <label for="codigo">Código del Producto *</label>
        <input v-model="product.codigo" id="codigo" type="text" required />
      </div>

      <div class="form-group">
        <label for="producto">Nombre del Producto *</label>
        <input v-model="product.producto" id="producto" type="text" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="marca">Marca</label>
          <input v-model="product.marca" id="marca" type="text" />
        </div>

        <div class="form-group">
          <label for="medida">Medida</label>
          <input v-model="product.medida" id="medida" type="text" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="almacen">Almacén</label>
          <input v-model="product.almacen" id="almacen" type="text" />
        </div>

        <div class="form-group">
          <label for="garantia">Garantía</label>
          <input v-model="product.garantia" id="garantia" type="text" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="costoTotal">Costo Total *</label>
          <input v-model.number="product.costoTotal" id="costoTotal" type="number" step="0.01" min="0" required />
        </div>

        <div class="form-group">
          <label for="existenciaTotal">Existencia Total *</label>
          <input v-model="product.existenciaTotal" id="existenciaTotal" type="text" required />
        </div>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="success" class="success-message">{{ success }}</div>

      <button type="submit" class="submit-button" :disabled="loading">
        {{ loading ? 'Creando...' : 'Crear Producto' }}
      </button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CreateProduct',
  data() {
    return {
      product: {
        codigo: '',
        producto: '',
        marca: '',
        medida: '',
        almacen: '',
        garantia: '',
        costoTotal: 0,
        existenciaTotal: '0'
      },
      loading: false,
      error: '',
      success: ''
    };
  },
  methods: {
    async createProduct() {
      this.loading = true;
      this.error = '';
      this.success = '';

      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No estás autenticado');
        }

        await axios.post('https://backend-chpc.vercel.app/api/tienda/productos', this.product, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.success = 'Producto creado exitosamente';
        this.resetForm();
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error al crear el producto';
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.product = {
        codigo: '',
        producto: '',
        marca: '',
        medida: '',
        almacen: '',
        garantia: '',
        costoTotal: 0,
        existenciaTotal: '0'
      };
    }
  }
};
</script>

<style scoped>
.create-product-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

label {
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

input, textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.submit-button {
  padding: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #0056b3;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  text-align: center;
}

.success-message {
  color: #28a745;
  text-align: center;
}
</style>
