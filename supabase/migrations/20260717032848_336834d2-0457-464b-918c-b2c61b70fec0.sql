
-- Lock down SECURITY DEFINER function
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Tighten notification insert (must have kind + title)
DROP POLICY IF EXISTS "notifications insert any" ON public.admin_notifications;
CREATE POLICY "notifications insert any"
  ON public.admin_notifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(coalesce(kind, '')) > 0
    AND length(coalesce(title, '')) > 0
    AND read = false
  );

-- Tighten notification update (only mark-as-read transitions)
DROP POLICY IF EXISTS "notifications admin update" ON public.admin_notifications;
CREATE POLICY "notifications admin update"
  ON public.admin_notifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.is_staff = true)
    )
  )
  WITH CHECK (
    read = true
    AND (read_by IS NULL OR read_by = auth.uid())
  );
