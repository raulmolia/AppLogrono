// página principal del módulo Académica
// Sistema Gestión Logroño - Módulo Académica
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Clock, 
  Building,
  Calendar,
  MapPin,
  TrendingUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface EstadisticasAcademica {
  totalEtapas: number;
  totalCiclos: number;
  totalCursos: number;
  totalClases: number;
  totalAsignaturas: number;
  totalUbicaciones: number;
  horariosActivos: number;
  anioLectivoActual: string;
}

// Datos de ejemplo para desarrollo
const EJEMPLO_ESTADISTICAS: EstadisticasAcademica = {
  totalEtapas: 4,
  totalCiclos: 8,
  totalCursos: 12,
  totalClases: 24,
  totalAsignaturas: 45,
  totalUbicaciones: 18,
  horariosActivos: 156,
  anioLectivoActual: '24-25'
};

export default function AcademicaPage() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasAcademica | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerEstadisticas();
  }, []);

  const obtenerEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Por ahora usamos datos de ejemplo
      // En el futuro se conectará con el backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular carga
      setEstadisticas(EJEMPLO_ESTADISTICAS);

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      setError('Error al cargar las estadísticas del módulo académico');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando estadísticas académicas...</span>
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
          <h1 className="text-3xl font-bold tracking-tight">Módulo Académico</h1>
          <p className="text-muted-foreground">
            Gestión integral del área académica - Año lectivo {estadisticas?.anioLectivoActual}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Calendar className="mr-1 h-3 w-3" />
          Año Lectivo {estadisticas?.anioLectivoActual}
        </Badge>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Etapas Educativas</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas?.totalEtapas}</div>
            <p className="text-xs text-muted-foreground">
              Infantil, Primaria, ESO, Bachillerato
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clases Activas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas?.totalClases}</div>
            <p className="text-xs text-muted-foreground">
              Distribuidas en {estadisticas?.totalCursos} cursos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asignaturas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas?.totalAsignaturas}</div>
            <p className="text-xs text-muted-foreground">
              En todas las etapas educativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horarios Activos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas?.horariosActivos}</div>
            <p className="text-xs text-muted-foreground">
              Configuraciones de horario
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accesos rápidos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Estructura Académica
            </CardTitle>
            <CardDescription>
              Gestiona etapas, ciclos, cursos y clases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/academica/etapas-ciclos-y-clases">
                <Building className="mr-2 h-4 w-4" />
                Etapas, Ciclos y Clases
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/academica/asignaturas">
                <BookOpen className="mr-2 h-4 w-4" />
                Asignaturas
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Personal Académico
            </CardTitle>
            <CardDescription>
              Coordinadores, responsables y asignaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/curso/25-26/coordinadores-y-responsables">
                <Users className="mr-2 h-4 w-4" />
                Coordinadores y Responsables
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/academica/asignaciones-empleados">
                <TrendingUp className="mr-2 h-4 w-4" />
                Asignaciones Empleados
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios y Organización
            </CardTitle>
            <CardDescription>
              Gestión de horarios y franjas temporales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/academica/horarios">
                <Clock className="mr-2 h-4 w-4" />
                Horarios
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/curso/25-26/franjas-horarias">
                <Calendar className="mr-2 h-4 w-4" />
                Franjas Horarias
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión del Curso Actual</CardTitle>
          <CardDescription>
            Herramientas específicas para el año lectivo {estadisticas?.anioLectivoActual}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/curso/25-26/asignaciones">
                <Users className="h-6 w-6 mb-2" />
                <span>Asignaciones Docentes</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/curso/25-26/incidencias">
                <AlertCircle className="h-6 w-6 mb-2" />
                <span>Incidencias</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/curso/25-26">
                <Calendar className="h-6 w-6 mb-2" />
                <span>Curso 25-26</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
