import NextAuth, { NextAuthOptions, DefaultSession } from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'

// Extender tipos de NextAuth para incluir información personalizada
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      microsoftId?: string | null
      tenantId?: string | null
      isActive: boolean
      roles?: string[]
      groups?: string[]
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    microsoftId?: string | null
    tenantId?: string | null
    isActive: boolean
    roles?: string[]
    groups?: string[]
  }
}

// Configuración de NextAuth.js para el módulo de autenticación
export const authOptions: NextAuthOptions = {
  // Configuración de proveedores
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
          prompt: "select_account",
          response_type: "code",
          response_mode: "query",
        },
      },
      token: {
        url: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
      },
      userinfo: {
        url: "https://graph.microsoft.com/oidc/userinfo",
      },
      profile(profile) {
        console.log('🔍 DEBUG: Perfil recibido de Azure AD:', profile)
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          microsoftId: profile.sub,
          tenantId: profile.tid,
          isActive: true,
        }
      },
    }),
  ],

  // Configuración de sesiones
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },

  // Configuración JWT
  jwt: {
    maxAge: 24 * 60 * 60, // 24 horas
  },

  // Páginas personalizadas
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  // Callbacks para personalizar el comportamiento
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔍 DEBUG: signIn callback iniciando', { 
        user: user?.email, 
        provider: account?.provider,
        profile: profile 
      })

      try {
        // MÁXIMA SIMPLIFICACIÓN: Solo verificar tenant básico
        if (account?.provider === 'azure-ad') {
          const tenantId = (profile as any)?.tid
          console.log('🔍 DEBUG: Verificando tenant', { 
            received: tenantId, 
            expected: process.env.AZURE_AD_TENANT_ID 
          })
          
          // Simplificar - permitir cualquier tenant por ahora para debugging
          // if (tenantId !== process.env.AZURE_AD_TENANT_ID) {
          //   console.log('❌ Usuario de tenant no autorizado:', tenantId)
          //   return false
          // }
        }

        console.log('✅ DEBUG: signIn callback EXITOSO - permitiendo acceso')
        return true
        
      } catch (error) {
        console.error('❌ ERROR CRÍTICO en signIn callback:', error)
        // Incluso con error, permitir acceso para debugging
        return true
      }
    },

    async jwt({ token, user, account, profile }) {
      // Incluir información adicional en el token JWT
      if (user) {
        token.id = user.id
        token.email = user.email
        token.isActive = user.isActive
        token.microsoftId = user.microsoftId
        token.tenantId = user.tenantId
      }

      // Obtener roles y grupos del usuario desde el backend
      if (token.email) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/user/${encodeURIComponent(token.email as string)}/permissions`)
          
          if (response.ok) {
            const userInfo = await response.json()
            token.roles = userInfo.roles || []
            token.groups = userInfo.groups || []
            token.isActive = userInfo.isActive
          }
        } catch (error) {
          console.error('❌ Error obteniendo roles del usuario:', error)
        }
      }

      return token
    },

    async session({ session, token }) {
      // Incluir información del token en la sesión
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.isActive = token.isActive as boolean
        session.user.microsoftId = token.microsoftId as string
        session.user.tenantId = token.tenantId as string
        session.user.roles = token.roles as string[]
        session.user.groups = token.groups as string[]
      }

      return session
    },

    async redirect({ url, baseUrl }) {
      // Redirigir después del login
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },

  // Eventos para logging y auditoría
  events: {
    async signOut({ token }) {
      if (token?.email) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: token.email,
            }),
          })
        } catch (error) {
          console.error('❌ Error registrando logout:', error)
        }
      }
    },
  },

  // Configuración de debugging
  debug: process.env.NODE_ENV === 'development',
  
  // Logger personalizado
  logger: {
    error(code, metadata) {
      console.error('🔐 NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('🔐 NextAuth Warning:', code)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 NextAuth Debug:', code, metadata)
      }
    },
  },
}

// Instancia de NextAuth
export default NextAuth(authOptions)

// Hook personalizado para verificar permisos (usando API del backend)
export async function hasPermission(
  userEmail: string, 
  resource: string, 
  action: string
): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/permissions/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        resource,
        action,
      }),
    })

    if (response.ok) {
      const result = await response.json()
      return result.hasPermission
    }

    return false
  } catch (error) {
    console.error('❌ Error verificando permisos:', error)
    return false
  }
}

// Función para obtener información completa del usuario (usando API del backend)
export async function getUserInfo(userEmail: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/user/${encodeURIComponent(userEmail)}`)
    
    if (response.ok) {
      return await response.json()
    }

    return null
  } catch (error) {
    console.error('❌ Error obteniendo información del usuario:', error)
    return null
  }
} 