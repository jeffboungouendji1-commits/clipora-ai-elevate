
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.expire_due_subscriptions() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

DROP POLICY "plans_public_read" ON public.subscription_plans;
CREATE POLICY "plans_anon_read" ON public.subscription_plans FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "plans_auth_read" ON public.subscription_plans FOR SELECT TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(),'admin'));
