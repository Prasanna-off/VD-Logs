import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Clock,
  CalendarCheck,
  CheckSquare,
  FileText,
  ArrowRight,
  Flame
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StaffDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [workLogToday, setWorkLogToday] = useState(null);

  // Real-time digital clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real assigned tasks and sort by Priority / Urgency
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setTasksLoading(true);
        const [tasksRes, logsRes] = await Promise.allSettled([
          api.get('/tasks/my-tasks'),
          api.get('/work-logs/my')
        ]);

        if (tasksRes.status === 'fulfilled' && tasksRes.value?.data?.data) {
          const rawTasks = tasksRes.value.data.data;

          const priorityWeights = {
            urgent: 4,
            high: 3,
            medium: 2,
            low: 1
          };

          const sorted = [...rawTasks].sort((a, b) => {
            const pA = priorityWeights[a.task?.priority?.toLowerCase()] || 0;
            const pB = priorityWeights[b.task?.priority?.toLowerCase()] || 0;
            if (pA !== pB) {
              return pB - pA; // highest priority first!
            }
            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
          });

          setAssignedTasks(sorted);
        }

        if (logsRes.status === 'fulfilled' && logsRes.value?.data?.data) {
          const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
          const todayLog = logsRes.value.data.data.find(l => l.work_date === todayDate);
          setWorkLogToday(todayLog || null);
        }
      } catch (err) {
        console.error('Error loading staff dashboard items', err);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      
      {/* Hero Attendance Punch Widget */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-amber-50/40 to-amber-100/30 dark:from-[#181511] dark:via-[#13110e] dark:to-[#0d0c0a] p-6 sm:p-8 border border-outline-variant/60 dark:border-[#d4af37]/35 shadow-md dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(212,175,55,0.2)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 dark:bg-[#d4af37]/15 dark:text-[#ffd700] dark:border-[#d4af37]/30 text-[11px] font-bold tracking-wider uppercase font-mono">
                Asia/Kolkata Session
              </span>
              <span className="text-xs font-mono text-stone-500 dark:text-[#8c8273]">IST</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-stone-900 dark:text-[#f7f2ea]">
              Welcome, <span className="gold-text">{user?.full_name || user?.display_name || 'Staff Member'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-[#bdae9b]">
              Staff ID: <span className="font-mono font-bold text-amber-700 dark:text-[#d4af37]">{user?.staff_id || 'VD-ACTIVE'}</span> • {formattedDate}
            </p>

            {/* Live Clock Display */}
            <div className="mt-3 flex items-baseline gap-2.5">
              <Clock className="w-5 h-5 text-amber-600 dark:text-[#d4af37] self-center" />
              <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-amber-700 dark:text-[#ffd700] drop-shadow-none dark:drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                {formattedTime}
              </span>
            </div>
          </div>

          {/* Quick Punch Button */}
          <div className="flex flex-col sm:items-end justify-center gap-2">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/staff/attendance')}
            >
              <CalendarCheck className="w-5 h-5 mr-2" />
              Open Attendance Ledger
            </Button>
            <span className="text-[11px] text-stone-500 dark:text-[#8c8273] text-center sm:text-right font-medium">
              Single daily session • Server timestamped
            </span>
          </div>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* My Assigned Tasks Section with Priority Highlighting */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col justify-between h-full p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/50 dark:border-[#3a342b]/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100/70 dark:bg-[#d4af37]/15 text-amber-700 dark:text-[#d4af37]">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-stone-900 dark:text-[#f7f2ea]">Assigned Tasks & Milestones</h2>
                    <p className="text-xs text-stone-500 dark:text-[#bdae9b]">Urgent duties prioritised at top</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/staff/tasks')}
                  className="text-xs"
                >
                  View All Tasks <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>

              {/* Tasks List rendering */}
              <div className="mt-4">
                {tasksLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2">
                    <div className="w-7 h-7 border-2 border-amber-600 dark:border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-stone-500 dark:text-[#8c8273]">Loading assigned duties...</span>
                  </div>
                ) : assignedTasks.length === 0 ? (
                  <div className="py-8">
                    <EmptyState
                      icon={CheckSquare}
                      title="No Tasks Assigned"
                      description="You are fully up to date. Newly delegated institutional tasks and checklists will appear here."
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {assignedTasks.slice(0, 4).map((assign) => {
                      const priority = assign.task?.priority?.toLowerCase();
                      const isUrgent = priority === 'urgent';
                      const isHigh = priority === 'high';

                      return (
                        <div
                          key={assign.id}
                          onClick={() => navigate('/staff/tasks')}
                          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                            isUrgent
                              ? 'bg-rose-50 border-rose-200 hover:bg-rose-100/70 dark:bg-red-950/30 dark:border-red-500/50 dark:hover:bg-red-950/50 shadow-xs'
                              : isHigh
                              ? 'bg-amber-50/80 border-amber-200 hover:bg-amber-100/60 dark:bg-amber-950/30 dark:border-amber-500/40 dark:hover:bg-amber-950/40'
                              : 'bg-stone-50/70 border-stone-200 hover:border-amber-400 hover:bg-white dark:bg-[#181512]/60 dark:border-[#3a342b]/60 dark:hover:border-[#d4af37]/40 dark:hover:bg-[#1f1b16]'
                          }`}
                        >
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {isUrgent && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px] uppercase tracking-wider border border-rose-300 dark:bg-red-500/20 dark:text-red-500 dark:border-red-500/30">
                                  <Flame className="w-3 h-3 text-rose-600 dark:text-red-500 animate-pulse" /> URGENT
                                </span>
                              )}
                              {isHigh && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase tracking-wider border border-amber-300 dark:bg-amber-500/20 dark:text-amber-500 dark:border-amber-500/30">
                                  HIGH PRIORITY
                                </span>
                              )}
                              <h3 className="font-bold text-sm text-stone-900 dark:text-[#f7f2ea] truncate hover:text-amber-700 dark:hover:text-[#ffd700] transition-colors">
                                {assign.task?.title}
                              </h3>
                            </div>
                            
                            {assign.task?.description && (
                              <p className="text-xs text-stone-500 dark:text-[#bdae9b] line-clamp-1">
                                {assign.task.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-semibold text-stone-500 dark:text-[#8c8273] uppercase font-mono">
                              {assign.status.replace(/_/g, ' ')}
                            </span>
                            <ArrowRight className="w-4 h-4 text-amber-600 dark:text-[#d4af37]" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Daily Work Log Summary */}
        <Card className="flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/50 dark:border-[#3a342b]/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100/70 dark:bg-[#d4af37]/15 text-amber-700 dark:text-[#d4af37]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-stone-900 dark:text-[#f7f2ea]">Daily Work Log</h2>
                  <p className="text-xs text-stone-500 dark:text-[#bdae9b]">Institutional Transparency</p>
                </div>
              </div>
            </div>

            <div className="py-6">
              {workLogToday ? (
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#1a1713] border border-stone-200 dark:border-[#d4af37]/30 flex flex-col gap-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-900 dark:text-[#f7f2ea]">Today's Log Documented</span>
                    <Badge variant="success" size="sm">Submitted</Badge>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-[#bdae9b] line-clamp-3 mt-1">
                    {workLogToday.content || workLogToday.description || 'Work log recorded for supervisor review.'}
                  </p>
                </div>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No Work Log for Today"
                  description="Keep accountability high by documenting your tasks and progress for today's session."
                  actionLabel="Draft Work Log"
                  onAction={() => navigate('/staff/work-logs')}
                />
              )}
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/staff/work-logs')}
            className="w-full text-xs"
          >
            Open Work Log Center
          </Button>
        </Card>
      </div>
    </div>
  );
};
