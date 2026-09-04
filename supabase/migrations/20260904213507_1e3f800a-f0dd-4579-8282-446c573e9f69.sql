
CREATE TABLE public.generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('script','video')),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','refunded')),
  prompt text NOT NULL,
  model text,
  provider_job_id text,
  credits_cost integer NOT NULL DEFAULT 0,
  credits_refunded boolean NOT NULL DEFAULT false,
  result_text text,
  storage_path text,
  duration_seconds integer,
  resolution text,
  aspect_ratio text,
  error_message text,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX generation_jobs_user_created_idx ON public.generation_jobs (user_id, created_at DESC);

GRANT SELECT ON public.generation_jobs TO authenticated;
GRANT ALL ON public.generation_jobs TO service_role;

ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY generation_jobs_select_own ON public.generation_jobs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER t_generation_jobs_upd BEFORE UPDATE ON public.generation_jobs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.refund_credits(_user_id uuid, _amount integer, _reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE new_balance integer;
BEGIN
  UPDATE public.user_credits
     SET balance = balance + _amount,
         used_this_period = GREATEST(used_this_period - _amount, 0),
         updated_at = now()
   WHERE user_id = _user_id
  RETURNING balance INTO new_balance;

  IF new_balance IS NULL THEN
    RETURN jsonb_build_object('ok', false);
  END IF;

  INSERT INTO public.credit_ledger (user_id, delta, reason) VALUES (_user_id, _amount, _reason);
  RETURN jsonb_build_object('ok', true, 'balance', new_balance);
END; $$;

REVOKE ALL ON FUNCTION public.refund_credits(uuid, integer, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refund_credits(uuid, integer, text) FROM anon;
REVOKE ALL ON FUNCTION public.refund_credits(uuid, integer, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.refund_credits(uuid, integer, text) TO service_role;

CREATE POLICY "generations_read_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'generations' AND (storage.foldername(name))[1] = auth.uid()::text);
