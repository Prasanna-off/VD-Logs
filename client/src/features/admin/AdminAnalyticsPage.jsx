import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import {
  BarChart3,
  Users,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const AdminAnalyticsPage = () => {
  const { isDark } = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [overviewRes, trendsRes] = await Promise.all([
          api.get('/admin/analytics/overview'),
          api.get('/admin/analytics/attendance-trends?days=14')
        ]);
        setMetrics(overviewRes.data.data);
        setTrends(trendsRes.data.data || []);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const kpis = [
    { label: 'Active Staff', value: metrics?.totalStaff || 0, icon: Users, color: 'text-amber-600 dark:text-[#d4af37]' },
    { label: 'Active Departments', value: metrics?.totalDepartments || 0, icon: Building2, color: 'text-amber-600 dark:text-[#e6c564]' },
    { label: 'Present Today', value: metrics?.presentToday || 0, icon: CalendarCheck, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Currently Working', value: metrics?.currentlyWorking || 0, icon: Clock, color: 'text-amber-500 dark:text-[#fbd46e]' },
    { label: 'Tasks Completed', value: metrics?.tasksCompleted || 0, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Pending Reviews', value: (metrics?.tasksPendingReview || 0) + (metrics?.workLogsPendingReview || 0), icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-extrabold tracking-tight gold-text">Trust Operational Analytics</h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-[#bdae9b] mt-0.5">
          Real-time PostgreSQL aggregates • Zero mock records • Attendance & Task performance
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-[#8c8273] truncate">{kpi.label}</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-[#221e17] flex items-center justify-center border border-amber-200/60 dark:border-[#d4af37]/20 shadow-xs">
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="my-2">
                <span className="text-2xl font-bold font-display text-stone-900 dark:text-[#f7f2ea]">{kpi.value}</span>
              </div>
              <span className="text-[10px] text-stone-400 dark:text-[#8c8273]">Derived from database</span>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Activity Trend */}
        <Card className="flex flex-col justify-between p-6">
          <div className="pb-4 border-b border-outline-variant/50 dark:border-[#3a342b]/60">
            <h3 className="font-bold text-sm text-stone-900 dark:text-[#f7f2ea]">14-Day Attendance Trend</h3>
            <p className="text-xs text-stone-500 dark:text-[#bdae9b]">Daily verified check-in volume</p>
          </div>

          <div className="py-6 min-h-[250px] flex items-center justify-center">
            {trends.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No Trend Data Yet"
                description="As staff record daily attendance, historical trend bars will populate here."
              />
            ) : (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={isDark ? 0.2 : 0.4} stroke={isDark ? '#d4af37' : '#d8caa8'} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: isDark ? '#bdae9b' : '#6b6255' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: isDark ? '#bdae9b' : '#6b6255' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#14120e' : '#ffffff',
                        borderColor: isDark ? 'rgba(212,175,55,0.4)' : '#d8caa8',
                        borderRadius: '0.75rem',
                        color: isDark ? '#f7f2ea' : '#1e1b16',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="present" name="Present Staff" fill={isDark ? '#d4af37' : '#947020'} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Completed Shifts" fill={isDark ? '#8c6e1c' : '#cbb382'} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>

        {/* Operational Health Summary */}
        <Card className="flex flex-col justify-between p-6">
          <div>
            <div className="pb-4 border-b border-outline-variant/50 dark:border-[#3a342b]/60">
              <h3 className="font-bold text-sm text-stone-900 dark:text-[#f7f2ea]">Operations Health & Compliance</h3>
              <p className="text-xs text-stone-500 dark:text-[#bdae9b]">Summary of active workflows and pending reviews</p>
            </div>

            <div className="flex flex-col gap-3.5 mt-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-[#181612] border border-stone-200 dark:border-[#3a342b]/40 shadow-xs">
                <span className="font-medium text-stone-800 dark:text-[#f7f2ea]">Task Completion Ratio</span>
                <span className="font-bold text-amber-700 dark:text-[#ffd700] font-mono">
                  {metrics?.tasksCompleted || 0} approved / {(metrics?.tasksCompleted || 0) + (metrics?.tasksInProgress || 0) + (metrics?.tasksPendingReview || 0)} total
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-[#181612] border border-stone-200 dark:border-[#3a342b]/40 shadow-xs">
                <span className="font-medium text-stone-800 dark:text-[#f7f2ea]">Pending Attendance Corrections</span>
                <Badge variant={metrics?.pendingCorrections > 0 ? 'warning' : 'neutral'}>
                  {metrics?.pendingCorrections || 0} Requests Pending
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-[#181612] border border-stone-200 dark:border-[#3a342b]/40 shadow-xs">
                <span className="font-medium text-stone-800 dark:text-[#f7f2ea]">Work Reports Awaiting Review</span>
                <Badge variant={metrics?.workLogsPendingReview > 0 ? 'info' : 'neutral'}>
                  {metrics?.workLogsPendingReview || 0} Awaiting Review
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 dark:text-[#8c8273] text-right mt-6 font-mono">
            Last synced: {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
          </div>
        </Card>
      </div>
    </div>
  );
};
