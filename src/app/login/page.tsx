'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In production: call /api/auth with action: 'login'
      // const response = await fetch('/api/auth', {
      //   method: 'POST',
      //   body: JSON.stringify({ action: 'login', ...formData })
      // });
      
      // Simulate login
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex">
      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-12 h-12 rounded-full bg-neon-green flex items-center justify-center">
              <span className="text-black font-bold text-2xl">A</span>
            </div>
            <span className="text-white font-semibold text-xl">AswardStore</span>
          </Link>

          <h1 className="text-2xl font-light text-white text-center mb-2">
            Bienvenido de nuevo
          </h1>
          <p className="text-muted text-center mb-8">
            Ingresa a tu cuenta para continuar
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-shade-50 text-sm mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="input-dark w-full"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-shade-50 text-sm">Contraseña</label>
                <Link href="/forgot-password" className="text-neon-green text-sm hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="input-dark w-full"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-dark-card-border" />
            <span className="text-shade-50 text-sm">o</span>
            <div className="flex-1 h-px bg-dark-card-border" />
          </div>

          {/* Social Login */}
          <button className="w-full flex items-center justify-center gap-3 py-3 border border-dark-card-border rounded-lg text-white hover:bg-forest transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          {/* Register Link */}
          <p className="text-center text-muted mt-8">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-neon-green hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>

      {/* Image Side - Desktop only */}
      <div className="hidden lg:block lg:w-1/2 bg-deep-teal relative">
        <div className="absolute inset-0 bg-dark-teal-wash" />
        <div className="relative z-10 h-full flex items-center justify-center p-12">
          <div className="text-center">
            <h2 className="text-3xl font-light text-white mb-4">
              Tu estilo, tu manera
            </h2>
            <p className="text-muted max-w-md">
              Únete a AswardStore y descubre las últimas tendencias en moda y calzado. 
              Envíos gratis en pedidos mayores a $150.000.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}