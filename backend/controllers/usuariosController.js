// Controlador para gestión de usuarios del sistema de autenticación
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authDb } = require('../lib/auth-prisma');

// Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await authDb.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                nombre: true,
                apellidos: true,
                rol: true,
                activo: true,
                fechaCreacion: true,
                ultimoAcceso: true,
                userPermissions: {
                    select: {
                        modulo: true,
                        seccion: true,
                        lectura: true,
                        escritura: true,
                        eliminacion: true,
                        exportacion: true,
                        administracion: true
                    }
                }
            },
            orderBy: { fechaCreacion: 'desc' }
        });

        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Crear nuevo usuario
exports.crearUsuario = async (req, res) => {
    try {
        const { username, email, nombre, apellidos, rol, activo, password, permisos } = req.body;

        // Validar que el username no exista
        const usuarioExistente = await authDb.user.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: email }
                ]
            }
        });

        if (usuarioExistente) {
            return res.status(400).json({ 
                error: 'El nombre de usuario o email ya existe' 
            });
        }

        // Encriptar contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear usuario
        const nuevoUsuario = await authDb.user.create({
            data: {
                username,
                email,
                nombre,
                apellidos,
                rol,
                activo,
                passwordHash,
                fechaCreacion: new Date(),
                ultimoAcceso: null
            }
        });

        // Crear permisos si se proporcionaron
        if (permisos && permisos.length > 0) {
            await authDb.userPermission.createMany({
                data: permisos.map(permiso => ({
                    userId: nuevoUsuario.id,
                    modulo: permiso.modulo,
                    seccion: permiso.seccion,
                    lectura: permiso.lectura || false,
                    escritura: permiso.escritura || false,
                    eliminacion: permiso.eliminacion || false,
                    exportacion: permiso.exportacion || false,
                    administracion: permiso.administracion || false
                }))
            });
        }

        // Obtener usuario completo con permisos
        const usuarioCompleto = await authDb.user.findUnique({
            where: { id: nuevoUsuario.id },
            select: {
                id: true,
                username: true,
                email: true,
                nombre: true,
                apellidos: true,
                rol: true,
                activo: true,
                fechaCreacion: true,
                ultimoAcceso: true,
                userPermissions: {
                    select: {
                        modulo: true,
                        seccion: true,
                        lectura: true,
                        escritura: true,
                        eliminacion: true,
                        exportacion: true,
                        administracion: true
                    }
                }
            }
        });

        res.status(201).json(usuarioCompleto);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, nombre, apellidos, rol, activo, permisos } = req.body;

        // Validar que el usuario exista
        const usuarioExistente = await authDb.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!usuarioExistente) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Validar username/email únicos (excluyendo el usuario actual)
        const usuarioConflicto = await authDb.user.findFirst({
            where: {
                AND: [
                    { id: { not: parseInt(id) } },
                    {
                        OR: [
                            { username: username },
                            { email: email }
                        ]
                    }
                ]
            }
        });

        if (usuarioConflicto) {
            return res.status(400).json({ 
                error: 'El nombre de usuario o email ya existe' 
            });
        }

        // Actualizar usuario
        const usuarioActualizado = await authDb.user.update({
            where: { id: parseInt(id) },
            data: {
                username,
                email,
                nombre,
                apellidos,
                rol,
                activo
            }
        });

        // Actualizar permisos si se proporcionaron
        if (permisos !== undefined) {
            // Eliminar permisos existentes
            await authDb.userPermission.deleteMany({
                where: { userId: parseInt(id) }
            });

            // Crear nuevos permisos
            if (permisos.length > 0) {
                await authDb.userPermission.createMany({
                    data: permisos.map(permiso => ({
                        userId: parseInt(id),
                        modulo: permiso.modulo,
                        seccion: permiso.seccion,
                        lectura: permiso.lectura || false,
                        escritura: permiso.escritura || false,
                        eliminacion: permiso.eliminacion || false,
                        exportacion: permiso.exportacion || false,
                        administracion: permiso.administracion || false
                    }))
                });
            }
        }

        // Obtener usuario completo con permisos
        const usuarioCompleto = await authDb.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                username: true,
                email: true,
                nombre: true,
                apellidos: true,
                rol: true,
                activo: true,
                fechaCreacion: true,
                ultimoAcceso: true,
                userPermissions: {
                    select: {
                        modulo: true,
                        seccion: true,
                        lectura: true,
                        escritura: true,
                        eliminacion: true,
                        exportacion: true,
                        administracion: true
                    }
                }
            }
        });

        res.json(usuarioCompleto);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el usuario exista
        const usuarioExistente = await authDb.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!usuarioExistente) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Prevenir eliminación del superadmin
        if (usuarioExistente.rol === 'SUPERADMIN') {
            return res.status(403).json({ 
                error: 'No se puede eliminar el superadministrador' 
            });
        }

        // Eliminar permisos primero (por restricción de clave foránea)
        await authDb.userPermission.deleteMany({
            where: { userId: parseInt(id) }
        });

        // Eliminar sesiones del usuario
        await authDb.session.deleteMany({
            where: { userId: parseInt(id) }
        });

        // Eliminar usuario
        await authDb.user.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Cambiar estado de usuario (activar/desactivar)
exports.cambiarEstadoUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;

        // Validar que el usuario exista
        const usuarioExistente = await authDb.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!usuarioExistente) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Prevenir desactivación del superadmin
        if (usuarioExistente.rol === 'SUPERADMIN' && !activo) {
            return res.status(403).json({ 
                error: 'No se puede desactivar el superadministrador' 
            });
        }

        // Actualizar estado
        const usuarioActualizado = await authDb.user.update({
            where: { id: parseInt(id) },
            data: { activo }
        });

        // Si se desactiva, eliminar sesiones activas
        if (!activo) {
            await authDb.session.deleteMany({
                where: { userId: parseInt(id) }
            });
        }

        res.json({ 
            message: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente`,
            usuario: usuarioActualizado 
        });
    } catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Restablecer contraseña
exports.restablecerPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevaPassword } = req.body;

        // Validar que el usuario exista
        const usuarioExistente = await authDb.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!usuarioExistente) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Encriptar nueva contraseña
        const passwordHash = await bcrypt.hash(nuevaPassword, 10);

        // Actualizar contraseña
        await authDb.user.update({
            where: { id: parseInt(id) },
            data: { passwordHash }
        });

        // Eliminar sesiones activas para forzar nuevo login
        await authDb.session.deleteMany({
            where: { userId: parseInt(id) }
        });

        res.json({ message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener estadísticas de usuarios
exports.obtenerEstadisticas = async (req, res) => {
    try {
        const [
            totalUsuarios,
            usuariosActivos,
            usuariosInactivos,
            usuariosConectadosHoy
        ] = await Promise.all([
            authDb.user.count(),
            authDb.user.count({ where: { activo: true } }),
            authDb.user.count({ where: { activo: false } }),
            authDb.user.count({
                where: {
                    ultimoAcceso: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            })
        ]);

        res.json({
            totalUsuarios,
            usuariosActivos,
            usuariosInactivos,
            usuariosConectadosHoy
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};