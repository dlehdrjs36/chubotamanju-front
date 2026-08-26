import { create } from "zustand";

const INITIAL_HOME_UI_STATE = {
  keyword: "",
};

export const useHomeUiStore = create((set) => ({
  ...INITIAL_HOME_UI_STATE,
  setKeyword: (keyword) => set({ keyword }),
  resetHomeUiState: () => set(INITIAL_HOME_UI_STATE),
}));
