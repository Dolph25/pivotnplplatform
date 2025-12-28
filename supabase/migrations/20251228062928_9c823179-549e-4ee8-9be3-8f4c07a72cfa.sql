-- Drop the existing policy with OR logic
DROP POLICY IF EXISTS "Investors can view own data" ON public.investors;

-- Create a strict policy that only allows users to view their own data
-- Admins are already covered by the "Admins can do everything on investors" policy
CREATE POLICY "Investors can view own data"
ON public.investors
FOR SELECT
TO authenticated
USING (user_id = auth.uid());