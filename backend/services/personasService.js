// Servicio de datos para gestión de personas
// Interacción con base de datos PersonasLogrono

const { personasDb } = require('../lib/personas-db');

/**
 * Obtener personas con filtros avanzados
 */
const getPersonasConFiltros = async (filtros) => {
  try {
    const {
      tipo,
      activo,
      search,
      page,
      limit,
      orderBy,
      orderDirection
    } = filtros;

    // Construcción del where clause
    const where = {};
    
    if (typeof activo === 'boolean') {
      where.activo = activo;
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido1: { contains: search, mode: 'insensitive' } },
        { apellido2: { contains: search, mode: 'insensitive' } },
        { dniNifNie: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Configuración de include basada en tipo
    const include = {};
    if (tipo === 'alumno') {
      include.alumno = true;
    } else if (tipo === 'responsable') {
      include.responsable = true;
    } else if (tipo === 'empleado') {
      include.empleado = true;
    } else if (tipo === 'asistente') {
      include.asistenteSocial = {
        include: {
          servicioSocial: true
        }
      };
    } else if (tipo === 'otro') {
      include.otraPersona = true;
    } else {
      // Si no se especifica tipo, incluir todas las especializaciones
      include.alumno = true;
      include.responsable = true;
      include.empleado = true;
      include.asistenteSocial = {
        include: {
          servicioSocial: true
        }
      };
      include.otraPersona = true;
    }

    // Conteo total
    const total = await personasDb.persona.count({ where });

    // Consulta paginada
    const personas = await personasDb.persona.findMany({
      where,
      include,
      orderBy: {
        [orderBy]: orderDirection
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Procesar resultados para agregar tipo detectado
    const personasConTipo = personas.map(persona => {
      let tipoDetectado = 'otro';
      let datosEspecializacion = null;

      if (persona.alumno) {
        tipoDetectado = 'alumno';
        datosEspecializacion = persona.alumno;
      } else if (persona.responsable) {
        tipoDetectado = 'responsable';
        datosEspecializacion = persona.responsable;
      } else if (persona.empleado) {
        tipoDetectado = 'empleado';
        datosEspecializacion = persona.empleado;
      } else if (persona.asistenteSocial) {
        tipoDetectado = 'asistente';
        datosEspecializacion = persona.asistenteSocial;
      } else if (persona.otraPersona) {
        tipoDetectado = 'otro';
        datosEspecializacion = persona.otraPersona;
      }

      return {
        ...persona,
        tipo: tipoDetectado,
        datosEspecializacion
      };
    });

    return {
      personas: personasConTipo,
      total
    };

  } catch (error) {
    console.error('Error en getPersonasConFiltros:', error);
    throw error;
  }
};

/**
 * Obtener resumen estadístico para dashboard
 */
const getResumenEstadistico = async () => {
  try {
    const [
      totalPersonas,
      totalAlumnos,
      totalResponsables,
      totalEmpleados,
      totalAsistentes,
      totalFamilias,
      totalServicios
    ] = await Promise.all([
      personasDb.persona.count({ where: { activo: true } }),
      personasDb.alumno.count(),
      personasDb.responsable.count(),
      personasDb.empleado.count(),
      personasDb.asistenteSocial.count(),
      personasDb.unidadFamiliar.count(),
      personasDb.servicioSocial.count()
    ]);

    return {
      totalPersonas,
      totalAlumnos,
      totalResponsables,
      totalEmpleados,
      totalAsistentes,
      totalFamilias,
      totalServicios
    };

  } catch (error) {
    console.error('Error en getResumenEstadistico:', error);
    throw error;
  }
};

/**
 * Obtener persona por ID con todas sus especializaciones
 */
const getPersonaById = async (id) => {
  try {
    const persona = await personasDb.persona.findUnique({
      where: { id },
      include: {
        alumno: true,
        responsable: true,
        empleado: true,
        asistenteSocial: {
          include: {
            servicioSocial: true
          }
        },
        otraPersona: true,
        unidadesFamiliares: {
          include: {
            unidadFamiliar: true,
            rol: true
          }
        }
      }
    });

    if (!persona) {
      return null;
    }

    // Detectar tipo principal
    let tipoDetectado = 'otro';
    let datosEspecializacion = null;

    if (persona.alumno) {
      tipoDetectado = 'alumno';
      datosEspecializacion = persona.alumno;
    } else if (persona.responsable) {
      tipoDetectado = 'responsable';
      datosEspecializacion = persona.responsable;
    } else if (persona.empleado) {
      tipoDetectado = 'empleado';
      datosEspecializacion = persona.empleado;
    } else if (persona.asistenteSocial) {
      tipoDetectado = 'asistente';
      datosEspecializacion = persona.asistenteSocial;
    } else if (persona.otraPersona) {
      tipoDetectado = 'otro';
      datosEspecializacion = persona.otraPersona;
    }

    return {
      ...persona,
      tipo: tipoDetectado,
      datosEspecializacion
    };

  } catch (error) {
    console.error('Error en getPersonaById:', error);
    throw error;
  }
};

/**
 * Crear nueva persona con especialización
 */
const createPersona = async (datosPersona) => {
  try {
    const {
      // Datos base
      id,
      idRacima,
      nombre,
      apellido1,
      apellido2,
      dniNifNie,
      fechaNacimiento,
      nacionalidad,
      activo = true,
      // Tipo y datos específicos
      tipo,
      datosEspecializacion
    } = datosPersona;

    // Validar que se proporcione un ID manual
    if (!id) {
      throw new Error('El ID es obligatorio y debe ser proporcionado manualmente');
    }

    // Verificar que el ID no exista
    const existeId = await personasDb.persona.findUnique({
      where: { id }
    });

    if (existeId) {
      throw new Error('El ID ya existe en el sistema');
    }

    // Crear persona base
    const datosPersonaBase = {
      id,
      idRacima,
      nombre,
      apellido1,
      apellido2,
      dniNifNie,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      nacionalidad,
      activo
    };

    // Crear persona con especialización en una transacción
    const resultado = await personasDb.$transaction(async (prisma) => {
      // 1. Crear persona base
      const personaCreada = await prisma.persona.create({
        data: datosPersonaBase
      });

      // 2. Crear especialización según tipo
      if (tipo === 'alumno' && datosEspecializacion) {
        await prisma.alumno.create({
          data: {
            personaId: personaCreada.id,
            ...datosEspecializacion
          }
        });
      } else if (tipo === 'responsable' && datosEspecializacion) {
        await prisma.responsable.create({
          data: {
            personaId: personaCreada.id,
            ...datosEspecializacion
          }
        });
      } else if (tipo === 'empleado' && datosEspecializacion) {
        await prisma.empleado.create({
          data: {
            personaId: personaCreada.id,
            ...datosEspecializacion
          }
        });
      } else if (tipo === 'asistente' && datosEspecializacion) {
        await prisma.asistenteSocial.create({
          data: {
            personaId: personaCreada.id,
            ...datosEspecializacion
          }
        });
      } else if (tipo === 'otro' && datosEspecializacion) {
        await prisma.otraPersona.create({
          data: {
            personaId: personaCreada.id,
            ...datosEspecializacion
          }
        });
      }

      return personaCreada;
    });

    // Obtener la persona completa creada
    return await getPersonaById(resultado.id);

  } catch (error) {
    console.error('Error en createPersona:', error);
    throw error;
  }
};

/**
 * Actualizar persona existente
 */
const updatePersona = async (id, datosActualizacion) => {
  try {
    const personaExistente = await personasDb.persona.findUnique({
      where: { id }
    });

    if (!personaExistente) {
      return null;
    }

    const {
      // Datos base
      nombre,
      apellido1,
      apellido2,
      dniNifNie,
      fechaNacimiento,
      nacionalidad,
      activo,
      // Datos específicos
      tipo,
      datosEspecializacion
    } = datosActualizacion;

    // Actualizar datos base
    const datosPersonaBase = {};
    if (nombre !== undefined) datosPersonaBase.nombre = nombre;
    if (apellido1 !== undefined) datosPersonaBase.apellido1 = apellido1;
    if (apellido2 !== undefined) datosPersonaBase.apellido2 = apellido2;
    if (dniNifNie !== undefined) datosPersonaBase.dniNifNie = dniNifNie;
    if (fechaNacimiento !== undefined) datosPersonaBase.fechaNacimiento = fechaNacimiento ? new Date(fechaNacimiento) : null;
    if (nacionalidad !== undefined) datosPersonaBase.nacionalidad = nacionalidad;
    if (activo !== undefined) datosPersonaBase.activo = activo;

    const personaActualizada = await personasDb.persona.update({
      where: { id },
      data: datosPersonaBase
    });

    // TODO: Implementar actualización de especializaciones
    // Esto requiere lógica más compleja para manejar cambios de tipo

    return await getPersonaById(id);

  } catch (error) {
    console.error('Error en updatePersona:', error);
    throw error;
  }
};

/**
 * Eliminar persona (baja lógica)
 */
const deletePersona = async (id) => {
  try {
    const personaExistente = await personasDb.persona.findUnique({
      where: { id }
    });

    if (!personaExistente) {
      return null;
    }

    const personaEliminada = await personasDb.persona.update({
      where: { id },
      data: {
        activo: false,
        fechaBaja: new Date()
      }
    });

    return personaEliminada;

  } catch (error) {
    console.error('Error en deletePersona:', error);
    throw error;
  }
};

module.exports = {
  getPersonasConFiltros,
  getResumenEstadistico,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona
};