import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';

export const AdminAttendancePage = () => {
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'corrections'
  const [ledger, setLedger] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [incompleteOnly, setIncompleteOnly] = useState(false);

  // Review Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (filterDate) params.append('date', filterDate);
      if (incompleteOnly) params.append('incomplete_only', 'true');

      const res = await api.get(`/attendance/admin?${params.toString()}`);
      setLedger(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load attendance ledger');
    } finally {
      setLoading(false);
    }
  };

  const fetchCorrections = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/attendance/admin/corrections');
      setCorrections(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load correction requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ledger') {
      fetchLedger();
    } else {
      fetchCorrections();
    }
  }, [activeTab, filterDate, incompleteOnly]);

  const handleDecision = async (decision) => {
    if (!selectedCorrection) return;
    try {
      setActionLoading(true);
      setError('');
      await api.post(`/attendance/admin/corrections/${selectedCorrection.id}/decision`, {
        decision,
        review_comment: reviewComment
      });
      setShowReviewModal(false);
      setReviewComment('');
      fetchCorrections();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Decision processing failed');
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Attendance Management</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Organization-wide ledger, live shifts & correction adjudication
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/20">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'ledger'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Daily Ledger
          </button>
          <button
            onClick={() => setActiveTab('corrections')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'corrections'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Correction Requests {corrections.filter(c => c.status === 'pending').length > 0 && `(${corrections.filter(c => c.status === 'pending').length})`}
          </button>
        </div>
      </div>

      {/* Filter Bar (Ledger tab only) */}
      {activeTab === 'ledger' && (
        <Card className="p-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-on-surface">Filter By Date:</span>
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
                  Clear Date
                </button>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={incompleteOnly}
                onChange={(e) => setIncompleteOnly(e.target.checked)}
                className="rounded text-primary focus:ring-primary accent-primary"
              />
              <span className="font-medium text-on-surface-variant">Incomplete Sessions Only (Open Check-ins)</span>
            </label>
          </div>
        </Card>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-lg bg-error-container/40 border border-error/20 flex items-start gap-2.5 text-error text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Content Table */}
      {activeTab === 'ledger' ? (
        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-on-surface-variant">Loading attendance ledger...</span>
            </div>
          ) : ledger.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={CalendarCheck}
                title="No Attendance Rows Recorded"
                description="No attendance sessions match the filter. Attendance appears here when staff members punch in."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low/60 text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/20">
                  <tr>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Staff Member</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Check In (IST)</th>
                    <th className="px-5 py-3.5">Check Out (IST)</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {ledger.map((row) => (
                    <tr key={row.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-on-surface">
                        {row.attendance_date}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-on-surface">{row.staff?.full_name || 'Staff Member'}</div>
                        <div className="font-mono text-[11px] text-primary">{row.staff?.staff_id}</div>
                      </td>
                      <td className="px-5 py-3.5 text-on-surface-variant">
                        {row.staff?.department?.name || '—'}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-on-surface">
                        {formatIST(row.check_in_at)}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-on-surface">
                        {formatIST(row.check_out_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={row.check_out_at ? 'success' : 'warning'}
                          dot={!row.check_out_at}
                        >
                          {row.check_out_at ? 'Completed' : 'Currently Working'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-on-surface-variant text-[11px] max-w-xs truncate">
                        {row.adjustment_reason || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        /* Correction Requests Tab */
        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-on-surface-variant">Loading correction requests...</span>
            </div>
          ) : corrections.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={CalendarCheck}
                title="No Correction Requests"
                description="Staff-submitted attendance correction requests will be listed here for adjudication."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low/60 text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/20">
                  <tr>
                    <th className="px-5 py-3.5">Staff</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Request Type</th>
                    <th className="px-5 py-3.5">Reason / Explanation</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {corrections.map((req) => (
                    <tr key={req.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-on-surface">{req.staff?.full_name}</div>
                        <div className="font-mono text-[11px] text-primary">{req.staff?.staff_id}</div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-on-surface">
                        {req.attendance_date}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-secondary">
                        {req.request_type.replace(/_/g, ' ')}
                      </td>
                      <td className="px-5 py-3.5 text-on-surface-variant max-w-sm">
                        {req.reason}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'error' : 'warning'}
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {req.status === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => { setSelectedCorrection(req); setShowReviewModal(true); }}
                          >
                            Review & Decide
                          </Button>
                        ) : (
                          <span className="text-outline text-[11px]">Adjudicated</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Adjudicate Correction Request"
        subtitle={`Staff: ${selectedCorrection?.staff?.full_name} (${selectedCorrection?.staff?.staff_id})`}
      >
        <div className="flex flex-col gap-4 text-xs">
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col gap-1">
            <span className="text-on-surface-variant">Working Date: <strong className="text-on-surface">{selectedCorrection?.attendance_date}</strong></span>
            <span className="text-on-surface-variant">Type: <strong className="text-secondary">{selectedCorrection?.request_type}</strong></span>
            <span className="text-on-surface-variant">Reason: <strong className="text-on-surface">{selectedCorrection?.reason}</strong></span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-on-surface">Review Comment / Audit Note (Optional)</label>
            <textarea
              rows={2}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Provide comments regarding this decision..."
              className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/20">
            <Button
              variant="outline"
              size="sm"
              loading={actionLoading}
              onClick={() => handleDecision('rejected')}
              className="text-error border-error/30 hover:bg-error-container/20"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject Request
            </Button>
            <Button
              size="sm"
              loading={actionLoading}
              onClick={() => handleDecision('approved')}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve Correction
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
