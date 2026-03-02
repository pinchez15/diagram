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
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

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

      await supabase.from("profiles").upsert(
        {
          id,
          clerk_user_id: id,
          full_name: fullName,
          avatar_url: image_url,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      break;
    }

    case "user.deleted": {
      const { id } = event.data as { id: string };
      await supabase
        .from("profiles")
        .update({ plan: "deleted", updated_at: new Date().toISOString() })
        .eq("id", id);
      break;
    }

    case "subscription.created":
    case "subscription.updated": {
      const { user_id, plan } = event.data as {
        user_id: string;
        plan: string;
      };
      if (user_id && plan) {
        await supabase
          .from("profiles")
          .update({ plan, updated_at: new Date().toISOString() })
          .eq("id", user_id);
      }
      break;
    }

    case "subscription.deleted": {
      const { user_id } = event.data as { user_id: string };
      if (user_id) {
        await supabase
          .from("profiles")
          .update({ plan: "expired", updated_at: new Date().toISOString() })
          .eq("id", user_id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
