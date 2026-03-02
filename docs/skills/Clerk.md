# Skill: Clerk (Auth & Billing)

## Overview

Diagram uses Clerk for all authentication and billing. Stripe runs behind Clerk's wall — we configure our Stripe key in the Clerk Dashboard but never call the Stripe API directly. This skill documents how agents should implement Clerk-related features.

**Deployment model:** No local dev. We deploy straight to production on Vercel. Clerk webhooks sync user/billing data to Supabase.

---

## Package

```bash
npm install @clerk/nextjs@latest
```

Always install `@latest` to ensure the application uses the latest Clerk Next.js SDK.

---

## Environment Variables

Store in `.env.local` only. **Never write real keys into code, markdown, or tracked files.** Use placeholders only in generated snippets.

```env
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
CLERK_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

Get keys from [Clerk Dashboard → API Keys](https://dashboard.clerk.com/last-active?path=api-keys).

Stripe keys are configured **inside Clerk's Dashboard → Billing Settings**, not in our env.

**Verify `.gitignore` excludes `.env*` before committing.**

---

## Setup Checklist

### 1. Proxy Middleware (`proxy.ts`)

Create `proxy.ts` using `clerkMiddleware()` from `@clerk/nextjs/server`. Place inside `src/` directory.

```typescript
// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/diagram(.*)",
  "/settings(.*)",
  "/templates(.*)",
  "/import(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

### 2. ClerkProvider (Root Layout)

Wrap the app in `<ClerkProvider>` in `app/layout.tsx`. Include Clerk's pre-built components:

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diagram",
  description: "AI-powered workflow diagramming for small business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header>
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### 3. Auth Routes

Clerk's prebuilt sign-in/sign-up pages:

```tsx
// src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}

// src/app/(auth)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <SignUp />;
}
```

---

## Auth Patterns

### Server-Side (API Routes, Server Components)

**Always use `async/await` with `auth()`.** Import from `@clerk/nextjs/server`.

```tsx
import { auth, currentUser } from "@clerk/nextjs/server";

// In an API route
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  // userId is the Clerk user ID — use this to query Supabase
}

// In a Server Component
export default async function DashboardPage() {
  const user = await currentUser();
  // user.id, user.firstName, user.emailAddresses, etc.
}
```

### Client-Side (React Components)

```tsx
import { useAuth, useUser } from "@clerk/nextjs";

function MyComponent() {
  const { userId, isSignedIn } = useAuth();
  const { user } = useUser();
  // user.id, user.fullName, user.imageUrl, etc.
}
```

### Clerk ↔ Supabase Bridge

API routes authenticate via Clerk, then query Supabase using the Clerk user ID. Supabase has **auto RLS enabled** — use service role key on server to bypass for admin operations, or scope queries with Clerk user ID.

```tsx
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for server-side
  );

  const { data } = await supabase
    .from("diagrams")
    .select("*")
    .eq("owner_id", userId); // Clerk user ID stored in profiles.id

  return Response.json(data);
}
```

---

## Billing Patterns

### Pricing Table

Display Clerk's built-in pricing table (automatically shows plans configured in Clerk Dashboard):

```tsx
import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return <PricingTable />;
}
```

For B2B/team plans, use `for="organization"`:

```tsx
<PricingTable for="organization" />
```

### Gating Features by Plan

**Server-side with `has()`:**

```tsx
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { has } = await auth();

  // Check by feature
  if (!has({ feature: "ai_generation" })) {
    return new Response("Upgrade required", { status: 403 });
  }

  // Check by plan
  if (!has({ plan: "team" })) {
    return new Response("Team plan required", { status: 403 });
  }
}
```

**Client-side with `<Protect>`:**

```tsx
import { Protect } from "@clerk/nextjs";

function AIGenerateButton() {
  return (
    <Protect feature="ai_generation" fallback={<UpgradePrompt />}>
      <button>Generate with AI</button>
    </Protect>
  );
}
```

### Plans Hook

```tsx
import { usePlans } from "@clerk/nextjs";

function BillingSettings() {
  const { plans, isLoading } = usePlans();
  // plans contains available subscription plans
}
```

### User Profile with Billing

Clerk's `<UserProfile />` component includes billing management when billing is enabled:

```tsx
import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return <UserProfile />;
}
```

---

## Webhook Handling (Clerk → Supabase)

Clerk webhooks sync user identity and billing events to Supabase. This is the **only** path for user data into our database.

### Setup

Register webhook endpoint in Clerk Dashboard → Webhooks:
- URL: `https://your-production-domain.com/api/webhooks/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`, `subscription.created`, `subscription.updated`, `subscription.deleted`

### Implementation

```tsx
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  switch (evt.type) {
    case "user.created":
      await supabase.from("profiles").upsert({
        id: evt.data.id,
        clerk_user_id: evt.data.id,
        full_name:
          `${evt.data.first_name || ""} ${evt.data.last_name || ""}`.trim(),
        avatar_url: evt.data.image_url,
      });
      break;

    case "user.updated":
      await supabase
        .from("profiles")
        .update({
          full_name:
            `${evt.data.first_name || ""} ${evt.data.last_name || ""}`.trim(),
          avatar_url: evt.data.image_url,
        })
        .eq("id", evt.data.id);
      break;

    case "user.deleted":
      // Soft delete — mark user as inactive, don't delete data
      await supabase
        .from("profiles")
        .update({ plan: "deleted" })
        .eq("id", evt.data.id);
      break;

    // Billing events — sync plan status
    case "subscription.created":
    case "subscription.updated":
      // Read plan from Clerk's subscription data
      // Update profiles.plan accordingly
      break;

    case "subscription.deleted":
      await supabase
        .from("profiles")
        .update({ plan: "expired" })
        .eq("id", evt.data.id);
      break;
  }

  return new Response("OK", { status: 200 });
}
```

### Webhook dependency

Install `svix` for webhook verification: `npm install svix`

---

## Trial Management

Clerk handles the 14-day trial lifecycle automatically when configured in the Clerk Dashboard:

1. **Configure trial in Clerk Dashboard** → Plans → Edit plan → Set trial period to 14 days
2. **Clerk auto-starts trial** on signup — no custom code needed
3. **Trial status** is available via `has()` — users on trial have full plan access
4. **Trial expiration** — Clerk prompts the user to subscribe. Fires `subscription.updated` webhook
5. **Check trial status client-side:**

```tsx
import { useAuth } from "@clerk/nextjs";

function TrialBanner() {
  const { has } = useAuth();
  // Check if user has active subscription or trial
  // Clerk's has() returns true during active trial
}
```

---

## CRITICAL Rules for Agents

### ALWAYS do:
1. **Use `clerkMiddleware()`** from `@clerk/nextjs/server` in `proxy.ts`
2. **Wrap** your app with `<ClerkProvider>` in `app/layout.tsx`
3. **Import** Clerk's Next.js features from `@clerk/nextjs` (components) or `@clerk/nextjs/server` (server helpers)
4. **Use `async/await`** with `auth()` — it returns a Promise
5. **Reference App Router** patterns only (`app/page.tsx`, `app/layout.tsx`)
6. **Store real keys only in `.env.local`** — never in code or tracked files
7. **Use placeholders only** (`YOUR_PUBLISHABLE_KEY`, `YOUR_SECRET_KEY`) in generated snippets
8. **Verify `.gitignore` excludes `.env*`** before any commit

### NEVER do:
1. **Never** use `authMiddleware()` — it's deprecated, replaced by `clerkMiddleware()`
2. **Never** reference `_app.tsx` or pages-based routing patterns
3. **Never** import from `@supabase/auth-helpers-nextjs` — Supabase is data-only
4. **Never** call the Stripe API directly — all billing goes through Clerk
5. **Never** import `withAuth` or `currentUser` from older deprecated APIs
6. **Never** write real API keys into any tracked file
7. **Never** create a file called `middleware.ts` — the Clerk middleware file is `proxy.ts`

### Verification Checklist (run before committing any Clerk code):
1. Is `clerkMiddleware()` used in `proxy.ts` (not `middleware.ts`)?
2. Is `<ClerkProvider>` wrapping the app in `app/layout.tsx`?
3. Are imports from `@clerk/nextjs` or `@clerk/nextjs/server` only?
4. Is the approach using App Router (not pages)?
5. Are only placeholder values used in code examples?
6. Are real keys excluded from tracked files?

---

## Clerk Dashboard Configuration Needed

Before development, these must be set up in the Clerk Dashboard:

- [ ] Application created with production domain
- [ ] Auth providers enabled: Email, Google, GitHub
- [ ] Billing enabled and Stripe key configured
- [ ] Plans created: Individual ($8/mo), Team ($20/mo)
- [ ] Features created for plan gating (e.g., `ai_generation`, `team_access`)
- [ ] Trial period set to 14 days on both plans
- [ ] Webhook endpoint registered with required events (production URL)
- [ ] Environment variables copied to Vercel

---

## References

- [Clerk Next.js Quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart)
- [Clerk Billing for B2C](https://clerk.com/docs/nextjs/guides/billing/for-b2c)
- [Clerk Billing for B2B](https://clerk.com/docs/nextjs/guides/billing/for-b2b)
- [Clerk Billing Webhooks](https://clerk.com/docs/nextjs/guides/development/webhooks/billing)
- [clerkMiddleware() Reference](https://clerk.com/docs/reference/nextjs/clerk-middleware)
