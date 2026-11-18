const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { supabaseAdmin, supabasePublic } = require('../config/supabase');

router.use(requireAuth, requireRole('admin'));

// GET system audit and activity logs
router.get('/', async (req, res, next) => {
  try {
    const client = req.scopedClient || supabaseAdmin || supabasePublic;
    const { limit = 50, offset = 0 } = req.query;

    const { data, count, error } = await client
      .from('audit_logs')
      .select(`
        id,
        action,
        entity_type,
        entity_id,
        before_data,
        after_data,
        created_at,
        actor:profiles(id, display_name, role)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(parseInt(offset, 10), parseInt(offset, 10) + parseInt(limit, 10) - 1);

    if (error) throw error;
    res.status(200).json({ data, meta: { total: count, limit: parseInt(limit, 10), offset: parseInt(offset, 10) } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
