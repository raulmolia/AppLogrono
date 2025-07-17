# Guía de Contribución

¡Gracias por tu interés en contribuir a AppLogroño! Esta guía te ayudará a entender cómo puedes colaborar efectivamente.

## Código de Conducta

Este proyecto se adhiere a un código de conducta profesional. Se espera que todos los participantes respeten este código.

## Cómo Contribuir

### Reportar Bugs

1. Verifica que el bug no haya sido reportado anteriormente
2. Usa la plantilla de issue para bugs
3. Incluye:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Entorno (OS, navegador, versión de Node.js)

### Sugerir Funcionalidades

1. Verifica que la funcionalidad no exista ya
2. Usa la plantilla de issue para funcionalidades
3. Describe:
   - El problema que resuelve
   - La solución propuesta
   - Alternativas consideradas
   - Contexto adicional

### Desarrollar

#### Configuración del Entorno

```bash
# Clonar el repositorio
git clone https://github.com/raulmolia/AppLogrono.git
cd AppLogrono

# Instalar dependencias
npm run install:all

# Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/my-frontend/.env.example frontend/my-frontend/.env.local

# Configurar base de datos
npm run db:generate
npm run db:push
npm run db:seed

# Ejecutar en modo desarrollo
npm run dev
```

#### Flujo de Desarrollo

1. **Crear rama feature**:
   ```bash
   git checkout -b feature/descripcion-breve
   ```

2. **Desarrollar**:
   - Sigue las convenciones de código existentes
   - Escribe tests cuando sea aplicable
   - Documenta cambios significativos

3. **Testing**:
   ```bash
   # Tests de backend
   npm run test:auth
   npm run test:personas
   npm run test:academica
   
   # Linting frontend
   npm run lint
   ```

4. **Commit**:
   ```bash
   git add .
   git commit -m "tipo(scope): descripción breve"
   ```

5. **Push y PR**:
   ```bash
   git push origin feature/descripcion-breve
   ```
   - Crear Pull Request desde GitHub
   - Llenar la plantilla de PR
   - Asignar reviewers apropiados

## Convenciones

### Mensajes de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(scope): descripción

[cuerpo opcional]

[footer opcional]
```

**Tipos**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formateo, punto y coma faltante, etc.
- `refactor`: Refactorización de código
- `test`: Añadir tests
- `chore`: Mantenimiento

**Scopes**:
- `auth`: Autenticación
- `personas`: Módulo personas
- `academica`: Módulo académico
- `ui`: Interfaz de usuario
- `api`: Backend/API
- `db`: Base de datos
- `config`: Configuración

### Código

#### Backend (Node.js/Express)

```javascript
// Usar const/let en lugar de var
const express = require('express');

// Funciones async/await
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Nombres descriptivos
const handleUserCreation = async (userData) => {
  // ...
};
```

#### Frontend (Next.js/React/TypeScript)

```typescript
// Interfaces para props
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

// Componentes funcionales con TypeScript
const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <div className="p-4 border rounded">
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user.id)}>Editar</button>
    </div>
  );
};

// Hooks personalizados
const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ...
  
  return { users, loading, refetch };
};
```

#### Estilos (Tailwind CSS)

```jsx
// Usar clases de Tailwind de forma consistente
<div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow">
  <h2 className="text-lg font-semibold text-gray-900">Título</h2>
  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
    Acción
  </button>
</div>
```

### Estructura de Archivos

#### Backend
```
backend/
├── controllers/     # Lógica de controladores
├── routes/         # Definición de rutas
├── middleware/     # Middleware personalizado
├── services/       # Lógica de negocio
├── lib/            # Utilidades y conexiones
└── prisma/         # Esquemas y migraciones
```

#### Frontend
```
frontend/my-frontend/src/
├── app/            # Páginas (App Router)
├── components/     # Componentes reutilizables
│   ├── ui/         # Componentes UI básicos
│   └── layout/     # Componentes de layout
├── hooks/          # Hooks personalizados
└── lib/            # Utilidades
```

## Testing

### Backend
```javascript
// Test de endpoint
const testGetUsers = async () => {
  const response = await fetch('http://localhost:3007/api/usuarios');
  const users = await response.json();
  
  console.assert(response.ok, 'La respuesta debe ser exitosa');
  console.assert(Array.isArray(users), 'Debe retornar un array');
  console.log('✓ Test GET usuarios pasado');
};
```

### Frontend
```typescript
// Test de componente (ejemplo conceptual)
describe('UserCard', () => {
  it('debe mostrar el nombre del usuario', () => {
    const user = { id: '1', name: 'Juan Pérez' };
    render(<UserCard user={user} onEdit={() => {}} />);
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
  });
});
```

## Documentación

- Documenta funciones complejas con JSDoc
- Actualiza README.md si cambias funcionalidad principal
- Añade ejemplos en archivos de documentación específicos

## Review Process

1. **Automático**: CI/CD checks (linting, tests)
2. **Manual**: Code review por maintainer
3. **Criterios**:
   - Código funcional
   - Sigue convenciones
   - Tests pasan
   - Documentación actualizada
   - Sin conflictos de merge

## Releases

- Versionado semántico (SemVer)
- Changelog generado automáticamente
- Tags de Git para cada release

## Soporte

- **Issues**: Para bugs y funcionalidades
- **Discussions**: Para preguntas generales
- **Email**: raul.molia@escolapioslogrono.es (para temas urgentes)

## Reconocimientos

Todos los contributors serán reconocidos en el README y releases.

---

¡Gracias por contribuir a AppLogroño! 🚀