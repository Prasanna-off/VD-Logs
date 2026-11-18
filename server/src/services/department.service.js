const { supabaseAdmin, supabasePublic } = require('../config/supabase');

class DepartmentService {
  static async listDepartments(scopedClient, includeInactive = false) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    let query = client
      .from('departments')
      .select('id, name, description, is_active, created_at, updated_at')
      .order('name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async createDepartment(scopedClient, { name, description }, adminProfileId) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    const trimmedName = name.trim();

    // Check case-insensitive uniqueness
    const { data: existing } = await client
      .from('departments')
      .select('id')
      .ilike('name', trimmedName)
      .maybeSingle();

    if (existing) {
      throw {
        status: 400,
        code: 'DUPLICATE_DEPARTMENT',
        message: `Department with name "${trimmedName}" already exists.`
      };
    }

    const { data, error } = await client
      .from('departments')
      .insert({
        name: trimmedName,
        description: description?.trim() || null,
        created_by: adminProfileId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateDepartment(scopedClient, id, updates) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.description !== undefined) payload.description = updates.description?.trim() || null;
    if (updates.is_active !== undefined) payload.is_active = updates.is_active;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await client
      .from('departments')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deactivateDepartment(scopedClient, id) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    // Check if active staff exist in this department
    const { data: staffInDept, error: staffError } = await client
      .from('staff')
      .select('id')
      .eq('department_id', id)
      .eq('employment_status', 'active');

    if (staffInDept && staffInDept.length > 0) {
      throw {
        status: 400,
        code: 'DEPARTMENT_HAS_ACTIVE_STAFF',
        message: `Cannot deactivate department while ${staffInDept.length} active staff member(s) belong to it. Reassign staff first.`
      };
    }

    const { data, error } = await client
      .from('departments')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = DepartmentService;
