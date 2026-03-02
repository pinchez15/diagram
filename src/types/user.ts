export type PlanType = "individual" | "team" | "expired" | "deleted";

export type TeamRole = "owner" | "admin" | "member";

export interface UserProfile {
  id: string; // Clerk user ID (text, e.g. "user_2abc123")
  clerk_user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: PlanType;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string; // UUID
  name: string;
  owner_id: string; // Clerk user ID
  plan: PlanType;
  max_seats: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string; // UUID
  team_id: string;
  user_id: string; // Clerk user ID
  role: TeamRole;
  created_at: string;
}
