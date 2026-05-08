import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProfileState {
  profileId: string | null
  region: string
  employmentType: string
  age: number | null
  completeness: number
  paymentHistory: unknown[]
  assets: Record<string, unknown>
  preferences: Record<string, unknown>
  setProfile: (p: Partial<ProfileState>) => void
  clear: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profileId: null,
      region: '310000',
      employmentType: 'Flexible_Employment',
      age: null,
      completeness: 0,
      paymentHistory: [],
      assets: {},
      preferences: {},
      setProfile: (p) => set((state) => ({ ...state, ...p })),
      clear: () =>
        set({
          profileId: null,
          region: '310000',
          employmentType: 'Flexible_Employment',
          age: null,
          completeness: 0,
          paymentHistory: [],
          assets: {},
          preferences: {},
        }),
    }),
    { name: 'nsi-profile' }
  )
)
