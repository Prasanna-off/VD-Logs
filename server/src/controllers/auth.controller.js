const AuthService = require('../services/auth.service');
const { supabasePublic } = require('../config/supabase');

class AuthController {
  static async staffLogin(req, res, next) {
    try {
      const { staff_id, password } = req.body;
      const result = await AuthService.loginStaff(staff_id, password);
      res.status(200).json({
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async adminLogin(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.loginAdmin(email, password);
      res.status(200).json({
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      res.status(200).json({
        data: {
          user: req.user,
          profile: req.profile,
          staff: req.staff || null
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { current_password, new_password } = req.body;
      await AuthService.changePassword(
        req.user.id,
        current_password,
        new_password,
        req.user.email
      );

      res.status(200).json({
        data: {
          message: 'Password changed successfully.'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { display_name, theme_preference } = req.body;
      const updates = {};
      if (display_name !== undefined) updates.display_name = display_name;
      if (theme_preference !== undefined) updates.theme_preference = theme_preference;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await req.scopedClient
        .from('profiles')
        .update(updates)
        .eq('id', req.user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.status(200).json({
        data: {
          profile: data
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      if (req.token) {
        await supabasePublic.auth.admin?.signOut(req.token).catch(() => {});
      }
      res.status(200).json({
        data: {
          message: 'Logged out successfully.'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
