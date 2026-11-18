const { supabaseAdmin, supabasePublic } = require('../config/supabase');

class AttendanceService {
  /**
   * Helper to format current date in Asia/Kolkata
   */
  static getKolkataDateString(date = new Date()) {
    return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // returns YYYY-MM-DD
  }

  /**
   * Check in staff member atomically for today's local working day (Asia/Kolkata)
   */
  static async checkIn(scopedClient, staffId) {
    const client = scopedClient || supabaseAdmin || supabasePublic;

    // Use the database stored procedure if present, otherwise execute atomic check-and-insert
    try {
      const { data: rpcResult, error: rpcError } = await client.rpc('perform_staff_check_in', {
        p_staff_id: staffId
      });

      if (!rpcError && rpcResult) {
        if (!rpcResult.success) {
          throw {
            status: 400,
            code: rpcResult.code,
            message: rpcResult.message
          };
        }
        return rpcResult;
      }
    } catch (rpcErr) {
      if (rpcErr.code === 'ALREADY_CHECKED_IN' || rpcErr.status === 400) throw rpcErr;
      // Fallback to query-level check
    }

    const todayDate = this.getKolkataDateString();
    const nowUtc = new Date().toISOString();

    // Check if row exists for today
    const { data: existing } = await client
      .from('attendance')
      .select('id, check_in_at')
      .eq('staff_id', staffId)
      .eq('attendance_date', todayDate)
      .maybeSingle();

    if (existing) {
      throw {
        status: 400,
        code: 'ALREADY_CHECKED_IN',
        message: 'Attendance for today has already been registered.'
      };
    }

    const { data, error } = await client
      .from('attendance')
      .insert({
        staff_id: staffId,
        attendance_date: todayDate,
        check_in_at: nowUtc,
        original_check_in_at: nowUtc
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw {
          status: 400,
          code: 'ALREADY_CHECKED_IN',
          message: 'Attendance for today has already been registered.'
        };
      }
      throw error;
    }

    return {
      success: true,
      attendance_id: data.id,
      attendance_date: data.attendance_date,
      check_in_at: data.check_in_at
    };
  }

  /**
   * Check out staff member from active session
   */
  static async checkOut(scopedClient, staffId) {
    const client = scopedClient || supabaseAdmin || supabasePublic;

    try {
      const { data: rpcResult, error: rpcError } = await client.rpc('perform_staff_check_out', {
        p_staff_id: staffId
      });

      if (!rpcError && rpcResult) {
        if (!rpcResult.success) {
          throw {
            status: 400,
            code: rpcResult.code,
            message: rpcResult.message
          };
        }
        return rpcResult;
      }
    } catch (rpcErr) {
      if (rpcErr.code === 'NO_OPEN_CHECKIN' || rpcErr.status === 400) throw rpcErr;
    }

    const nowUtc = new Date().toISOString();

    // Find the latest open session (null check_out_at)
    const { data: openSession, error: lookupError } = await client
      .from('attendance')
      .select('id, attendance_date, check_in_at, check_out_at')
      .eq('staff_id', staffId)
      .is('check_out_at', null)
      .order('check_in_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError || !openSession) {
      throw {
        status: 400,
        code: 'NO_OPEN_CHECKIN',
        message: 'No active check-in session found to check out from.'
      };
    }

    const { data, error } = await client
      .from('attendance')
      .update({
        check_out_at: nowUtc,
        original_check_out_at: nowUtc,
        updated_at: nowUtc
      })
      .eq('id', openSession.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      attendance_id: data.id,
      attendance_date: data.attendance_date,
      check_in_at: data.check_in_at,
      check_out_at: data.check_out_at
    };
  }

  /**
   * Get attendance status of a staff member for today
   */
  static async getTodayStatus(scopedClient, staffId) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    const todayDate = this.getKolkataDateString();

    const { data, error } = await client
      .from('attendance')
      .select('id, attendance_date, check_in_at, check_out_at')
      .eq('staff_id', staffId)
      .eq('attendance_date', todayDate)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return { status: 'NOT_CHECKED_IN', record: null };
    }

    if (data.check_in_at && !data.check_out_at) {
      return { status: 'CURRENTLY_WORKING', record: data };
    }

    return { status: 'CHECKED_OUT', record: data };
  }

  /**
   * List staff member's own attendance history
   */
  static async getStaffAttendanceHistory(scopedClient, staffId, { limit = 30, offset = 0 } = {}) {
    const client = scopedClient || supabaseAdmin || supabasePublic;

    const { data, count, error } = await client
      .from('attendance')
      .select('id, attendance_date, check_in_at, check_out_at, adjustment_reason', { count: 'exact' })
      .eq('staff_id', staffId)
      .order('attendance_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, total: count, limit, offset };
  }

  /**
   * Admin: List organization attendance ledger
   */
  static async listAdminAttendance(scopedClient, { date, start_date, end_date, staff_id, department_id, incomplete_only, limit = 50, offset = 0 } = {}) {
    const client = scopedClient || supabaseAdmin || supabasePublic;

    let query = client
      .from('attendance')
      .select(`
        id,
        attendance_date,
        check_in_at,
        check_out_at,
        adjustment_reason,
        created_at,
        staff:staff(id, staff_id, full_name, designation, department:departments(id, name))
      `, { count: 'exact' })
      .order('attendance_date', { ascending: false })
      .order('check_in_at', { ascending: false });

    if (date) {
      query = query.eq('attendance_date', date);
    }
    if (start_date && end_date) {
      query = query.gte('attendance_date', start_date).lte('attendance_date', end_date);
    }
    if (staff_id) {
      query = query.eq('staff_id', staff_id);
    }
    if (incomplete_only === 'true') {
      query = query.is('check_out_at', null);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    // Filter department in-memory if requested
    let filtered = data;
    if (department_id) {
      filtered = data.filter(r => r.staff?.department?.id === department_id);
    }

    return { data: filtered, total: count, limit, offset };
  }

  /**
   * Submit correction request
   */
  static async submitCorrectionRequest(scopedClient, staffId, payload) {
    const client = scopedClient || supabaseAdmin || supabasePublic;

    const { data, error } = await client
      .from('attendance_correction_requests')
      .insert({
        staff_id: staffId,
        attendance_id: payload.attendance_id || null,
        attendance_date: payload.attendance_date,
        request_type: payload.request_type,
        proposed_check_in_at: payload.proposed_check_in_at || null,
        proposed_check_out_at: payload.proposed_check_out_at || null,
        reason: payload.reason,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * List correction requests
   */
  static async listCorrectionRequests(scopedClient, { staff_id, status } = {}) {
    const client = scopedClient || supabaseAdmin || supabasePublic;

    let query = client
      .from('attendance_correction_requests')
      .select(`
        id,
        attendance_id,
        attendance_date,
        request_type,
        proposed_check_in_at,
        proposed_check_out_at,
        reason,
        status,
        reviewed_at,
        review_comment,
        created_at,
        staff:staff(id, staff_id, full_name, department:departments(id, name))
      `)
      .order('created_at', { ascending: false });

    if (staff_id) {
      query = query.eq('staff_id', staff_id);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Admin: Review and decide on correction request
   */
  static async adjudicateCorrection(scopedClient, requestId, adminProfileId, { decision, review_comment, adjusted_check_in_at, adjusted_check_out_at }) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    const now = new Date().toISOString();

    const { data: request, error: reqError } = await client
      .from('attendance_correction_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (reqError || !request) {
      throw { status: 404, code: 'REQUEST_NOT_FOUND', message: 'Correction request not found.' };
    }

    if (request.status !== 'pending') {
      throw { status: 400, code: 'ALREADY_DECIDED', message: 'This request has already been adjudicated.' };
    }

    if (decision === 'approved') {
      const checkInToUse = adjusted_check_in_at || request.proposed_check_in_at;
      const checkOutToUse = adjusted_check_out_at || request.proposed_check_out_at;

      if (request.attendance_id) {
        // Update existing attendance row preserving original values
        await client
          .from('attendance')
          .update({
            check_in_at: checkInToUse,
            check_out_at: checkOutToUse || null,
            adjustment_reason: `Approved Correction #${requestId.slice(0, 8)}: ${review_comment || request.reason}`,
            last_adjusted_by: adminProfileId,
            last_adjusted_at: now,
            updated_at: now
          })
          .eq('id', request.attendance_id);
      } else {
        // Insert missing attendance row
        await client
          .from('attendance')
          .insert({
            staff_id: request.staff_id,
            attendance_date: request.attendance_date,
            check_in_at: checkInToUse || now,
            check_out_at: checkOutToUse || null,
            original_check_in_at: checkInToUse || now,
            original_check_out_at: checkOutToUse || null,
            adjustment_reason: `Approved Missing Session: ${review_comment || request.reason}`,
            last_adjusted_by: adminProfileId,
            last_adjusted_at: now
          });
      }
    }

    // Update request state
    const { data: updatedReq, error: updateError } = await client
      .from('attendance_correction_requests')
      .update({
        status: decision,
        reviewed_by: adminProfileId,
        reviewed_at: now,
        review_comment: review_comment || null
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedReq;
  }
}

module.exports = AttendanceService;
