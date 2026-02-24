-- Supabase Row Level Security
-- Run this in the Supabase SQL editor AFTER running `prisma migrate deploy`
--
-- How it works:
-- - Enabling RLS with no policies = anon role has ZERO access by default
-- - The DATABASE_URL uses the service_role connection string, which bypasses
--   RLS entirely — so application queries via Prisma are unaffected
-- - This protects against direct DB access via Supabase Studio or a leaked anon key

ALTER TABLE "Url" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Analytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
