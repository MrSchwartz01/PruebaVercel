const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: '/',
  transpileDependencies: [],
  devServer: {
    host: '0.0.0.0', // Permitir acceso desde cualquier IP en la red
    port: 8080,
    allowedHosts: 'all', // Permitir todos los hosts
  }
})
