-- Fix the overly permissive INSERT policy on scan_results
-- This should only allow authenticated users with verified scan ownership
DROP POLICY IF EXISTS "Service role can insert results" ON public.scan_results;

-- Create a proper INSERT policy that checks scan ownership
CREATE POLICY "Users can create results for their scans"
  ON public.scan_results FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.scans
    WHERE scans.id = scan_results.scan_id
    AND scans.user_id = auth.uid()
  ));