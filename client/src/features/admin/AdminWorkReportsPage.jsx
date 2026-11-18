import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const AdminWorkReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Review Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (filterDate) params.append('date', filterDate);

      const res = await api.get(`/work-logs/admin?${params.toString()}`);
      setReports(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch work reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, filterDate]);

  const handleDecision = async (decision) => {
    if (!selectedReport) return;
    try {
      setActionLoading(true);
      setError('');
      await api.post(`/work-logs/${selectedReport.id}/review`, {
        decision,
        review_comment: reviewComment
      });
      setShowReviewModal(false);
      setSelectedReport(null);
      setReviewComment('');
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Review failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header (matches screen_9_work_reports) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Daily Work Reports Oversight</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Audit staff work logs, verify output transparency, and provide supervisor evaluations
          </p>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-on-surface">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-container-low text-on-surface text-xs px-3 py-1.5 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted (Pending Review)</option>
                <option value="approved">Approved</option>
                <option value="needs_revision">Needs Revision</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-on-surface">Date:</span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-surface-container-low text-on-surface text-xs px-3 py-1.5 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="text-outline hover:text-on-surface text-[11px] underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-lg bg-error-container/40 border border-error/20 flex items-start gap-2.5 text-error text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Reports Table / Empty State */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-on-surface-variant">Loading work reports...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={FileText}
              title="No Work Reports Submitted"
              description="When staff submit their daily operational logs for Trust oversight, they will stream here for review."
            />
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/15">
            {reports.map((report) => (
              <div key={report.id} className="p-5 flex flex-col gap-3 hover:bg-surface-container-low/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-primary font-bold">{report.staff?.staff_id}</span>
                    <span className="font-semibold text-sm text-on-surface">{report.staff?.full_name}</span>
                    <span className="text-xs text-outline">• {report.staff?.department?.name || 'Staff'}</span>
                    <Badge
                      variant={
                        report.status === 'approved' ? 'success' :
                        report.status === 'submitted' ? 'info' :
                        report.status === 'needs_revision' ? 'error' : 'neutral'
                      }
                      size="sm"
                    >
                      {report.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <span className="text-xs text-outline font-mono">
                    Working Date: {report.work_date}
                  </span>
                </div>

                <div className="text-xs">
                  <h4 className="font-bold text-on-surface text-sm mb-1">{report.title}</h4>
                  <p className="text-on-surface-variant leading-relaxed max-w-3xl whitespace-pre-line">
                    {report.description}
                  </p>
                </div>

                {report.minutes_spent && (
                  <div className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-secondary" /> Duration: {report.minutes_spent} minutes
                  </div>
                )}

                {/* Supervisor Feedback Note if already reviewed */}
                {report.review_comment && (
                  <div className="p-2.5 rounded-lg bg-surface-container text-xs text-on-surface">
                    <strong className="block text-[11px] uppercase tracking-wider text-outline mb-0.5">Existing Review Feedback:</strong>
                    {report.review_comment}
                  </div>
                )}

                {/* Action Row */}
                <div className="mt-1 flex items-center justify-between text-xs pt-2 border-t border-outline-variant/15">
                  <span className="text-[11px] text-outline">
                    {report.assignment?.task?.title ? `Task: ${report.assignment.task.title}` : 'Independent Daily Work'}
                  </span>

                  {report.status === 'submitted' && (
                    <Button
                      size="sm"
                      onClick={() => { setSelectedReport(report); setShowReviewModal(true); }}
                      className="text-xs"
                    >
                      Evaluate & Adjudicate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Evaluate Work Report"
        subtitle={`Staff: ${selectedReport?.staff?.full_name} (${selectedReport?.staff?.staff_id})`}
      >
        <div className="flex flex-col gap-4 text-xs">
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col gap-1">
            <span className="font-bold text-sm text-on-surface">{selectedReport?.title}</span>
            <span className="text-on-surface-variant leading-relaxed mt-1">{selectedReport?.description}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-on-surface">Supervisor Comment / Guidance</label>
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
              onClick={() => handleDecision('needs_revision')}
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              Request Revision
            </Button>
            <Button
              size="sm"
              loading={actionLoading}
              onClick={() => handleDecision('approved')}
            >
              Approve Work Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
