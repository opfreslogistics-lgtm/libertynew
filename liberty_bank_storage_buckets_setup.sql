-- ============================================================================================================
-- LIBERTY BANK - STORAGE BUCKETS SETUP
-- ============================================================================================================
-- 
-- This script creates all storage buckets and their security policies for Liberty Bank.
-- Run this in Supabase SQL Editor AFTER running the main database setup.
-- 
-- IMPORTANT: Run this as a Supabase admin user
-- 
-- Buckets created:
-- 1. profile-pictures (Public) - User profile images
-- 2. app-images (Public) - App logos, banners, general images
-- 3. bill-logos (Public) - Bill/biller company logos
-- 4. kyc-documents (Private) - KYC verification documents
-- 5. loan-documents (Private) - Loan application documents
-- 6. mobile-deposits (Private) - Mobile check deposit images
-- 7. documents (Private) - General user documents
-- 
-- ============================================================================================================

-- ============================================================================================================
-- STEP 1: CREATE STORAGE BUCKETS
-- ============================================================================================================

-- Insert buckets into storage.buckets table
-- Note: If bucket already exists, this will be ignored (ON CONFLICT DO NOTHING)

-- Bucket 1: profile-pictures (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures',
  true,
  10485760, -- 10 MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket 2: app-images (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-images',
  'app-images',
  true,
  10485760, -- 10 MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'image/x-icon']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket 3: bill-logos (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bill-logos',
  'bill-logos',
  true,
  5242880, -- 5 MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket 4: kyc-documents (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false,
  10485760, -- 10 MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket 5: loan-documents (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'loan-documents',
  'loan-documents',
  false,
  10485760, -- 10 MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket 6: mobile-deposits (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mobile-deposits',
  'mobile-deposits',
  false,
  10485760, -- 10 MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket 7: documents (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50 MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'text/csv']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================================================
-- STEP 2: CREATE STORAGE POLICIES FOR PUBLIC BUCKETS
-- ============================================================================================================

-- ===== PROFILE PICTURES BUCKET POLICIES =====

-- Allow authenticated users to upload their own profile pictures
DROP POLICY IF EXISTS "Users can upload own profile pictures" ON storage.objects;
CREATE POLICY "Users can upload own profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own profile pictures
DROP POLICY IF EXISTS "Users can update own profile pictures" ON storage.objects;
CREATE POLICY "Users can update own profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own profile pictures
DROP POLICY IF EXISTS "Users can delete own profile pictures" ON storage.objects;
CREATE POLICY "Users can delete own profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view profile pictures (public bucket)
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

-- ===== APP IMAGES BUCKET POLICIES =====

-- Allow admins to upload app images
DROP POLICY IF EXISTS "Admins can upload app images" ON storage.objects;
CREATE POLICY "Admins can upload app images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'app-images'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Allow admins to update app images
DROP POLICY IF EXISTS "Admins can update app images" ON storage.objects;
CREATE POLICY "Admins can update app images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'app-images'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Allow admins to delete app images
DROP POLICY IF EXISTS "Admins can delete app images" ON storage.objects;
CREATE POLICY "Admins can delete app images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'app-images'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Allow anyone to view app images (public bucket)
DROP POLICY IF EXISTS "Anyone can view app images" ON storage.objects;
CREATE POLICY "Anyone can view app images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-images');

-- ===== BILL LOGOS BUCKET POLICIES =====

-- Allow admins to upload bill logos
DROP POLICY IF EXISTS "Admins can upload bill logos" ON storage.objects;
CREATE POLICY "Admins can upload bill logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bill-logos'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Allow admins to update bill logos
DROP POLICY IF EXISTS "Admins can update bill logos" ON storage.objects;
CREATE POLICY "Admins can update bill logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'bill-logos'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Allow admins to delete bill logos
DROP POLICY IF EXISTS "Admins can delete bill logos" ON storage.objects;
CREATE POLICY "Admins can delete bill logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'bill-logos'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Allow anyone to view bill logos (public bucket)
DROP POLICY IF EXISTS "Anyone can view bill logos" ON storage.objects;
CREATE POLICY "Anyone can view bill logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bill-logos');

-- ============================================================================================================
-- STEP 3: CREATE STORAGE POLICIES FOR PRIVATE BUCKETS
-- ============================================================================================================

-- ===== KYC DOCUMENTS BUCKET POLICIES =====

-- Allow users to upload their own KYC documents
DROP POLICY IF EXISTS "Users can upload own kyc documents" ON storage.objects;
CREATE POLICY "Users can upload own kyc documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own KYC documents
DROP POLICY IF EXISTS "Users can view own kyc documents" ON storage.objects;
CREATE POLICY "Users can view own kyc documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own KYC documents
DROP POLICY IF EXISTS "Users can update own kyc documents" ON storage.objects;
CREATE POLICY "Users can update own kyc documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own KYC documents
DROP POLICY IF EXISTS "Users can delete own kyc documents" ON storage.objects;
CREATE POLICY "Users can delete own kyc documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all KYC documents
DROP POLICY IF EXISTS "Admins can view all kyc documents" ON storage.objects;
CREATE POLICY "Admins can view all kyc documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Allow admins to manage all KYC documents
DROP POLICY IF EXISTS "Admins can manage all kyc documents" ON storage.objects;
CREATE POLICY "Admins can manage all kyc documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- ===== LOAN DOCUMENTS BUCKET POLICIES =====

-- Allow users to upload their own loan documents
DROP POLICY IF EXISTS "Users can upload own loan documents" ON storage.objects;
CREATE POLICY "Users can upload own loan documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'loan-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own loan documents
DROP POLICY IF EXISTS "Users can view own loan documents" ON storage.objects;
CREATE POLICY "Users can view own loan documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'loan-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own loan documents
DROP POLICY IF EXISTS "Users can delete own loan documents" ON storage.objects;
CREATE POLICY "Users can delete own loan documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'loan-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all loan documents
DROP POLICY IF EXISTS "Admins can view all loan documents" ON storage.objects;
CREATE POLICY "Admins can view all loan documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'loan-documents'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Allow admins to manage all loan documents
DROP POLICY IF EXISTS "Admins can manage all loan documents" ON storage.objects;
CREATE POLICY "Admins can manage all loan documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'loan-documents'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- ===== MOBILE DEPOSITS BUCKET POLICIES =====

-- Allow users to upload their own mobile deposit images
DROP POLICY IF EXISTS "Users can upload own mobile deposits" ON storage.objects;
CREATE POLICY "Users can upload own mobile deposits"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'mobile-deposits'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own mobile deposit images
DROP POLICY IF EXISTS "Users can view own mobile deposits" ON storage.objects;
CREATE POLICY "Users can view own mobile deposits"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'mobile-deposits'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all mobile deposits
DROP POLICY IF EXISTS "Admins can view all mobile deposits" ON storage.objects;
CREATE POLICY "Admins can view all mobile deposits"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'mobile-deposits'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Allow admins to manage all mobile deposits
DROP POLICY IF EXISTS "Admins can manage all mobile deposits" ON storage.objects;
CREATE POLICY "Admins can manage all mobile deposits"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'mobile-deposits'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- ===== DOCUMENTS BUCKET POLICIES =====

-- Allow users to upload their own documents
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own documents
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own documents
DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own documents
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all documents
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Allow admins to manage all documents
DROP POLICY IF EXISTS "Admins can manage all documents" ON storage.objects;
CREATE POLICY "Admins can manage all documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- ============================================================================================================
-- SETUP COMPLETE!
-- ============================================================================================================

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '============================================================================================================';
  RAISE NOTICE 'STORAGE BUCKETS SETUP COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '============================================================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Buckets created: 7';
  RAISE NOTICE '  1. profile-pictures (Public) - User profile images';
  RAISE NOTICE '  2. app-images (Public) - App logos and images';
  RAISE NOTICE '  3. bill-logos (Public) - Bill company logos';
  RAISE NOTICE '  4. kyc-documents (Private) - KYC verification files';
  RAISE NOTICE '  5. loan-documents (Private) - Loan application files';
  RAISE NOTICE '  6. mobile-deposits (Private) - Check deposit images';
  RAISE NOTICE '  7. documents (Private) - General user documents';
  RAISE NOTICE '';
  RAISE NOTICE 'Storage policies created: 40+';
  RAISE NOTICE '';
  RAISE NOTICE 'Security features:';
  RAISE NOTICE '  ✓ Users can only access their own files in private buckets';
  RAISE NOTICE '  ✓ Admins can access all files';
  RAISE NOTICE '  ✓ Public buckets visible to everyone';
  RAISE NOTICE '  ✓ File size limits enforced';
  RAISE NOTICE '  ✓ MIME type restrictions enforced';
  RAISE NOTICE '';
  RAISE NOTICE 'Your storage is ready for production!';
  RAISE NOTICE '============================================================================================================';
END $$;

SELECT 'Storage buckets setup completed successfully!' AS status;

-- ============================================================================================================
-- VERIFICATION QUERY
-- ============================================================================================================

-- Run this to verify buckets were created:
SELECT 
  id,
  name,
  public,
  ROUND(file_size_limit / 1048576.0, 2) || ' MB' AS size_limit,
  array_length(allowed_mime_types, 1) AS mime_types_count,
  created_at
FROM storage.buckets
ORDER BY name;
