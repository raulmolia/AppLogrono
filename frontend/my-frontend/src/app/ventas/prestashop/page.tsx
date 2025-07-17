"use client";

import React, { useState, useEffect, useMemo, lazy, Suspense, memo, useCallback } from 'react';
import {
  Calculator,
  TrendingUp,
  BookOpen,
  Shirt,
  PieChart,
  Upload,
  ChevronRight,
  Menu,
  Download
} from 'lucide-react';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Tipos y interfaces básicas
interface Factura {
  IdFra: string;
  FechaFra: string;
  NumFra: string;
  Cliente: string;
  Alumno: string | null;
  BIFra: number;
  TotalIvaFra: number;
  TotalDescuentoFra: number | null;
  TotalFra: number;
  FechaCreacion: string;
  Lineas: LineaFactura[];
}

interface LineaFactura {
  ID: number;
  IdFra: string;
  Concepto: string;
  Tipo: string;
  BaseImponible: number;
  TasaImpuesto: number;
  ImporteImpuesto: number;
  ImporteTotal: number;
}

type SeccionMenu = 
  | 'iva-trimestral'
  | 'ventas-generales'
  | 'ventas-generales-ventas'
  | 'ventas-generales-facturas'
  | 'venta-libros'
  | 'venta-libros-ventas'
  | 'venta-libros-facturas'
  | 'venta-ropa'
  | 'venta-ropa-ventas'
  | 'venta-ropa-facturas'
  | 'estadisticas-generales'
  | 'subir-facturas';

// Componente principal
export default function PrestashopPage() {
  const [seccionActiva, setSeccionActiva] = useState<SeccionMenu>('estadisticas-generales');
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>('25-26');
  const [facturas2425, setFacturas2425] = useState<Factura[]>([]);
  const [facturas2526, setFacturas2526] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar datos
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3007';
      
      // Cargar facturas 24/25
      const response2425 = await fetch(`${backendUrl}/facturas?curso=24/25`);
      if (!response2425.ok) {
        throw new Error(`Error HTTP 24/25: ${response2425.status}`);
      }
      const data2425 = await response2425.json();
      
      // Cargar facturas 25/26
      const response2526 = await fetch(`${backendUrl}/facturas?curso=25/26`);
      if (!response2526.ok) {
        throw new Error(`Error HTTP 25/26: ${response2526.status}`);
      }
      const data2526 = await response2526.json();
      
      setFacturas2425(data2425);
      setFacturas2526(data2526);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Renderizar contenido según sección activa
  const renderContenido = () => {
    if (loading) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
              <span className="ml-2 text-gray-600">Cargando datos...</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-red-600">
              <h3 className="font-semibold mb-2">Error al cargar datos</h3>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Módulo Prestashop</h3>
            <p className="text-gray-600">Sección: {seccionActiva}</p>
            <p className="text-gray-600">Curso: {cursoSeleccionado}</p>
            <p className="text-gray-600">Facturas 24/25: {facturas2425.length}</p>
            <p className="text-gray-600">Facturas 25/26: {facturas2526.length}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-screen bg-gray-50">
      <div className="flex h-full">
        {/* Sidebar placeholder */}
        <div className="w-80 border-r border-gray-200 bg-white">
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
              <Menu className="h-4 w-4" />
              Venta libros y ropa
            </h2>
          </div>
          <div className="p-2">
            <nav className="space-y-1">
              <button
                onClick={() => setSeccionActiva('estadisticas-generales')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs font-medium rounded-md transition-colors ${
                  seccionActiva === 'estadisticas-generales'
                    ? 'bg-gray-100 text-gray-900 border-l-2 border-gray-400'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <PieChart className="h-3.5 w-3.5" />
                <span>Estadísticas Generales</span>
              </button>
              <button
                onClick={() => setSeccionActiva('subir-facturas')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs font-medium rounded-md transition-colors ${
                  seccionActiva === 'subir-facturas'
                    ? 'bg-gray-100 text-gray-900 border-l-2 border-gray-400'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Subir Facturas</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-800">Prestashop Dashboard</h1>
              <div className="flex items-center gap-4">
                <Select value={cursoSeleccionado} onValueChange={setCursoSeleccionado}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24-25">Curso 24/25</SelectItem>
                    <SelectItem value="25-26">Curso 25/26</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 p-6 overflow-auto">
            {renderContenido()}
          </div>
        </div>
      </div>
    </div>
  );
}