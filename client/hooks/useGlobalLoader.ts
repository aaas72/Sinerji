import { create } from 'zustand';

interface GlobalLoaderState {
  isLoading: boolean;
  message: string;
  subMessage: string;
  showLoader: (message: string, subMessage?: string) => void;
  hideLoader: () => void;
}

export const useGlobalLoader = create<GlobalLoaderState>((set) => ({
  isLoading: false,
  message: "",
  subMessage: "",
  showLoader: (message, subMessage = "") => set({ isLoading: true, message, subMessage }),
  hideLoader: () => set({ isLoading: false, message: "", subMessage: "" }),
}));
