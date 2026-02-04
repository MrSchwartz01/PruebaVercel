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
        Notificaciones
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

      <!-- Tab de Garantías -->
      <div v-if="activeTab === 'garantias'" class="tab-panel">
        <AdminGarantias />
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

      <!-- Tab de Personalización -->
      <div v-if="activeTab === 'personalizacion' && isAdmin" class="tab-panel">
        <AdminPersonalizacion />
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

<script src="./AdminPanel.js"></script>
<style scoped src="./AdminPanel.css"></style>
