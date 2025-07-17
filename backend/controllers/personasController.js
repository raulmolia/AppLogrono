// Controlador para gestión de personas
// Módulo independiente del sistema integral de gestión educativa

const personasService = require('../services/personasService');
const { validationResult } = require('express-validator');

/**
 * Obtener personas con filtros avanzados
 * GET /api/personas?tipo=alumno&activo=true&page=1&limit=10&search=juan
 */
const getPersonas = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const filtros = {
      tipo: req.query.tipo, // 'alumno', 'responsable', 'empleado', 'asistente', 'otro'
      activo: req.query.activo === 'true',
      search: req.query.search, // Búsqueda por nombre, apellidos, DNI
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      orderBy: req.query.orderBy || 'apellido1',
      orderDirection: req.query.orderDirection || 'asc'
    };

    const resultado = await personasService.getPersonasConFiltros(filtros);

    res.json({
      success: true,
      data: {
        personas: resultado.personas,
        total: resultado.total,
        page: filtros.page,
        totalPages: Math.ceil(resultado.total / filtros.limit)
      }
    });

  } catch (error) {
    console.error('Error en getPersonas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener resumen estadístico para dashboard
 * GET /api/personas/resumen
 */
const getResumenPersonas = async (req, res) => {
  try {
    const resumen = await personasService.getResumenEstadistico();
    
    res.json({
      success: true,
      data: resumen
    });

  } catch (error) {
    console.error('Error en getResumenPersonas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener persona por ID
 * GET /api/personas/:id
 */
const getPersonaById = async (req, res) => {
  try {
    const { id } = req.params;
    const persona = await personasService.getPersonaById(parseInt(id));

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }

    res.json({
      success: true,
      data: persona
    });

  } catch (error) {
    console.error('Error en getPersonaById:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Crear nueva persona
 * POST /api/personas
 */
const createPersona = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const datosPersona = req.body;
    const nuevaPersona = await personasService.createPersona(datosPersona);

    res.status(201).json({
      success: true,
      data: nuevaPersona,
      message: 'Persona creada exitosamente'
    });

  } catch (error) {
    console.error('Error en createPersona:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'El DNI ya existe en el sistema'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Actualizar persona existente
 * PUT /api/personas/:id
 */
const updatePersona = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const datosActualizacion = req.body;

    const personaActualizada = await personasService.updatePersona(parseInt(id), datosActualizacion);

    if (!personaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }

    res.json({
      success: true,
      data: personaActualizada,
      message: 'Persona actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en updatePersona:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'El DNI ya existe en el sistema'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Eliminar persona (baja lógica)
 * DELETE /api/personas/:id
 */
const deletePersona = async (req, res) => {
  try {
    const { id } = req.params;
    const personaEliminada = await personasService.deletePersona(parseInt(id));

    if (!personaEliminada) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Persona eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error en deletePersona:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getPersonas,
  getResumenPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona
};