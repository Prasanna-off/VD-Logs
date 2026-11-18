import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  History
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const correctionSchema = z.object({
  attendance_date: z.string().min(10, 'Valid date is required'),
  request_type: z.enum([
    'missing_check_in',
    'missing_check_out',
    'incorrect_check_in',
    'incorrect_check_out',
    'other'
  ]),
  reason: z.string().min(5, 'Please provide an explanation of at least 5 characters')
});

export const MyAttendancePage = () => {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(correctionSchema),
    defaultValues: {
      attendance_date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
      request_type: 'missing_check_out',
      reason: ''
    }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [todayRes, historyRes, corrRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/me'),
        api.get('/attendance/correction-requests/me')
      ]);
      setTodayStatus(todayRes.data.data);
      setHistory(historyRes.data.data || []);
      setCorrections(corrRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async () => {
    try {
      setPunchLoading(true);
      setError('');
      await api.post('/attendance/check-in');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Check-in failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setPunchLoading(true);
      setError('');
      await api.post('/attendance/check-out');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Check-out failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const onSubmitCorrection = async (values) => {
    try {
      setActionLoading(true);
      setError('');
      await api.post('/attendance/correction-requests', values);
      setShowCorrectionModal(false);
      reset();
      fetchData();
      alert('Correction request submitted for Admin review.');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit correction');
    } finally {
      setActionLoading(false);
    }
  };

  const formatIST = (utcString) => {
    if (!utcString) return '—';
    return new Date(utcString).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight gold-text">
            My Attendance Ledger
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-[#bdae9b] mt-0.5">
            Real-time server-timestamped daily work records • Asia/Kolkata (IST)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={PlusCircle}
          onClick={() => setShowCorrectionModal(true)}
        >
          Request Correction
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 dark:bg-red-950/60 dark:border-red-500/40 dark:text-red-300 flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Today Punch Action Card */}
      <Card className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-700 dark:text-[#d4af37] uppercase tracking-wider font-mono">
                Today's Working Session
              </span>
              <span className="text-stone-300 dark:text-[#3a342b]">•</span>
              <span className="text-xs text-stone-500 dark:text-[#bdae9b]">
                {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {todayStatus?.status === 'CURRENTLY_WORKING' ? (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Currently Working
                </span>
              ) : todayStatus?.status === 'CHECKED_OUT' ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Shift Completed
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-[#1e1b16] text-stone-600 dark:text-[#8c8273] border border-stone-200 dark:border-[#3a342b] text-xs font-bold">
                  Not Checked In
                </span>
              )}
            </div>

            {todayStatus?.record && (
              <div className="flex items-center gap-5 text-xs text-stone-600 dark:text-[#bdae9b] mt-1">
                <span>Check In: <strong className="text-stone-900 dark:text-[#f7f2ea] font-mono">{formatIST(todayStatus.record.check_in_at)}</strong></span>
                <span>Check Out: <strong className="text-stone-900 dark:text-[#f7f2ea] font-mono">{formatIST(todayStatus.record.check_out_at)}</strong></span>
              </div>
            )}
          </div>

          {/* Action Interactive Clean Punch Buttons */}
          <div className="flex flex-col items-start md:items-end gap-2">
            {todayStatus?.status === 'NOT_CHECKED_IN' && (
              <Button
                variant="primary"
                size="lg"
                loading={punchLoading}
                onClick={handleCheckIn}
                className="px-8 shadow-gold-glow"
              >
                <CalendarCheck className="w-5 h-5 mr-2" />
                Check In Today
              </Button>
            )}

            {todayStatus?.status === 'CURRENTLY_WORKING' && (
              <Button
                variant="secondary"
                size="lg"
                loading={punchLoading}
                onClick={handleCheckOut}
                className="px-8 text-amber-800 dark:text-[#ffd700]"
              >
                <Clock className="w-5 h-5 mr-2" />
                Check Out Now
              </Button>
            )}

            {todayStatus?.status === 'CHECKED_OUT' && (
              <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 px-5 py-3 rounded-xl font-semibold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Today's single attendance session is finalized.</span>
              </div>
            )}
            <span className="text-[10px] text-stone-400 dark:text-[#6d6355]">
              Authorized single shift record per working day
            </span>
          </div>
        </div>
      </Card>

      {/* Attendance History Table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/50 dark:border-[#3a342b]/60 flex items-center justify-between bg-stone-50/70 dark:bg-[#14120e]">
          <div className="flex items-center gap-2.5">
            <History className="w-4 h-4 text-amber-600 dark:text-[#d4af37]" />
            <h2 className="text-sm font-bold text-stone-900 dark:text-[#f7f2ea]">Attendance History (Recent 30 Days)</h2>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-amber-600 dark:border-[#d4af37] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-stone-500 dark:text-[#8c8273]">Loading records...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={CalendarCheck}
              title="No Attendance History"
              description="Your verified check-in and check-out ledger records will be documented here chronologically."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-[#181512] text-stone-500 dark:text-[#bdae9b] uppercase text-[10px] tracking-wider border-b border-outline-variant/50 dark:border-[#3a342b]/60">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Working Date</th>
                  <th className="px-6 py-3.5 font-bold">Check In (IST)</th>
                  <th className="px-6 py-3.5 font-bold">Check Out (IST)</th>
                  <th className="px-6 py-3.5 font-bold">Session Status</th>
                  <th className="px-6 py-3.5 font-bold">Adjustment Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 dark:divide-[#3a342b]/40 text-stone-900 dark:text-[#f7f2ea]">
                {history.map((row) => (
                  <tr key={row.id} className="hover:bg-amber-50/40 dark:hover:bg-[#1a1713] transition-colors">
                    <td className="px-6 py-3.5 font-medium">{row.date}</td>
                    <td className="px-6 py-3.5 font-mono text-amber-700 dark:text-[#ffd700] font-bold">{formatIST(row.check_in_at)}</td>
                    <td className="px-6 py-3.5 font-mono text-amber-700 dark:text-[#ffd700] font-bold">{formatIST(row.check_out_at)}</td>
                    <td className="px-6 py-3.5">
                      {row.check_out_at ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Completed</span>
                      ) : row.check_in_at ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">Working</span>
                      ) : (
                        <span className="text-stone-400 dark:text-[#8c8273]">Absent</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-stone-500 dark:text-[#8c8273]">{row.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Correction Request Modal */}
      {showCorrectionModal && (
        <Modal
          isOpen={showCorrectionModal}
          onClose={() => setShowCorrectionModal(false)}
          title="Attendance Correction Request"
        >
          <form onSubmit={handleSubmit(onSubmitCorrection)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-900 dark:text-[#f7f2ea]">Attendance Date</label>
              <input
                type="date"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181612] rounded-xl border border-stone-300 dark:border-[#3a342b] text-xs text-stone-900 dark:text-[#f7f2ea] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none"
                {...register('attendance_date')}
              />
              {errors.attendance_date && <span className="text-rose-500 text-xs">{errors.attendance_date.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-900 dark:text-[#f7f2ea]">Request Type</label>
              <select
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#181612] rounded-xl border border-stone-300 dark:border-[#3a342b] text-xs text-stone-900 dark:text-[#f7f2ea] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none"
                {...register('request_type')}
              >
                <option value="missing_check_in">Missing Check In</option>
                <option value="missing_check_out">Missing Check Out</option>
                <option value="incorrect_check_in">Incorrect Check In Time</option>
                <option value="incorrect_check_out">Incorrect Check Out Time</option>
                <option value="other">Other Ledger Correction</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-900 dark:text-[#f7f2ea]">Reason & Explanation</label>
              <textarea
                rows={3}
                placeholder="Explain the discrepancy..."
                className="w-full p-3 bg-white dark:bg-[#181612] rounded-xl border border-stone-300 dark:border-[#3a342b] text-xs text-stone-900 dark:text-[#f7f2ea] focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none"
                {...register('reason')}
              />
              {errors.reason && <span className="text-rose-500 text-xs">{errors.reason.message}</span>}
            </div>

            <div className="flex justify-end gap-2.5 mt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowCorrectionModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={actionLoading}>
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
