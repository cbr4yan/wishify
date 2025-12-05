-- Migration 001: Add reserved_by to gifts table
-- Run this if you already have the database set up

-- Add column to store the PIN of who reserved the gift
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS reserved_by TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gifts_reserved_by ON gifts(reserved_by);

