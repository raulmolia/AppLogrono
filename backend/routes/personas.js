// Rutas para API de personas
// Módulo independiente del sistema integral de gestión educativa

const express = require('express');
const router = express.Router();

// Importar controladores y validaciones
const personasController = require('../controllers/personasController');
const {
  validateGetPersonas,
  validateGetPersonaById,
  validateCreatePersona,
  validateUpdatePersona,
  validateDeletePersona
} = require('../middlewares/personasValidation');

// ==========================================
// RUTAS PRINCIPALES DE PERSONAS
// ==========================================

/**
 * @route GET /api/personas
 * @desc Obtener lista de personas con filtros
 * @query {string} tipo - Tipo de persona (alumno, responsable, empleado, asistente, otro)
 * @query {boolean} activo - Filtrar por estado activo
 * @query {string} search - Búsqueda por nombre, apellidos, DNI
 * @query {number} page - Página (default: 1)
 * @query {number} limit - Límite por página (default: 10, max: 100)
 * @query {string} orderBy - Campo de ordenamiento (default: apellido1)
 * @query {string} orderDirection - Dirección de ordenamiento (asc/desc, default: asc)
 * @access Public (TODO: Implementar autenticación cuando esté lista)
 */
router.get('/', validateGetPersonas, personasController.getPersonas);

/**
 * @route GET /api/personas/resumen
 * @desc Obtener resumen estadístico para dashboard
 * @access Public (TODO: Implementar autenticación cuando esté lista)
 */
router.get('/resumen', personasController.getResumenPersonas);

/**
 * @route GET /api/personas/:id
 * @desc Obtener persona por ID
 * @param {number} id - ID de la persona
 * @access Public (TODO: Implementar autenticación cuando esté lista)
 */
router.get('/:id', validateGetPersonaById, personasController.getPersonaById);

/**
 * @route POST /api/personas
 * @desc Crear nueva persona
 * @body {object} datosPersona - Datos de la persona a crear
 * @access Public (TODO: Implementar autenticación cuando esté lista)
 */
router.post('/', validateCreatePersona, personasController.createPersona);

/**
 * @route PUT /api/personas/:id
 * @desc Actualizar persona existente
 * @param {number} id - ID de la persona
 * @body {object} datosActualizacion - Datos a actualizar
 * @access Public (TODO: Implementar autenticación cuando esté lista)
 */
router.put('/:id', validateUpdatePersona, personasController.updatePersona);

/**
 * @route DELETE /api/personas/:id
 * @desc Eliminar persona (baja lógica)
 * @param {number} id - ID de la persona
 * @access Public (TODO: Implementar autenticación cuando esté lista)
 */
router.delete('/:id', validateDeletePersona, personasController.deletePersona);

// ==========================================
// RUTAS ESPECÍFICAS POR TIPO
// ==========================================

/**
 * @route GET /api/personas/alumnos
 * @desc Obtener solo alumnos con filtros específicos
 * @query {number} unidadFamiliar - Filtrar por unidad familiar
 * @query {string} curso - Filtrar por curso académico
 * @access Public (TODO: Implementar autenticación cuando esté lista)
 */
router.get('/alumnos', (req, res, next) => {
  req.query.tipo = 'alumno';
  next();
}, validateGetPersonas, personasController.getPersonas);

/**
 * @route GET /api/personas/responsables
 * @desc Obtener solo responsables con filtros específicos
 * @query {boolean} conContacto - Filtrar responsables con datos de contacto
 * @access Public (TODO: Implementar autenticación cuando esté lista)
 */
router.get('/responsables', (req, res, next) => {
  req.query.tipo = 'responsable';
  next();
}, validateGetPersonas, personasController.getPersonas);

/**
 * @route GET /api/personas/empleados
 * @desc Obtener solo empleados con filtros específicos
 * @query {string} categoria - Filtrar por categoría
 * @query {string} departamento - Filtrar por departamento
 * @query {boolean} esResponsable - Filtrar empleados que son responsables
 * @access Public (TODO: Implementar autenticación cuando esté lista)
 */
router.get('/empleados', (req, res, next) => {
  req.query.tipo = 'empleado';
  next();
}, validateGetPersonas, personasController.getPersonas);

/**
 * @route GET /api/personas/servicios-sociales
 * @desc Obtener asistentes sociales con filtros específicos
 * @query {number} servicioSocial - Filtrar por servicio social
 * @access Public (TODO: Implementar autenticación cuando esté lista)
 */
router.get('/servicios-sociales', (req, res, next) => {
  req.query.tipo = 'asistente';
  next();
}, validateGetPersonas, personasController.getPersonas);

// ==========================================
// RUTAS DE UTILIDAD
// ==========================================

/**
 * @route GET /api/personas/search/:termino
 * @desc Búsqueda rápida de personas
 * @param {string} termino - Término de búsqueda
 * @access Public (TODO: Implementar autenticación cuando esté lista)
 */
router.get('/search/:termino', (req, res, next) => {
  req.query.search = req.params.termino;
  req.query.limit = '20'; // Límite para búsqueda rápida
  next();
}, validateGetPersonas, personasController.getPersonas);

/**
 * @route GET /api/personas/validar-dni/:dni
 * @desc Validar si un DNI ya existe en el sistema
 * @param {string} dni - DNI a validar
 * @access Public (TODO: Implementar autenticación cuando esté lista)
 */
router.get('/validar-dni/:dni', async (req, res) => {
  try {
    const { dni } = req.params;
    const personasService = require('../services/personasService');
    
    // Buscar persona con este DNI
    const resultado = await personasService.getPersonasConFiltros({
      search: dni,
      activo: true,
      page: 1,
      limit: 1
    });
    
    const existe = resultado.personas.some(p => p.dniNifNie === dni);
    
    res.json({
      success: true,
      existe,
      message: existe ? 'DNI ya existe en el sistema' : 'DNI disponible'
    });
    
  } catch (error) {
    console.error('Error validando DNI:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;