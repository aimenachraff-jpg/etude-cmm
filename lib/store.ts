import { create } from 'zustand'

interface User {
  displayName?: string;
  testDate?: number;
}

interface ExamHistoryItem {
  startTime: number;
  endTime?: number;
  score?: number;
  config?: {
    questionCount?: number;
    tdScope?: string[];
  };
}

interface StoreState {
  user: User | null;
  skillReadiness: Record<string, number>;
  streak: number;
  lastActive: Date | null;
  examHistory: ExamHistoryItem[];
  setUser: (user: User) => void;
  setSkillReadiness: (skillId: string, value: number) => void;
  incrementStreak: () => void;
  addExamResult: (result: Omit<ExamHistoryItem, 'startTime'> & { startTime?: number }) => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  skillReadiness: {},
  streak: 0,
  lastActive: null,
  examHistory: [],

  setUser: (user) => set({ user }),

  setSkillReadiness: (skillId, value) =>
    set((state) => ({
      skillReadiness: { ...state.skillReadiness, [skillId]: value },
    })),

  incrementStreak: () =>
    set((state) => ({ streak: state.streak + 1 })),

  addExamResult: (result) =>
    set((state) => ({
      examHistory: [{ ...result, startTime: result.startTime || Date.now() }, ...state.examHistory],
    })),
}))
