// Cliente Prisma para el módulo de autenticación
// Sistema Gestión Logroño - Base de datos: AuthLogronoApp
// Completamente independiente de otros módulos

const { PrismaClient } = require('../prisma/generated/auth-client');

// Crear cliente Prisma específico para autenticación
const authPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

// Función para conectar y verificar la base de datos
async function connectAuthDatabase() {
  try {
    await authPrisma.$connect();
    console.log('✅ Base de datos AuthLogronoApp conectada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a AuthLogronoApp:', error);
    return false;
  }
}

// Función para desconectar la base de datos
async function disconnectAuthDatabase() {
  try {
    await authPrisma.$disconnect();
    console.log('✅ Base de datos AuthLogronoApp desconectada');
  } catch (error) {
    console.error('❌ Error desconectando AuthLogronoApp:', error);
  }
}

// Función para verificar la salud de la base de datos
async function checkAuthDatabaseHealth() {
  try {
    await authPrisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date() };
  }
}

module.exports = {
  authDb: authPrisma,
  authPrisma,
  connectAuthDatabase,
  disconnectAuthDatabase,
  checkAuthDatabaseHealth
};