import { create } from "zustand";
import type { PlanType, Team, TeamMember } from "@/types/user";

interface AppState {
  // User state (synced from Clerk)
  plan: PlanType | null;
  trialEndsAt: string | null;

  // Team state
  currentTeam: Team | null;
  teamMembers: TeamMember[];

  // UI state
  sidebarOpen: boolean;

  // Actions
  setPlan: (plan: PlanType) => void;
  setTrialEndsAt: (date: string | null) => void;
  setCurrentTeam: (team: Team | null) => void;
  setTeamMembers: (members: TeamMember[]) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  plan: null,
  trialEndsAt: null,
  currentTeam: null,
  teamMembers: [],
  sidebarOpen: true,

  setPlan: (plan) => set({ plan }),
  setTrialEndsAt: (date) => set({ trialEndsAt: date }),
  setCurrentTeam: (team) => set({ currentTeam: team }),
  setTeamMembers: (members) => set({ teamMembers: members }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
