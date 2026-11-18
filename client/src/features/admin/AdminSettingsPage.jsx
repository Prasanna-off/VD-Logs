import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Save,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  User,
  Lock,
  Building
} from 'lucide-react';
import { useForm } from 'react-hook-form';

export const AdminSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password / Admin Profile states
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const { register: regSettings, handleSubmit: handleSettingsSubmit, reset: resetSettings } = useForm();
  const { register: regPw, handleSubmit: handlePwSubmit, reset: resetPw } = useForm();
  const { register: regProfile, handleSubmit: handleProfileSubmit } = useForm({
    defaultValues: {
      display_name: user?.display_name || ''
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        if (res.data.data) {
          resetSettings({
            organization_name: res.data.data.organization_name,
            timezone: res.data.data.timezone,
            work_start_time: res.data.data.work_start_time || '09:00:00',
            work_end_time: res.data.data.work_end_time || '17:30:00',
            late_grace_minutes: res.data.data.late_grace_minutes || 15
          });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [resetSettings]);

  const onUpdateSettings = async (values) => {
    try {
      setSaveLoading(true);
      setError('');
      setSuccess('');
      await api.patch('/settings', values);
      setSuccess('Trust organization settings saved successfully.');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update settings');
    } finally {
      setSaveLoading(false);
    }
  };

  const onChangeAdminPassword = async (values) => {
    try {
      setPwLoading(true);
      setPwError('');
      setPwSuccess('');
      await api.post('/auth/change-password', values);
      setPwSuccess('Master Administrator password updated successfully.');
      resetPw();
    } catch (err) {
      setPwError(err.response?.data?.error?.message || 'Failed to update password. Verify current credentials.');
    } finally {
      setPwLoading(false);
    }
  };

  const onUpdateAdminProfile = async (values) => {
    try {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');
      await api.patch('/auth/profile', values);
      setProfileSuccess('Administrator profile identifier updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-extrabold tracking-tight gold-text">
          Admin Settings & Credentials
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-[#bdae9b] mt-1">
          Manage administrator login identifier, master password, and organizational operating policies
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Administrator ID & Master Password Security */}
        <div className="flex flex-col gap-6">
          
          {/* Admin Profile / User ID Identifier */}
          <Card className="p-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-outline-variant/50 dark:border-[#3a342b]/60">
              <User className="w-4 h-4 text-amber-600 dark:text-[#d4af37]" />
              <h2 className="font-bold text-sm text-stone-900 dark:text-[#f7f2ea]">Admin Profile & Display Identifier</h2>
            </div>

            {profileError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 dark:bg-red-950/60 dark:border-red-500/40 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-red-400" />
                <span>{profileError}</span>
              </div>
            )}
            {profileSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit(onUpdateAdminProfile)} className="flex flex-col gap-4 mt-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-stone-700 dark:text-[#bdae9b] font-medium">Administrator Institutional Email / User ID</label>
                <input
                  type="text"
                  disabled
                  value={user?.email || 'admin@vishvadaantrust.org'}
                  className="w-full bg-stone-100 dark:bg-[#14120e] text-stone-500 dark:text-[#8c8273] font-mono px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-[#3a342b]/40 cursor-not-allowed text-xs"
                />
                <span className="text-[10px] text-stone-400 dark:text-[#6d6355]">Institutional email bound to root administrator role</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-stone-700 dark:text-[#bdae9b] font-medium">Display Name / Call Sign</label>
                <input
                  type="text"
                  placeholder="e.g. Master Administrator"
                  className="w-full bg-white dark:bg-[#1a1713] text-stone-900 dark:text-[#f7f2ea] px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-[#3a342b] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none text-xs"
                  {...regProfile('display_name')}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" loading={profileLoading}>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Update Identifier
                </Button>
              </div>
            </form>
          </Card>

          {/* Master Password Change */}
          <Card className="p-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-outline-variant/50 dark:border-[#3a342b]/60">
              <Lock className="w-4 h-4 text-amber-600 dark:text-[#d4af37]" />
              <h2 className="font-bold text-sm text-stone-900 dark:text-[#f7f2ea]">Update Master Administrator Password</h2>
            </div>

            {pwError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 dark:bg-red-950/60 dark:border-red-500/40 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-red-400" />
                <span>{pwError}</span>
              </div>
            )}
            {pwSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{pwSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePwSubmit(onChangeAdminPassword)} className="flex flex-col gap-4 mt-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-stone-700 dark:text-[#bdae9b] font-medium">Current Password *</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-white dark:bg-[#1a1713] text-stone-900 dark:text-[#f7f2ea] px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-[#3a342b] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none text-xs"
                  {...regPw('current_password', { required: true })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-stone-700 dark:text-[#bdae9b] font-medium">New Master Password (Min 6 chars) *</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-white dark:bg-[#1a1713] text-stone-900 dark:text-[#f7f2ea] px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-[#3a342b] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none text-xs"
                  {...regPw('new_password', { required: true, minLength: 6 })}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" loading={pwLoading}>
                  <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                  Save New Password
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Organization & Policy Settings */}
        <Card className="p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-outline-variant/50 dark:border-[#3a342b]/60">
              <Building className="w-4 h-4 text-amber-600 dark:text-[#d4af37]" />
              <h2 className="font-bold text-sm text-stone-900 dark:text-[#f7f2ea]">Trust Organization & Timing Rules</h2>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 dark:bg-red-950/60 dark:border-red-500/40 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-red-400" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSettingsSubmit(onUpdateSettings)} className="flex flex-col gap-4 mt-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-stone-700 dark:text-[#bdae9b] font-medium">Organization Full Legal Name</label>
                <input
                  type="text"
                  className="w-full bg-white dark:bg-[#1a1713] text-stone-900 dark:text-[#f7f2ea] px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-[#3a342b] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none text-xs"
                  {...regSettings('organization_name')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-stone-700 dark:text-[#bdae9b] font-medium">Standard Timezone</label>
                  <input
                    type="text"
                    disabled
                    className="w-full bg-stone-100 dark:bg-[#14120e] text-stone-500 dark:text-[#8c8273] font-mono px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-[#3a342b]/40 cursor-not-allowed text-xs"
                    {...regSettings('timezone')}
                  />
                  <span className="text-[10px] text-stone-400 dark:text-[#6d6355]">Locked to Asia/Kolkata (IST)</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-stone-700 dark:text-[#bdae9b] font-medium">Late Grace Window (Mins)</label>
                  <input
                    type="number"
                    className="w-full bg-white dark:bg-[#1a1713] text-stone-900 dark:text-[#f7f2ea] px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-[#3a342b] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none text-xs"
                    {...regSettings('late_grace_minutes')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-stone-700 dark:text-[#bdae9b] font-medium">Official Shift Start</label>
                  <input
                    type="time"
                    step="1"
                    className="w-full bg-white dark:bg-[#1a1713] text-stone-900 dark:text-[#f7f2ea] px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-[#3a342b] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none text-xs"
                    {...regSettings('work_start_time')}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-stone-700 dark:text-[#bdae9b] font-medium">Official Shift End</label>
                  <input
                    type="time"
                    step="1"
                    className="w-full bg-white dark:bg-[#1a1713] text-stone-900 dark:text-[#f7f2ea] px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-[#3a342b] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none text-xs"
                    {...regSettings('work_end_time')}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-outline-variant/50 dark:border-[#3a342b]/60">
                <Button type="submit" size="sm" loading={saveLoading}>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Organization Policy
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};
