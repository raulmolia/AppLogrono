'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error('Por favor, complete todos los campos')
      return
    }
    
    setLoading(true)
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.8.4:3007'
      console.log('🔑 Login: Enviando solicitud a:', `${backendUrl}/api/auth/login`)
      
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password
        })
      })
      
      console.log('📡 Login: Respuesta recibida:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      const data = await response.json()
      console.log('📋 Login: Datos de respuesta:', data)
      
      if (response.ok && data.success) {
        toast.success(`¡Bienvenido, ${data.user.nombre}!`)
        
        console.log('✅ Login exitoso, esperando y redirigiendo...')
        
        // Esperar un poco más para que las cookies se establezcan
        setTimeout(() => {
          console.log('🔄 Forzando recarga de página para actualizar estado...')
          window.location.href = 'http://192.168.8.4:3003/'
        }, 1500)
        
      } else {
        console.log('❌ Login fallido:', data.message)
        toast.error(data.message || 'Error en el inicio de sesión')
        setFormData(prev => ({ ...prev, password: '' }))
      }
      
    } catch (error) {
      console.error('💥 Error en login:', error)
      toast.error('Error de conexión')
      setFormData(prev => ({ ...prev, password: '' }))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: 'username' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/Logo.jpg"
            alt="Logotipo Colegio"
            width={120}
            height={120}
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema Gestión Logroño
          </h1>
        </div>
        
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold text-center">
              Iniciar sesión
            </CardTitle>
            <CardDescription className="text-center">
              Ingrese sus credenciales para acceder
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange('username')}
                  placeholder="Ingrese su nombre de usuario"
                  disabled={loading}
                  autoComplete="username"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange('password')}
                    placeholder="Ingrese su contraseña"
                    disabled={loading}
                    className="pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-gray-800"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}