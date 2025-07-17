// Rutas para gestión de usuarios del sistema de autenticación
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

// Middleware de autenticación (implementado en authController)
const { requireAuth, requirePermission } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(requireAuth);

// Rutas para gestión de usuarios
router.get('/', usuariosController.obtenerUsuarios);
router.post('/', usuariosController.crearUsuario);
router.put('/:id', usuariosController.actualizarUsuario);
router.delete('/:id', usuariosController.eliminarUsuario);
router.put('/:id/estado', usuariosController.cambiarEstadoUsuario);
router.put('/:id/password', usuariosController.restablecerPassword);
router.get('/estadisticas', usuariosController.obtenerEstadisticas);

module.exports = router;