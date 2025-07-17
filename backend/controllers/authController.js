// authController.js - Controlador de autenticación basado en sesiones
// FASE 2: Backend API Sesiones - Sistema de autenticación local
// Fecha: 16/07/2025

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authDb } = require('../lib/auth-prisma');
const { logSessionChange, logFailedAccess } = require('../middleware/audit');

// Verificar que authDb se importó correctamente
if (!authDb) {
  console.error('ERROR: authDb no se importó correctamente');
  process.exit(1);
}

console.log('✅ authDb importado correctamente en authController');

// Configuración de JWT
const JWT_SECRET = process.env.JWT_SECRET || 'sistema-logrono-secret-key-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * AUT-4.1: POST /login - Autenticación usuario/contraseña
 * Crea sesión en BD y devuelve cookie httpOnly
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validar campos requeridos
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    // Buscar usuario en base de datos
    const user = await authDb.usuarios.findUnique({
      where: { username },
      include: {
        usuarios_roles: {
          include: {
            rol: {
              include: {
                roles_permisos: {
                  include: {
                    permiso: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      // Log intento de acceso fallido
      await logFailedAccess(
        username,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent') || 'Unknown',
        'Usuario no encontrado'
      );

      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      // Log intento de acceso fallido
      await logFailedAccess(
        username,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent') || 'Unknown',
        'Contraseña incorrecta'
      );

      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar tokens JWT
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        roles: user.usuarios_roles.map(ur => ur.rol.nombre)
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    // Crear sesión en base de datos
    const session = await authDb.sesiones.create({
      data: {
        usuario_id: user.id,
        session_token: accessToken,
        refresh_token: refreshToken,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('User-Agent') || 'Unknown',
        fecha_expiracion: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        ultima_actividad: new Date()
      }
    });

    // Actualizar último acceso del usuario
    await authDb.usuarios.update({
      where: { id: user.id },
      data: { ultimo_acceso: new Date() }
    });

    // Log inicio de sesión exitoso
    await logSessionChange(
      user.id,
      'LOGIN_SUCCESS',
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent') || 'Unknown',
      { sessionId: session.id }
    );

    // Configurar cookie httpOnly
    const cookieOptions = {
      httpOnly: true,
      secure: false, // Cambiado a false para desarrollo
      sameSite: 'lax', // Cambiado de 'strict' a 'lax' para mejor compatibilidad
      domain: '192.168.8.4', // Añadido dominio explícito
      path: '/' // Añadido path explícito
    };

    res.cookie('auth_token', accessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    console.log('🍪 Cookies establecidas:', {
      auth_token: accessToken.substring(0, 20) + '...',
      refresh_token: refreshToken.substring(0, 20) + '...',
      domain: '192.168.8.4',
      sameSite: 'lax'
    });

    // Respuesta exitosa (sin devolver tokens en JSON por seguridad)
    res.json({
      success: true,
      message: 'Autenticación exitosa',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        avatar_url: user.avatar_url,
        roles: user.usuarios_roles.map(ur => ur.rol.nombre)
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * AUT-4.2: POST /logout - Invalidar sesión
 * Elimina sesión de BD y limpia cookies
 */
const logout = async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    let userId = null;
    
    if (token) {
      try {
        // Intentar obtener el userId del token
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        // Token inválido, continuar con logout
      }
      
      // Desactivar sesión en base de datos
      await authDb.sesiones.updateMany({
        where: { session_token: token },
        data: { activa: false }
      });
      
      // Log cierre de sesión
      if (userId) {
        await logSessionChange(
          userId,
          'LOGOUT_SUCCESS',
          req.ip || req.connection.remoteAddress,
          req.get('User-Agent') || 'Unknown'
        );
      }
    }

    // Limpiar cookies
    res.clearCookie('auth_token');
    res.clearCookie('refresh_token');

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * AUT-4.3: POST /refresh - Renovación de tokens
 * Genera nuevo token de acceso usando refresh token
 */
const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token no encontrado'
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Buscar sesión activa
    const session = await authDb.sesiones.findFirst({
      where: {
        refresh_token: refreshToken,
        activa: true
      },
      include: {
        usuarios: {
          include: {
            usuarios_roles: {
              include: {
                rol: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Sesión inválida'
      });
    }

    // Generar nuevo access token
    const newAccessToken = jwt.sign(
      { 
        userId: session.usuarios.id, 
        username: session.usuarios.username,
        roles: session.usuarios.usuarios_roles.map(ur => ur.rol.nombre)
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Actualizar sesión en BD
    await authDb.sesiones.update({
      where: { id: session.id },
      data: {
        session_token: newAccessToken,
        ultima_actividad: new Date()
      }
    });

    // Configurar nueva cookie
    res.cookie('auth_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    res.json({
      success: true,
      message: 'Token renovado exitosamente'
    });

  } catch (error) {
    console.error('Error en refresh:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

/**
 * AUT-4.4: GET /me - Información del usuario actual
 * Devuelve datos del usuario autenticado
 */
const me = async (req, res) => {
  try {
    console.log('🔍 /me endpoint: Cookies recibidas:', {
      all_cookies: req.cookies,
      auth_token: req.cookies.auth_token ? 'presente' : 'ausente',
      refresh_token: req.cookies.refresh_token ? 'presente' : 'ausente',
      headers: req.headers.cookie
    });

    let token = req.cookies.auth_token;
    let isRefreshToken = false;
    
    // Si no hay auth_token, intentar usar refresh_token
    if (!token && req.cookies.refresh_token) {
      console.log('⚠️ /me: auth_token no encontrado, intentando con refresh_token');
      token = req.cookies.refresh_token;
      isRefreshToken = true;
    }
    
    if (!token) {
      console.log('❌ /me: Ningún token encontrado');
      return res.status(401).json({
        success: false,
        message: 'Token no encontrado'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Si es refresh token, verificar que sea del tipo correcto
    if (isRefreshToken && decoded.type !== 'refresh') {
      console.log('❌ /me: Refresh token inválido');
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    console.log('✅ /me: Token verificado para usuario:', decoded.userId);
    
    // Buscar usuario completo
    const user = await authDb.usuarios.findUnique({
      where: { id: decoded.userId },
      include: {
        usuarios_roles: {
          include: {
            rol: {
              include: {
                roles_permisos: {
                  include: {
                    permiso: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user || !user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no válido'
      });
    }

    // Formatear permisos
    const permisos = user.usuarios_roles.flatMap(ur => 
      ur.rol.roles_permisos.map(rp => ({
        recurso: rp.permiso.recurso,
        accion: rp.permiso.accion
      }))
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        avatar_url: user.avatar_url,
        ultimo_acceso: user.ultimo_acceso,
        roles: user.usuarios_roles.map(ur => ur.rol.nombre),
        permisos: permisos
      }
    });

  } catch (error) {
    console.error('Error en me:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

/**
 * AUT-4.5: GET /health - Verificación de conectividad
 * Verifica que el sistema de autenticación funcione correctamente
 */
const health = async (req, res) => {
  try {
    console.log('🔍 Health check iniciado');
    console.log('🔍 authDb:', typeof authDb);
    console.log('🔍 authDb.$queryRaw:', typeof authDb.$queryRaw);
    
    // Verificar conexión a base de datos
    console.log('🔍 Ejecutando query...');
    await authDb.$queryRaw`SELECT 1`;
    console.log('🔍 Query ejecutado exitosamente');
    
    // Obtener estadísticas básicas
    console.log('🔍 Obteniendo estadísticas...');
    const stats = await Promise.all([
      authDb.usuarios.count({ where: { activo: true } }),
      authDb.sesiones.count({ where: { activa: true } }),
      authDb.roles.count({ where: { activo: true } })
    ]);

    console.log('🔍 Estadísticas obtenidas:', stats);

    res.json({
      success: true,
      message: 'Sistema de autenticación operativo',
      stats: {
        usuarios_activos: stats[0],
        sesiones_activas: stats[1],
        roles_activos: stats[2]
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error en health check:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error de conectividad',
      error: error.message
    });
  }
};

module.exports = {
  login,
  logout,
  refresh,
  me,
  health
};