import type { Metadata } from 'next'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Autenticación - Sistema Gestión Logroño',
  description: 'Sistema de autenticación para el Sistema Gestión Logroño',
}

/**
 * Layout para las páginas de autenticación
 * 
 * Este layout reemplaza el contenido del layout principal del sistema
 * para evitar mostrar el sidebar y menús cuando el usuario
 * no está autenticado.
 * 
 * @author GitHub Copilot
 * @date 17/07/2025
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Contenido de las páginas de autenticación */}
      {children}
      
      {/* Toaster para notificaciones */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
    </div>
  )
}