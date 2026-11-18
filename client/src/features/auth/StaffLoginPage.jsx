import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  BadgeCheck,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import Grainient from '../../components/react-bits/Grainient';

const staffLoginSchema = z.object({
  staff_id: z.string().min(1, 'Staff ID is required'),
  password: z.string().min(1, 'Password is required')
});

export const StaffLoginPage = () => {
  const { loginStaff } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: {
      staff_id: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setAuthError('');
      await loginStaff(data.staff_id, data.password);
      navigate('/staff');
    } catch (err) {
      setAuthError(err.response?.data?.error?.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden select-none antialiased">
      {/* Interactive React Bits Canvas Background */}
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
                Staff Workspace
              </h1>
              <p className="text-xs text-stone-500 dark:text-[#bdae9b] mt-1 font-medium">
                Attendance • Tasks • Transparency
              </p>
            </div>

            {/* Error Notification */}
            {authError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 dark:bg-red-950/60 dark:border-red-500/40 dark:text-red-300 flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form className="flex flex-col gap-4 mt-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700 dark:text-[#bdae9b]" htmlFor="staffIdInput">
                    Staff ID
                  </label>
                  <span className="text-[10px] text-stone-400 dark:text-[#8c8273]">e.g. VD-2025-001</span>
                </div>
                <div className="relative flex items-center">
                  <BadgeCheck className="absolute left-3.5 text-amber-600 dark:text-[#d4af37] w-4 h-4 pointer-events-none" />
                  <input
                    id="staffIdInput"
                    type="text"
                    autoComplete="username"
                    placeholder="VD-2025-001"
                    className="w-full bg-white dark:bg-[#1a1713]/90 text-stone-900 dark:text-on-surface placeholder:text-stone-400 dark:placeholder:text-[#6d6355] text-sm pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#3a342b] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none transition-all"
                    {...register('staff_id')}
                  />
                </div>
                {errors.staff_id && (
                  <span className="text-rose-500 text-xs font-medium">{errors.staff_id.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700 dark:text-[#bdae9b]" htmlFor="passwordInput">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="text-[11px] text-amber-700 dark:text-[#d4af37] hover:underline transition-colors flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" /> Need help?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 text-amber-600 dark:text-[#d4af37] w-4 h-4 pointer-events-none" />
                  <input
                    id="passwordInput"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="w-full bg-white dark:bg-[#1a1713]/90 text-stone-900 dark:text-on-surface placeholder:text-stone-400 dark:placeholder:text-[#6d6355] text-sm pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 dark:border-[#3a342b] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none transition-all"
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
                  <UserCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                </span>
              </Button>
            </form>

            {/* Bottom Admin Link */}
            <div className="mt-6 pt-4 border-t border-outline-variant/50 dark:border-[#3a342b]/60 flex items-center justify-between text-xs">
              <span className="text-stone-500 dark:text-[#8c8273]">Trust Administrator?</span>
              <Link to="/login" className="font-semibold text-amber-700 dark:text-[#d4af37] hover:underline flex items-center gap-1">
                Admin Console <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#14120e] rounded-2xl p-6 border border-stone-200 dark:border-[#d4af37]/30 shadow-2xl flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/50 dark:border-[#3a342b]/60">
              <h3 className="font-bold text-sm text-stone-900 dark:text-[#f7f2ea]">Staff Login Assistance</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-[#1a1713] text-stone-400 dark:text-[#8c8273]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-stone-600 dark:text-[#bdae9b] leading-relaxed">
              Your <strong>Staff ID</strong> (e.g., <code className="font-mono text-amber-700 dark:text-[#ffd700]">VD-2025-001</code>) and initial password are issued by the Trust Administration.
            </p>
            <p className="text-stone-600 dark:text-[#bdae9b] leading-relaxed">
              If you have misplaced your credentials or are locked out, contact the system administrator directly to request a password reset.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowHelpModal(false)}
              className="mt-2"
            >
              Understood
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
