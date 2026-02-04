import apiClient from '@/services/api';
import { API_BASE_URL } from '@/config/api';
import AdminProductos from './AdminProductos.vue';
import AdminGarantias from './AdminGarantias.vue';
import AdminPersonalizacion from './AdminPersonalizacion.vue';
import NotificationsPanel from '../NotificationsPanel/NotificationsPanel.vue';
import NotificationsBell from '../NotificationsPanel/NotificationsBell.vue';

export default {
  name: 'AdminPanelMain',
  components: {
    AdminProductos,
    AdminGarantias,
    AdminPersonalizacion,
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
        { id: 'garantias', label: 'Garantías' },
        { id: 'banners', label: 'Banners' },
        { id: 'logo', label: 'Logo' },
        { id: 'personalizacion', label: '🎨 Personalización' },
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

  async mounted() {
    // Primero verificar autenticación
    const isValid = await this.checkAuth();
    if (!isValid) return;
    
    // Solo cargar datos si la autenticación es válida
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
    
    async checkAuth() {
      const role = localStorage.getItem('user_rol');
      const token = localStorage.getItem('access_token');
      
      // Verificar que hay un token
      if (!token) {
        console.error('❌ No hay token de acceso, redirigiendo al login');
        this.$router.push('/login');
        return false;
      }
      
      // Verificar el token con el backend
      try {
        await apiClient.get('/auth/verificar');
        console.log('✅ Token válido');
      } catch (error) {
        console.error('❌ Token inválido o expirado');
        // El interceptor de apiClient manejará el refresh o redirigirá al login
        return false;
      }
      
      this.userRole = role;
      this.isAdmin = role === 'administrador';
      this.isVendedor = role === 'vendedor';
      
      if (role !== 'administrador' && role !== 'vendedor') {
        this.$router.push('/');
        alert('Acceso denegado: Solo administradores y vendedores');
        return false;
      }
      
      return true;
    },

    async loadPermisosVendedor() {
      if (!this.isVendedor) return;
      
      try {
        const [bannersRes, promocionesRes, logoRes] = await Promise.all([
          apiClient.get('/permisos-temporales/verificar/banners', this.getAuthHeaders()),
          apiClient.get('/permisos-temporales/verificar/promociones', this.getAuthHeaders()),
          apiClient.get('/permisos-temporales/verificar/logo', this.getAuthHeaders()),
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
        const response = await apiClient.get('/promociones');
        this.promociones = response.data;
      } catch (error) {
        console.error('Error al cargar promociones:', error);
      }
    },

    async loadProductos() {
      try {
        const response = await apiClient.get('/tienda/productos');
        // La API devuelve { data: [...], total, page, limit, totalPages }
        this.productos = response.data.data || response.data;
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    },

    async submitPromotion() {
      try {
        if (this.editingPromotion) {
          await apiClient.patch(`/promociones/${this.editingPromotion.id}`,
            this.promotionForm,
            this.getAuthHeaders()
          );
          this.showPromotionMessage('Promoción actualizada exitosamente', 'success');
        } else {
          await apiClient.post('/promociones',
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
        await apiClient.delete(`/promociones/${id}`,
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
        const response = await apiClient.get('/tienda/banners');
        this.banners = response.data.data || response.data;
      } catch (error) {
        console.error('Error al cargar banners:', error);
      }
    },

    async submitBanner() {
      try {
        if (this.editingBanner) {
          await apiClient.patch(`/tienda/banners/${this.editingBanner.id}`,
            this.bannerForm,
            this.getAuthHeaders()
          );
          this.showBannerMessage('Banner actualizado exitosamente', 'success');
        } else {
          await apiClient.post('/tienda/banners',
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
        await apiClient.delete(`/tienda/banners/${id}`,
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
        const response = await apiClient.get('/configuracion/logo_url');
        this.currentLogo = response.data.valor || response.data;
      } catch (error) {
        console.log('No hay logo configurado');
      }
    },

    async submitLogo() {
      try {
        await apiClient.post('/configuracion',
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
        // apiClient ya incluye el token automáticamente via interceptor
        const response = await apiClient.get('/usuarios');
        this.usuarios = response.data;
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        // Si es 401, el interceptor redirigirá al login
      }
    },

    async loadCurrentUserId() {
      try {
        // apiClient ya incluye el token automáticamente via interceptor
        const response = await apiClient.get('/usuarios/perfil');
        this.currentUserId = response.data.id;
      } catch (error) {
        console.error('Error al obtener ID del usuario actual:', error);
        // Si es 401, el interceptor redirigirá al login
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
          await apiClient.patch(`/usuarios/${this.editingUser.id}`,
            updateData,
            this.getAuthHeaders()
          );
          this.showUserMessage('Usuario actualizado exitosamente', 'success');
        } else {
          // Crear usuario nuevo
          console.log('Enviando POST a:', `${API_BASE_URL}/usuarios`);
          await apiClient.post('/usuarios',
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
        await apiClient.delete(`/usuarios/${id}`,
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
        const response = await apiClient.get('/permisos-temporales',
          this.getAuthHeaders()
        );
        this.permisos = response.data;
      } catch (error) {
        console.error('Error al cargar permisos:', error);
      }
    },

    async loadVendedores() {
      try {
        const response = await apiClient.get('/usuarios',
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
          await apiClient.patch(`/permisos-temporales/${this.editingPermiso.id}`,
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
          
          await apiClient.post('/permisos-temporales',
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
        await apiClient.patch(`/permisos-temporales/${id}/revocar`,
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
        await apiClient.delete(`/permisos-temporales/${id}`,
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
