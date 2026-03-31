# AGENTS.md

## Core Principle

Do not patch symptoms. If something behaves unexpectedly, diagnose the 
underlying cause. Avoid fallbacks, heuristics, local stabilizations, or 
post-processing bandages that are not faithful general algorithms.

## Architecture Reference

Before making any changes, read ARCHITECTURE.md in the project root.
All work must comply with the constraints defined there.

## Quick Rules

- Public reads: Anon Key only (let RLS work)
- Admin operations: Service Role Key via createAdminClient()
- Write operations: persist to DB first, then call external services
- Counter updates: atomic DB operations only, no read-modify-write in JS
- DB schema changes: create a migration file in supabase/migrations/, do not execute directly
- Never inline DDL in application code
