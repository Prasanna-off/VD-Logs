-- ============================================================================
-- VD LOGS — DATABASE MIGRATION 002: STORED PROCEDURES & ATOMIC FUNCTIONS
-- Organization: Vishvadaan Educational and Charitable Trust
-- Standard: Asia/Kolkata date handling, atomic check-in/out, duplicate guards
-- ============================================================================

-- Function to get the current date in Asia/Kolkata
CREATE OR REPLACE FUNCTION public.get_kolkata_today()
RETURNS DATE AS $$
BEGIN
    RETURN (timezone('Asia/Kolkata'::text, now()))::DATE;
END;
$$ LANGUAGE plpgsql STABLE;

-- ----------------------------------------------------------------------------
-- 1. ATOMIC CHECK-IN FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.perform_staff_check_in(p_staff_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_today DATE;
    v_now TIMESTAMPTZ;
    v_attendance_id UUID;
    v_existing_id UUID;
BEGIN
    v_today := public.get_kolkata_today();
    v_now := timezone('utc'::text, now());

    -- Check if record already exists for today
    SELECT id INTO v_existing_id 
    FROM public.attendance 
    WHERE staff_id = p_staff_id AND attendance_date = v_today;

    IF v_existing_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'ALREADY_CHECKED_IN',
            'message', 'Attendance for today has already been registered.'
        );
    END IF;

    -- Insert new check-in
    INSERT INTO public.attendance (
        staff_id,
        attendance_date,
        check_in_at,
        original_check_in_at
    ) VALUES (
        p_staff_id,
        v_today,
        v_now,
        v_now
    ) RETURNING id INTO v_attendance_id;

    RETURN jsonb_build_object(
        'success', true,
        'attendance_id', v_attendance_id,
        'attendance_date', v_today,
        'check_in_at', v_now
    );
EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object(
        'success', false,
        'code', 'CONCURRENT_CHECK_IN',
        'message', 'A check-in operation for today was already recorded.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 2. ATOMIC CHECK-OUT FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.perform_staff_check_out(p_staff_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_now TIMESTAMPTZ;
    v_attendance_rec RECORD;
BEGIN
    v_now := timezone('utc'::text, now());

    -- Find open check-in session for this staff (latest row with null check_out_at)
    SELECT * INTO v_attendance_rec
    FROM public.attendance
    WHERE staff_id = p_staff_id AND check_out_at IS NULL
    ORDER BY check_in_at DESC
    LIMIT 1
    FOR UPDATE;

    IF v_attendance_rec.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'NO_OPEN_CHECKIN',
            'message', 'No active check-in session found to check out from.'
        );
    END IF;

    -- Update checkout timestamp
    UPDATE public.attendance
    SET check_out_at = v_now,
        original_check_out_at = COALESCE(original_check_out_at, v_now),
        updated_at = v_now
    WHERE id = v_attendance_rec.id;

    RETURN jsonb_build_object(
        'success', true,
        'attendance_id', v_attendance_rec.id,
        'attendance_date', v_attendance_rec.attendance_date,
        'check_in_at', v_attendance_rec.check_in_at,
        'check_out_at', v_now
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 3. PROVISION ADMIN PROFILE HELPER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.provision_initial_admin(
    p_auth_user_id UUID,
    p_display_name TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.profiles (id, role, display_name, is_active)
    VALUES (p_auth_user_id, 'admin', p_display_name, true)
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin',
        is_active = true,
        display_name = EXCLUDED.display_name,
        updated_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
