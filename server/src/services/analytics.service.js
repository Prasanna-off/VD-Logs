const { supabaseAdmin, supabasePublic } = require('../config/supabase');

class AnalyticsService {
  static getKolkataTodayString() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  }

  /**
   * Get operational overview statistics strictly computed from PostgreSQL records
   */
  static async getOverviewMetrics(scopedClient) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    const today = this.getKolkataTodayString();

    // 1. Staff counts
    const { count: totalStaff, error: staffError } = await client
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('employment_status', 'active');

    // 2. Department counts
    const { count: totalDepartments, error: deptError } = await client
      .from('departments')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 3. Attendance counts for today
    const { data: todayAttendance, error: attError } = await client
      .from('attendance')
      .select('check_in_at, check_out_at')
      .eq('attendance_date', today);

    const presentToday = todayAttendance ? todayAttendance.length : 0;
    const currentlyWorking = todayAttendance ? todayAttendance.filter(a => a.check_in_at && !a.check_out_at).length : 0;
    const checkedOutToday = todayAttendance ? todayAttendance.filter(a => a.check_out_at !== null).length : 0;

    // 4. Task counts by status
    const { data: assignments, error: assignError } = await client
      .from('task_assignments')
      .select('status');

    const tasksPendingReview = assignments ? assignments.filter(a => a.status === 'submitted_for_review').length : 0;
    const tasksCompleted = assignments ? assignments.filter(a => a.status === 'completed').length : 0;
    const tasksInProgress = assignments ? assignments.filter(a => a.status === 'in_progress' || a.status === 'pending').length : 0;

    // 5. Work logs pending review
    const { count: workLogsPendingReview, error: workError } = await client
      .from('work_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted');

    // 6. Correction requests pending
    const { count: pendingCorrections, error: corrError } = await client
      .from('attendance_correction_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    return {
      totalStaff: totalStaff || 0,
      totalDepartments: totalDepartments || 0,
      presentToday,
      currentlyWorking,
      checkedOutToday,
      tasksPendingReview,
      tasksCompleted,
      tasksInProgress,
      workLogsPendingReview: workLogsPendingReview || 0,
      pendingCorrections: pendingCorrections || 0,
      todayDate: today
    };
  }

  /**
   * Get attendance trends over the last 14 days
   */
  static async getAttendanceTrends(scopedClient, days = 14) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    
    // Fetch recent attendance rows
    const { data, error } = await client
      .from('attendance')
      .select('attendance_date, check_in_at, check_out_at')
      .order('attendance_date', { ascending: true })
      .limit(500);

    if (error) throw error;

    // Aggregate counts by date
    const dateMap = {};
    if (data) {
      data.forEach(row => {
        if (!dateMap[row.attendance_date]) {
          dateMap[row.attendance_date] = { date: row.attendance_date, present: 0, completed: 0 };
        }
        dateMap[row.attendance_date].present += 1;
        if (row.check_out_at) {
          dateMap[row.attendance_date].completed += 1;
        }
      });
    }

    return Object.values(dateMap);
  }
}

module.exports = AnalyticsService;
