-- Wishify Database Schema
-- Run this in your Supabase SQL Editor
-- Uses CUID2 for IDs (generated in the app, not by the database)

-- Table: events (grupos/eventos)
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  secret_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: wishlists
CREATE TABLE wishlists (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  secret_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: gifts
CREATE TABLE gifts (
  id TEXT PRIMARY KEY,
  wishlist_id TEXT REFERENCES wishlists(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  reserved BOOLEAN DEFAULT FALSE,
  reserved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wishlists_event_id ON wishlists(event_id);
CREATE INDEX idx_gifts_wishlist_id ON gifts(wishlist_id);
CREATE INDEX idx_gifts_reserved_by ON gifts(reserved_by);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations (public app without auth)
CREATE POLICY "Allow all on events" ON events FOR ALL USING (true);
CREATE POLICY "Allow all on wishlists" ON wishlists FOR ALL USING (true);
CREATE POLICY "Allow all on gifts" ON gifts FOR ALL USING (true);
