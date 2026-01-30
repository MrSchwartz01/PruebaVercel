/**
 * API Handler para Vercel
 * 
 * NOTA: Este archivo es solo para documentación.
 * El backend real está desplegado en: https://backend-chpc.vercel.app
 * Repositorio del backend: C:\Users\Contabilidad\Documents\GitHub\backend-chpc
 * 
 * Este proyecto frontend no incluye código de backend.
 * Todas las llamadas al API deben ir a la URL configurada en src/config/api.js
 */

export default function handler(req: any, res: any) {
  res.status(200).json({
    message: 'Este es un proyecto frontend',
    note: 'El backend está desplegado en un repositorio separado',
    backendUrl: 'https://backend-chpc.vercel.app',
    frontendConfig: 'Ver src/config/api.js para configuración del API'
  });
}


