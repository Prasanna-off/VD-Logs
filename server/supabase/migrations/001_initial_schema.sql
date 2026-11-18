-- ============================================================================
-- VD LOGS — DATABASE MIGRATION 001: CORE TABLES & CONSTRAINTS
-- Organization: Vishvadaan Educational and Charitable Trust
-- Database: Supabase PostgreSQL
-- Timezone Standard: UTC storage, Asia/Kolkata operational context
-- ============================================================================

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked directly to Supabase Auth auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
    display_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 2. DEPARTMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Case-insensitive unique department name
CREATE UNIQUE INDEX IF NOT EXISTS idx_departments_unique_name 
ON public.departments (lower(trim(name)));

-- ----------------------------------------------------------------------------
-- 3. STAFF TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE RESTRICT,
    staff_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE RESTRICT,
    designation TEXT,
    joining_date DATE,
    employment_status TEXT NOT NULL DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'left')),
    deactivated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for searching staff by staff_id case-insensitively
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_unique_staff_id 
ON public.staff (lower(trim(staff_id)));

CREATE INDEX IF NOT EXISTS idx_staff_department_status 
ON public.staff (department_id, employment_status);

-- ----------------------------------------------------------------------------
-- 4. ATTENDANCE TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE RESTRICT,
    attendance_date DATE NOT NULL, -- Asia/Kolkata date calculated server/db side
    check_in_at TIMESTAMPTZ NOT NULL,
    check_out_at TIMESTAMPTZ,
    original_check_in_at TIMESTAMPTZ,
    original_check_out_at TIMESTAMPTZ,
    adjustment_reason TEXT,
    last_adjusted_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    last_adjusted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_staff_attendance_date UNIQUE (staff_id, attendance_date),
    CONSTRAINT chk_checkout_after_checkin CHECK (check_out_at IS NULL OR check_out_at >= check_in_at)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date 
ON public.attendance (attendance_date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_staff_date 
ON public.attendance (staff_id, attendance_date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_checkin 
ON public.attendance (check_in_at DESC);

-- ----------------------------------------------------------------------------
-- 5. ATTENDANCE CORRECTION REQUESTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_correction_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_id UUID REFERENCES public.attendance(id) ON DELETE RESTRICT,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE RESTRICT,
    attendance_date DATE NOT NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('missing_check_in', 'missing_check_out', 'incorrect_check_in', 'incorrect_check_out', 'other')),
    proposed_check_in_at TIMESTAMPTZ,
    proposed_check_out_at TIMESTAMPTZ,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    reviewed_at TIMESTAMPTZ,
    review_comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_correction_staff_status 
ON public.attendance_correction_requests (staff_id, status);

CREATE INDEX IF NOT EXISTS idx_correction_status 
ON public.attendance_correction_requests (status, created_at DESC);

-- ----------------------------------------------------------------------------
-- 6. TASKS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    start_at TIMESTAMPTZ,
    due_at TIMESTAMPTZ,
    instructions TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_due_after_start CHECK (due_at IS NULL OR start_at IS NULL OR due_at >= start_at)
);

CREATE INDEX IF NOT EXISTS idx_tasks_due_archived 
ON public.tasks (due_at, is_archived);

-- ----------------------------------------------------------------------------
-- 7. TASK ASSIGNMENTS TABLE (Staff-Task bridge)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted_for_review', 'completed', 'needs_revision')),
    submitted_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    reviewed_at TIMESTAMPTZ,
    review_comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_task_staff_assignment UNIQUE (task_id, staff_id)
);

CREATE INDEX IF NOT EXISTS idx_task_assignments_staff_status 
ON public.task_assignments (staff_id, status);

-- ----------------------------------------------------------------------------
-- 8. TASK CHECKLIST ITEMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_checklist_task_order 
ON public.task_checklist_items (task_id, sort_order ASC);

-- ----------------------------------------------------------------------------
-- 9. TASK CHECKLIST PROGRESS TABLE (Per-assignment progress)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_checklist_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.task_assignments(id) ON DELETE CASCADE,
    checklist_item_id UUID NOT NULL REFERENCES public.task_checklist_items(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    completed_at TIMESTAMPTZ,
    CONSTRAINT uq_assignment_checklist_item UNIQUE (assignment_id, checklist_item_id)
);

CREATE INDEX IF NOT EXISTS idx_checklist_progress_assignment 
ON public.task_checklist_progress (assignment_id);

-- ----------------------------------------------------------------------------
-- 10. TASK ACTIVITY LOGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.task_assignments(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 11. WORK LOGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.work_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE RESTRICT,
    work_date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    related_task_assignment_id UUID REFERENCES public.task_assignments(id) ON DELETE SET NULL,
    minutes_spent INTEGER CHECK (minutes_spent IS NULL OR minutes_spent >= 0),
    additional_notes TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'needs_revision')),
    submitted_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    reviewed_at TIMESTAMPTZ,
    review_comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_work_logs_staff_date_status 
ON public.work_logs (staff_id, work_date DESC, status);

-- ----------------------------------------------------------------------------
-- 12. WORK LOG ATTACHMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.work_log_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_log_id UUID NOT NULL REFERENCES public.work_logs(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT,
    size_bytes BIGINT,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 13. NOTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    related_entity_type TEXT,
    related_entity_id UUID,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient 
ON public.notifications (recipient_id, read_at, created_at DESC);

-- ----------------------------------------------------------------------------
-- 14. AUDIT LOGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    before_data JSONB,
    after_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created 
ON public.audit_logs (created_at DESC, actor_id);

-- ----------------------------------------------------------------------------
-- 15. ORGANIZATION SETTINGS TABLE (Single configuration row)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    work_start_time TIME DEFAULT '09:00:00',
    work_end_time TIME DEFAULT '17:30:00',
    late_grace_minutes INTEGER NOT NULL DEFAULT 15 CHECK (late_grace_minutes >= 0),
    attendance_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insert initial organization settings row if not present
INSERT INTO public.organization_settings (organization_name, timezone, work_start_time, work_end_time, late_grace_minutes)
SELECT 'Vishvadaan Educational and Charitable Trust', 'Asia/Kolkata', '09:00:00', '17:30:00', 15
WHERE NOT EXISTS (SELECT 1 FROM public.organization_settings);
