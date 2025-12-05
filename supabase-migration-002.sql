-- Migration 002: Add image support to gifts
-- Run this in your Supabase SQL Editor

-- Add image_url column to gifts table
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for gift images (run in Supabase Dashboard > Storage)
-- Or use this SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('gift-images', 'gift-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to gift images
CREATE POLICY "Public read access for gift images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gift-images');

-- Allow anyone to upload gift images
CREATE POLICY "Anyone can upload gift images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gift-images');

-- Allow anyone to delete gift images
CREATE POLICY "Anyone can delete gift images"
ON storage.objects FOR DELETE
USING (bucket_id = 'gift-images');

