const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { supabaseAdmin, supabasePublic } = require('../config/supabase');

router.use(requireAuth);

// GET organization settings (accessible to all authenticated users)
router.get('/', async (req, res, next) => {
  try {
    const client = req.scopedClient || supabaseAdmin || supabasePublic;
    const { data, error } = await client
      .from('organization_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
});

// PATCH organization settings (Admin only)
router.patch('/', requireRole('admin'), async (req, res, next) => {
  try {
    const client = req.scopedClient || supabaseAdmin || supabasePublic;
    const { organization_name, timezone, work_start_time, work_end_time, late_grace_minutes } = req.body;

    const updates = {};
    if (organization_name) updates.organization_name = organization_name.trim();
    if (timezone) updates.timezone = timezone.trim();
    if (work_start_time) updates.work_start_time = work_start_time;
    if (work_end_time) updates.work_end_time = work_end_time;
    if (late_grace_minutes !== undefined) updates.late_grace_minutes = parseInt(late_grace_minutes, 10);
    updates.updated_by = req.user.id;
    updates.updated_at = new Date().toISOString();

    // Check if row exists
    const { data: existing } = await client.from('organization_settings').select('id').limit(1).maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await client
        .from('organization_settings')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await client
        .from('organization_settings')
        .insert({
          organization_name: updates.organization_name || 'Vishvadaan Educational and Charitable Trust',
          timezone: updates.timezone || 'Asia/Kolkata',
          ...updates
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
