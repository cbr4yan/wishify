-- Wishify Database Schema
-- Run this in your Supabase SQL Editor

-- Table: events (grupos/eventos)
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  secret_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: wishlists
CREATE TABLE wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  secret_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: gifts
CREATE TABLE gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  reserved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_wishlists_slug ON wishlists(slug);
CREATE INDEX idx_wishlists_event_id ON wishlists(event_id);
CREATE INDEX idx_gifts_wishlist_id ON gifts(wishlist_id);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations (public app without auth)
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true);
CREATE POLICY "Allow all operations on wishlists" ON wishlists FOR ALL USING (true);
CREATE POLICY "Allow all operations on gifts" ON gifts FOR ALL USING (true);
