import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import {
  LayoutDashboard,
  CalendarCheck,
  CheckSquare,
  FileText,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export const StaffLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/staff', icon: LayoutDashboard },
    { label: 'My Attendance', path: '/staff/attendance', icon: CalendarCheck },
    { label: 'Assigned Tasks', path: '/staff/tasks', icon: CheckSquare },
    { label: 'Daily Work Logs', path: '/staff/work-logs', icon: FileText },
    { label: 'Profile & Security', path: '/staff/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/staff-login');
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-sans flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-20 bg-white/90 dark:bg-[#110f0c]/90 backdrop-blur-2xl border-b border-outline-variant/60 dark:border-[#d4af37]/20 flex items-center justify-between px-4 sm:px-8 shadow-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#f7be38] to-[#b89228] shadow-sm dark:shadow-[0_0_15px_rgba(212,175,55,0.35)] shrink-0">
              <img
                src="/logo.png"
                alt="Vishvadaan Logo"
                className="w-10 h-10 rounded-full object-cover bg-white p-0.5"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-sm gold-text tracking-wide">VD LOGS</span>
              <span className="text-[10px] text-on-surface-variant font-medium">Staff Workspace</span>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 pl-6 border-l border-outline-variant/50 dark:border-[#3a342b]/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-100/70 text-amber-900 border border-amber-300 shadow-sm dark:bg-[#d4af37]/20 dark:text-[#ffd700] dark:border-[#d4af37]/40 font-bold'
                      : 'text-stone-600 dark:text-[#bdae9b] hover:bg-stone-100 dark:hover:bg-[#1a1713] hover:text-stone-900 dark:hover:text-[#f7f2ea]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div
            onClick={() => navigate('/staff/profile')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity pl-2"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#8c6e1c] text-white dark:text-[#0a0802] flex items-center justify-center font-extrabold text-xs shadow-gold-glow">
              {user?.full_name?.charAt(0) || user?.display_name?.charAt(0) || 'S'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-on-surface leading-tight">
                {user?.full_name || user?.display_name || 'Staff Member'}
              </span>
              <span className="text-[10px] font-mono text-amber-700 dark:text-[#d4af37] font-bold">
                {user?.staff_id || 'VD-ACTIVE'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-stone-600 dark:text-[#bdae9b] hover:bg-stone-100 dark:hover:bg-[#1a1713]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
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
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
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

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
