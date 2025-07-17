const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Importar rutas del módulo Autenticación
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');

// Importar rutas del módulo Personas
const personasRoutes = require('./routes/personas');
const fotosRoutes = require('./routes/fotosRoutes');
const familiasRoutes = require('./routes/familiasRoutes');
const busquedaRoutes = require('./routes/busquedaRoutes');
const documentosRoutes = require('./routes/documentosRoutes');

// Importar rutas del módulo Académica
const academicYearsRoutes = require('./routes/academicYears');
const etapasRoutes = require('./routes/etapas');
const ciclosRoutes = require('./routes/ciclos');
const cursosRoutes = require('./routes/cursos');
const clasesRoutes = require('./routes/clases');
const asignaturasRoutes = require('./routes/asignaturas');
const ubicacionesRoutes = require('./routes/ubicaciones');
const horariosRoutes = require('./routes/horarios');
const coordinadoresRoutes = require('./routes/coordinadoresRoutes');
const asignacionesRoutes = require('./routes/asignacionesRoutes');
const incidenciasRoutes = require('./routes/incidenciasRoutes');
const franjasHorariasRoutes = require('./routes/franjasHorariasRoutes');

const prisma = new PrismaClient();
const app = express();

// Configuración CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3003',
  'http://localhost:3010',
  'http://localhost:3001',
  'http://192.168.8.4:3003',
  'http://192.168.8.4:3000',
  'http://192.168.8.4:3010'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política CORS para este sitio no permite acceso desde el origen especificado.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

// Health check - Base de datos Prestashop
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    res.json({ 
      status: 'OK', 
      message: 'Servidor y base de datos funcionando correctamente',
      module: 'Sistema Gestión Logroño',
      database: 'Multi-BD (Prestashop, Personas, Académica, Auth)',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en health check:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Error de conexión a la base de datos',
      error: error.message 
    });
  }
});

// Función para parsear fechas DD/MM/YYYY
function parseDate(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const date = new Date(Date.UTC(year, month, day));
       if (date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day) {
        return date;
      }
    }
  }
   console.error(`Error parseando fecha: ${dateString}`);
  return null;
}

// === RUTAS DE AUTENTICACIÓN ===
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);

// === RUTAS DEL MÓDULO PERSONAS ===
app.use('/api/personas', personasRoutes);
app.use('/api/fotos', fotosRoutes);
app.use('/api/familias', familiasRoutes);
app.use('/api/busqueda', busquedaRoutes);
app.use('/api/documentos', documentosRoutes);

// === RUTAS DEL MÓDULO ACADÉMICA ===
app.use('/api/academic-years', academicYearsRoutes);
app.use('/api/etapas', etapasRoutes);
app.use('/api/ciclos', ciclosRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/clases', clasesRoutes);
app.use('/api/asignaturas', asignaturasRoutes);
app.use('/api/ubicaciones', ubicacionesRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/coordinadores', coordinadoresRoutes);
app.use('/api/asignaciones', asignacionesRoutes);
app.use('/api/incidencias', incidenciasRoutes);
app.use('/api/franjas-horarias', franjasHorariasRoutes);

// === RUTAS DEL MÓDULO PRESTASHOP ===
// Obtener todas las facturas con filtros opcionales
app.get('/facturas', async (req, res) => {
  try {
    const { curso, categoria, cliente } = req.query;
    
    let whereClause = {};
    
    if (curso) {
      whereClause.Curso = curso;
    }
    
    if (categoria) {
      whereClause.Categoria = categoria;
    }
    
    if (cliente) {
      whereClause.OR = [
        { Cliente: { contains: cliente } },
        { Email: { contains: cliente } }
      ];
    }
    
    const facturas = await prisma.facturas.findMany({
      where: whereClause,
      orderBy: {
        FechaFra: 'desc'
      }
    });
    
    res.json(facturas);
  } catch (error) {
    console.error('Error obteniendo facturas:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// Subir facturas desde archivo Excel
app.post('/upload-facturas', async (req, res) => {
  try {
    const { facturas } = req.body;
    
    if (!facturas || !Array.isArray(facturas)) {
      return res.status(400).json({ error: 'Formato de datos inválido' });
    }
    
    const facturasParaInsertar = facturas.map(factura => {
      const fechaFra = parseDate(factura.FechaFra);
      
      let curso = factura.Curso;
      if (!curso && fechaFra) {
        if (fechaFra >= new Date('2024-07-01') && fechaFra < new Date('2025-07-01')) {
          curso = '24/25';
        } else if (fechaFra >= new Date('2025-07-01') && fechaFra < new Date('2026-07-01')) {
          curso = '25/26';
        }
      }
      
      return {
        IdFra: parseInt(factura.IdFra),
        FechaFra: fechaFra,
        Cliente: factura.Cliente || '',
        Email: factura.Email || '',
        Categoria: factura.Categoria || '',
        Producto: factura.Producto || '',
        Precio: parseFloat(factura.Precio) || 0,
        Cantidad: parseInt(factura.Cantidad) || 0,
        Descuento: parseFloat(factura.Descuento) || 0,
        Total: parseFloat(factura.Total) || 0,
        TipoIVA: factura.TipoIVA || '',
        IVA: parseFloat(factura.IVA) || 0,
        Curso: curso || ''
      };
    });
    
    const resultado = await prisma.facturas.createMany({
      data: facturasParaInsertar,
      skipDuplicates: true
    });
    
    res.json({
      message: 'Facturas subidas exitosamente',
      insertadas: resultado.count,
      total: facturas.length
    });
    
  } catch (error) {
    console.error('Error subiendo facturas:', error);
    res.status(500).json({ 
      error: 'Error procesando las facturas',
      details: error.message
    });
  }
});

// Análisis de datos por categoría y curso
app.get('/analisis', async (req, res) => {
  try {
    const { curso, categoria } = req.query;
    
    let whereClause = {};
    
    if (curso) {
      whereClause.Curso = curso;
    }
    
    if (categoria) {
      whereClause.Categoria = categoria;
    }
    
    const analisis = await prisma.facturas.groupBy({
      by: ['Curso', 'Categoria'],
      where: whereClause,
      _sum: {
        Total: true,
        Cantidad: true
      },
      _count: {
        IdFra: true
      },
      orderBy: {
        Curso: 'desc'
      }
    });
    
    res.json(analisis);
  } catch (error) {
    console.error('Error en análisis:', error);
    res.status(500).json({ 
      error: 'Error generando análisis',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Módulo Prestashop: http://localhost:${PORT}/health`);
  console.log(`👥 Módulo Personas: Rutas /api/personas/*`);
  console.log(`🎓 Módulo Académica: Rutas /api/etapas/* /api/ciclos/* etc.`);
  console.log(`🔐 Módulo Autenticación: /api/auth/* /api/usuarios/*`);
  console.log(`🌐 CORS habilitado para desarrollo local`);
});

module.exports = app;