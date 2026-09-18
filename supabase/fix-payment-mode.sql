-- Allow users to enter any non-empty payment mode text.
-- Run this once in the Supabase SQL Editor.

alter table public.payment_requests
  drop constraint if exists payment_requests_payment_mode_check;
