'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from '@/hooks/useAuth';

/**
 * Componente que aplica el layout principal y maneja la autenticación
 * Redirige a login si no está autenticado (excepto en rutas públicas)
 * 
 * @author GitHub Copilot
 * @date 17/07/2025
 */
export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/auth/login'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Efecto para manejar redirecciones (solo una vez)
  useEffect(() => {
    console.log('🔄 ConditionalLayout: useEffect ejecutado', {
      pathname,
      isAuthenticated,
      isLoading,
      isPublicRoute,
      hasRedirected,
      timestamp: new Date().toISOString()
    });

    if (!isLoading && !hasRedirected) {
      if (!isAuthenticated && !isPublicRoute) {
        // Usuario no autenticado intentando acceder a ruta protegida
        console.log('🙫 ConditionalLayout: Redirigiendo a login desde:', pathname);
        setHasRedirected(true);
        setTimeout(() => {
          router.replace('/auth/login');
        }, 100);
        return;
      }
      
      if (isAuthenticated && pathname === '/auth/login') {
        // Usuario autenticado intentando acceder al login
        console.log('✅ ConditionalLayout: Usuario autenticado, redirigiendo al dashboard');
        setHasRedirected(true);
        setTimeout(() => {
          router.replace('/');
        }, 100);
        return;
      }
    }
  }, [isAuthenticated, isLoading, pathname, isPublicRoute, router, hasRedirected]);
  
  // Reset hasRedirected cuando cambia la ruta manualmente
  useEffect(() => {
    setHasRedirected(false);
  }, [pathname]);
  
  // Si está cargando, mostrar indicador
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Verificando autenticación...</span>
      </div>
    );
  }
  
  // Si estamos en rutas de auth, no aplicar el layout principal
  if (pathname.startsWith('/auth')) {
    return <>{children}</>;
  }
  
  // Si no está autenticado y no es ruta pública, mostrar indicador de redirección
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Redirigiendo al login...</span>
      </div>
    );
  }
  
  // Para el resto de rutas protegidas con usuario autenticado, aplicar el layout principal
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4">{children}</main>
      <Footer />
    </div>
  );
}