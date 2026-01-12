-- Migration: Add is_document column to todos table (PostgreSQL)
-- Run this SQL to add the new field for standalone documents

ALTER TABLE todos ADD COLUMN IF NOT EXISTS is_document BOOLEAN DEFAULT FALSE;
