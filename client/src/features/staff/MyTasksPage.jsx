import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { SpringCheck } from '../../components/react-bits/SpringCheck';
import api from '../../services/api';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ListChecks,
  Send,
  Flame,
  ArrowRight
} from 'lucide-react';

export const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [checklistProgress, setChecklistProgress] = useState([]);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/tasks/my-tasks');
      if (res.data?.data) {
        const priorityWeights = {
          urgent: 4,
          high: 3,
          medium: 2,
          low: 1
        };

        const sorted = [...res.data.data].sort((a, b) => {
          const pA = priorityWeights[a.task?.priority?.toLowerCase()] || 0;
          const pB = priorityWeights[b.task?.priority?.toLowerCase()] || 0;
          if (pA !== pB) {
            return pB - pA;
          }
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        });

        setTasks(sorted);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openAssignmentModal = async (assignment) => {
    setActiveAssignment(assignment);
    setSubmissionNotes('');
    setShowDetailModal(true);
    try {
      const res = await api.get(`/tasks/assignments/${assignment.id}/checklist`);
      setChecklistProgress(res.data.data || []);
    } catch (err) {
      console.error('Error fetching checklist items:', err);
      setChecklistProgress([]);
    }
  };

  const handleToggleChecklist = async (progressItem, isCompleted) => {
    try {
      const updated = checklistProgress.map(p =>
        p.id === progressItem.id ? { ...p, is_completed: isCompleted } : p
      );
      setChecklistProgress(updated);

      await api.patch(`/tasks/assignments/${activeAssignment.id}/checklist/${progressItem.id}`, {
        is_completed: isCompleted
      });
    } catch (err) {
      console.error('Failed to toggle checklist item', err);
    }
  };

  const handleSubmitForReview = async () => {
    try {
      setActionLoading(true);
      setError('');
      await api.post(`/tasks/assignments/${activeAssignment.id}/submit`, {
        submission_notes: submissionNotes
      });
      setShowDetailModal(false);
      fetchTasks();
      alert('Task assignment submitted for Administrator review.');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Submission failed');
    } finally {
      setActionLoading(false);
    }
  };

  const completedCount = checklistProgress.filter(p => p.is_completed).length;
  const progressPercent = checklistProgress.length > 0
    ? Math.round((completedCount / checklistProgress.length) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight gold-text">
            My Assigned Tasks
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-[#bdae9b] mt-0.5">
            Review requirements, mark off interactive checklists, and submit for Trust approval
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 dark:bg-red-950/60 dark:border-red-500/40 dark:text-red-300 flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Tasks List */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-amber-600 dark:border-[#d4af37] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-stone-500 dark:text-[#8c8273]">Loading your assigned tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={CheckSquare}
              title="All Tasks Complete"
              description="You have no pending task assignments. Newly delegated duties and checklists will appear here automatically."
            />
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/40 dark:divide-[#3a342b]/40">
            {tasks.map((assign) => {
              const isUrgent = assign.task?.priority?.toLowerCase() === 'urgent';
              const isHigh = assign.task?.priority?.toLowerCase() === 'high';

              return (
                <div
                  key={assign.id}
                  onClick={() => openAssignmentModal(assign)}
                  className={`p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 cursor-pointer ${
                    isUrgent
                      ? 'bg-rose-50/60 hover:bg-rose-100/70 dark:bg-red-950/20 dark:hover:bg-red-950/30'
                      : 'hover:bg-amber-50/40 dark:hover:bg-[#1a1713]'
                  }`}
                >
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {isUrgent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px] uppercase tracking-wider border border-rose-300 dark:bg-red-500/20 dark:text-red-500 dark:border-red-500/30">
                          <Flame className="w-3 h-3 text-rose-600 dark:text-red-500 animate-pulse" /> URGENT
                        </span>
                      )}
                      {isHigh && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase tracking-wider border border-amber-300 dark:bg-amber-500/20 dark:text-amber-500 dark:border-amber-500/30">
                          HIGH
                        </span>
                      )}
                      <h3 className="font-bold text-sm text-stone-900 dark:text-[#f7f2ea] hover:text-amber-700 dark:hover:text-[#ffd700] transition-colors">
                        {assign.task?.title}
                      </h3>
                      <Badge
                        variant={
                          assign.status === 'completed' ? 'success' :
                          assign.status === 'submitted_for_review' ? 'info' :
                          assign.status === 'needs_revision' ? 'error' : 'warning'
                        }
                        size="sm"
                      >
                        {assign.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    {assign.task?.description && (
                      <p className="text-xs text-stone-500 dark:text-[#bdae9b] line-clamp-2 max-w-xl">
                        {assign.task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-[#8c8273] mt-1 font-medium">
                      <span className="font-semibold text-amber-700 dark:text-[#d4af37]">{assign.task?.category || 'General'}</span>
                      {assign.task?.due_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Due: {new Date(assign.task.due_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <Button variant="outline" size="sm" className="text-xs">
                      View Checklist <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Task Checklist & Submission Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={activeAssignment?.task?.title || 'Task Details'}
        subtitle={`Priority: ${activeAssignment?.task?.priority?.toUpperCase()} • Category: ${activeAssignment?.task?.category || 'General'}`}
        maxWidth="max-w-xl"
      >
        <div className="flex flex-col gap-5 text-xs">
          {activeAssignment?.task?.description && (
            <div className="bg-stone-50 dark:bg-[#181612] p-3.5 rounded-xl text-stone-900 dark:text-[#f7f2ea] leading-relaxed border border-stone-200 dark:border-[#3a342b]/60">
              {activeAssignment.task.description}
            </div>
          )}

          {/* Supervisor Feedback Banner if Revision was requested */}
          {activeAssignment?.status === 'needs_revision' && activeAssignment?.review_comment && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-500/40 dark:text-amber-300 rounded-xl">
              <strong className="block text-[11px] uppercase tracking-wider font-bold mb-1">Supervisor Revision Request:</strong>
              {activeAssignment.review_comment}
            </div>
          )}

          {/* Progress Bar */}
          {checklistProgress.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-stone-800 dark:text-[#f7f2ea]">Milestone Progress</span>
                <span className="text-amber-700 dark:text-[#ffd700] font-mono font-bold">{progressPercent}% ({completedCount}/{checklistProgress.length})</span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-[#221e17] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-700 dark:from-[#d4af37] dark:to-[#aa8218] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Interactive Checklist Items */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-bold text-stone-900 dark:text-[#f7f2ea] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-amber-600 dark:text-[#d4af37]" />
              Required Checklist Items
            </h4>
            {checklistProgress.length === 0 ? (
              <span className="text-stone-500 dark:text-[#8c8273] text-xs italic">No specific checklist items defined for this task.</span>
            ) : (
              <div className="flex flex-col gap-2">
                {checklistProgress.map((p) => {
                  const isLocked = activeAssignment?.status === 'submitted_for_review' || activeAssignment?.status === 'completed';
                  return (
                    <SpringCheck
                      key={p.id}
                      label={p.checklist_item?.item_text || p.item_text || 'Milestone item'}
                      checked={p.is_completed}
                      disabled={isLocked}
                      onChange={(checked) => handleToggleChecklist(p, checked)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Submission Notes & Action */}
          {activeAssignment?.status !== 'completed' && activeAssignment?.status !== 'submitted_for_review' && (
            <div className="flex flex-col gap-2 mt-2">
              <label className="font-semibold text-stone-900 dark:text-[#f7f2ea]">Completion Notes for Supervisor</label>
              <textarea
                rows={3}
                placeholder="Detail what was completed or mention any specific findings..."
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                className="w-full p-3 bg-white dark:bg-[#181612] text-stone-900 dark:text-[#f7f2ea] text-xs rounded-xl border border-stone-300 dark:border-[#3a342b]/60 focus:border-amber-500 dark:focus:border-[#d4af37] focus:outline-none transition-all placeholder:text-stone-400"
              />

              <div className="flex justify-end gap-2.5 mt-3">
                <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  loading={actionLoading}
                  icon={Send}
                  onClick={handleSubmitForReview}
                >
                  Submit for Review
                </Button>
              </div>
            </div>
          )}

          {activeAssignment?.status === 'submitted_for_review' && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 dark:bg-amber-950/30 dark:border-amber-500/30 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Assignment submitted. Awaiting administrator review and sign-off.</span>
            </div>
          )}

          {activeAssignment?.status === 'completed' && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-500/30 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>This task has been approved and marked complete by Trust Admin.</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
