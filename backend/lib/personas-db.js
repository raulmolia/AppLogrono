// Cliente Prisma independiente para MÓDULO PERSONAS
// Configuración completamente aislada del módulo Prestashop

const { PrismaClient: PersonasPrismaClient } = require('../prisma/generated/personas-client');

// Cliente específico para base de datos PersonasLogrono
const personasDb = new PersonasPrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

// Verificar conexión al inicializar
async function verificarConexionPersonas() {
  try {
    await personasDb.$connect();
    console.log('✅ Conexión establecida con PersonasLogrono');
  } catch (error) {
    console.error('❌ Error conectando con PersonasLogrono:', error.message);
    throw error;
  }
}

// Manejo de cierre adecuado
process.on('SIGINT', async () => {
  await personasDb.$disconnect();
});

process.on('SIGTERM', async () => {
  await personasDb.$disconnect();
});

module.exports = {
  personasDb,
  verificarConexionPersonas
};