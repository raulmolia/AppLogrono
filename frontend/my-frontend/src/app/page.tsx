"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Contenido principal */}
      <div className="flex flex-col items-center justify-center px-4 md:px-8 pt-16">
        {/* Título centrado */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Bienvenido al Sistema de Gestión
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Utilice el menú de navegación para acceder a las diferentes secciones
          </p>
        </div>

        {/* Card con información básica */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Sistema de Gestión Escolar</CardTitle>
            <CardDescription>
              Plataforma integral para la gestión de familias, servicios, ventas y administración
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Esta es la página principal del sistema. Puede acceder a las diferentes funcionalidades 
              utilizando el menú de navegación ubicado en la parte superior de la página.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}