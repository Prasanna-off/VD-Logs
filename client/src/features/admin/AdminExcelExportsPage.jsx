import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const AdminExcelExportsPage = () => {
  const [attStartDate, setAttStartDate] = useState('');
  const [attEndDate, setAttEndDate] = useState('');
  const [workStartDate, setWorkStartDate] = useState('');
  const [workEndDate, setWorkEndDate] = useState('');
  const [downloadingAtt, setDownloadingAtt] = useState(false);
  const [downloadingWork, setDownloadingWork] = useState(false);
  const [error, setError] = useState('');

  const handleDownloadAttendance = async () => {
    try {
      setDownloadingAtt(true);
      setError('');
      const response = await api.post(
        '/admin/analytics/exports/attendance',
        {
          start_date: attStartDate || null,
          end_date: attEndDate || null
        },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `VD_Logs_Attendance_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to generate Attendance Excel export.');
    } finally {
      setDownloadingAtt(false);
    }
  };

  const handleDownloadWorkReports = async () => {
    try {
      setDownloadingWork(true);
      setError('');
      const response = await api.post(
        '/admin/analytics/exports/work-reports',
        {
          start_date: workStartDate || null,
          end_date: workEndDate || null
        },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `VD_Logs_WorkReports_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to generate Work Reports Excel export.');
    } finally {
      setDownloadingWork(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header (matches screen_11_excel_exports) */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Excel Export Center</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
          Generate formatted, audit-compliant Microsoft Excel (.xlsx) workbooks directly from live database tables
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-3.5 rounded-lg bg-error-container/40 border border-error/20 flex items-start gap-2.5 text-error text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Export Card */}
        <Card className="flex flex-col justify-between p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
                <FileSpreadsheet className="w-5 h-5 text-on-primary" />
              </div>
              <div>
                <h3 className="font-bold text-base text-on-surface">Attendance Register (.xlsx)</h3>
                <span className="text-[11px] text-outline font-mono">ExcelJS Server Generator</span>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
              Includes check-in/out timestamps in Asia/Kolkata, session durations, staff IDs, department designations, and administrative adjustment notes.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-on-surface">Start Date</label>
                <input
                  type="date"
                  value={attStartDate}
                  onChange={(e) => setAttStartDate(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-xs px-2.5 py-1.5 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-on-surface">End Date</label>
                <input
                  type="date"
                  value={attEndDate}
                  onChange={(e) => setAttEndDate(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-xs px-2.5 py-1.5 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none mt-1"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/20">
            <Button
              size="sm"
              loading={downloadingAtt}
              onClick={handleDownloadAttendance}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Attendance Spreadsheet
            </Button>
          </div>
        </Card>

        {/* Work Reports Export Card */}
        <Card className="flex flex-col justify-between p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-sm">
                <FileSpreadsheet className="w-5 h-5 text-on-secondary-container" />
              </div>
              <div>
                <h3 className="font-bold text-base text-on-surface">Daily Work Reports (.xlsx)</h3>
                <span className="text-[11px] text-outline font-mono">ExcelJS Server Generator</span>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
              Includes logged duties, time spent, task linkages, submission status, and supervisor evaluation feedback across the organization.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-on-surface">Start Date</label>
                <input
                  type="date"
                  value={workStartDate}
                  onChange={(e) => setWorkStartDate(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-xs px-2.5 py-1.5 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-on-surface">End Date</label>
                <input
                  type="date"
                  value={workEndDate}
                  onChange={(e) => setWorkEndDate(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-xs px-2.5 py-1.5 rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none mt-1"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/20">
            <Button
              size="sm"
              variant="secondary"
              loading={downloadingWork}
              onClick={handleDownloadWorkReports}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Work Reports Spreadsheet
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
