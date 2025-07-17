'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Search, Filter, Loader2, AlertCircle } from 'lucide-react';

// Función para normalizar texto: quitar acentos, convertir a minúsculas
const normalizarTexto = (texto: string): string => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos (acentos)
    .trim();
};

// Función de búsqueda flexible que ignora orden, acentos y mayúsculas
const busquedaFlexible = (texto: string, termino: string): boolean => {
  if (!termino.trim()) return true;
  
  const textoNormalizado = normalizarTexto(texto);
  const terminoNormalizado = normalizarTexto(termino);
  
  // Dividir el término de búsqueda en palabras
  const palabrasBusqueda = terminoNormalizado.split(/\s+/).filter(p => p.length > 0);
  
  // Verificar que todas las palabras estén presentes (en cualquier orden)
  return palabrasBusqueda.every(palabra => textoNormalizado.includes(palabra));
};

// Tipo para personas
interface Persona {
  id: string;
  apellidos: string;
  nombre: string;
  tipo: string;
  clase?: string;
  telefonoMadre?: string;
  telefonoPadre?: string;
  telefono?: string;
  email: string;
  dni: string;
  fechaNacimiento?: string;
  direccion?: string;
  unidadFamiliar?: string;
  categoria?: string;
  servicioSocial?: string;
  activo: boolean;
}

// Datos de ejemplo para desarrollo
const EJEMPLO_PERSONAS: Persona[] = [
  {
    id: '1',
    apellidos: 'García Martínez',
    nombre: 'Ana',
    tipo: 'alumno',
    clase: '2ºA ESO',
    telefonoMadre: '666 123 456',
    telefonoPadre: '666 789 012',
    email: 'ana.garcia@ejemplo.com',
    dni: '12345678A',
    fechaNacimiento: '15/03/2008',
    direccion: 'Calle Mayor 123, Logroño',
    unidadFamiliar: 'Familia García',
    activo: true
  },
  {
    id: '2',
    apellidos: 'López Fernández',
    nombre: 'Carlos',
    tipo: 'responsable',
    telefono: '666 345 678',
    email: 'carlos.lopez@ejemplo.com',
    dni: '87654321B',
    direccion: 'Avenida La Paz 45, Logroño',
    unidadFamiliar: 'Familia López',
    activo: true
  },
  {
    id: '3',
    apellidos: 'Rodríguez Sánchez',
    nombre: 'María',
    tipo: 'empleado',
    telefono: '666 901 234',
    categoria: 'Profesor',
    email: 'maria.rodriguez@colegio.com',
    dni: '11223344C',
    activo: true
  }
];

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Por ahora usamos datos de ejemplo
        // En el futuro: const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/personas`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simular carga
        setPersonas(EJEMPLO_PERSONAS);
        
      } catch (err) {
        console.error('Error cargando personas:', err);
        setError('Error al cargar las personas');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Filtrar personas según búsqueda y filtros
  const personasFiltradas = useMemo(() => {
    return personas.filter(persona => {
      // Filtro por tipo
      if (filtroTipo !== 'todos' && persona.tipo !== filtroTipo) {
        return false;
      }

      // Filtro por búsqueda
      if (busqueda.trim()) {
        const textoCompleto = `${persona.nombre} ${persona.apellidos} ${persona.email} ${persona.dni} ${persona.clase || ''} ${persona.categoria || ''}`;
        return busquedaFlexible(textoCompleto, busqueda);
      }

      return true;
    });
  }, [personas, busqueda, filtroTipo]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = personas.length;
    const alumnos = personas.filter(p => p.tipo === 'alumno').length;
    const responsables = personas.filter(p => p.tipo === 'responsable').length;
    const empleados = personas.filter(p => p.tipo === 'empleado').length;
    const activos = personas.filter(p => p.activo).length;

    return { total, alumnos, responsables, empleados, activos };
  }, [personas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando personas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Personas</h1>
          <p className="text-muted-foreground">
            Gestiona la información de alumnos, responsables y empleados
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alumnos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.alumnos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responsables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.responsables}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.empleados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.activos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros y búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, apellidos, email, DNI..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="todos">Todos los tipos</option>
              <option value="alumno">Alumnos</option>
              <option value="responsable">Responsables</option>
              <option value="empleado">Empleados</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de personas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resultados ({personasFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personasFiltradas.map((persona) => (
              <div key={persona.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{persona.nombre} {persona.apellidos}</h3>
                    <Badge variant={persona.tipo === 'alumno' ? 'default' : persona.tipo === 'responsable' ? 'secondary' : 'outline'}>
                      {persona.tipo}
                    </Badge>
                    {!persona.activo && (
                      <Badge variant="destructive">Inactivo</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>{persona.email}</div>
                    <div>DNI: {persona.dni}</div>
                    {persona.clase && <div>Clase: {persona.clase}</div>}
                    {persona.categoria && <div>Categoría: {persona.categoria}</div>}
                    {persona.telefono && <div>Teléfono: {persona.telefono}</div>}
                    {persona.telefonoMadre && <div>Tel. Madre: {persona.telefonoMadre}</div>}
                    {persona.telefonoPadre && <div>Tel. Padre: {persona.telefonoPadre}</div>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Ver detalles
                  </Button>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            ))}
            
            {personasFiltradas.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron personas que coincidan con los filtros.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
