// auth.js - Middleware de autenticación y autorización
// FASE 2: Backend API Sesiones - AUT-5: Middleware de autenticación
// Fecha: 16/07/2025

const jwt = require('jsonwebtoken');
const { authDb } = require('../lib/auth-prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'sistema-logrono-secret-key-2025';

/**
 * AUT-5.1: requireAuth - Verificar sesión válida
 * Middleware para verificar que el usuario esté autenticado
 */
const requireAuth = async (req, res, next) => {
  try {
    // Extraer token de cookies
    const token = req.cookies.auth_token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que la sesión esté activa en BD
    const session = await authDb.sesiones.findFirst({
      where: {
        session_token: token,
        activa: true,
        fecha_expiracion: {
          gt: new Date()
        }
      },
      include: {
        usuarios: {
          include: {
            usuarios_roles: {
              include: {
                roles: {
                  include: {
                    roles_permisos: {
                      include: {
                        permisos: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Sesión inválida o expirada'
      });
    }

    // Verificar que el usuario esté activo
    if (!session.usuarios.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    // Actualizar última actividad
    await authDb.sesiones.update({
      where: { id: session.id },
      data: { ultima_actividad: new Date() }
    });

    // Añadir información del usuario al request
    req.user = {
      id: session.usuarios.id,
      username: session.usuarios.username,
      email: session.usuarios.email,
      nombre: session.usuarios.nombre,
      apellidos: session.usuarios.apellidos,
      roles: session.usuarios.usuarios_roles.map(ur => ur.roles.nombre),
      permisos: session.usuarios.usuarios_roles.flatMap(ur => 
        ur.roles.roles_permisos.map(rp => ({
          recurso: rp.permisos.recurso,
          accion: rp.permisos.accion
        }))
      )
    };

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

/**
 * AUT-5.2: requireRole - Verificar rol específico
 * Middleware para verificar que el usuario tenga un rol específico
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!req.user.roles.includes(requiredRole)) {
      return res.status(403).json({
        success: false,
        message: `Se requiere rol: ${requiredRole}`
      });
    }

    next();
  };
};

/**
 * AUT-5.3: requirePermission - Verificar permiso específico
 * Middleware para verificar que el usuario tenga un permiso específico
 */
const requirePermission = (recurso, accion) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const hasPermission = req.user.permisos.some(p => 
      p.recurso === recurso && p.accion === accion
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Permiso denegado. Se requiere: ${recurso}.${accion}`
      });
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación
 * Añade información del usuario si está autenticado, pero no falla si no lo está
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const session = await authDb.sesiones.findFirst({
      where: {
        session_token: token,
        activa: true,
        fecha_expiracion: {
          gt: new Date()
        }
      },
      include: {
        usuarios: {
          include: {
            usuarios_roles: {
              include: {
                roles: {
                  include: {
                    roles_permisos: {
                      include: {
                        permisos: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (session && session.usuarios.activo) {
      req.user = {
        id: session.usuarios.id,
        username: session.usuarios.username,
        email: session.usuarios.email,
        nombre: session.usuarios.nombre,
        apellidos: session.usuarios.apellidos,
        roles: session.usuarios.usuarios_roles.map(ur => ur.roles.nombre),
        permisos: session.usuarios.usuarios_roles.flatMap(ur => 
          ur.roles.roles_permisos.map(rp => ({
            recurso: rp.permisos.recurso,
            accion: rp.permisos.accion
          }))
        )
      };
    }

    next();
  } catch (error) {
    // En caso de error, continuar sin autenticación
    next();
  }
};

/**
 * Helper para verificar si el usuario tiene un permiso específico
 */
const hasPermission = (user, recurso, accion) => {
  if (!user || !user.permisos) return false;
  
  return user.permisos.some(p => 
    p.recurso === recurso && p.accion === accion
  );
};

/**
 * Helper para verificar si el usuario tiene un rol específico
 */
const hasRole = (user, role) => {
  if (!user || !user.roles) return false;
  
  return user.roles.includes(role);
};

module.exports = {
  requireAuth,
  requireRole,
  requirePermission,
  optionalAuth,
  hasPermission,
  hasRole
};