import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import Grainient from '../../components/react-bits/Grainient';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid administrator email address'),
  password: z.string().min(1, 'Master password is required')
});

export const AdminLoginPage = () => {
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setAuthError('');
      await login(data.email, data.password);
      navigate('/admin');
    } catch (err) {
      setAuthError(err.response?.data?.error?.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden select-none antialiased">
      {/* Dynamic Interactive React Bits Canvas Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30">
        <Grainient
          colors={isDark ? ["#0b0a08", "#1c1812", "#3a2d12", "#d4af37", "#100e0b"] : ["#fbf9f5", "#f5eedd", "#e6d5b0", "#b89228", "#ffffff"]}
          angle={45}
          flow={0.5}
          grainAmount={0.05}
          grainSize={1.0}
        />
      </div>

      {/* Theme Switcher Top-Right */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      <main className="w-full max-w-md relative z-10">
        <div className="flex flex-col w-full items-center">
          
          {/* Institutional Crest / Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className={`relative p-1.5 rounded-full bg-gradient-to-b from-[#f7be38] via-[#d4af37] to-[#7a5a20] ${
              isDark ? 'shadow-[0_0_35px_rgba(212,175,55,0.4)]' : 'shadow-[0_0_25px_rgba(184,146,40,0.25)]'
            }`}>
              <img
                src="/logo.png"
                alt="Vishvadaan Trust Logo"
                className="w-20 h-20 rounded-full object-cover bg-white p-1"
              />
            </div>
            <h2 className="text-sm font-display tracking-widest text-amber-700 dark:text-[#d4af37] uppercase mt-3 font-bold">
              Vishvadaan Trust
            </h2>
          </div>

          {/* Luxury Card */}
          <div className="w-full bg-white/95 dark:bg-[#13110e]/90 backdrop-blur-2xl shadow-xl dark:shadow-2xl rounded-2xl p-8 flex flex-col border border-stone-200 dark:border-[#d4af37]/30">
            
            {/* Header */}
            <div className="text-center pb-5 border-b border-outline-variant/50 dark:border-[#3a342b]/60">
              <h1 className="text-2xl font-display font-bold tracking-wide gold-text">
                Admin Console
              </h1>
              <p className="text-xs text-stone-500 dark:text-[#bdae9b] mt-1 font-medium">
                Attendance • Tasks • Transparency
              </p>
            </div>

            {/* Error Banner */}
            {authError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 dark:bg-red-950/60 dark:border-red-500/40 dark:text-red-300 flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form className="flex flex-col gap-4 mt-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-[#bdae9b]" htmlFor="adminEmail">
                  Administrator Institutional Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 text-amber-600 dark:text-[#d4af37] pointer-events-none w-4 h-4" />
                  <input
                    id="adminEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@vishvadaantrust.org"
                    className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-[#1a1713]/90 text-stone-900 dark:text-on-surface text-sm rounded-xl border border-stone-300 dark:border-[#3a342b] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-[#6d6355]"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <span className="text-rose-500 text-xs font-medium">{errors.email.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700 dark:text-[#bdae9b]" htmlFor="adminPassword">
                    Master Password
                  </label>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 text-amber-600 dark:text-[#d4af37] pointer-events-none w-4 h-4" />
                  <input
                    id="adminPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#1a1713]/90 text-stone-900 dark:text-on-surface text-sm rounded-xl border border-stone-300 dark:border-[#3a342b] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-[#6d6355]"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-stone-400 hover:text-amber-700 dark:text-[#8c8273] dark:hover:text-[#d4af37] p-1 focus:outline-none"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-rose-500 text-xs font-medium">{errors.password.message}</span>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full mt-3"
              >
                <span className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>{isSubmitting ? 'Verifying...' : 'Sign In to Console'}</span>
                </span>
              </Button>
            </form>

            {/* Switch to Staff Login Link */}
            <div className="mt-6 pt-4 border-t border-outline-variant/50 dark:border-[#3a342b]/60 flex items-center justify-between text-xs">
              <span className="text-stone-500 dark:text-[#8c8273]">Are you a trust staff member?</span>
              <Link to="/staff-login" className="font-semibold text-amber-700 dark:text-[#d4af37] hover:underline transition-colors flex items-center gap-1">
                Staff ID Sign In <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
