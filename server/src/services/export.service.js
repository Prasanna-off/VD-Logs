const ExcelJS = require('exceljs');
const { supabaseAdmin, supabasePublic } = require('../config/supabase');

class ExportService {
  /**
   * Helper to format UTC timestamps to IST string
   */
  static formatIST(utcDateString) {
    if (!utcDateString) return '—';
    return new Date(utcDateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true
    });
  }

  /**
   * Base styling for professional trust spreadsheets
   */
  static styleSheetHeaders(sheet, title, columns) {
    // Title row
    sheet.mergeCells(1, 1, 1, columns.length);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = `VISHVADAAN EDUCATIONAL AND CHARITABLE TRUST — ${title.toUpperCase()}`;
    titleCell.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F108E' } }; // #1f108e
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 30;

    // Generated at row
    sheet.mergeCells(2, 1, 2, columns.length);
    const metaCell = sheet.getCell(2, 1);
    metaCell.value = `Exported at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST) • Operational Ledger`;
    metaCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF464553' } };
    metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F3FF' } };
    metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(2).height = 20;

    // Empty row
    sheet.getRow(3).height = 10;

    // Table Header Row
    sheet.getRow(4).values = columns.map(c => c.header);
    sheet.getRow(4).height = 24;
    sheet.getRow(4).eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3730A3' } }; // #3730a3
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFC8C4D5' } },
        left: { style: 'thin', color: { argb: 'FFC8C4D5' } },
        bottom: { style: 'medium', color: { argb: 'FF1F108E' } },
        right: { style: 'thin', color: { argb: 'FFC8C4D5' } }
      };
    });

    // Set column widths
    columns.forEach((col, idx) => {
      sheet.getColumn(idx + 1).width = col.width || 18;
    });

    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4 }];
  }

  /**
   * Export Attendance Ledger to Excel
   */
  static async exportAttendance(scopedClient, { start_date, end_date, staff_id, department_id } = {}) {
    const client = scopedClient || supabaseAdmin || supabasePublic;

    let query = client
      .from('attendance')
      .select(`
        id,
        attendance_date,
        check_in_at,
        check_out_at,
        adjustment_reason,
        staff:staff(staff_id, full_name, department:departments(name), designation)
      `)
      .order('attendance_date', { ascending: false });

    if (start_date && end_date) {
      query = query.gte('attendance_date', start_date).lte('attendance_date', end_date);
    }
    if (staff_id) {
      query = query.eq('staff_id', staff_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Vishvadaan Trust VD Logs';
    const sheet = workbook.addWorksheet('Attendance Ledger');

    const columns = [
      { header: 'Working Date', width: 14 },
      { header: 'Staff ID', width: 15 },
      { header: 'Staff Name', width: 25 },
      { header: 'Department', width: 20 },
      { header: 'Designation', width: 18 },
      { header: 'Check In (IST)', width: 22 },
      { header: 'Check Out (IST)', width: 22 },
      { header: 'Session Status', width: 18 },
      { header: 'Adjustment Reason / Note', width: 35 }
    ];

    this.styleSheetHeaders(sheet, 'Attendance Ledger', columns);

    if (!data || data.length === 0) {
      const emptyRow = sheet.addRow(['No attendance records found for the selected criteria.', '', '', '', '', '', '', '', '']);
      emptyRow.font = { italic: true, color: { argb: 'FF777584' } };
    } else {
      data.forEach((row) => {
        const addedRow = sheet.addRow([
          row.attendance_date,
          row.staff?.staff_id || '—',
          row.staff?.full_name || '—',
          row.staff?.department?.name || '—',
          row.staff?.designation || 'Staff',
          this.formatIST(row.check_in_at),
          this.formatIST(row.check_out_at),
          row.check_out_at ? 'Completed' : 'Open (Currently Working)',
          row.adjustment_reason || '—'
        ]);

        addedRow.height = 20;
        addedRow.eachCell((cell) => {
          cell.font = { name: 'Arial', size: 9 };
          cell.alignment = { vertical: 'middle' };
          cell.border = {
            bottom: { style: 'thin', color: { argb: 'FFE2E7FF' } },
            left: { style: 'thin', color: { argb: 'FFE2E7FF' } },
            right: { style: 'thin', color: { argb: 'FFE2E7FF' } }
          };
        });
      });
    }

    return workbook;
  }

  /**
   * Export Work Reports to Excel
   */
  static async exportWorkReports(scopedClient, { start_date, end_date, staff_id, status } = {}) {
    const client = scopedClient || supabaseAdmin || supabasePublic;

    let query = client
      .from('work_logs')
      .select(`
        id,
        work_date,
        title,
        description,
        minutes_spent,
        status,
        review_comment,
        staff:staff(staff_id, full_name, department:departments(name)),
        assignment:task_assignments(task:tasks(title))
      `)
      .order('work_date', { ascending: false });

    if (start_date && end_date) {
      query = query.gte('work_date', start_date).lte('work_date', end_date);
    }
    if (staff_id) {
      query = query.eq('staff_id', staff_id);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Vishvadaan Trust VD Logs';
    const sheet = workbook.addWorksheet('Daily Work Reports');

    const columns = [
      { header: 'Work Date', width: 14 },
      { header: 'Staff ID', width: 15 },
      { header: 'Staff Name', width: 25 },
      { header: 'Department', width: 20 },
      { header: 'Log Title', width: 30 },
      { header: 'Minutes Spent', width: 15 },
      { header: 'Status', width: 16 },
      { header: 'Related Task', width: 25 },
      { header: 'Supervisor Evaluation', width: 35 }
    ];

    this.styleSheetHeaders(sheet, 'Daily Work Reports', columns);

    if (!data || data.length === 0) {
      const emptyRow = sheet.addRow(['No work logs found for the selected criteria.', '', '', '', '', '', '', '', '']);
      emptyRow.font = { italic: true, color: { argb: 'FF777584' } };
    } else {
      data.forEach((row) => {
        const addedRow = sheet.addRow([
          row.work_date,
          row.staff?.staff_id || '—',
          row.staff?.full_name || '—',
          row.staff?.department?.name || '—',
          row.title,
          row.minutes_spent || '—',
          row.status.toUpperCase(),
          row.assignment?.task?.title || 'General Duty',
          row.review_comment || '—'
        ]);

        addedRow.height = 20;
        addedRow.eachCell((cell) => {
          cell.font = { name: 'Arial', size: 9 };
          cell.alignment = { vertical: 'middle' };
          cell.border = {
            bottom: { style: 'thin', color: { argb: 'FFE2E7FF' } },
            left: { style: 'thin', color: { argb: 'FFE2E7FF' } },
            right: { style: 'thin', color: { argb: 'FFE2E7FF' } }
          };
        });
      });
    }

    return workbook;
  }
}

module.exports = ExportService;
