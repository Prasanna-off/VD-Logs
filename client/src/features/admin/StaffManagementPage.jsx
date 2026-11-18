import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import { Users, UserPlus, Search, AlertCircle, Edit, Ban, KeyRound, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const staffSchema = z.object({
  staff_id: z.string().min(2, 'Staff ID is required').trim(),
  full_name: z.string().min(2, 'Full name is required').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  department_id: z.string().optional().or(z.literal('')),
  designation: z.string().optional().or(z.literal('')),
  joining_date: z.string().optional().or(z.literal(''))
});

const resetPasswordSchema = z.object({
  new_password: z.string().min(6, 'Password must be at least 6 characters')
});

export const StaffManagementPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { register: regStaff, handleSubmit: handleStaffSubmit, reset: resetStaffForm, formState: { errors: staffErrors } } = useForm({
    resolver: zodResolver(staffSchema)
  });

  const { register: regReset, handleSubmit: handleResetSubmit, reset: resetResetForm, formState: { errors: resetErrors } } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedDept) params.append('department_id', selectedDept);
      if (selectedStatus) params.append('status', selectedStatus);

      const res = await api.get(`/staff?${params.toString()}`);
      setStaffList(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch staff directory');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepts = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data || []);
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedDept, selectedStatus]);

  const onAddStaff = async (values) => {
    try {
      setActionLoading(true);
      setError('');
      await api.post('/staff', values);
      setShowAddModal(false);
      resetStaffForm();
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to provision staff member');
    } finally {
      setActionLoading(false);
    }
  };

  const onResetPassword = async (values) => {
    try {
      setActionLoading(true);
      setError('');
      await api.post(`/staff/${selectedStaff.id}/reset-password`, values);
      setShowResetModal(false);
      resetResetForm();
      alert('Password reset successfully!');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this staff account? They will no longer be able to log in.')) return;
    try {
      setError('');
      await api.post(`/staff/${id}/deactivate`);
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Deactivation failed');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Staff Directory & Provisioning</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Administered personnel directory for Vishvadaan Trust
          </p>
        </div>
        <Button icon={UserPlus} size="sm" onClick={() => { resetStaffForm(); setShowAddModal(true); }}>
          + Add Staff Member
        </Button>
      </div>

      {/* Filter and Search Bar (matches screen_3_staff_management) */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-outline absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Staff ID, Name, or Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface text-xs pl-9 pr-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="left">Left</option>
            </select>
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

      {/* Staff Table / Empty State */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-on-surface-variant">Loading staff records...</span>
          </div>
        ) : staffList.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Users}
              title="No Staff Accounts Provisioned"
              description="No staff members match the selected filters. Use '+ Add Staff Member' to provision trusted credentials."
              actionLabel="Add First Staff Member"
              onAction={() => { resetStaffForm(); setShowAddModal(true); }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low/60 text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/20">
                <tr>
                  <th className="px-5 py-3.5">Staff ID</th>
                  <th className="px-5 py-3.5">Full Name</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Designation</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-primary">
                      {staff.staff_id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-on-surface">{staff.full_name}</div>
                      {staff.email && <div className="text-[11px] text-on-surface-variant">{staff.email}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-on-surface-variant">
                      {staff.department?.name || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-on-surface-variant">
                      {staff.designation || 'Staff'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={staff.employment_status === 'active' ? 'success' : 'neutral'}
                        dot={staff.employment_status === 'active'}
                      >
                        {staff.employment_status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={KeyRound}
                          onClick={() => { setSelectedStaff(staff); resetResetForm(); setShowResetModal(true); }}
                          title="Reset Password"
                        >
                          Reset Pwd
                        </Button>
                        {staff.employment_status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-error hover:bg-error-container/20"
                            icon={Ban}
                            onClick={() => handleDeactivate(staff.id)}
                            title="Deactivate staff"
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Staff Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Provision Staff Member"
        subtitle="Staff members authenticate using their Staff ID and the initial password set here."
      >
        <form onSubmit={handleStaffSubmit(onAddStaff)} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Staff ID *</label>
              <input
                type="text"
                placeholder="e.g. VD-2025-001"
                className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
                {...regStaff('staff_id')}
              />
              {staffErrors.staff_id && <span className="text-error text-[10px]">{staffErrors.staff_id.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Full Name *</label>
              <input
                type="text"
                placeholder="Staff full legal name"
                className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
                {...regStaff('full_name')}
              />
              {staffErrors.full_name && <span className="text-error text-[10px]">{staffErrors.full_name.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Initial Password *</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
                {...regStaff('password')}
              />
              {staffErrors.password && <span className="text-error text-[10px]">{staffErrors.password.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Department</label>
              <select
                className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
                {...regStaff('department_id')}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Designation / Role</label>
              <input
                type="text"
                placeholder="e.g. Field Officer, Instructor"
                className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
                {...regStaff('designation')}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Joining Date</label>
              <input
                type="date"
                className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
                {...regStaff('joining_date')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Email (Optional)</label>
              <input
                type="email"
                placeholder="staff@vishvadaantrust.org"
                className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
                {...regStaff('email')}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Phone (Optional)</label>
              <input
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
                {...regStaff('phone')}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-outline-variant/20">
            <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={actionLoading}>
              Provision Staff Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title={`Reset Password — ${selectedStaff?.full_name}`}
        subtitle={`Staff ID: ${selectedStaff?.staff_id}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetSubmit(onResetPassword)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">New Secure Password *</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              className="w-full bg-surface-container-low text-on-surface text-xs px-3.5 py-2.5 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
              {...regReset('new_password')}
            />
            {resetErrors.new_password && <span className="text-error text-xs">{resetErrors.new_password.message}</span>}
          </div>

          <div className="flex items-center justify-end gap-2 mt-2 pt-4 border-t border-outline-variant/20">
            <Button variant="ghost" size="sm" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={actionLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
