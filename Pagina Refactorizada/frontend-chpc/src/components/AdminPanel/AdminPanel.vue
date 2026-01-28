<template>
  <div class="admin-panel">
    <div class="panel-header">
      <button class="back-button" @click="goToHome" title="Volver al Inicio">
        ← Volver al Inicio
      </button>
      <h1>Panel de Administración</h1>
      <div class="spacer"></div>
      <!-- Campana de notificaciones -->
      <NotificationsBell v-if="isAuthenticated" />
    </div>

    <div class="tabs">
      <button
        v-for="tab in visibleTabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
      <!-- Agregar tab de notificaciones -->
      <button
        :class="['tab-button', { active: activeTab === 'notificaciones' }]"
        @click="activeTab = 'notificaciones'"
      >
        🔔 Notificaciones
      </button>
    </div>

    <div class="tab-content">
      <!-- Tab de Notificaciones -->
      <div v-if="activeTab === 'notificaciones'" class="tab-panel">
        <NotificationsPanel />
      </div>
      
      <!-- Tab de Productos -->
      <div v-if="activeTab === 'productos'" class="tab-panel">
        <AdminProductos />
      </div>
      
      <!-- Tab de Promociones -->
      <div v-if="activeTab === 'promociones'" class="tab-panel">
        <h2>Gestión de Promociones</h2>
        
        <!-- Alerta para vendedores -->
        <div v-if="isVendedor && !permisosVendedor.promociones" class="info-message">
          ℹ️ <strong>Modo Solo Lectura:</strong> Como vendedor, puedes visualizar las promociones pero no crear, editar o eliminar.
        </div>
        <div v-if="isVendedor && permisosVendedor.promociones" class="info-message success">
          ✅ <strong>Permiso Temporal Activo:</strong> Tienes acceso para gestionar promociones.
        </div>
        
        <div v-if="puedeEditarPromocion()" class="form-section">
          <h3>{{ editingPromotion ? 'Editar Promoción' : 'Nueva Promoción' }}</h3>
          <form @submit.prevent="submitPromotion" class="promotion-form">
            <div class="form-group">
              <label>Producto:</label>
              <select v-model="promotionForm.producto_id" required>
                <option value="">Seleccione un producto</option>
                <option v-for="producto in productos" :key="producto.id" :value="producto.id">
                  {{ producto.nombre_producto }} - ${{ producto.precio }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Porcentaje de Descuento (%):</label>
              <input
                type="number"
                v-model.number="promotionForm.porcentaje_descuento"
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Fecha Inicio:</label>
                <input
                  type="datetime-local"
                  v-model="promotionForm.fecha_inicio"
                  required
                />
              </div>

              <div class="form-group">
                <label>Fecha Fin:</label>
                <input
                  type="datetime-local"
                  v-model="promotionForm.fecha_fin"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>
                <input type="checkbox" v-model="promotionForm.activa" />
                Promoción Activa
              </label>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                {{ editingPromotion ? 'Actualizar' : 'Crear' }} Promoción
              </button>
              <button
                v-if="editingPromotion"
                type="button"
                class="btn btn-secondary"
                @click="cancelEditPromotion"
              >
                Cancelar
              </button>
            </div>

            <div v-if="promotionMessage" :class="['message', promotionMessageType]">
              {{ promotionMessage }}
            </div>
          </form>
        </div>

        <div class="promotions-list">
          <h3>Promociones Existentes</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Descuento</th>
                <th>Precio Original</th>
                <th>Precio con Descuento</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="promo in promociones" :key="promo.id">
                <td>{{ promo.id }}</td>
                <td>{{ promo.producto?.nombre_producto }}</td>
                <td>{{ promo.porcentaje_descuento }}%</td>
                <td>${{ promo.producto?.precio }}</td>
                <td>${{ calcularPrecioConDescuento(promo.producto?.precio, promo.porcentaje_descuento) }}</td>
                <td>{{ formatDate(promo.fecha_inicio) }}</td>
                <td>{{ formatDate(promo.fecha_fin) }}</td>
                <td>
                  <span :class="['status-badge', promo.activa ? 'active' : 'inactive']">
                    {{ promo.activa ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
                <td class="actions">
                  <button v-if="puedeEditarPromocion()" @click="editPromotion(promo)" class="btn-icon" title="Editar">✏️</button>
                  <button v-if="puedeEditarPromocion()" @click="deletePromotion(promo.id)" class="btn-icon" title="Eliminar">🗑️</button>
                  <span v-if="isVendedor && !permisosVendedor.promociones" class="readonly-badge">👁️ Solo lectura</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab de Banners -->
      <div v-if="activeTab === 'banners'" class="tab-panel">
        <h2>Gestión de Banners</h2>
        
        <div v-if="isVendedor && !permisosVendedor.banners" class="info-message">
          ℹ️ <strong>Modo Solo Lectura:</strong> Como vendedor, puedes visualizar los banners pero no modificarlos.
        </div>
        <div v-if="isVendedor && permisosVendedor.banners" class="info-message success">
          ✅ <strong>Permiso Temporal Activo:</strong> Tienes acceso para gestionar banners.
        </div>

        <div v-if="puedeEditarBanner()" class="form-section">
          <h3>{{ editingBanner ? 'Editar Banner' : 'Nuevo Banner' }}</h3>
          <form @submit.prevent="submitBanner" class="banner-form">
            <div class="form-group">
              <label>Título:</label>
              <input type="text" v-model="bannerForm.titulo" required />
            </div>

            <div class="form-group">
              <label>URL de la Imagen:</label>
              <input type="text" v-model="bannerForm.imagen_url" required />
            </div>

            <div class="form-group">
              <label>Producto Asociado (opcional):</label>
              <select v-model="bannerForm.producto_id">
                <option :value="null">Sin asociar</option>
                <option v-for="producto in productos" :key="producto.id" :value="producto.id">
                  {{ producto.nombre_producto }}
                </option>
              </select>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                {{ editingBanner ? 'Actualizar' : 'Crear' }} Banner
              </button>
              <button
                v-if="editingBanner"
                type="button"
                class="btn btn-secondary"
                @click="cancelEditBanner"
              >
                Cancelar
              </button>
            </div>

            <div v-if="bannerMessage" :class="['message', bannerMessageType]">
              {{ bannerMessage }}
            </div>
          </form>
        </div>

        <div class="banners-list">
          <h3>Banners Existentes</h3>
          <div class="banners-grid">
            <div v-for="banner in banners" :key="banner.id" class="banner-card">
              <img :src="banner.imagen_url" :alt="banner.titulo" />
              <div class="banner-info">
                <h4>{{ banner.titulo }}</h4>
                <p v-if="banner.producto">Asociado a: {{ banner.producto.nombre_producto }}</p>
                <p v-else>Sin producto asociado</p>
                <div class="banner-actions">
                  <button v-if="puedeEditarBanner()" @click="editBanner(banner)" class="btn-small">Editar</button>
                  <button v-if="puedeEditarBanner()" @click="deleteBanner(banner.id)" class="btn-small btn-danger">Eliminar</button>
                  <span v-if="isVendedor && !permisosVendedor.banners" class="readonly-badge">👁️ Solo lectura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab de Logo -->
      <div v-if="activeTab === 'logo'" class="tab-panel">
        <h2>Configuración del Logo</h2>
        
        <div v-if="isVendedor && !permisosVendedor.logo" class="info-message">
          ℹ️ <strong>Acceso Restringido:</strong> Como vendedor, no tienes permisos para cambiar el logo del sitio.
        </div>
        <div v-if="isVendedor && permisosVendedor.logo" class="info-message success">
          ✅ <strong>Permiso Temporal Activo:</strong> Tienes acceso para actualizar el logo.
        </div>
        
        <div v-if="puedeEditarLogo()" class="form-section">
          <form @submit.prevent="submitLogo" class="logo-form">
            <div class="logo-preview" v-if="currentLogo">
              <h3>Logo Actual:</h3>
              <img :src="currentLogo" alt="Logo actual" class="current-logo" />
            </div>

            <div class="form-group">
              <label>Nueva URL del Logo:</label>
              <input type="text" v-model="logoForm.logo_url" required />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Actualizar Logo</button>
            </div>

            <div v-if="logoMessage" :class="['message', logoMessageType]">
              {{ logoMessage }}
            </div>
          </form>
        </div>
      </div>

      <!-- Tab de Usuarios -->
      <div v-if="activeTab === 'usuarios' && isAdmin" class="tab-panel">
        <h2>Gestión de Usuarios</h2>
        
        <div class="form-section">
          <h3>{{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
          <form @submit.prevent="submitUser" class="user-form">
            <div class="form-row">
              <div class="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  v-model="userForm.nombre"
                  required
                  minlength="2"
                  maxlength="50"
                />
              </div>

              <div class="form-group">
                <label>Apellido:</label>
                <input
                  type="text"
                  v-model="userForm.apellido"
                  required
                  minlength="2"
                  maxlength="50"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  v-model="userForm.username"
                  required
                  minlength="3"
                  maxlength="30"
                  pattern="[a-zA-Z0-9_]+"
                  :disabled="editingUser"
                />
              </div>

              <div class="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  v-model="userForm.email"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div v-if="!editingUser" class="form-group">
                <label>Contraseña:</label>
                <input
                  type="password"
                  v-model="userForm.password"
                  required
                  minlength="6"
                />
              </div>

              <div class="form-group">
                <label>Teléfono:</label>
                <input
                  type="text"
                  v-model="userForm.telefono"
                  pattern="[0-9+\-\s()]+"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Rol:</label>
                <select v-model="userForm.rol" required>
                  <option value="">Seleccione un rol</option>
                  <option value="administrador">Administrador</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="tecnico">Técnico</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Dirección:</label>
              <textarea
                v-model="userForm.direccion"
                rows="2"
                maxlength="200"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                {{ editingUser ? 'Actualizar' : 'Crear' }} Usuario
              </button>
              <button
                v-if="editingUser"
                type="button"
                class="btn btn-secondary"
                @click="cancelEditUser"
              >
                Cancelar
              </button>
            </div>

            <div v-if="userMessage" :class="['message', userMessageType]">
              {{ userMessage }}
            </div>
          </form>
        </div>

        <div class="users-list">
          <h3>Usuarios Registrados</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>Username</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Fecha Creación</th>
                <th>Último Acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in usuarios" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.nombre }} {{ user.apellido }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="['role-badge', getRoleClass(user.rol)]">
                    {{ getRoleLabel(user.rol) }}
                  </span>
                </td>
                <td>{{ formatDate(user.fecha_creacion) }}</td>
                <td>{{ user.ultimo_acceso ? formatDate(user.ultimo_acceso) : 'Nunca' }}</td>
                <td class="actions">
                  <button v-if="isAdmin" @click="editUser(user)" class="btn-icon" title="Editar">✏️</button>
                  <button 
                    v-if="isAdmin && !isCurrentUser(user.id)" 
                    @click="deleteUser(user.id)" 
                    class="btn-icon" 
                    title="Eliminar"
                  >🗑️</button>
                  <span v-if="isCurrentUser(user.id)" class="readonly-badge">👤 Tú</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab de Permisos Temporales -->
      <div v-if="activeTab === 'permisos' && isAdmin" class="tab-panel">
        <h2>Permisos Temporales para Vendedores</h2>
        
        <div class="form-section">
          <h3>{{ editingPermiso ? 'Editar Permiso' : 'Otorgar Nuevo Permiso' }}</h3>
          <form @submit.prevent="submitPermiso" class="permiso-form">
            <div class="form-row">
              <div class="form-group">
                <label>Vendedor:</label>
                <select v-model="permisoForm.user_id" required :disabled="editingPermiso">
                  <option value="">Seleccione un vendedor</option>
                  <option 
                    v-for="vendedor in vendedores" 
                    :key="vendedor.id" 
                    :value="vendedor.id"
                  >
                    {{ vendedor.nombre }} {{ vendedor.apellido }} (@{{ vendedor.username }})
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Tipo de Permiso:</label>
                <select v-model="permisoForm.tipo_permiso" required :disabled="editingPermiso">
                  <option value="">Seleccione tipo</option>
                  <option value="banners">Banners</option>
                  <option value="promociones">Promociones</option>
                  <option value="logo">Logo</option>
                  <option value="all">Todos los permisos</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Fecha de Expiración:</label>
                <input
                  type="datetime-local"
                  v-model="permisoForm.fecha_expiracion"
                  required
                  :min="getCurrentDateTime()"
                />
              </div>

              <div v-if="editingPermiso" class="form-group">
                <label>Estado:</label>
                <select v-model="permisoForm.activo">
                  <option :value="true">Activo</option>
                  <option :value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Razón del Permiso:</label>
              <textarea
                v-model="permisoForm.razon"
                rows="3"
                placeholder="Ej: Permiso para actualizar banners durante campaña de fin de año"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                {{ editingPermiso ? 'Actualizar' : 'Otorgar' }} Permiso
              </button>
              <button
                v-if="editingPermiso"
                type="button"
                class="btn btn-secondary"
                @click="cancelEditPermiso"
              >
                Cancelar
              </button>
            </div>

            <div v-if="permisoMessage" :class="['message', permisoMessageType]">
              {{ permisoMessage }}
            </div>
          </form>
        </div>

        <div class="permisos-list">
          <h3>Permisos Otorgados</h3>
          
          <div class="filter-tabs">
            <button 
              :class="{ active: permisoFilter === 'all' }"
              @click="permisoFilter = 'all'"
            >
              Todos
            </button>
            <button 
              :class="{ active: permisoFilter === 'activos' }"
              @click="permisoFilter = 'activos'"
            >
              Activos
            </button>
            <button 
              :class="{ active: permisoFilter === 'expirados' }"
              @click="permisoFilter = 'expirados'"
            >
              Expirados/Revocados
            </button>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vendedor</th>
                <th>Tipo Permiso</th>
                <th>Fecha Expiración</th>
                <th>Estado</th>
                <th>Otorgado Por</th>
                <th>Razón</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="permiso in permisosFiltrados" :key="permiso.id">
                <td>{{ permiso.id }}</td>
                <td>
                  {{ permiso.usuario.nombre }} {{ permiso.usuario.apellido }}<br>
                  <small>@{{ permiso.usuario.username }}</small>
                </td>
                <td>
                  <span :class="['permiso-badge', getPermisoBadgeClass(permiso.tipo_permiso)]">
                    {{ getPermisoLabel(permiso.tipo_permiso) }}
                  </span>
                </td>
                <td>{{ formatDate(permiso.fecha_expiracion) }}</td>
                <td>
                  <span :class="['status-badge', getPermisoStatusClass(permiso)]">
                    {{ getPermisoStatus(permiso) }}
                  </span>
                </td>
                <td>{{ permiso.otorgado_por || 'N/A' }}</td>
                <td>
                  <span class="razon-text" :title="permiso.razon">
                    {{ permiso.razon ? truncateText(permiso.razon, 30) : 'Sin razón' }}
                  </span>
                </td>
                <td class="actions">
                  <button 
                    v-if="isAdmin && permiso.activo && !isPermisoExpirado(permiso)"
                    @click="editPermiso(permiso)" 
                    class="btn-icon" 
                    title="Editar"
                  >✏️</button>
                  <button 
                    v-if="isAdmin && permiso.activo && !isPermisoExpirado(permiso)"
                    @click="revocarPermiso(permiso.id)" 
                    class="btn-icon btn-warning" 
                    title="Revocar"
                  >🚫</button>
                  <button 
                    v-if="isAdmin"
                    @click="deletePermiso(permiso.id)" 
                    class="btn-icon" 
                    title="Eliminar"
                  >🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import AdminProductos from './AdminProductos.vue';
import NotificationsPanel from '../NotificationsPanel/NotificationsPanel.vue';
import NotificationsBell from '../NotificationsPanel/NotificationsBell.vue';

export default {
  name: 'AdminPanelMain',
  components: {
    AdminProductos,
    NotificationsPanel,
    NotificationsBell,
  },
  data() {
    return {
      API_BASE_URL, // Exponer para usar en template si es necesario
      activeTab: 'promociones',
      tabs: [
        { id: 'productos', label: 'Productos' },
        { id: 'promociones', label: 'Promociones' },
        { id: 'banners', label: 'Banners' },
        { id: 'logo', label: 'Logo' },
        { id: 'usuarios', label: 'Usuarios' },
        { id: 'permisos', label: 'Permisos Temporales' },
      ],
      isAuthenticated: !!localStorage.getItem('access_token'),

      // Permisos
      userRole: '',
      isAdmin: false,
      isVendedor: false,

      // Promociones
      promociones: [],
      productos: [],
      editingPromotion: null,
      promotionForm: {
        producto_id: '',
        porcentaje_descuento: 0,
        fecha_inicio: '',
        fecha_fin: '',
        activa: true,
      },
      promotionMessage: '',
      promotionMessageType: '',

      // Banners
      banners: [],
      editingBanner: null,
      bannerForm: {
        titulo: '',
        imagen_url: '',
        producto_id: null,
      },
      bannerMessage: '',
      bannerMessageType: '',

      // Logo
      currentLogo: '',
      logoForm: {
        logo_url: '',
      },
      logoMessage: '',
      logoMessageType: '',

      // Usuarios
      usuarios: [],
      editingUser: null,
      currentUserId: null,
      userForm: {
        nombre: '',
        apellido: '',
        username: '',
        email: '',
        password: '',
        telefono: '',
        direccion: '',
        rol: '',
      },
      userMessage: '',
      userMessageType: '',

      // Permisos Temporales
      permisos: [],
      vendedores: [],
      editingPermiso: null,
      permisoFilter: 'all', // 'all', 'activos', 'expirados'
      permisoForm: {
        user_id: '',
        tipo_permiso: '',
        fecha_expiracion: '',
        activo: true,
        razon: '',
      },
      permisoMessage: '',
      permisoMessageType: '',

      // Control de permisos para vendedores
      permisosVendedor: {
        banners: false,
        promociones: false,
        logo: false,
      },
    };
  },

  mounted() {
    this.checkAuth();
    this.loadPromociones();
    this.loadProductos();
    this.loadBanners();
    this.loadLogo();
    this.loadUsuarios();
    this.loadCurrentUserId();
    this.loadPermisos();
    this.loadVendedores();
    this.loadPermisosVendedor();
  },

  methods: {
    goToHome() {
      this.$router.push('/home');
    },
    
    checkAuth() {
      const role = localStorage.getItem('user_rol');
      this.userRole = role;
      this.isAdmin = role === 'administrador';
      this.isVendedor = role === 'vendedor';
      
      if (role !== 'administrador' && role !== 'vendedor') {
        this.$router.push('/');
        alert('Acceso denegado: Solo administradores y vendedores');
      }
    },

    async loadPermisosVendedor() {
      if (!this.isVendedor) return;
      
      try {
        const [bannersRes, promocionesRes, logoRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/permisos-temporales/verificar/banners`, this.getAuthHeaders()),
          axios.get(`${API_BASE_URL}/permisos-temporales/verificar/promociones`, this.getAuthHeaders()),
          axios.get(`${API_BASE_URL}/permisos-temporales/verificar/logo`, this.getAuthHeaders()),
        ]);

        this.permisosVendedor = {
          banners: bannersRes.data.tienePermiso,
          promociones: promocionesRes.data.tienePermiso,
          logo: logoRes.data.tienePermiso,
        };
      } catch (error) {
        console.error('Error al verificar permisos del vendedor:', error);
      }
    },

    puedeEditarPromocion() {
      return this.isAdmin || (this.isVendedor && this.permisosVendedor.promociones);
    },

    puedeEditarBanner() {
      return this.isAdmin || (this.isVendedor && this.permisosVendedor.banners);
    },

    puedeEditarLogo() {
      return this.isAdmin || (this.isVendedor && this.permisosVendedor.logo);
    },

    getAuthHeaders() {
      const token = localStorage.getItem('access_token');
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    },

    // ========== PROMOCIONES ==========
    async loadPromociones() {
      try {
        const response = await axios.get(`${API_BASE_URL}/promociones`);
        this.promociones = response.data;
      } catch (error) {
        console.error('Error al cargar promociones:', error);
      }
    },

    async loadProductos() {
      try {
        const response = await axios.get(`${API_BASE_URL}/tienda/productos`);
        this.productos = response.data;
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    },

    async submitPromotion() {
      try {
        if (this.editingPromotion) {
          await axios.patch(
            `${API_BASE_URL}/promociones/${this.editingPromotion.id}`,
            this.promotionForm,
            this.getAuthHeaders()
          );
          this.showPromotionMessage('Promoción actualizada exitosamente', 'success');
        } else {
          await axios.post(
            `${API_BASE_URL}/promociones`,
            this.promotionForm,
            this.getAuthHeaders()
          );
          this.showPromotionMessage('Promoción creada exitosamente', 'success');
        }
        this.resetPromotionForm();
        this.loadPromociones();
      } catch (error) {
        console.error('Error al guardar promoción:', error);
        this.showPromotionMessage(
          error.response?.data?.message || 'Error al guardar la promoción',
          'error'
        );
      }
    },

    editPromotion(promo) {
      this.editingPromotion = promo;
      this.promotionForm = {
        producto_id: promo.producto_id,
        porcentaje_descuento: promo.porcentaje_descuento,
        fecha_inicio: this.formatDateForInput(promo.fecha_inicio),
        fecha_fin: this.formatDateForInput(promo.fecha_fin),
        activa: promo.activa,
      };
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async deletePromotion(id) {
      if (!confirm('¿Está seguro de eliminar esta promoción?')) return;

      try {
        await axios.delete(
          `${API_BASE_URL}/promociones/${id}`,
          this.getAuthHeaders()
        );
        this.showPromotionMessage('Promoción eliminada exitosamente', 'success');
        this.loadPromociones();
      } catch (error) {
        console.error('Error al eliminar promoción:', error);
        this.showPromotionMessage('Error al eliminar la promoción', 'error');
      }
    },

    cancelEditPromotion() {
      this.resetPromotionForm();
    },

    resetPromotionForm() {
      this.editingPromotion = null;
      this.promotionForm = {
        producto_id: '',
        porcentaje_descuento: 0,
        fecha_inicio: '',
        fecha_fin: '',
        activa: true,
      };
    },

    showPromotionMessage(message, type) {
      this.promotionMessage = message;
      this.promotionMessageType = type;
      setTimeout(() => {
        this.promotionMessage = '';
      }, 3000);
    },

    // ========== BANNERS ==========
    async loadBanners() {
      try {
        const response = await axios.get(`${API_BASE_URL}/tienda/banners`);
        this.banners = response.data.data || response.data;
      } catch (error) {
        console.error('Error al cargar banners:', error);
      }
    },

    async submitBanner() {
      try {
        if (this.editingBanner) {
          await axios.patch(
            `${API_BASE_URL}/tienda/banners/${this.editingBanner.id}`,
            this.bannerForm,
            this.getAuthHeaders()
          );
          this.showBannerMessage('Banner actualizado exitosamente', 'success');
        } else {
          await axios.post(
            `${API_BASE_URL}/tienda/banners`,
            this.bannerForm,
            this.getAuthHeaders()
          );
          this.showBannerMessage('Banner creado exitosamente', 'success');
        }
        this.resetBannerForm();
        this.loadBanners();
      } catch (error) {
        console.error('Error al guardar banner:', error);
        this.showBannerMessage('Error al guardar el banner', 'error');
      }
    },

    editBanner(banner) {
      this.editingBanner = banner;
      this.bannerForm = {
        titulo: banner.titulo,
        imagen_url: banner.imagen_url,
        producto_id: banner.producto_id,
      };
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async deleteBanner(id) {
      if (!confirm('¿Está seguro de eliminar este banner?')) return;

      try {
        await axios.delete(
          `${API_BASE_URL}/tienda/banners/${id}`,
          this.getAuthHeaders()
        );
        this.showBannerMessage('Banner eliminado exitosamente', 'success');
        this.loadBanners();
      } catch (error) {
        console.error('Error al eliminar banner:', error);
        this.showBannerMessage('Error al eliminar el banner', 'error');
      }
    },

    cancelEditBanner() {
      this.resetBannerForm();
    },

    resetBannerForm() {
      this.editingBanner = null;
      this.bannerForm = {
        titulo: '',
        imagen_url: '',
        producto_id: null,
      };
    },

    showBannerMessage(message, type) {
      this.bannerMessage = message;
      this.bannerMessageType = type;
      setTimeout(() => {
        this.bannerMessage = '';
      }, 3000);
    },

    // ========== LOGO ==========
    async loadLogo() {
      try {
        const response = await axios.get(`${API_BASE_URL}/configuracion/logo_url`);
        this.currentLogo = response.data.valor || response.data;
      } catch (error) {
        console.log('No hay logo configurado');
      }
    },

    async submitLogo() {
      try {
        await axios.post(
          `${API_BASE_URL}/configuracion`,
          {
            clave: 'logo_url',
            valor: this.logoForm.logo_url,
          },
          this.getAuthHeaders()
        );
        this.showLogoMessage('Logo actualizado exitosamente', 'success');
        this.loadLogo();
        this.logoForm.logo_url = '';
      } catch (error) {
        console.error('Error al actualizar logo:', error);
        this.showLogoMessage('Error al actualizar el logo', 'error');
      }
    },

    showLogoMessage(message, type) {
      this.logoMessage = message;
      this.logoMessageType = type;
      setTimeout(() => {
        this.logoMessage = '';
      }, 3000);
    },

    // ========== USUARIOS ==========
    async loadUsuarios() {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/usuarios`,
          this.getAuthHeaders()
        );
        this.usuarios = response.data;
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    },

    async loadCurrentUserId() {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/usuarios/perfil`,
          this.getAuthHeaders()
        );
        this.currentUserId = response.data.id;
      } catch (error) {
        console.error('Error al obtener ID del usuario actual:', error);
      }
    },

    async submitUser() {
      try {
        // Debug: verificar token y headers
        const token = localStorage.getItem('access_token');
        const headers = this.getAuthHeaders();
        console.log('Token:', token ? 'Existe' : 'No existe');
        console.log('Headers:', headers);
        console.log('UserForm:', this.userForm);

        if (this.editingUser) {
          // Actualizar usuario (sin password)
          // eslint-disable-next-line no-unused-vars
          const { password, ...updateData } = this.userForm;
          await axios.patch(
            `${API_BASE_URL}/usuarios/${this.editingUser.id}`,
            updateData,
            this.getAuthHeaders()
          );
          this.showUserMessage('Usuario actualizado exitosamente', 'success');
        } else {
          // Crear usuario nuevo
          console.log('Enviando POST a:', `${API_BASE_URL}/usuarios`);
          await axios.post(
            `${API_BASE_URL}/usuarios`,
            this.userForm,
            this.getAuthHeaders()
          );
          this.showUserMessage('Usuario creado exitosamente', 'success');
        }
        this.resetUserForm();
        this.loadUsuarios();
      } catch (error) {
        console.error('Error completo al guardar usuario:', error);
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        console.error('Response headers:', error.response?.headers);
        this.showUserMessage(
          error.response?.data?.message || 'Error al guardar el usuario',
          'error'
        );
      }
    },

    editUser(user) {
      this.editingUser = user;
      this.userForm = {
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.username,
        email: user.email,
        password: '', // No cargar password
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        rol: user.rol,
      };
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async deleteUser(id) {
      if (!confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

      try {
        await axios.delete(
          `${API_BASE_URL}/usuarios/${id}`,
          this.getAuthHeaders()
        );
        this.showUserMessage('Usuario eliminado exitosamente', 'success');
        this.loadUsuarios();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        this.showUserMessage(
          error.response?.data?.message || 'Error al eliminar el usuario',
          'error'
        );
      }
    },

    cancelEditUser() {
      this.resetUserForm();
    },

    resetUserForm() {
      this.editingUser = null;
      this.userForm = {
        nombre: '',
        apellido: '',
        username: '',
        email: '',
        password: '',
        telefono: '',
        direccion: '',
        rol: '',
      };
    },

    showUserMessage(message, type) {
      this.userMessage = message;
      this.userMessageType = type;
      setTimeout(() => {
        this.userMessage = '';
      }, 3000);
    },

    isCurrentUser(userId) {
      return this.currentUserId === userId;
    },

    getRoleClass(rol) {
      const roleClasses = {
        'administrador': 'role-admin',
        'vendedor': 'role-vendedor',
        'tecnico': 'role-tecnico'
      };
      return roleClasses[rol] || 'role-default';
    },

    getRoleLabel(rol) {
      const roleLabels = {
        'administrador': 'Administrador',
        'vendedor': 'Vendedor',
        'tecnico': 'Técnico'
      };
      return roleLabels[rol] || rol;
    },

    // ========== UTILIDADES ==========
    calcularPrecioConDescuento(precio, descuento) {
      if (!precio || !descuento) return precio;
      return (precio - (precio * descuento) / 100).toFixed(2);
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    formatDateForInput(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    // ========== PERMISOS TEMPORALES ==========
    async loadPermisos() {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/permisos-temporales`,
          this.getAuthHeaders()
        );
        this.permisos = response.data;
      } catch (error) {
        console.error('Error al cargar permisos:', error);
      }
    },

    async loadVendedores() {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/usuarios`,
          this.getAuthHeaders()
        );
        this.vendedores = response.data.filter(u => u.rol === 'vendedor');
      } catch (error) {
        console.error('Error al cargar vendedores:', error);
      }
    },

    async submitPermiso() {
      try {
        if (this.editingPermiso) {
          await axios.patch(
            `${API_BASE_URL}/permisos-temporales/${this.editingPermiso.id}`,
            {
              fecha_expiracion: this.permisoForm.fecha_expiracion,
              activo: this.permisoForm.activo,
              razon: this.permisoForm.razon,
            },
            this.getAuthHeaders()
          );
          this.showPermisoMessage('Permiso actualizado exitosamente', 'success');
        } else {
          // Convertir user_id a número y asegurar formato correcto
          const permisoData = {
            user_id: parseInt(this.permisoForm.user_id),
            tipo_permiso: this.permisoForm.tipo_permiso,
            fecha_expiracion: new Date(this.permisoForm.fecha_expiracion).toISOString(),
            razon: this.permisoForm.razon || undefined,
          };
          
          await axios.post(
            `${API_BASE_URL}/permisos-temporales`,
            permisoData,
            this.getAuthHeaders()
          );
          this.showPermisoMessage('Permiso otorgado exitosamente', 'success');
        }
        this.resetPermisoForm();
        this.loadPermisos();
      } catch (error) {
        console.error('Error al guardar permiso:', error);
        this.showPermisoMessage(
          error.response?.data?.message || 'Error al guardar el permiso',
          'error'
        );
      }
    },

    editPermiso(permiso) {
      this.editingPermiso = permiso;
      this.permisoForm = {
        user_id: permiso.user_id,
        tipo_permiso: permiso.tipo_permiso,
        fecha_expiracion: this.formatDateForInput(permiso.fecha_expiracion),
        activo: permiso.activo,
        razon: permiso.razon || '',
      };
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async revocarPermiso(id) {
      if (!confirm('¿Está seguro de revocar este permiso?')) return;

      try {
        await axios.patch(
          `${API_BASE_URL}/permisos-temporales/${id}/revocar`,
          {},
          this.getAuthHeaders()
        );
        this.showPermisoMessage('Permiso revocado exitosamente', 'success');
        this.loadPermisos();
      } catch (error) {
        console.error('Error al revocar permiso:', error);
        this.showPermisoMessage(
          error.response?.data?.message || 'Error al revocar el permiso',
          'error'
        );
      }
    },

    async deletePermiso(id) {
      if (!confirm('¿Está seguro de eliminar este permiso? Esta acción no se puede deshacer.')) return;

      try {
        await axios.delete(
          `${API_BASE_URL}/permisos-temporales/${id}`,
          this.getAuthHeaders()
        );
        this.showPermisoMessage('Permiso eliminado exitosamente', 'success');
        this.loadPermisos();
      } catch (error) {
        console.error('Error al eliminar permiso:', error);
        this.showPermisoMessage(
          error.response?.data?.message || 'Error al eliminar el permiso',
          'error'
        );
      }
    },

    cancelEditPermiso() {
      this.resetPermisoForm();
    },

    resetPermisoForm() {
      this.editingPermiso = null;
      this.permisoForm = {
        user_id: '',
        tipo_permiso: '',
        fecha_expiracion: '',
        activo: true,
        razon: '',
      };
    },

    showPermisoMessage(message, type) {
      this.permisoMessage = message;
      this.permisoMessageType = type;
      setTimeout(() => {
        this.permisoMessage = '';
      }, 3000);
    },

    getCurrentDateTime() {
      const now = new Date();
      return this.formatDateForInput(now);
    },

    isPermisoExpirado(permiso) {
      return new Date(permiso.fecha_expiracion) < new Date();
    },

    getPermisoStatus(permiso) {
      if (!permiso.activo) return 'Revocado';
      if (this.isPermisoExpirado(permiso)) return 'Expirado';
      return 'Activo';
    },

    getPermisoStatusClass(permiso) {
      if (!permiso.activo) return 'inactive';
      if (this.isPermisoExpirado(permiso)) return 'expired';
      return 'active';
    },

    getPermisoLabel(tipo) {
      const labels = {
        'banners': 'Banners',
        'promociones': 'Promociones',
        'logo': 'Logo',
        'all': 'Todos'
      };
      return labels[tipo] || tipo;
    },

    getPermisoBadgeClass(tipo) {
      const classes = {
        'banners': 'permiso-banners',
        'promociones': 'permiso-promociones',
        'logo': 'permiso-logo',
        'all': 'permiso-all'
      };
      return classes[tipo] || 'permiso-default';
    },

    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },
  },

  computed: {
    visibleTabs() {
      // Filtrar tabs según el rol del usuario
      return this.tabs.filter(tab => {
        // Solo administradores ven el tab de usuarios y permisos
        if ((tab.id === 'usuarios' || tab.id === 'permisos') && !this.isAdmin) {
          return false;
        }
        return true;
      });
    },

    permisosFiltrados() {
      const now = new Date();
      
      return this.permisos.filter(permiso => {
        if (this.permisoFilter === 'activos') {
          return permiso.activo && new Date(permiso.fecha_expiracion) > now;
        } else if (this.permisoFilter === 'expirados') {
          return !permiso.activo || new Date(permiso.fecha_expiracion) <= now;
        }
        return true; // 'all'
      });
    },
  },
};
</script>

<style scoped>
.admin-panel {
  max-width: 1400px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  border-bottom: 2px solid #0066cc;
  padding-bottom: 15px;
}

.panel-header h1 {
  color: #333;
  font-size: 28px;
  margin: 0;
  flex: 1;
  text-align: center;
}

.back-button {
  padding: 10px 20px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.back-button:hover {
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
  transform: translateX(-3px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.back-button:active {
  transform: translateX(-1px);
}

.spacer {
  width: 140px; /* Mismo ancho aproximado del botón para centrar el título */
}

/* Tabs */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #0066cc;
}

.tab-button.active {
  color: #0066cc;
  border-bottom-color: #0066cc;
}

/* Tab Content */
.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-panel h2 {
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
}

.tab-panel h3 {
  color: #555;
  font-size: 18px;
  margin-bottom: 15px;
}

/* Forms */
.form-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="datetime-local"],
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input[type="checkbox"] {
  margin-right: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #0066cc;
  color: white;
}

.btn-primary:hover {
  background: #0052a3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #0066cc;
  color: white;
}

.btn-small:hover {
  background: #0052a3;
}

.btn-danger {
  background: #dc3545;
}

.btn-danger:hover {
  background: #c82333;
}

/* Messages */
.info-message {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
  font-weight: 500;
}

.info-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message {
  padding: 12px;
  border-radius: 4px;
  margin-top: 15px;
  font-weight: 500;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Data Table */
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.data-table thead {
  background: #0066cc;
  color: white;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.data-table tbody tr:hover {
  background: #f8f9fa;
}

.data-table .actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  transition: transform 0.2s ease;
}

.btn-icon:hover {
  transform: scale(1.2);
}

/* Status Badge */
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.expired {
  background: #fff3cd;
  color: #856404;
}

/* Permisos Temporales */
.permiso-form input[type="datetime-local"],
.permiso-form select,
.permiso-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.permiso-form textarea {
  resize: vertical;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.filter-tabs button {
  padding: 8px 16px;
  border: 2px solid #0066cc;
  background: white;
  color: #0066cc;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.filter-tabs button.active {
  background: #0066cc;
  color: white;
}

.filter-tabs button:hover {
  background: #0052a3;
  color: white;
}

.permiso-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.permiso-badge.permiso-banners {
  background: #e3f2fd;
  color: #1976d2;
}

.permiso-badge.permiso-promociones {
  background: #fce4ec;
  color: #c2185b;
}

.permiso-badge.permiso-logo {
  background: #f3e5f5;
  color: #7b1fa2;
}

.permiso-badge.permiso-all {
  background: #e8f5e9;
  color: #2e7d32;
}

.permiso-badge.permiso-default {
  background: #e0e0e0;
  color: #666;
}

.razon-text {
  cursor: help;
  text-decoration: underline dotted;
}

.btn-warning {
  background: #ff9800 !important;
}

.btn-warning:hover {
  background: #f57c00 !important;
}

/* Banners Grid */
.banners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.banner-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.banner-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.banner-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.banner-info {
  padding: 15px;
}

.banner-info h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.banner-info p {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 14px;
}

.banner-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* Mensajes informativos */
.info-message {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-left: 4px solid #2196f3;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  color: #1565c0;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
}

.readonly-badge {
  background: #e0e0e0;
  color: #666;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Logo */
.logo-preview {
  margin-bottom: 20px;
  text-align: center;
}

.current-logo {
  max-width: 300px;
  max-height: 150px;
  object-fit: contain;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  background: white;
}

/* Usuarios */
.user-form input[type="email"],
.user-form input[type="password"],
.user-form input[type="text"],
.user-form select,
.user-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.user-form textarea {
  resize: vertical;
}

.user-form input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.users-list {
  margin-top: 30px;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.role-badge.role-admin {
  background: #fce4ec;
  color: #c2185b;
}

.role-badge.role-vendedor {
  background: #e3f2fd;
  color: #1976d2;
}

.role-badge.role-tecnico {
  background: #e8f5e9;
  color: #2e7d32;
}

.role-badge.role-default {
  background: #e0e0e0;
  color: #666;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .banners-grid {
    grid-template-columns: 1fr;
  }

  .data-table {
    font-size: 12px;
  }

  .data-table th,
  .data-table td {
    padding: 8px;
  }
}
</style>
