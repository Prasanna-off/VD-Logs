import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import { Building2, Plus, AlertCircle, Edit2, Ban, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const deptSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').trim(),
  description: z.string().optional()
});

export const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(deptSchema)
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/departments?include_inactive=true');
      setDepartments(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    reset({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setValue('name', dept.name);
    setValue('description', dept.description || '');
    setShowModal(true);
  };

  const onSubmit = async (values) => {
    try {
      setActionLoading(true);
      setError('');
      if (editingDept) {
        await api.patch(`/departments/${editingDept.id}`, values);
      } else {
        await api.post('/departments', values);
      }
      setShowModal(false);
      reset();
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this department?')) return;
    try {
      setError('');
      await api.post(`/departments/${id}/deactivate`);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Deactivation failed');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Department Management</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Organize Vishvadaan Trust operational divisions and teams
          </p>
        </div>
        <Button icon={Plus} size="sm" onClick={openCreateModal}>
          New Department
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-3.5 rounded-lg bg-error-container/40 border border-error/20 flex items-start gap-2.5 text-error text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Departments Table or Empty State */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-on-surface-variant">Loading departments...</span>
          </div>
        ) : departments.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Building2}
              title="No Departments Configured"
              description="Create organizational departments (e.g., Administration, Education, Logistics) so staff can be assigned."
              actionLabel="Add Department"
              onAction={openCreateModal}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low/60 text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/20">
                <tr>
                  <th className="px-5 py-3.5">Department Name</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-on-surface text-sm">
                      {dept.name}
                    </td>
                    <td className="px-5 py-3.5 text-on-surface-variant max-w-xs truncate">
                      {dept.description || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={dept.is_active ? 'success' : 'neutral'} dot={dept.is_active}>
                        {dept.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit2}
                          onClick={() => openEditModal(dept)}
                          title="Edit department"
                        >
                          Edit
                        </Button>
                        {dept.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-error hover:bg-error-container/20"
                            icon={Ban}
                            onClick={() => handleDeactivate(dept.id)}
                            title="Deactivate department"
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

      {/* Create / Edit Department Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDept ? 'Edit Department' : 'Create New Department'}
        subtitle="Departments group staff members and operational workflows."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface" htmlFor="deptName">
              Department Name *
            </label>
            <input
              id="deptName"
              type="text"
              placeholder="e.g. Administration, Accounts, Logistics"
              className="w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2.5 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"
              {...register('name')}
            />
            {errors.name && <span className="text-error text-xs">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface" htmlFor="deptDesc">
              Description (Optional)
            </label>
            <textarea
              id="deptDesc"
              rows={3}
              placeholder="Operational responsibilities and scope..."
              className="w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2.5 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all resize-none"
              {...register('description')}
            />
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-outline-variant/20">
            <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={actionLoading}>
              {editingDept ? 'Update Department' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
