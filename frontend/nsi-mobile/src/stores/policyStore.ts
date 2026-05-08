import { create } from 'zustand'

interface PolicyState {
  policies: unknown[]
  lastFetchAt: number
  setPolicies: (policies: unknown[]) => void
}

export const usePolicyStore = create<PolicyState>((set) => ({
  policies: [],
  lastFetchAt: 0,
  setPolicies: (policies) => set({ policies, lastFetchAt: Date.now() }),
}))
