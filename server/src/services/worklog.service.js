const { supabaseAdmin, supabasePublic } = require('../config/supabase');

class WorkLogService {
  /**
   * Staff: Create work log as draft or direct submission
   */
  static async createWorkLog(scopedClient, staffId, payload) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    const now = new Date().toISOString();
    const status = payload.is_submitted ? 'submitted' : 'draft';

    const { data, error } = await client
      .from('work_logs')
      .insert({
        staff_id: staffId,
        work_date: payload.work_date,
        title: payload.title.trim(),
        description: payload.description.trim(),
        related_task_assignment_id: payload.related_task_assignment_id || null,
        minutes_spent: payload.minutes_spent ? parseInt(payload.minutes_spent, 10) : null,
        additional_notes: payload.additional_notes?.trim() || null,
        status,
        submitted_at: payload.is_submitted ? now : null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Staff: Update work log (only permitted when draft or needs_revision)
   */
  static async updateWorkLog(scopedClient, logId, staffId, payload) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    const now = new Date().toISOString();

    const { data: existing, error: findError } = await client
      .from('work_logs')
      .select('id, staff_id, status')
      .eq('id', logId)
      .single();

    if (findError || !existing) {
      throw { status: 404, code: 'WORK_LOG_NOT_FOUND', message: 'Work log not found.' };
    }

    if (existing.staff_id !== staffId) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Not authorized to edit this work log.' };
    }

    if (existing.status === 'approved') {
      throw { status: 400, code: 'CANNOT_EDIT_APPROVED', message: 'Approved work logs cannot be edited.' };
    }

    const updates = {};
    if (payload.title !== undefined) updates.title = payload.title.trim();
    if (payload.description !== undefined) updates.description = payload.description.trim();
    if (payload.related_task_assignment_id !== undefined) updates.related_task_assignment_id = payload.related_task_assignment_id || null;
    if (payload.minutes_spent !== undefined) updates.minutes_spent = payload.minutes_spent ? parseInt(payload.minutes_spent, 10) : null;
    if (payload.additional_notes !== undefined) updates.additional_notes = payload.additional_notes?.trim() || null;
    if (payload.is_submitted) {
      updates.status = 'submitted';
      updates.submitted_at = now;
    }
    updates.updated_at = now;

    const { data, error } = await client
      .from('work_logs')
      .update(updates)
      .eq('id', logId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Staff: List own work logs
   */
  static async listMyWorkLogs(scopedClient, staffId, { status } = {}) {
    const client = scopedClient || supabaseAdmin || supabasePublic;

    let query = client
      .from('work_logs')
      .select(`
        id,
        work_date,
        title,
        description,
        minutes_spent,
        additional_notes,
        status,
        submitted_at,
        reviewed_at,
        review_comment,
        created_at,
        assignment:task_assignments(
          id,
          task:tasks(id, title)
        )
      `)
      .eq('staff_id', staffId)
      .order('work_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Admin: List all work reports across the trust
   */
  static async listAdminWorkLogs(scopedClient, { status, staff_id, date, start_date, end_date, limit = 50, offset = 0 } = {}) {
    const client = scopedClient || supabaseAdmin || supabasePublic;

    let query = client
      .from('work_logs')
      .select(`
        id,
        work_date,
        title,
        description,
        minutes_spent,
        additional_notes,
        status,
        submitted_at,
        reviewed_at,
        review_comment,
        created_at,
        staff:staff(id, staff_id, full_name, department:departments(name)),
        assignment:task_assignments(
          id,
          task:tasks(id, title)
        )
      `, { count: 'exact' })
      .order('work_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (staff_id) {
      query = query.eq('staff_id', staff_id);
    }
    if (date) {
      query = query.eq('work_date', date);
    }
    if (start_date && end_date) {
      query = query.gte('work_date', start_date).lte('work_date', end_date);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data, total: count, limit, offset };
  }

  /**
   * Admin: Review work report (Approve or Request Revision)
   */
  static async adjudicateWorkLog(scopedClient, logId, adminProfileId, { decision, review_comment }) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    const now = new Date().toISOString();

    const { data: existing, error: findError } = await client
      .from('work_logs')
      .select('id, status')
      .eq('id', logId)
      .single();

    if (findError || !existing) {
      throw { status: 404, code: 'WORK_LOG_NOT_FOUND', message: 'Work log not found.' };
    }

    const newStatus = decision === 'approved' ? 'approved' : 'needs_revision';

    const { data, error } = await client
      .from('work_logs')
      .update({
        status: newStatus,
        reviewed_by: adminProfileId,
        reviewed_at: now,
        review_comment: review_comment || null,
        updated_at: now
      })
      .eq('id', logId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = WorkLogService;
