-- Migration 008: Fix loyalty_cards schema gap
-- Adds missing 'points' column to loyalty_cards table

ALTER TABLE loyalty_cards 
  ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;
