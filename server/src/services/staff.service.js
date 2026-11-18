const { supabaseAdmin, supabasePublic } = require('../config/supabase');

class StaffService {
  static async listStaff(scopedClient, { search, department_id, status, limit = 50, offset = 0 } = {}) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    let query = client
      .from('staff')
      .select(`
        id,
        staff_id,
        full_name,
        email,
        phone,
        designation,
        joining_date,
        employment_status,
        created_at,
        department:departments(id, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (department_id) {
      query = query.eq('department_id', department_id);
    }

    if (status) {
      query = query.eq('employment_status', status);
    }

    if (search) {
      const s = search.trim();
      query = query.or(`full_name.ilike.%${s}%,staff_id.ilike.%${s}%,email.ilike.%${s}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data, total: count, limit, offset };
  }

  static async getStaffById(scopedClient, id) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    const { data, error } = await client
      .from('staff')
      .select(`
        id,
        auth_user_id,
        staff_id,
        full_name,
        email,
        phone,
        designation,
        joining_date,
        employment_status,
        deactivated_at,
        created_at,
        updated_at,
        department:departments(id, name)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw {
        status: 404,
        code: 'STAFF_NOT_FOUND',
        message: 'Staff member record not found.'
      };
    }
    return data;
  }

  /**
   * Provision a staff member: creates Auth user, Profile, and Staff row atomically
   */
  static async createStaff(scopedClient, payload) {
    if (!supabaseAdmin) {
      throw {
        status: 500,
        code: 'SERVICE_ROLE_KEY_REQUIRED',
        message: 'SUPABASE_SERVICE_ROLE_KEY is required on the backend to provision staff credentials.'
      };
    }

    const normalizedStaffId = payload.staff_id.trim();
    const fullName = payload.full_name.trim();
    const email = payload.email?.trim() || null;
    const password = payload.password;

    // 1. Verify Staff ID is unique
    const { data: existingStaff } = await supabaseAdmin
      .from('staff')
      .select('id')
      .ilike('staff_id', normalizedStaffId)
      .maybeSingle();

    if (existingStaff) {
      throw {
        status: 400,
        code: 'STAFF_ID_TAKEN',
        message: `Staff ID "${normalizedStaffId}" is already assigned to another staff member.`
      };
    }

    // 2. Generate internal email identity for Supabase Auth if no institutional email provided
    const authEmail = email && email.includes('@')
      ? email.toLowerCase()
      : `staff.${normalizedStaffId.toLowerCase().replace(/[^a-z0-9]/g, '')}@vishvadaantrust.internal`;

    // 3. Create Supabase Auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        staff_id: normalizedStaffId,
        full_name: fullName,
        role: 'staff'
      }
    });

    if (authError) {
      throw {
        status: 400,
        code: 'AUTH_CREATION_FAILED',
        message: authError.message
      };
    }

    const authUserId = authUser.user.id;

    try {
      // 4. Create Profile row
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUserId,
          role: 'staff',
          display_name: fullName,
          is_active: true,
          theme_preference: 'light'
        });

      if (profileError) throw profileError;

      // 5. Create Staff record
      const { data: staffData, error: staffInsertError } = await supabaseAdmin
        .from('staff')
        .insert({
          auth_user_id: authUserId,
          staff_id: normalizedStaffId,
          full_name: fullName,
          email: email,
          phone: payload.phone?.trim() || null,
          department_id: payload.department_id || null,
          designation: payload.designation?.trim() || null,
          joining_date: payload.joining_date || null,
          employment_status: 'active'
        })
        .select(`
          id,
          staff_id,
          full_name,
          email,
          phone,
          designation,
          joining_date,
          employment_status,
          department:departments(id, name)
        `)
        .single();

      if (staffInsertError) throw staffInsertError;

      return staffData;
    } catch (cleanupError) {
      // Rollback auth user creation if database insert fails
      console.error('[Staff Provisioning Failed — Rolling Back Auth User]', cleanupError);
      await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(() => {});
      throw cleanupError;
    }
  }

  static async updateStaff(scopedClient, id, updates) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    const payload = {};
    if (updates.full_name !== undefined) payload.full_name = updates.full_name.trim();
    if (updates.email !== undefined) payload.email = updates.email?.trim() || null;
    if (updates.phone !== undefined) payload.phone = updates.phone?.trim() || null;
    if (updates.department_id !== undefined) payload.department_id = updates.department_id || null;
    if (updates.designation !== undefined) payload.designation = updates.designation?.trim() || null;
    if (updates.joining_date !== undefined) payload.joining_date = updates.joining_date || null;
    if (updates.employment_status !== undefined) payload.employment_status = updates.employment_status;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await client
      .from('staff')
      .update(payload)
      .eq('id', id)
      .select(`
        id,
        staff_id,
        full_name,
        email,
        phone,
        designation,
        joining_date,
        employment_status,
        department:departments(id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async deactivateStaff(scopedClient, id) {
    const client = scopedClient || supabaseAdmin || supabasePublic;
    const now = new Date().toISOString();

    const { data, error } = await client
      .from('staff')
      .update({
        employment_status: 'inactive',
        deactivated_at: now,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Also deactivate the profile to invalidate login sessions
    if (data.auth_user_id) {
      await (supabaseAdmin || client)
        .from('profiles')
        .update({ is_active: false, updated_at: now })
        .eq('id', data.auth_user_id);
    }

    return data;
  }

  static async resetStaffPassword(staffId, newPassword) {
    if (!supabaseAdmin) {
      throw {
        status: 500,
        code: 'SERVICE_ROLE_KEY_REQUIRED',
        message: 'SUPABASE_SERVICE_ROLE_KEY is required to reset staff passwords.'
      };
    }

    const { data: staff, error } = await supabaseAdmin
      .from('staff')
      .select('auth_user_id')
      .eq('id', staffId)
      .single();

    if (error || !staff) {
      throw {
        status: 404,
        code: 'STAFF_NOT_FOUND',
        message: 'Staff record not found.'
      };
    }

    const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(staff.auth_user_id, {
      password: newPassword
    });

    if (resetError) throw resetError;
    return { success: true };
  }
}

module.exports = StaffService;
