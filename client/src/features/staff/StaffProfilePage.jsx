import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import {
  KeyRound,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle2,
  Lock,
  QrCode
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(6, 'New password must be at least 6 characters')
});

export const StaffProfilePage = () => {
  const { user } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const onChangePassword = async (values) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await api.post('/auth/change-password', values);
      setSuccess('Your password has been changed successfully.');
      reset();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-extrabold tracking-tight gold-text">
          Staff Dossier & Security
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-[#bdae9b] mt-0.5">
          Review institutional identity details, cryptographic ID badge, and manage account credentials
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 dark:bg-red-950/60 dark:border-red-500/40 dark:text-red-300 flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-300 flex items-center gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Holographic 3D Digital Badge Card */}
        <div className="group relative rounded-2xl p-[1px] bg-gradient-to-tr from-amber-400/40 via-amber-200/30 to-amber-600/40 dark:from-[#d4af37]/40 dark:via-[#e6c564]/20 dark:to-[#947020]/40 shadow-sm dark:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="rounded-2xl bg-white dark:bg-[#14120e] p-6 h-full flex flex-col justify-between border border-stone-200 dark:border-[#d4af37]/20 shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/50 dark:border-[#3a342b]/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#8c6e1c] text-white dark:text-[#0a0802] flex items-center justify-center font-extrabold text-lg shadow-gold-glow">
                    {user?.full_name?.charAt(0) || user?.display_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-stone-900 dark:text-[#f7f2ea] tracking-tight">{user?.full_name || user?.display_name}</h3>
                    <span className="font-mono text-xs font-bold text-amber-700 dark:text-[#d4af37]">{user?.staff_id || 'VD-ACTIVE'}</span>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-[#221e17] text-outline">
                  <QrCode className="w-6 h-6 text-amber-700 dark:text-[#d4af37]" />
                </div>
              </div>

              <div className="flex flex-col gap-3.5 mt-5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-outline-variant/40 dark:border-[#3a342b]/40">
                  <span className="text-stone-500 dark:text-[#bdae9b]">Designation</span>
                  <span className="font-semibold text-stone-900 dark:text-[#f7f2ea]">{user?.designation || 'Trust Staff Member'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-outline-variant/40 dark:border-[#3a342b]/40">
                  <span className="text-stone-500 dark:text-[#bdae9b]">Institutional Status</span>
                  <Badge variant="success" size="sm" dot>Active Trust Staff</Badge>
                </div>
                <div className="flex justify-between py-1.5 border-b border-outline-variant/40 dark:border-[#3a342b]/40">
                  <span className="text-stone-500 dark:text-[#bdae9b]">Organization</span>
                  <span className="font-semibold text-stone-900 dark:text-[#f7f2ea]">Vishvadaan Trust</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 dark:text-[#bdae9b]">Theme Mode</span>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 text-amber-700 dark:text-[#d4af37] hover:underline font-bold"
                  >
                    {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    <span>{isDark ? 'Dark Theme' : 'Light Theme'} (Switch)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/50 dark:border-[#3a342b]/60 flex items-center justify-between text-[11px] text-stone-400 dark:text-[#8c8273]">
              <span>Cryptographic Identity Token</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-outline-variant/50 dark:border-[#3a342b]/60">
              <Lock className="w-4 h-4 text-amber-600 dark:text-[#d4af37]" />
              <h2 className="font-bold text-sm text-stone-900 dark:text-[#f7f2ea]">Change Secure Password</h2>
            </div>

            <form onSubmit={handleSubmit(onChangePassword)} className="flex flex-col gap-4 mt-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-stone-700 dark:text-[#f7f2ea]">Current Password *</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-white dark:bg-[#1a1713] text-stone-900 dark:text-[#f7f2ea] text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-[#3a342b] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none transition-all placeholder:text-stone-400"
                  {...register('current_password')}
                />
                {errors.current_password && <span className="text-rose-500 text-[10px]">{errors.current_password.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-stone-700 dark:text-[#f7f2ea]">New Password (Min 6 chars) *</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-white dark:bg-[#1a1713] text-stone-900 dark:text-[#f7f2ea] text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-[#3a342b] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none transition-all placeholder:text-stone-400"
                  {...register('new_password')}
                />
                {errors.new_password && <span className="text-rose-500 text-[10px]">{errors.new_password.message}</span>}
              </div>

              <div className="mt-2 pt-3 border-t border-outline-variant/50 dark:border-[#3a342b]/60 flex justify-end">
                <Button type="submit" size="sm" loading={loading}>
                  <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};
