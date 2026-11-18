import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import {
  History,
  Shield,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/audit-logs');
        setLogs(res.data.data || []);
      } catch (err) {
        console.error('Audit logs fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header (matches screen_12_activity_logs) */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">System Activity & Audit Logs</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
          Immutable operational trail • Privileged administrative actions • Security accountability
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-on-surface-variant">Loading system audit trail...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={History}
              title="Audit Ledger Clean"
              description="Privileged administrative actions (such as account provisioning, password resets, and policy changes) will be chronologically documented here."
            />
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/15 text-xs">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-surface-container-low/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface">{log.action}</span>
                      <Badge variant="neutral" size="sm">{log.entity_type}</Badge>
                    </div>
                    <span className="text-[11px] text-on-surface-variant block mt-0.5">
                      Actor: {log.actor?.display_name || 'System Administrator'}
                    </span>
                  </div>
                </div>
                <span className="text-outline text-[11px] font-mono shrink-0">
                  {new Date(log.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
