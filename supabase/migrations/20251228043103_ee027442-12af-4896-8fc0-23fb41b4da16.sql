-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
);

-- Storage policies for documents bucket
CREATE POLICY "Admins can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Create storage bucket for data imports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imports', 
  'imports', 
  false,
  104857600, -- 100MB limit for data files
  ARRAY['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
);

-- Storage policies for imports bucket
CREATE POLICY "Admins can upload imports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'imports' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can view imports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'imports' 
  AND public.has_role(auth.uid(), 'admin')
);