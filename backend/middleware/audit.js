// audit.js - Middleware de auditoría
// FASE 2: Backend API Sesiones - AUT-6: Middleware de auditoría
// Fecha: 16/07/2025

const { authDb } = require('../lib/auth-prisma');

/**
 * AUT-6.1: Registrar inicio y cierre de sesión
 * Este middleware se ejecuta automáticamente en login/logout
 */
const logSessionChange = async (userId, accion, ipAddress, userAgent, additionalData = {}) => {
  try {
    await authDb.logs_cambios.create({
      data: {
        usuario_id: userId,
        accion,
        tabla: 'sesiones',
        ip_address: ipAddress,
        user_agent: userAgent,
        datos_despues: JSON.stringify(additionalData),
        modulo: 'auth'
      }
    });
  } catch (error) {
    console.error('Error registrando cambio de sesión:', error);
  }
};

/**
 * AUT-6.2: Registrar mutaciones BD con before/after JSON
 * Middleware para registrar cambios en base de datos
 */
const auditMiddleware = (tabla, operacion = 'unknown') => {
  return async (req, res, next) => {
    // Guardar el método original de res.json
    const originalJson = res.json;
    
    // Interceptar la respuesta
    res.json = function(body) {
      // Solo auditar operaciones exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Ejecutar auditoría de forma asíncrona
        setImmediate(async () => {
          try {
            await auditDatabaseChange(
              req.user ? req.user.id : null,
              operacion,
              tabla,
              req.body,
              body,
              req.ip || req.connection.remoteAddress,
              req.get('User-Agent') || 'Unknown',
              req.params.id || null
            );
          } catch (error) {
            console.error('Error en auditoría:', error);
          }
        });
      }
      
      // Llamar al método original
      return originalJson.call(this, body);
    };
    
    next();
  };
};

/**
 * Función auxiliar para registrar cambios en base de datos
 */
const auditDatabaseChange = async (userId, accion, tabla, datosBefore, datosAfter, ipAddress, userAgent, registroId) => {
  try {
    await authDb.logs_cambios.create({
      data: {
        usuario_id: userId,
        accion,
        tabla,
        registro_id: registroId ? parseInt(registroId) : null,
        datos_antes: datosBefore ? JSON.stringify(datosBefore) : null,
        datos_despues: datosAfter ? JSON.stringify(datosAfter) : null,
        ip_address: ipAddress,
        user_agent: userAgent,
        modulo: getModuleFromTable(tabla)
      }
    });
  } catch (error) {
    console.error('Error registrando cambio en BD:', error);
  }
};

/**
 * AUT-6.3: Logging de accesos fallidos y comportamientos anómalos
 * Middleware para registrar intentos de acceso fallidos
 */
const logFailedAccess = async (username, ipAddress, userAgent, motivo, bloqueado = false) => {
  try {
    await authDb.intentos_acceso.create({
      data: {
        username,
        ip_address: ipAddress,
        user_agent: userAgent,
        motivo_fallo: motivo,
        bloqueado
      }
    });
  } catch (error) {
    console.error('Error registrando acceso fallido:', error);
  }
};

/**
 * Middleware para detectar comportamientos anómalos
 */
const detectAnomalousActivity = async (req, res, next) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const currentIp = req.ip || req.connection.remoteAddress;
      const currentUserAgent = req.get('User-Agent') || 'Unknown';
      
      // Verificar si hay cambios significativos en IP o User-Agent
      const recentSessions = await authDb.sesiones.findMany({
        where: {
          usuario_id: userId,
          fecha_inicio: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
          }
        },
        orderBy: {
          fecha_inicio: 'desc'
        },
        take: 5
      });

      const differentIPs = new Set();
      const differentUserAgents = new Set();
      
      recentSessions.forEach(session => {
        if (session.ip_address && session.ip_address !== currentIp) {
          differentIPs.add(session.ip_address);
        }
        if (session.user_agent && session.user_agent !== currentUserAgent) {
          differentUserAgents.add(session.user_agent);
        }
      });

      // Si hay más de 3 IPs diferentes en 24h, registrar como anómalo
      if (differentIPs.size > 3) {
        await auditDatabaseChange(
          userId,
          'ACTIVIDAD_ANOMALA',
          'sesiones',
          { tipo: 'multiple_ips', count: differentIPs.size },
          { ips: Array.from(differentIPs) },
          currentIp,
          currentUserAgent,
          null
        );
      }
    }
  } catch (error) {
    console.error('Error detectando actividad anómala:', error);
  }
  
  next();
};

/**
 * Helper para determinar el módulo basado en la tabla
 */
const getModuleFromTable = (tabla) => {
  if (tabla.startsWith('usuarios') || tabla.startsWith('roles') || tabla.startsWith('permisos') || tabla.startsWith('sesiones')) {
    return 'auth';
  }
  if (tabla.startsWith('personas') || tabla.startsWith('alumnos') || tabla.startsWith('responsables') || tabla.startsWith('familias')) {
    return 'personas';
  }
  if (tabla.startsWith('etapas') || tabla.startsWith('ciclos') || tabla.startsWith('cursos') || tabla.startsWith('clases') || tabla.startsWith('asignaturas')) {
    return 'academica';
  }
  if (tabla.startsWith('facturas') || tabla.startsWith('productos')) {
    return 'prestashop';
  }
  return 'unknown';
};

/**
 * Middleware para registrar acceso a endpoints protegidos
 */
const logProtectedAccess = async (req, res, next) => {
  try {
    if (req.user) {
      await auditDatabaseChange(
        req.user.id,
        `ACCESS_${req.method}`,
        'endpoints',
        { path: req.originalUrl },
        { success: true },
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent') || 'Unknown',
        null
      );
    }
  } catch (error) {
    console.error('Error registrando acceso protegido:', error);
  }
  
  next();
};

module.exports = {
  logSessionChange,
  auditMiddleware,
  auditDatabaseChange,
  logFailedAccess,
  detectAnomalousActivity,
  logProtectedAccess
};