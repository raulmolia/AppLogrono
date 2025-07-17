/**
 * Header.tsx - Componente Header con integración de autenticación
 * FASE 4: Header y Avatar - Sistema de autenticación
 * Fecha: 17/07/2025
 * Desarrollador: GitHub Copilot
 * 
 * CAMBIOS REALIZADOS:
 * - AUT-8.1: Integración con sistema de autenticación
 * - AUT-8.2: Componente UserAvatar con dropdown
 * - AUT-8.3: Eliminación del botón iniciar/cerrar sesión anterior
 * - AUT-8.4: Indicador visual de sesiones activas
 */

'use client';

import React from 'react';
import Image from 'next/image';
import MainMenu from './MainMenu';
import UserAvatar from '@/components/auth/UserAvatar';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
    const { isAuthenticated, isLoading } = useAuth();

    return (
        <header className="bg-white text-black p-4 border-b border-gray-200">
            {/* Fila superior: Logo y Usuario */}
            <div className="container mx-auto flex justify-between items-center mb-4">
                <div className="flex-shrink-0">
                    <Image src="/Logo.jpg" alt="Logo" width={150} height={40} />
                </div>
                
                {/* Área de usuario con autenticación */}
                <div className="flex-shrink-0 flex items-center space-x-2">
                    {isLoading ? (
                        // Estado de carga
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-gray-500">Cargando...</span>
                        </div>
                    ) : isAuthenticated ? (
                        // Usuario autenticado - Mostrar UserAvatar
                        <UserAvatar />
                    ) : (
                        // Usuario no autenticado - Mostrar botón de login
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Sin sesión</span>
                            <button
                                onClick={() => window.location.href = '/auth/login'}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Iniciar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Fila inferior: Menú de Navegación Centrado */}
            <div className="container mx-auto flex justify-center">
                <MainMenu />
            </div>
        </header>
    );
};

export default Header;