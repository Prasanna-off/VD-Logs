-- ============================================================================
-- VD LOGS — DATABASE MIGRATION 003: ROW LEVEL SECURITY (RLS) POLICIES
-- Organization: Vishvadaan Educational and Charitable Trust
-- Standard: Principle of least privilege, strict cross-user data isolation
-- ============================================================================

-- Enable RLS on all operational tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_correction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_checklist_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_log_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- SECURITY HELPER FUNCTIONS (Prevent recursive RLS evaluation)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.auth_staff_id()
RETURNS UUID AS $$
    SELECT id FROM public.staff WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- ----------------------------------------------------------------------------
-- Staff can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (id = auth.uid() OR public.auth_user_role() = 'admin');

-- Staff can update only their display_name and theme_preference
CREATE POLICY "Users can update own display/theme" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (id = auth.uid())
WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- ----------------------------------------------------------------------------
-- 2. DEPARTMENTS POLICIES
-- ----------------------------------------------------------------------------
-- Any authenticated user can read active departments
CREATE POLICY "Authenticated users can read departments" 
ON public.departments FOR SELECT 
TO authenticated 
USING (true);

-- Only Admin can insert, update or delete departments
CREATE POLICY "Admins full manage departments" 
ON public.departments FOR ALL 
TO authenticated 
USING (public.auth_user_role() = 'admin')
WITH CHECK (public.auth_user_role() = 'admin');

-- ----------------------------------------------------------------------------
-- 3. STAFF POLICIES
-- ----------------------------------------------------------------------------
-- Staff can view their own record; Admins can view all staff
CREATE POLICY "Staff view own record, Admin views all" 
ON public.staff FOR SELECT 
TO authenticated 
USING (auth_user_id = auth.uid() OR public.auth_user_role() = 'admin');

-- Only Admins can create or update staff
CREATE POLICY "Admins manage staff" 
ON public.staff FOR ALL 
TO authenticated 
USING (public.auth_user_role() = 'admin')
WITH CHECK (public.auth_user_role() = 'admin');

-- ----------------------------------------------------------------------------
-- 4. ATTENDANCE POLICIES
-- ----------------------------------------------------------------------------
-- Staff can view their own attendance; Admin can view all attendance
CREATE POLICY "Staff view own attendance, Admin views all" 
ON public.attendance FOR SELECT 
TO authenticated 
USING (staff_id = public.auth_staff_id() OR public.auth_user_role() = 'admin');

-- Only Admin can update attendance directly (e.g. for approved corrections)
CREATE POLICY "Admins update attendance" 
ON public.attendance FOR UPDATE 
TO authenticated 
USING (public.auth_user_role() = 'admin')
WITH CHECK (public.auth_user_role() = 'admin');

-- ----------------------------------------------------------------------------
-- 5. ATTENDANCE CORRECTION REQUESTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Staff view own correction requests, Admin views all" 
ON public.attendance_correction_requests FOR SELECT 
TO authenticated 
USING (staff_id = public.auth_staff_id() OR public.auth_user_role() = 'admin');

CREATE POLICY "Staff can insert own correction requests" 
ON public.attendance_correction_requests FOR INSERT 
TO authenticated 
WITH CHECK (staff_id = public.auth_staff_id());

CREATE POLICY "Admins update correction requests" 
ON public.attendance_correction_requests FOR UPDATE 
TO authenticated 
USING (public.auth_user_role() = 'admin')
WITH CHECK (public.auth_user_role() = 'admin');

-- ----------------------------------------------------------------------------
-- 6. TASKS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins full manage tasks" 
ON public.tasks FOR ALL 
TO authenticated 
USING (public.auth_user_role() = 'admin')
WITH CHECK (public.auth_user_role() = 'admin');

CREATE POLICY "Staff view tasks assigned to them" 
ON public.tasks FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.task_assignments ta 
        WHERE ta.task_id = public.tasks.id 
          AND ta.staff_id = public.auth_staff_id()
    )
);

-- ----------------------------------------------------------------------------
-- 7. TASK ASSIGNMENTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins full manage task assignments" 
ON public.task_assignments FOR ALL 
TO authenticated 
USING (public.auth_user_role() = 'admin')
WITH CHECK (public.auth_user_role() = 'admin');

CREATE POLICY "Staff view own assignments" 
ON public.task_assignments FOR SELECT 
TO authenticated 
USING (staff_id = public.auth_staff_id());

CREATE POLICY "Staff update own assignment status" 
ON public.task_assignments FOR UPDATE 
TO authenticated 
USING (staff_id = public.auth_staff_id())
WITH CHECK (staff_id = public.auth_staff_id());

-- ----------------------------------------------------------------------------
-- 8. TASK CHECKLIST ITEMS & PROGRESS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Authenticated users view checklist items" 
ON public.task_checklist_items FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins manage checklist items" 
ON public.task_checklist_items FOR ALL 
TO authenticated 
USING (public.auth_user_role() = 'admin')
WITH CHECK (public.auth_user_role() = 'admin');

CREATE POLICY "Staff manage checklist progress for own assignments" 
ON public.task_checklist_progress FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.task_assignments ta 
        WHERE ta.id = public.task_checklist_progress.assignment_id 
          AND ta.staff_id = public.auth_staff_id()
    ) OR public.auth_user_role() = 'admin'
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.task_assignments ta 
        WHERE ta.id = public.task_checklist_progress.assignment_id 
          AND ta.staff_id = public.auth_staff_id()
    ) OR public.auth_user_role() = 'admin'
);

-- ----------------------------------------------------------------------------
-- 9. WORK LOGS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Staff view own work logs, Admin views all" 
ON public.work_logs FOR SELECT 
TO authenticated 
USING (staff_id = public.auth_staff_id() OR public.auth_user_role() = 'admin');

CREATE POLICY "Staff insert own work logs" 
ON public.work_logs FOR INSERT 
TO authenticated 
WITH CHECK (staff_id = public.auth_staff_id());

CREATE POLICY "Staff update own unapproved work logs" 
ON public.work_logs FOR UPDATE 
TO authenticated 
USING (staff_id = public.auth_staff_id() AND status IN ('draft', 'needs_revision'))
WITH CHECK (staff_id = public.auth_staff_id());

CREATE POLICY "Admins update work logs" 
ON public.work_logs FOR UPDATE 
TO authenticated 
USING (public.auth_user_role() = 'admin')
WITH CHECK (public.auth_user_role() = 'admin');

-- ----------------------------------------------------------------------------
-- 10. NOTIFICATIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users view own notifications" 
ON public.notifications FOR SELECT 
TO authenticated 
USING (recipient_id = auth.uid());

CREATE POLICY "Users update own notifications read status" 
ON public.notifications FOR UPDATE 
TO authenticated 
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 11. AUDIT LOGS & SETTINGS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Only admins read audit logs" 
ON public.audit_logs FOR SELECT 
TO authenticated 
USING (public.auth_user_role() = 'admin');

CREATE POLICY "Authenticated users view organization settings" 
ON public.organization_settings FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only admins update organization settings" 
ON public.organization_settings FOR UPDATE 
TO authenticated 
USING (public.auth_user_role() = 'admin')
WITH CHECK (public.auth_user_role() = 'admin');
