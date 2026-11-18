const { supabasePublic, supabaseAdmin, createScopedClient } = require('../config/supabase');

/**
 * Middleware to authenticate requests via Supabase JWT
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token missing or invalid.'
        }
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase Auth
    const { data: { user }, error: authError } = await supabasePublic.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Session expired or token is invalid.'
        }
      });
    }

    // Attach basic auth info to request
    req.user = user;
    req.token = token;
    req.scopedClient = createScopedClient(token);

    // Retrieve user's application profile & role
    const client = supabaseAdmin || supabasePublic;
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('id, role, display_name, is_active, theme_preference')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'User profile does not exist or has been removed.'
        }
      });
    }

    if (!profile.is_active) {
      return res.status(403).json({
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'This account has been deactivated. Please contact the administrator.'
        }
      });
    }

    req.profile = profile;

    // If staff, also resolve their staff record
    if (profile.role === 'staff') {
      const { data: staff, error: staffError } = await client
        .from('staff')
        .select('id, staff_id, full_name, email, department_id, designation, employment_status')
        .eq('auth_user_id', user.id)
        .single();

      if (staffError || !staff) {
        return res.status(403).json({
          error: {
            code: 'STAFF_RECORD_NOT_FOUND',
            message: 'Associated staff record not found.'
          }
        });
      }

      if (staff.employment_status !== 'active') {
        return res.status(403).json({
          error: {
            code: 'ACCOUNT_DEACTIVATED',
            message: 'Your employment status is inactive. Please contact the administrator.'
          }
        });
      }

      req.staff = staff;
    }

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_AUTH_ERROR',
        message: 'Failed to authenticate user.'
      }
    });
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles Allowed roles ('admin', 'staff')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.profile || !roles.includes(req.profile.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.'
        }
      });
    }
    next();
  };
};

module.exports = {
  requireAuth,
  requireRole
};
