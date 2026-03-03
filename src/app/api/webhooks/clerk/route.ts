import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

interface WebhookEvent {
  type: string;
  data: Record<string, unknown>;
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error("[webhook] CLERK_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // Verify webhook signature with svix
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("[webhook] Missing svix headers");
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let event: WebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("[webhook] Invalid signature:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  console.log(`[webhook] Received event: ${event.type}`);
  const supabase = createServiceClient();

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const { id, first_name, last_name, image_url } = event.data as {
        id: string;
        first_name: string | null;
        last_name: string | null;
        image_url: string | null;
      };
      const fullName = [first_name, last_name].filter(Boolean).join(" ") || null;

      const { error } = await supabase.from("profiles").upsert(
        {
          id,
          clerk_user_id: id,
          full_name: fullName,
          avatar_url: image_url,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      if (error) {
        console.error(`[webhook] Failed to upsert profile for ${id}:`, error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      console.log(`[webhook] Upserted profile for ${id}`);
      break;
    }

    case "user.deleted": {
      const { id } = event.data as { id: string };
      // Set plan to 'individual' (safe value within check constraint) and mark as soft-deleted via updated_at
      const { error } = await supabase
        .from("profiles")
        .update({ plan: "individual", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) {
        console.error(`[webhook] Failed to handle user.deleted for ${id}:`, error.message);
      }
      break;
    }

    case "subscription.created":
    case "subscription.updated": {
      const { user_id, plan } = event.data as {
        user_id: string;
        plan: string;
      };
      if (user_id && plan) {
        // Map to values allowed by DB check constraint
        const safePlan = plan === "team" ? "team" : "individual";
        const { error } = await supabase
          .from("profiles")
          .update({ plan: safePlan, updated_at: new Date().toISOString() })
          .eq("id", user_id);
        if (error) {
          console.error(`[webhook] Failed to update subscription for ${user_id}:`, error.message);
        }
      }
      break;
    }

    case "subscription.deleted": {
      const { user_id } = event.data as { user_id: string };
      if (user_id) {
        const { error } = await supabase
          .from("profiles")
          .update({ plan: "individual", updated_at: new Date().toISOString() })
          .eq("id", user_id);
        if (error) {
          console.error(`[webhook] Failed to handle subscription.deleted for ${user_id}:`, error.message);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
