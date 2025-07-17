# AppLogroño - Sistema de Gestión Integral

## Descripción

Aplicación web integral para la gestión educativa y administrativa de Escolapios Logroño. Desarrollada con Next.js 14, Express.js, TypeScript y Prisma ORM.

## Características Principales

### 🏫 Módulos Funcionales
- **Personas**: Gestión de alumnos, responsables y empleados
- **Académica**: Etapas, ciclos, clases, asignaturas y horarios
- **Ventas**: Prestashop, libros y material escolar
- **Servicios**: Comedor, madrugadores, extraescolares
- **Financiera**: Recibos, cobros, presupuestos
- **RRHH**: Empleados, formaciones, bajas médicas
- **Edificio**: Espacios, reservas, mantenimiento
- **CRM**: Dashboard, potenciales, registros
- **Plataforma**: Usuarios, permisos, bases de datos

### 🔐 Autenticación y Seguridad
- Autenticación basada en sesiones con cookies httpOnly
- Sistema de auditoría completo
- Middleware de protección de rutas
- Gestión de permisos granular

### 📊 Dashboard y Analíticas
- Gráficos interactivos con Recharts
- Exportación a Excel
- Filtros avanzados
- Comparativas anuales

### 🎨 Interfaz de Usuario
- Diseño moderno con shadcn/ui
- Tema responsivo con Tailwind CSS
- Componentes reutilizables
- Navegación intuitiva

## Tecnologías

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **shadcn/ui**
- **TanStack Table**
- **Recharts**
- **Lucide React**

### Backend
- **Express.js**
- **Prisma ORM**
- **SQL Server**
- **bcryptjs**
- **jsonwebtoken**
- **cookie-parser**
- **cors**

### Base de Datos
- **SQL Server** (AuthLogronoApp y módulos adicionales)
- **Prisma** para migraciones y gestión de esquemas
- **Esquemas múltiples**: auth, personas, académica

## Estructura del Proyecto

```
AppLogrono/
├── backend/                     # Servidor Express.js
│   ├── controllers/            # Controladores de API
│   ├── routes/                 # Rutas de API
│   ├── middleware/             # Middleware personalizado
│   ├── services/               # Lógica de negocio
│   ├── lib/                    # Conexiones Prisma
│   ├── prisma/                 # Esquemas y migraciones
│   └── index.js               # Punto de entrada
├── frontend/my-frontend/        # Aplicación Next.js
│   ├── src/
│   │   ├── app/               # Páginas (App Router)
│   │   ├── components/        # Componentes React
│   │   ├── hooks/             # Hooks personalizados
│   │   └── lib/               # Utilidades
│   ├── public/                # Archivos estáticos
│   └── package.json
├── docs/                        # Documentación
└── package.json                # Configuración principal
```

## Instalación

### Prerrequisitos
- Node.js 18+
- npm o yarn
- SQL Server
- Git

### Configuración Inicial

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/raulmolia/AppLogrono.git
   cd AppLogrono
   ```

2. **Instalar dependencias del proyecto principal**:
   ```bash
   npm install
   ```

3. **Instalar dependencias del frontend**:
   ```bash
   cd frontend/my-frontend
   npm install
   cd ../..
   ```

4. **Instalar dependencias del backend**:
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Configuración de Base de Datos

1. **Crear la base de datos SQL Server**:
   ```sql
   CREATE DATABASE AuthLogronoApp;
   ```

2. **Configurar variables de entorno**:
   
   **Backend** (`backend/.env`):
   ```env
   # Base de datos
   DATABASE_URL_AUTH="sqlserver://localhost:1433;database=AuthLogronoApp;integratedSecurity=true;trustServerCertificate=true;"
   DATABASE_URL_PERSONAS="sqlserver://localhost:1433;database=PersonasLogronoApp;integratedSecurity=true;trustServerCertificate=true;"
   DATABASE_URL_ACADEMICA="sqlserver://localhost:1433;database=AcademicaLogronoApp;integratedSecurity=true;trustServerCertificate=true;"
   
   # Autenticación
   JWT_SECRET="tu_jwt_secret_aqui"
   SESSION_SECRET="tu_session_secret_aqui"
   
   # Configuración del servidor
   PORT=3007
   NODE_ENV=development
   ```
   
   **Frontend** (`frontend/my-frontend/.env.local`):
   ```env
   # Backend URL
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3007
   
   # NextAuth
   NEXTAUTH_URL=http://localhost:3003
   NEXTAUTH_SECRET="tu_nextauth_secret_aqui"
   
   # Azure AD (opcional)
   AZURE_AD_CLIENT_ID="tu_client_id"
   AZURE_AD_CLIENT_SECRET="tu_client_secret"
   AZURE_AD_TENANT_ID="tu_tenant_id"
   ```

3. **Ejecutar migraciones de Prisma**:
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   cd ..
   ```

4. **Sembrar datos iniciales** (opcional):
   ```bash
   cd backend
   node prisma/seed-auth-simple.js
   cd ..
   ```

## Desarrollo

### Comandos Principales

```bash
# Desarrollo (ejecuta backend y frontend simultáneamente)
npm run dev

# Desarrollo con servidor mock
npm run dev:mock

# Solo backend
cd backend && node index.js

# Solo frontend
cd frontend/my-frontend && npm run dev
```

### Estructura de URLs

- **Frontend**: http://localhost:3003
- **Backend API**: http://localhost:3007
- **Documentación**: /docs

### Desarrollo de Componentes

Los componentes UI están basados en shadcn/ui y se encuentran en `frontend/my-frontend/src/components/ui/`. Todos los componentes son totalmente tipados con TypeScript.

### API Routes

Las rutas de API siguen el patrón RESTful:
- `GET /api/{resource}` - Listar recursos
- `GET /api/{resource}/{id}` - Obtener recurso específico
- `POST /api/{resource}` - Crear recurso
- `PUT /api/{resource}/{id}` - Actualizar recurso
- `DELETE /api/{resource}/{id}` - Eliminar recurso

## Autenticación

El sistema utiliza un enfoque híbrido:

1. **Sesiones con cookies httpOnly** para la aplicación principal
2. **JWT tokens** para APIs externas
3. **Azure AD** como proveedor de identidad (opcional)
4. **Sistema de permisos** granular basado en roles

### Flujo de Autenticación

1. Usuario hace login → JWT generado
2. Sesión creada en base de datos
3. Cookie httpOnly establecida
4. Middleware valida en cada request
5. Auditoría registrada automáticamente

## Base de Datos

### Esquemas Prisma

- **schema-auth.prisma**: Usuarios, sesiones, permisos
- **schema-personas.prisma**: Alumnos, responsables, empleados
- **schema-academica.prisma**: Etapas, clases, asignaturas

### Migraciones

```bash
# Generar migración
cd backend
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones
npx prisma db push

# Regenerar cliente
npx prisma generate
```

## Testing

### Backend Testing
```bash
cd backend
# Test de autenticación
node test-auth.js

# Test de personas
node test-personas.js

# Test académica
node test-academica.js
```

## Despliegue

### Producción

1. **Build del frontend**:
   ```bash
   cd frontend/my-frontend
   npm run build
   ```

2. **Configurar variables de entorno de producción**

3. **Ejecutar en modo producción**:
   ```bash
   npm run dev:production
   ```

### Variables de Entorno Requeridas

**Producción Backend**:
- `DATABASE_URL_AUTH`
- `DATABASE_URL_PERSONAS` 
- `DATABASE_URL_ACADEMICA`
- `JWT_SECRET`
- `SESSION_SECRET`
- `NODE_ENV=production`

**Producción Frontend**:
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## Contribuir

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código

- **TypeScript** estricto
- **ESLint** para linting
- **Prettier** para formateo
- **Conventional Commits** para mensajes

## Licencia

ISC License - Ver archivo LICENSE para más detalles.

## Soporte

Para soporte técnico o consultas:
- **Email**: raul.molia@escolapioslogrono.es
- **Issues**: [GitHub Issues](https://github.com/raulmolia/AppLogrono/issues)

## Roadmap

### Próximas Funcionalidades
- [ ] Módulo de comunicaciones
- [ ] Integración con Microsoft Teams
- [ ] App móvil
- [ ] API pública
- [ ] Dashboard de analíticas avanzado
- [ ] Sistema de notificaciones en tiempo real

---

**Desarrollo**: Raúl Molia para Escolapios Logroño  
**Versión**: 1.0.0  
**Última actualización**: Julio 2025