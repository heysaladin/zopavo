"use client";

import { create } from "zustand";
import { Platform, PostStatus } from "./utils";

interface Post {
  id: string;
  title: string;
  platform: Platform;
  caption: string;
  hashtags: string | null;
  mediaPath: string | null;
  scheduledAt: Date | null;
  status: PostStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AppState {
  // Library filters
  statusFilter: PostStatus | "ALL";
  platformFilter: Platform | "ALL";
  setStatusFilter: (status: PostStatus | "ALL") => void;
  setPlatformFilter: (platform: Platform | "ALL") => void;

  // Execute state
  executeStep: number;
  setExecuteStep: (step: number) => void;
  resetExecuteStep: () => void;

  // Selected post
  selectedPost: Post | null;
  setSelectedPost: (post: Post | null) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Toast notifications
  toast: { message: string; type: "success" | "error" | "info" } | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  clearToast: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  statusFilter: "ALL",
  platformFilter: "ALL",
  setStatusFilter: (status) => set({ statusFilter: status }),
  setPlatformFilter: (platform) => set({ platformFilter: platform }),

  executeStep: 0,
  setExecuteStep: (step) => set({ executeStep: step }),
  resetExecuteStep: () => set({ executeStep: 0 }),

  selectedPost: null,
  setSelectedPost: (post) => set({ selectedPost: post }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  toast: null,
  showToast: (message, type = "info") => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}));
