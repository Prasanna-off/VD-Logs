const { supabaseAdmin, supabasePublic } = require('../config/supabase');

class TaskService {
  /**
   * Admin: Create a new task, assign staff, and build dynamic checklist items
   */
  static async createTask(scopedClient, adminProfileId, payload) {
    const client = scopedClient || supabaseAdmin || supabasePublic;

    // 1. Insert task
    const { data: task, error: taskError } = await client
      .from('tasks')
      .insert({
        title: payload.title.trim(),
        description: payload.description?.trim() || null,
        category: payload.category?.trim() || 'General',
        priority: payload.priority || 'medium',
        start_at: payload.start_at || null,
        due_at: payload.due_at || null,
        instructions: payload.instructions?.trim() || null,
        created_by: adminProfileId
      })
      .select()
      .single();

    if (taskError) throw taskError;

    // 2. Insert checklist items if provided
    let checklistItems = [];
    if (payload.checklist_items && payload.checklist_items.length > 0) {
      const itemsToInsert = payload.checklist_items.map((item, idx) => ({
        task_id: task.id,
        title: item.title.trim(),
        description: item.description?.trim() || null,
        sort_order: idx + 1,
        is_required: item.is_required !== false
      }));

      const { data: createdItems, error: itemsError } = await client
        .from('task_checklist_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) throw itemsError;
      checklistItems = createdItems;
    }

    // 3. Assign staff members
    if (payload.assigned_staff_ids && payload.assigned_staff_ids.length > 0) {
      const assignments = payload.assigned_staff_ids.map(staffId => ({
        task_id: task.id,
        staff_id: staffId,
        status: 'pending'
      }));

      const { data: createdAssignments, error: assignError } = await client
        .from('task_assignments')
        .insert(assignments)
        .select();

      if (assignError) throw assignError;

      // 4. Initialize checklist progress rows for each assignment
      if (checklistItems.length > 0) {
        const progressRows = [];
        for (const assign of createdAssignments) {
          for (const item of checklistItems) {
            progressRows.push({
              assignment_id: assign.id,
              checklist_item_id: item.id,
              is_completed: false
            });
          }
        }
        await client.from('task_checklist_progress').insert(progressRows);
      }
    }

    return task;
  }

  /**
   * Admin: List all tasks with assignments and progress summary
   */
  static async listAdminTasks(scopedClient, { status, priority, is_archived = false, limit = 50, offset = 0 } = {}) {
    const client = scopedClient || supabaseAdmin || supabasePublic;

    let query = client
      .from('tasks')
      .select(`
        id,
        title,
        description,
        category,
        priority,
        start_at,
        due_at,
        instructions,
        is_archived,
        created_at,
        assignments:task_assignments(
          id,
          status,
          submitted_at,
          reviewed_at,
          review_comment,
          staff:staff(id, staff_id, full_name, department:departments(name))
        ),
        checklist_items:task_checklist_items(id, title, is_required)
      `, { count: 'exact' })
      .eq('is_archived', is_archived)
      .order('created_at', { ascending: false });

    if (priority) {
      query = query.eq('priority', priority);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data, total: count, limit, offset };
  }

  /**
   * Staff: List tasks assigned to the authenticated staff member
   */
  static async listStaffTasks(scopedClient, staffId, { status } = {}) {
    const client = scopedClient || supabaseAdmin || supabasePublic;

    let query = client
      .from('task_assignments')
      .select(`
        id,
        status,
        submitted_at,
        reviewed_at,
        review_comment,
        created_at,
        task:tasks(
          id,
          title,
          description,
          category,
          priority,
          start_at,
          due_at,
          instructions
        )
      `)
      .eq('staff_id', staffId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Get full details of an assignment including interactive checklist
   */
  static async getAssignmentDetails(scopedClient, assignmentId, staffId = null) {
    const client = scopedClient || supabaseAdmin || supabasePublic;

    let query = client
      .from('task_assignments')
      .select(`
        id,
        task_id,
        staff_id,
        status,
        submitted_at,
        reviewed_at,
        review_comment,
        created_at,
        task:tasks(
          id,
          title,
          description,
          category,
          priority,
          start_at,
          due_at,
          instructions
        ),
        staff:staff(id, staff_id, full_name, designation),
        progress:task_checklist_progress(
          id,
          checklist_item_id,
          is_completed,
          completed_at,
          item:task_checklist_items(id, title, description, is_required, sort_order)
        )
      `)
      .eq('id', assignmentId)
      .single();

    const { data, error } = await query;
    if (error || !data) {
      throw { status: 404, code: 'ASSIGNMENT_NOT_FOUND', message: 'Task assignment not found.' };
    }

    // Ownership check for staff
    if (staffId && data.staff_id !== staffId) {
      throw { status: 403, code: 'FORBIDDEN', message: 'You can only view your own task assignments.' };
    }

    return data;
  }

  /**
   * Staff: Update checklist item completion
   */
  static async updateChecklistProgress(scopedClient, assignmentId, checklistItemId, staffId, isCompleted, profileId) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    const now = new Date().toISOString();

    // Verify assignment belongs to staff and is not in submitted/completed state
    const { data: assignment, error: assignError } = await client
      .from('task_assignments')
      .select('id, staff_id, status')
      .eq('id', assignmentId)
      .single();

    if (assignError || !assignment) {
      throw { status: 404, code: 'ASSIGNMENT_NOT_FOUND', message: 'Assignment not found.' };
    }

    if (assignment.staff_id !== staffId) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Not authorized for this assignment.' };
    }

    if (assignment.status === 'submitted_for_review' || assignment.status === 'completed') {
      throw { status: 400, code: 'LOCKED_STATE', message: 'Checklist cannot be modified while under review or completed.' };
    }

    // Upsert checklist progress
    const { data, error } = await client
      .from('task_checklist_progress')
      .update({
        is_completed: isCompleted,
        completed_by: isCompleted ? profileId : null,
        completed_at: isCompleted ? now : null
      })
      .eq('assignment_id', assignmentId)
      .eq('checklist_item_id', checklistItemId)
      .select()
      .single();

    if (error) throw error;

    // If assignment was pending, move to in_progress
    if (assignment.status === 'pending' || assignment.status === 'needs_revision') {
      await client
        .from('task_assignments')
        .update({ status: 'in_progress', updated_at: now })
        .eq('id', assignmentId);
    }

    return data;
  }

  /**
   * Staff: Submit task assignment for Admin review
   */
  static async submitAssignmentForReview(scopedClient, assignmentId, staffId, submissionNotes) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    const now = new Date().toISOString();

    const { data: assignment, error: assignError } = await client
      .from('task_assignments')
      .select('id, staff_id, status')
      .eq('id', assignmentId)
      .single();

    if (assignError || !assignment) {
      throw { status: 404, code: 'ASSIGNMENT_NOT_FOUND', message: 'Assignment not found.' };
    }

    if (assignment.staff_id !== staffId) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Not authorized for this assignment.' };
    }

    if (assignment.status === 'completed') {
      throw { status: 400, code: 'ALREADY_COMPLETED', message: 'Task assignment has already been approved.' };
    }

    const { data, error } = await client
      .from('task_assignments')
      .update({
        status: 'submitted_for_review',
        submitted_at: now,
        review_comment: submissionNotes ? `Staff Submission Note: ${submissionNotes}` : null,
        updated_at: now
      })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Admin: Approve or Request Revision on task assignment
   */
  static async adjudicateTaskAssignment(scopedClient, assignmentId, adminProfileId, { decision, review_comment }) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    const now = new Date().toISOString();

    const { data: assignment, error: assignError } = await client
      .from('task_assignments')
      .select('id, status, staff_id, task_id')
      .eq('id', assignmentId)
      .single();

    if (assignError || !assignment) {
      throw { status: 404, code: 'ASSIGNMENT_NOT_FOUND', message: 'Assignment not found.' };
    }

    const newStatus = decision === 'completed' ? 'completed' : 'needs_revision';

    const { data, error } = await client
      .from('task_assignments')
      .update({
        status: newStatus,
        reviewed_by: adminProfileId,
        reviewed_at: now,
        review_comment: review_comment || null,
        updated_at: now
      })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = TaskService;
