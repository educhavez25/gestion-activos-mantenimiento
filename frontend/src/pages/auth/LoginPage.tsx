import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.errors?.email) {
        setErrorMessage(err.response.data.errors.email[0]);
      } else {
        setErrorMessage(err.response?.data?.message || 'Error al iniciar sesión. Revisa tus credenciales.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Iniciar Sesión</h3>
        <p className="text-xs text-slate-500 mt-1">Accede con tu cuenta empresarial para gestionar activos.</p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@empresa.com"
            required
          />
        </div>

        <div>
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          <LogIn className="w-4 h-4" />
          <span>Ingresar al Sistema</span>
        </Button>
      </form>

      {/* Demo Credentials Quick Fill Box */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Acceso Rápido Demo (Portafolio)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@example.com', 'password')}
            className="p-2 text-left rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 transition-all cursor-pointer"
          >
            <p className="font-semibold text-slate-800">Administrador</p>
            <p className="text-[10px] text-slate-500">admin@example.com</p>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('supervisor@example.com', 'password')}
            className="p-2 text-left rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 transition-all cursor-pointer"
          >
            <p className="font-semibold text-slate-800">Supervisor</p>
            <p className="text-[10px] text-slate-500">supervisor@example.com</p>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('tecnico@example.com', 'password')}
            className="p-2 text-left rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 transition-all cursor-pointer"
          >
            <p className="font-semibold text-slate-800">Técnico TI</p>
            <p className="text-[10px] text-slate-500">tecnico@example.com</p>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('usuario@example.com', 'password')}
            className="p-2 text-left rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 transition-all cursor-pointer"
          >
            <p className="font-semibold text-slate-800">Usuario Regular</p>
            <p className="text-[10px] text-slate-500">usuario@example.com</p>
          </button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 underline">
            Crear cuenta de empleado
          </Link>
        </p>
      </div>
    </div>
  );
};
