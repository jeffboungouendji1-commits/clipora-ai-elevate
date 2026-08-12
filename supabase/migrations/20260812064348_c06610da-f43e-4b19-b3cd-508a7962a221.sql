
CREATE OR REPLACE FUNCTION public.deduct_credits(_user_id uuid, _amount integer, _reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_balance integer;
BEGIN
  UPDATE public.user_credits
     SET balance = balance - _amount,
         used_this_period = used_this_period + _amount,
         updated_at = now()
   WHERE user_id = _user_id AND balance >= _amount
  RETURNING balance INTO new_balance;

  IF new_balance IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'balance', COALESCE((SELECT balance FROM public.user_credits WHERE user_id = _user_id), 0));
  END IF;

  INSERT INTO public.credit_ledger (user_id, delta, reason) VALUES (_user_id, -_amount, _reason);
  RETURN jsonb_build_object('ok', true, 'balance', new_balance);
END; $$;

REVOKE ALL ON FUNCTION public.deduct_credits(uuid, integer, text) FROM PUBLIC, anon, authenticated;
