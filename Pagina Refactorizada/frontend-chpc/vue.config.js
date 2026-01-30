const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  outputDir: 'dist',
  assetsDir: 'static',
  transpileDependencies: [],
  
  devServer: {
    open: true,
    host: 'localhost',
    port: 8080,
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  },
  // Variables globales para acceder a la URL del API desde el código
  chainWebpack: config => {
    config.plugin('define').tap(definitions => {
      definitions[0] = Object.assign(definitions[0], {
        __API_URL__: JSON.stringify(
          process.env.VUE_APP_API_URL || 'http://localhost:3001'
        )
      })
      return definitions
    })
  }
})