// auth.js - Rutas de autenticación
// FASE 2: Backend API Sesiones - Rutas Express /api/auth
// Fecha: 16/07/2025

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Middleware para log de rutas
router.use((req, res, next) => {
  console.log(`🔍 Ruta auth llamada: ${req.method} ${req.path}`);
  next();
});

/**
 * AUT-4: Rutas Express /api/auth
 * Implementa todas las rutas de autenticación basadas en sesiones
 */

/**
 * AUT-4.1: POST /api/auth/login
 * Autenticación usuario/contraseña → crea sesión y cookie httpOnly
 */
router.post('/login', authController.login);

/**
 * AUT-4.2: POST /api/auth/logout
 * Invalidar sesión → elimina sesión de BD y limpia cookies
 */
router.post('/logout', authController.logout);

/**
 * AUT-4.3: POST /api/auth/refresh
 * Renovación de tokens → genera nuevo access token con refresh token
 */
router.post('/refresh', authController.refresh);

/**
 * AUT-4.4: GET /api/auth/me
 * Información del usuario actual → devuelve datos del usuario autenticado
 */
router.get('/me', authController.me);

/**
 * AUT-4.5: GET /api/auth/health
 * Verificación de conectividad → verifica que el sistema funcione
 */
router.get('/health', authController.health);

module.exports = router;