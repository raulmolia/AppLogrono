// Cliente Prisma independiente para Módulo Académica
// Sistema Gestión Logroño - Base de datos: AcademicaLogrono

const { PrismaClient: AcademicaPrismaClient } = require('../prisma/generated/academica-client');

// Cliente independiente para módulo Académica
const academicaDb = new AcademicaPrismaClient({
  datasources: {
    db: {
      url: process.env.ACADEMICA_DATABASE_URL
    }
  },
  log: process.env.DEBUG_MODE === 'true' ? ['query', 'info', 'warn', 'error'] : ['error']
});

// Función para obtener el año lectivo actual
function getCurrentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  
  if (month >= 7) {
    // Julio-Diciembre: Año actual al siguiente
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    // Enero-Junio: Año anterior al actual
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
}

// Función para obtener información del año académico
function getAcademicMonthInfo(date = new Date()) {
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();
  
  if (month >= 7) {
    return {
      academicMonth: month - 6, // Julio = mes 1
      academicYear: `${year}-${(year + 1).toString().slice(-2)}`
    };
  } else {
    return {
      academicMonth: month + 6, // Enero = mes 7
      academicYear: `${year - 1}-${year.toString().slice(-2)}`
    };
  }
}

// Función para inicializar el año lectivo actual si no existe
async function initializeCurrentAcademicYear() {
  const currentYear = getCurrentAcademicYear();
  
  try {
    const existingYear = await academicaDb.aniosLectivos.findUnique({
      where: { anioLectivo: currentYear }
    });

    if (!existingYear) {
      console.log(`Creando año lectivo ${currentYear}...`);
      
      // Calcular fechas del año lectivo
      const startYear = parseInt(currentYear.split('-')[0]);
      const fechaInicio = new Date(startYear, 6, 1); // 1 de julio
      const fechaFin = new Date(startYear + 1, 5, 30); // 30 de junio del año siguiente

      await academicaDb.aniosLectivos.create({
        data: {
          anioLectivo: currentYear,
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
          esActual: true
        }
      });

      // Desactivar años anteriores como actuales
      await academicaDb.aniosLectivos.updateMany({
        where: {
          anioLectivo: { not: currentYear }
        },
        data: {
          esActual: false
        }
      });

      console.log(`✅ Año lectivo ${currentYear} inicializado correctamente`);
    }
  } catch (error) {
    console.error('Error inicializando año lectivo:', error);
  }
}

module.exports = {
  academicaDb,
  getCurrentAcademicYear,
  getAcademicMonthInfo,
  initializeCurrentAcademicYear
};