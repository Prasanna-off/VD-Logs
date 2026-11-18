import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CheckSquare,
  FileText,
  BarChart3,
  FileSpreadsheet,
  History,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Staff Management', path: '/admin/staff', icon: Users },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
    { label: 'Tasks', path: '/admin/tasks', icon: CheckSquare },
    { label: 'Work Reports', path: '/admin/work-reports', icon: FileText },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Excel Exports', path: '/admin/exports', icon: FileSpreadsheet },
    { label: 'Activity Logs', path: '/admin/activity-logs', icon: History },
    { label: 'Settings & Security', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-sans flex antialiased selection:bg-primary/20 selection:text-primary">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white/95 dark:bg-[#110f0c]/95 backdrop-blur-2xl border-r border-outline-variant/60 dark:border-[#d4af37]/20 z-50 flex-col justify-between shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-20 px-5 flex items-center gap-3 border-b border-outline-variant/50 dark:border-[#3a342b]/60 bg-surface-container-low/50 dark:bg-[#14120e]/60">
            <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#f7be38] to-[#b89228] shadow-sm dark:shadow-[0_0_15px_rgba(212,175,55,0.35)] shrink-0">
              <img
                src="/logo.png"
                alt="Vishvadaan Logo"
                className="w-10 h-10 rounded-full object-cover bg-white p-0.5"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-sm gold-text tracking-wide truncate">VD LOGS</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 dark:bg-[#d4af37]/15 dark:text-[#ffd700] dark:border-[#d4af37]/30">ADMIN</span>
              </div>
              <span className="text-[10px] text-on-surface-variant truncate font-medium">Vishvadaan Trust</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1 p-3.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-100/70 text-amber-900 border border-amber-300 shadow-sm dark:bg-gradient-to-r dark:from-[#d4af37]/20 dark:to-[#9e7a1b]/15 dark:text-[#ffd700] dark:border-[#d4af37]/45 dark:shadow-[0_4px_16px_rgba(212,175,55,0.15)] font-bold'
                      : 'text-stone-600 dark:text-[#bdae9b] hover:bg-stone-100 dark:hover:bg-[#1a1713] hover:text-stone-900 dark:hover:text-[#f7f2ea]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isActive
                      ? 'text-amber-700 dark:text-[#ffd700] scale-110'
                      : 'text-stone-400 dark:text-[#8c8273] group-hover:text-amber-600 dark:group-hover:text-[#d4af37]'
                  }`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-[#ffd700] shadow-sm dark:shadow-[0_0_8px_#ffd700]" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Database Status & Footer */}
        <div className="p-3.5 border-t border-outline-variant/50 dark:border-[#3a342b]/60 flex flex-col gap-2.5 bg-surface-container-low/30 dark:bg-[#14120e]/40">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-container dark:bg-[#1a1713] border border-outline-variant/40 dark:border-[#3a342b]/60 text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
              <span className="text-[11px] text-on-surface-variant font-medium">Supabase RLS</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">ONLINE</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-red-950/30 border border-transparent hover:border-rose-200 dark:hover:border-red-500/30 transition-all w-full cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-40 h-20 bg-white/90 dark:bg-[#110f0c]/85 backdrop-blur-2xl border-b border-outline-variant/60 dark:border-[#d4af37]/20 flex items-center justify-between px-4 sm:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-stone-100 dark:hover:bg-[#1a1713] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-on-surface-variant">
              <span>Vishvadaan Educational & Charitable Trust</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 dark:text-[#6d6355]" />
              <span className="font-semibold text-on-surface">Admin Console</span>
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div
              onClick={() => navigate('/admin/settings')}
              className="flex items-center gap-3 pl-3 border-l border-outline-variant/50 dark:border-[#3a342b]/60 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#8c6e1c] text-white dark:text-[#0a0802] flex items-center justify-center font-extrabold text-xs shadow-gold-glow">
                A
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-on-surface leading-tight">
                  {user?.display_name || user?.email || 'System Admin'}
                </span>
                <span className="text-[10px] text-amber-700 dark:text-[#d4af37] font-bold">Admin Credentials</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
            <div className="w-64 bg-white dark:bg-[#110f0c] h-full p-4 flex flex-col justify-between shadow-2xl border-r border-outline-variant/60 dark:border-[#d4af37]/30">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant/50 dark:border-[#3a342b]/60">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-full bg-white p-0.5" />
                    <span className="font-display font-bold gold-text text-sm">VD LOGS</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-[#1a1713]">
                    <X className="w-5 h-5 text-stone-500 dark:text-[#8c8273]" />
                  </button>
                </div>
                <nav className="flex flex-col gap-1 mt-3">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                          isActive
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-[#d4af37]/20 dark:text-[#ffd700] dark:border-[#d4af37]/40'
                            : 'text-stone-600 dark:text-[#bdae9b] hover:bg-stone-100 dark:hover:bg-[#1a1713]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-red-950/30 rounded-xl"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Child Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};
