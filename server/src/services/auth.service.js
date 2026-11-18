const { supabasePublic, supabaseAdmin } = require('../config/supabase');

class AuthService {
  /**
   * Resolve Staff ID to internal email identity and authenticate with Supabase Auth
   */
  static async loginStaff(staffId, password) {
    const normalizedStaffId = staffId.trim();

    // Query staff record using case-insensitive staff_id match
    const client = supabaseAdmin || supabasePublic;
    const { data: staffRecord, error: staffLookupError } = await client
      .from('staff')
      .select('id, staff_id, auth_user_id, full_name, email, employment_status, department_id, designation')
      .ilike('staff_id', normalizedStaffId)
      .maybeSingle();

    if (staffLookupError || !staffRecord) {
      // PRD Security: Generic authentication error to avoid user enumeration
      throw {
        status: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid Staff ID or password.'
      };
    }

    if (staffRecord.employment_status !== 'active') {
      throw {
        status: 403,
        code: 'ACCOUNT_DEACTIVATED',
        message: 'This staff account is currently deactivated.'
      };
    }

    // Lookup profile
    const { data: profileRecord, error: profileError } = await client
      .from('profiles')
      .select('id, role, display_name, is_active, theme_preference')
      .eq('id', staffRecord.auth_user_id)
      .single();

    if (profileError || !profileRecord || !profileRecord.is_active) {
      throw {
        status: 403,
        code: 'ACCOUNT_DEACTIVATED',
        message: 'This account is currently deactivated.'
      };
    }

    // Determine internal email identity for Supabase Auth
    // If staff has an email, use it; otherwise use internal alias: staff.<staff_id_lowercase>@vishvadaantrust.internal
    const internalEmail = staffRecord.email && staffRecord.email.includes('@')
      ? staffRecord.email
      : `staff.${normalizedStaffId.toLowerCase().replace(/[^a-z0-9]/g, '')}@vishvadaantrust.internal`;

    // Attempt Supabase Auth password sign-in
    const { data: sessionData, error: authError } = await supabasePublic.auth.signInWithPassword({
      email: internalEmail,
      password: password
    });

    if (authError || !sessionData.session) {
      // Check if fallback email format was used during provisioning
      const fallbackEmail = `staff.${staffRecord.id}@vishvadaantrust.internal`;
      if (internalEmail !== fallbackEmail) {
        const { data: retryData, error: retryError } = await supabasePublic.auth.signInWithPassword({
          email: fallbackEmail,
          password: password
        });

        if (!retryError && retryData.session) {
          return {
            session: retryData.session,
            user: {
              id: profileRecord.id,
              staff_id: staffRecord.staff_id,
              full_name: staffRecord.full_name,
              role: profileRecord.role,
              designation: staffRecord.designation,
              department_id: staffRecord.department_id,
              theme_preference: profileRecord.theme_preference
            }
          };
        }
      }

      throw {
        status: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid Staff ID or password.'
      };
    }

    return {
      session: sessionData.session,
      user: {
        id: profileRecord.id,
        staff_id: staffRecord.staff_id,
        full_name: staffRecord.full_name,
        role: profileRecord.role,
        designation: staffRecord.designation,
        department_id: staffRecord.department_id,
        theme_preference: profileRecord.theme_preference
      }
    };
  }

  /**
   * Admin login using email and password
   */
  static async loginAdmin(email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    const { data: sessionData, error: authError } = await supabasePublic.auth.signInWithPassword({
      email: normalizedEmail,
      password: password
    });

    if (authError || !sessionData.session) {
      throw {
        status: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid administrative email or password.'
      };
    }

    // Verify role is admin
    const client = supabaseAdmin || supabasePublic;
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('id, role, display_name, is_active, theme_preference')
      .eq('id', sessionData.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin' || !profile.is_active) {
      throw {
        status: 403,
        code: 'ACCESS_DENIED',
        message: 'You do not have administrative privileges.'
      };
    }

    return {
      session: sessionData.session,
      user: {
        id: profile.id,
        email: sessionData.user.email,
        display_name: profile.display_name,
        role: profile.role,
        theme_preference: profile.theme_preference
      }
    };
  }

  /**
   * Change password for the currently authenticated user
   */
  static async changePassword(userId, currentPassword, newPassword, userEmail) {
    // Re-verify current credentials
    if (userEmail) {
      const { error: verifyError } = await supabasePublic.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword
      });

      if (verifyError) {
        throw {
          status: 400,
          code: 'INCORRECT_CURRENT_PASSWORD',
          message: 'The current password provided is incorrect.'
        };
      }
    }

    // Update to new password via admin client or auth
    const client = supabaseAdmin || supabasePublic;
    if (supabaseAdmin) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword
      });
      if (updateError) {
        throw {
          status: 500,
          code: 'PASSWORD_UPDATE_FAILED',
          message: updateError.message
        };
      }
    } else {
      const { error: updateError } = await supabasePublic.auth.updateUser({
        password: newPassword
      });
      if (updateError) {
        throw {
          status: 500,
          code: 'PASSWORD_UPDATE_FAILED',
          message: updateError.message
        };
      }
    }

    return { success: true };
  }
}

module.exports = AuthService;
