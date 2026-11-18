import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  CalendarCheck,
  Plus,
  ArrowUpRight,
  Activity,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export const AdminOverviewPage = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({
    staffCount: 0,
    presentToday: 0,
    currentlyWorking: 0,
    deptCount: 0,
    pendingReviews: 0,
    pendingCorrections: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewMetrics = async () => {
      try {
        setLoading(true);
        const [staffRes, deptRes, attendanceRes, tasksRes] = await Promise.allSettled([
          api.get('/staff?page=1&limit=1'),
          api.get('/departments'),
          api.get(`/attendance/daily?date=${new Date().toISOString().split('T')[0]}`),
          api.get('/tasks?status=in_review&limit=1')
        ]);

        const totalStaff = staffRes.status === 'fulfilled' ? (staffRes.value?.data?.meta?.total || staffRes.value?.data?.data?.length || 0) : 0;
        const totalDepts = deptRes.status === 'fulfilled' ? (deptRes.value?.data?.data?.length || 0) : 0;
        const dailyRecords = attendanceRes.status === 'fulfilled' ? (attendanceRes.value?.data?.data || []) : [];
        const pendingTasks = tasksRes.status === 'fulfilled' ? (tasksRes.value?.data?.meta?.total || tasksRes.value?.data?.data?.length || 0) : 0;

        const present = dailyRecords.filter(r => r.check_in_time).length;
        const working = dailyRecords.filter(r => r.check_in_time && !r.check_out_time).length;

        setStatsData({
          staffCount: totalStaff,
          presentToday: present,
          currentlyWorking: working,
          deptCount: totalDepts,
          pendingReviews: pendingTasks,
          pendingCorrections: 0
        });

        if (dailyRecords.length > 0) {
          const mapped = dailyRecords.slice(0, 8).map(r => ({
            id: r.id,
            title: r.staff?.full_name || `Staff ${r.staff_id}`,
            description: r.check_out_time ? `Punched out at ${r.check_out_time}` : `Checked in at ${r.check_in_time}`,
            meta: r.date || 'Today'
          }));
          setRecentActivities(mapped);
        }
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewMetrics();
  }, []);

  const stats = [
    { label: 'Total Staff', count: statsData.staffCount, sublabel: 'Registered trust staff', icon: Users, color: 'text-amber-600 dark:text-[#d4af37]' },
    { label: 'Present Today', count: statsData.presentToday, sublabel: 'Checked in today', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Active Sessions', count: statsData.currentlyWorking, sublabel: 'Open work shifts', icon: Clock, color: 'text-amber-500 dark:text-[#fbd46e]' },
    { label: 'Departments', count: statsData.deptCount, sublabel: 'Active divisions', icon: Building2, color: 'text-amber-600 dark:text-[#e6c564]' },
    { label: 'Pending Reviews', count: statsData.pendingReviews, sublabel: 'Tasks awaiting sign-off', icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Daily Punches', count: statsData.presentToday, sublabel: 'Ledger verified', icon: CalendarCheck, color: 'text-amber-700 dark:text-yellow-500' },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      
      {/* Operations Cockpit Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-amber-50/40 to-amber-100/30 dark:from-[#181511] dark:via-[#14120e] dark:to-[#0d0c0a] p-6 sm:p-8 border border-outline-variant/60 dark:border-[#d4af37]/30 shadow-md dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(212,175,55,0.2)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span className="text-xs font-bold text-amber-700 dark:text-[#d4af37] tracking-widest uppercase font-mono">Operations Cockpit</span>
              <span className="text-stone-300 dark:text-[#3a342b]">•</span>
              <span className="text-xs text-stone-500 dark:text-[#bdae9b]">Asia/Kolkata (IST)</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-stone-900 dark:text-[#f7f2ea]">
              Administrator Command Center
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-[#bdae9b] max-w-xl leading-relaxed">
              Institutional governance and transparency monitoring for Vishvadaan Educational and Charitable Trust.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => navigate('/admin/staff')}
            >
              Add Staff
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={Building2}
              onClick={() => navigate('/admin/departments')}
            >
              Departments
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={CalendarCheck}
              onClick={() => navigate('/admin/attendance')}
            >
              Attendance Ledger
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              interactive
              className="flex flex-col justify-between p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-[#8c8273] truncate">{stat.label}</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-[#221e17] flex items-center justify-center border border-amber-200/60 dark:border-[#d4af37]/20 shadow-xs">
                  <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
              </div>

              <div className="my-3 flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-display font-extrabold text-stone-900 dark:text-[#f7f2ea] tracking-tight">
                  {loading ? '—' : stat.count}
                </span>
              </div>

              <div className="text-[10px] text-stone-500 dark:text-[#8c8273] truncate font-medium">
                {stat.sublabel}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Operations Overview & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Activity Monitor */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/50 dark:border-[#3a342b]/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100/70 dark:bg-[#d4af37]/15 text-amber-700 dark:text-[#d4af37]">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-stone-900 dark:text-[#f7f2ea]">Real-Time Attendance Ledger Stream</h2>
                    <p className="text-xs text-stone-500 dark:text-[#bdae9b]">Verified timestamps recorded directly into Supabase</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/attendance')}
                  className="text-xs"
                >
                  View Ledger <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>

              {/* Feed Rendering */}
              <div className="mt-4">
                {recentActivities.length > 0 ? (
                  <div className="divide-y divide-outline-variant/40 dark:divide-[#3a342b]/40">
                    {recentActivities.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-stone-900 dark:text-[#f7f2ea]">{item.title}</span>
                          <span className="text-[11px] text-stone-500 dark:text-[#bdae9b]">{item.description}</span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-700 dark:text-[#ffd700] font-semibold">{item.meta}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12">
                    <EmptyState
                      icon={CalendarCheck}
                      title="No Attendance Records Today"
                      description="When staff members record their check-in for today's working session in Asia/Kolkata, their activity will stream here instantly."
                      actionLabel="Open Attendance Register"
                      onAction={() => navigate('/admin/attendance')}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* System & Trust Quick Info */}
        <Card className="flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-outline-variant/50 dark:border-[#3a342b]/60">
              <div className="p-2 rounded-xl bg-amber-100/70 dark:bg-[#d4af37]/15 text-amber-700 dark:text-[#d4af37]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-stone-900 dark:text-[#f7f2ea]">Trust Governance</h2>
                <p className="text-xs text-stone-500 dark:text-[#bdae9b]">Institutional policy rules</p>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 mt-5 text-xs">
              <div className="flex justify-between py-2 border-b border-outline-variant/40 dark:border-[#3a342b]/40">
                <span className="text-stone-500 dark:text-[#bdae9b]">Organization</span>
                <span className="font-semibold text-stone-900 dark:text-[#f7f2ea] text-right">Vishvadaan Trust</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/40 dark:border-[#3a342b]/40">
                <span className="text-stone-500 dark:text-[#bdae9b]">Standard Timezone</span>
                <span className="font-mono text-amber-700 dark:text-[#ffd700] font-bold">Asia/Kolkata (IST)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/40 dark:border-[#3a342b]/40">
                <span className="text-stone-500 dark:text-[#bdae9b]">Attendance Limit</span>
                <span className="font-semibold text-stone-900 dark:text-[#f7f2ea]">1 Session Per Day</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/40 dark:border-[#3a342b]/40">
                <span className="text-stone-500 dark:text-[#bdae9b]">Task Sign-Off</span>
                <span className="font-semibold text-stone-900 dark:text-[#f7f2ea]">Admin Approval Required</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-stone-500 dark:text-[#bdae9b]">Data Protection</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Supabase RLS Enabled</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/50 dark:border-[#3a342b]/60">
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate('/admin/settings')}
            >
              Modify Operating Policy
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
