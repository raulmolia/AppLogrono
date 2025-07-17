/**
 * useAuth.ts - Hook personalizado para autenticación
 * FASE 4: Header y Avatar - Sistema de autenticación
 * Fecha: 17/07/2025
 * Desarrollador: GitHub Copilot
 */

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Usuario {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellidos: string;
  avatar_url: string | null;
  roles: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: Usuario | null;
  isLoading: boolean;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.8.4:3007';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  /**
   * Verificar estado de autenticación actual
   */
  const checkAuth = async () => {
    console.log('🔍 checkAuth: Iniciando verificación...', { 
      backendUrl: BACKEND_URL,
      timestamp: new Date().toISOString(),
      cookies: document.cookie
    });
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include', // Incluir cookies httpOnly
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('📡 checkAuth: Respuesta recibida:', {
        status: response.status,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
        cookies: document.cookie
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ checkAuth: Usuario autenticado:', {
          user: data.user,
          timestamp: new Date().toISOString()
        });
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          isLoading: false
        });
      } else {
        const errorText = await response.text();
        console.log('❌ checkAuth: Usuario NO autenticado:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: response.url,
          timestamp: new Date().toISOString()
        });
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('💥 checkAuth: Error de red:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        backendUrl: BACKEND_URL,
        timestamp: new Date().toISOString()
      });
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
        toast.success('Sesión cerrada exitosamente');
        // Redirigir al login
        window.location.href = '/auth/login';
      } else {
        throw new Error('Error cerrando sesión');
      }
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  /**
   * Cambiar usuario (redirigir a login)
   */
  const changeUser = async () => {
    await logout();
  };

  /**
   * Refresh de datos del usuario
   */
  const refreshUser = async () => {
    await checkAuth();
  };

  // Verificar autenticación al cargar el hook
  useEffect(() => {
    console.log('🔍 useAuth: Iniciando verificación de autenticación...');
    checkAuth();
  }, []);

  // Debug: Log cuando el estado cambia
  useEffect(() => {
    console.log('🔄 useAuth: Estado actualizado:', {
      isAuthenticated: authState.isAuthenticated,
      user: authState.user?.username,
      isLoading: authState.isLoading
    });
  }, [authState]);

  return {
    ...authState,
    logout,
    changeUser,
    refreshUser,
    checkAuth
  };
};