# Skill: Supabase (Data Layer)

## Overview

Diagram uses Supabase for data persistence, file storage, and (in V2) real-time collaboration. **Supabase does NOT handle authentication** — that's Clerk's job. Supabase is strictly the data layer.

---

## Package

```
@supabase/supabase-js
```

Install: `npm install @supabase/supabase-js`

---

## Architecture: Clerk + Supabase

Since Clerk handles auth, the Clerk ↔ Supabase bridge works like this:

1. **Client requests** authenticate via Clerk (middleware, `useAuth()`)
2. **API routes** get the Clerk user ID via `auth()` from `@clerk/nextjs/server`
3. **API routes** create a Supabase client with the **service role key** (bypasses RLS)
4. **API routes** filter queries by the Clerk user ID (application-level access control)

Alternatively, for RLS-based access:
- Generate a custom JWT for Supabase containing the Clerk user ID
- Pass it to the Supabase client to enable RLS filtering

### Server-Side Client (Recommended for API Routes)

```typescript
// src/lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js'

export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // Service role — bypasses RLS
  )
}
```

### Client-Side Client (For real-time subscriptions in V2)

```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

---

## Database Schema

Full schema is in PRD.md. Key tables:

| Table | Primary Key | Notes |
|-------|-------------|-------|
| `profiles` | `id` (text, Clerk user ID) | Synced from Clerk via webhook |
| `teams` | `id` (uuid) | `owner_id` references `profiles.id` |
| `team_members` | `id` (uuid) | Junction table: team ↔ user |
| `diagrams` | `id` (uuid) | `owner_id` references `profiles.id`, `canvas_data` is JSONB |
| `diagram_versions` | `id` (uuid) | Auto-save history, references `diagrams.id` |
| `tool_categories` | `id` (uuid) | Seed data for node color-coding |
| `usage` | `id` (uuid) | Monthly counters per user |

### Important: Profile IDs are Clerk User IDs

The `profiles.id` column is a **text** field containing the Clerk user ID (e.g., `user_2abc123def`), NOT a Supabase auth UUID. All foreign keys referencing users use this Clerk ID.

---

## Common Query Patterns

### Fetch user's diagrams

```typescript
const { data: diagrams } = await supabase
  .from('diagrams')
  .select('id, title, type, thumbnail_url, updated_at')
  .eq('owner_id', clerkUserId)
  .order('updated_at', { ascending: false })
```

### Save diagram (auto-save)

```typescript
const { error } = await supabase
  .from('diagrams')
  .update({
    canvas_data: serializedCanvasData,
    updated_at: new Date().toISOString(),
  })
  .eq('id', diagramId)
  .eq('owner_id', clerkUserId)  // Always filter by owner for safety
```

### Create version snapshot

```typescript
const { error } = await supabase
  .from('diagram_versions')
  .insert({
    diagram_id: diagramId,
    canvas_data: serializedCanvasData,
    created_by: clerkUserId,
  })
```

### Increment usage

```typescript
const { error } = await supabase.rpc('increment_diagram_count', {
  p_user_id: clerkUserId,
})
```

---

## Migrations

Manage via Supabase CLI:

```bash
# Create a new migration
supabase migration new add_column_to_diagrams

# Apply migrations
supabase db push

# Reset local database
supabase db reset
```

Migration files live in `supabase/migrations/`.

---

## File Storage

Supabase Storage handles diagram thumbnails and exported files:

```typescript
// Upload a thumbnail
const { data, error } = await supabase.storage
  .from('thumbnails')
  .upload(`${diagramId}/thumb.png`, thumbnailBuffer, {
    contentType: 'image/png',
    upsert: true,
  })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('thumbnails')
  .getPublicUrl(`${diagramId}/thumb.png`)
```

Storage buckets needed:
- `thumbnails` — diagram preview images
- `exports` — generated PDF/PNG/SVG files (temporary, can be cleaned up)

---

## Key Rules for Agents

1. **Never use Supabase Auth** — all auth goes through Clerk
2. **Always filter queries by `owner_id`** (the Clerk user ID) in API routes
3. **Use service role key on the server only** — never expose it to the client
4. **`canvas_data` is JSONB** — store the full React Flow serialized state
5. **Auto-save uses debounced upserts** — don't create a new row every time
6. **Version snapshots are separate from auto-save** — different cadence (every 5 min vs. every 2 sec)
7. **Seed `tool_categories` in migrations** — this is system data, not user-generated

---

## References

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
