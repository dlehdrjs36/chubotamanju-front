import { create } from "zustand";

const INITIAL_SESSION_STATE = {
  selectedGuildId: "",
};

export const useSessionStore = create((set) => ({
  ...INITIAL_SESSION_STATE,
  setSelectedGuildId: (selectedGuildId) => set({ selectedGuildId }),
  resetSessionState: () => set(INITIAL_SESSION_STATE),
}));
