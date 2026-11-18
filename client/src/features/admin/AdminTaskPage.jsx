import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const taskCreateSchema = z.object({
  title: z.string().min(2, 'Task title is required').trim(),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_at: z.string().optional(),
  instructions: z.string().optional(),
  assigned_staff_ids: z.array(z.string()).min(1, 'Please select at least one staff member')
});

export const AdminTaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals & Checklist State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [checklistItems, setChecklistItems] = useState([{ title: '' }]);
  const [actionLoading, setActionLoading] = useState(false);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [reviewComment, setReviewComment] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: {
      priority: 'medium',
      assigned_staff_ids: []
    }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [tasksRes, staffRes] = await Promise.all([
        api.get('/tasks/admin'),
        api.get('/staff')
      ]);
      setTasks(tasksRes.data.data || []);
      setStaffMembers(staffRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load task operations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddChecklistRow = () => {
    setChecklistItems([...checklistItems, { title: '' }]);
  };

  const handleChecklistTitleChange = (idx, value) => {
    const copy = [...checklistItems];
    copy[idx].title = value;
    setChecklistItems(copy);
  };

  const handleRemoveChecklistRow = (idx) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== idx));
  };

  const onSubmitTask = async (values) => {
    try {
      setActionLoading(true);
      setError('');
      const payload = {
        ...values,
        due_at: values.due_at ? new Date(values.due_at).toISOString() : null,
        checklist_items: checklistItems.filter(item => item.title.trim().length > 0)
      };

      await api.post('/tasks', payload);
      setShowCreateModal(false);
      reset();
      setChecklistItems([{ title: '' }]);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjudicate = async (decision) => {
    if (!selectedAssignment) return;
    try {
      setActionLoading(true);
      setError('');
      await api.post(`/tasks/assignments/${selectedAssignment.id}/review`, {
        decision,
        review_comment: reviewComment
      });
      setShowReviewModal(false);
      setSelectedAssignment(null);
      setReviewComment('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Review adjudication failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent': return <Badge variant="error">Urgent</Badge>;
      case 'high': return <Badge variant="warning">High</Badge>;
      case 'medium': return <Badge variant="info">Medium</Badge>;
      default: return <Badge variant="neutral">Low</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Task Management & Delegation</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Create tasks, build checklists, delegate to staff, and adjudicate completions
          </p>
        </div>
        <Button icon={Plus} size="sm" onClick={() => setShowCreateModal(true)}>
          + Create Task
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-lg bg-error-container/40 border border-error/20 flex items-start gap-2.5 text-error text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tasks Table / Empty State */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-on-surface-variant">Loading task roster...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={CheckSquare}
              title="No Tasks Delegated Yet"
              description="Create the first task, assign it to trust staff members, and attach dynamic checklist milestones."
              actionLabel="Create Task"
              onAction={() => setShowCreateModal(true)}
            />
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/15">
            {tasks.map((task) => (
              <div key={task.id} className="p-5 flex flex-col gap-3 hover:bg-surface-container-low/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-sm text-on-surface">{task.title}</h3>
                    {getPriorityBadge(task.priority)}
                    <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider bg-surface-container px-2 py-0.5 rounded-md">
                      {task.category || 'General'}
                    </span>
                  </div>
                  {task.due_at && (
                    <span className="text-xs text-outline flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Due: {new Date(task.due_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {task.description && (
                  <p className="text-xs text-on-surface-variant max-w-2xl">{task.description}</p>
                )}

                {/* Checklist Summary */}
                {task.checklist_items && task.checklist_items.length > 0 && (
                  <div className="text-[11px] text-outline font-medium">
                    Checklist: {task.checklist_items.length} items defined
                  </div>
                )}

                {/* Assignees & Submissions Strip */}
                <div className="mt-2 pt-3 border-t border-outline-variant/15 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-primary" /> Assignees:
                  </span>
                  {task.assignments && task.assignments.map((assign) => (
                    <div
                      key={assign.id}
                      className="inline-flex items-center gap-2 bg-surface-container px-2.5 py-1 rounded-lg text-xs"
                    >
                      <span className="font-medium text-on-surface">
                        {assign.staff?.full_name} ({assign.staff?.staff_id})
                      </span>
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
                      {assign.status === 'submitted_for_review' && (
                        <Button
                          size="sm"
                          onClick={() => { setSelectedAssignment(assign); setShowReviewModal(true); }}
                          className="py-0.5 px-2 text-[10px]"
                        >
                          Adjudicate
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create & Delegate Task"
        subtitle="Specify task scope, attach staff assignees, and build required checklists."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmitTask)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Task Title *</label>
            <input
              type="text"
              placeholder="e.g. Conduct Community Center Safety & Log Audit"
              className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
              {...register('title')}
            />
            {errors.title && <span className="text-error text-[10px]">{errors.title.message}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Category</label>
              <input
                type="text"
                placeholder="e.g. Field, Education, Ops"
                className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
                {...register('category')}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Priority</label>
              <select
                className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
                {...register('priority')}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Due Date</label>
              <input
                type="datetime-local"
                className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
                {...register('due_at')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Description & Context</label>
            <textarea
              rows={2}
              placeholder="Detailed brief of the task..."
              className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none resize-none"
              {...register('description')}
            />
          </div>

          {/* Assign Staff Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">Assign Staff Members *</label>
            <select
              multiple
              className="w-full bg-surface-container-low text-on-surface text-xs p-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none h-24"
              {...register('assigned_staff_ids')}
            >
              {staffMembers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.staff_id}) — {s.department?.name || 'Staff'}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-outline">Hold Ctrl (Windows) / Cmd (Mac) to select multiple assignees</span>
            {errors.assigned_staff_ids && <span className="text-error text-[10px]">{errors.assigned_staff_ids.message}</span>}
          </div>

          {/* Dynamic Checklist Builder */}
          <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface">Interactive Checklist Items</label>
              <button
                type="button"
                onClick={handleAddChecklistRow}
                className="text-primary hover:underline text-[11px] font-semibold"
              >
                + Add Checklist Item
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto">
              {checklistItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleChecklistTitleChange(idx, e.target.value)}
                    placeholder={`Checklist item #${idx + 1}`}
                    className="flex-1 bg-surface-container-low text-on-surface text-xs px-3 py-1.5 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
                  />
                  {checklistItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistRow(idx)}
                      className="p-1 text-outline hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-outline-variant/20">
            <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={actionLoading}>
              Delegate Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Adjudication Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Review Task Submission"
        subtitle={`Staff: ${selectedAssignment?.staff?.full_name} (${selectedAssignment?.staff?.staff_id})`}
      >
        <div className="flex flex-col gap-4 text-xs">
          {selectedAssignment?.review_comment && (
            <div className="p-3 bg-surface-container-low rounded-lg text-on-surface">
              {selectedAssignment.review_comment}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-on-surface">Review Feedback / Comments</label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Provide constructive feedback or approval notes..."
              className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/20">
            <Button
              variant="outline"
              size="sm"
              loading={actionLoading}
              onClick={() => handleAdjudicate('needs_revision')}
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              Request Revision
            </Button>
            <Button
              size="sm"
              loading={actionLoading}
              onClick={() => handleAdjudicate('completed')}
            >
              Approve Completion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
