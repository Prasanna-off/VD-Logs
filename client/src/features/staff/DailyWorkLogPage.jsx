import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import {
  FileText,
  Plus,
  Clock,
  AlertCircle,
  Edit2,
  Send,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const workLogSchema = z.object({
  work_date: z.string().min(10, 'Valid date required'),
  title: z.string().min(2, 'Title is required').trim(),
  description: z.string().min(5, 'Detailed description is required').trim(),
  related_task_assignment_id: z.string().optional().or(z.literal('')),
  minutes_spent: z.coerce.number().min(0).optional(),
  additional_notes: z.string().optional()
});

export const DailyWorkLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(workLogSchema),
    defaultValues: {
      work_date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
      minutes_spent: 60
    }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [logsRes, tasksRes] = await Promise.all([
        api.get('/work-logs/my'),
        api.get('/tasks/my-tasks')
      ]);
      setLogs(logsRes.data.data || []);
      setMyTasks(tasksRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load work logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNewLogModal = () => {
    setEditingLog(null);
    reset({
      work_date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
      title: '',
      description: '',
      related_task_assignment_id: '',
      minutes_spent: 60,
      additional_notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (log) => {
    setEditingLog(log);
    setValue('work_date', log.work_date);
    setValue('title', log.title);
    setValue('description', log.description);
    setValue('related_task_assignment_id', log.assignment?.id || '');
    setValue('minutes_spent', log.minutes_spent || 0);
    setValue('additional_notes', log.additional_notes || '');
    setShowModal(true);
  };

  const onSubmit = async (values, isSubmitted = false) => {
    try {
      setActionLoading(true);
      setError('');
      const payload = {
        ...values,
        is_submitted: isSubmitted
      };

      if (editingLog) {
        await api.patch(`/work-logs/${editingLog.id}`, payload);
      } else {
        await api.post('/work-logs', payload);
      }

      setShowModal(false);
      reset();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save work log');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header (matches screen_19_daily_work_log_form and screen_20_work_history_feedback) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Daily Work Reports & History</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Document daily operational progress, link related tasks, and review Trust feedback
          </p>
        </div>
        <Button icon={Plus} size="sm" onClick={openNewLogModal}>
          + New Daily Log
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-lg bg-error-container/40 border border-error/20 flex items-start gap-2.5 text-error text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Work Logs List */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-on-surface-variant">Loading daily logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={FileText}
              title="No Work Logs Recorded"
              description="Keep your work transparent by creating daily logs detailing completed operations."
              actionLabel="Create First Work Log"
              onAction={openNewLogModal}
            />
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/15">
            {logs.map((log) => (
              <div key={log.id} className="p-5 flex flex-col gap-3 hover:bg-surface-container-low/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-outline">{log.work_date}</span>
                    <h3 className="font-bold text-sm text-on-surface">{log.title}</h3>
                    <Badge
                      variant={
                        log.status === 'approved' ? 'success' :
                        log.status === 'submitted' ? 'info' :
                        log.status === 'needs_revision' ? 'error' : 'neutral'
                      }
                      size="sm"
                    >
                      {log.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  {log.minutes_spent && (
                    <span className="text-xs text-on-surface-variant flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {log.minutes_spent} minutes
                    </span>
                  )}
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed max-w-3xl whitespace-pre-line">
                  {log.description}
                </p>

                {/* Supervisor Review Comment Banner */}
                {log.review_comment && (
                  <div className={`p-3 rounded-lg text-xs flex items-start gap-2.5 ${
                    log.status === 'needs_revision'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-900 dark:text-amber-200'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-900 dark:text-emerald-200'
                  }`}>
                    <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[11px] uppercase tracking-wider mb-0.5">Supervisor Evaluation:</strong>
                      <span>{log.review_comment}</span>
                    </div>
                  </div>
                )}

                {/* Footer and Edit Actions */}
                <div className="mt-1 flex items-center justify-between text-xs pt-2 border-t border-outline-variant/15">
                  <span className="text-[11px] text-outline">
                    {log.assignment?.task?.title ? `Linked to: ${log.assignment.task.title}` : 'General Duty'}
                  </span>

                  {(log.status === 'draft' || log.status === 'needs_revision') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit2}
                      onClick={() => openEditModal(log)}
                      className="text-xs"
                    >
                      Edit & Submit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* New / Edit Work Log Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingLog ? 'Edit Daily Work Log' : 'Create Daily Work Log'}
        subtitle="Capture work details, time invested, and link relevant tasks for administrative transparency."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit((values) => onSubmit(values, false))} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Working Date *</label>
              <input
                type="date"
                className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
                {...register('work_date')}
              />
              {errors.work_date && <span className="text-error text-[10px]">{errors.work_date.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Time Spent (Minutes)</label>
              <input
                type="number"
                placeholder="e.g. 120"
                className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
                {...register('minutes_spent')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Log Headline / Title *</label>
            <input
              type="text"
              placeholder="e.g. Completed Community Center Inventory & Log Sheet Audit"
              className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
              {...register('title')}
            />
            {errors.title && <span className="text-error text-[10px]">{errors.title.message}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Related Assigned Task (Optional)</label>
            <select
              className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
              {...register('related_task_assignment_id')}
            >
              <option value="">No specific task (General Duty)</option>
              {myTasks.map((t) => (
                <option key={t.id} value={t.id}>{t.task?.title}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Detailed Description *</label>
            <textarea
              rows={4}
              placeholder="Describe work completed, milestones reached, and any observations..."
              className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none resize-none"
              {...register('description')}
            />
            {errors.description && <span className="text-error text-[10px]">{errors.description.message}</span>}
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-outline-variant/20">
            <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={actionLoading}
              onClick={handleSubmit((values) => onSubmit(values, false))}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              size="sm"
              loading={actionLoading}
              onClick={handleSubmit((values) => onSubmit(values, true))}
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Submit to Trust
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
