import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  identityType: 'individual' | 'enterprise' | null
  phone: string | null
  email: string | null
  birthDate: string | null
  region: string
  gender: string
  employment: string
  fontSize: string
  landingPage: '/' | '/sandbox'
  setTokens: (access: string, refresh: string, type: string) => void
  setPhone: (phone: string) => void
  setEmail: (email: string) => void
  setBirthDate: (birthDate: string) => void
  setRegion: (region: string) => void
  setGender: (gender: string) => void
  setEmployment: (employment: string) => void
  setFontSize: (fontSize: string) => void
  setLandingPage: (page: '/' | '/sandbox') => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      identityType: null,
      phone: null,
      email: null,
      birthDate: null,
      region: '310000',
      gender: 'male',
      employment: 'Corporate_Employee',
      fontSize: 'medium',
      landingPage: '/',
      setTokens: (access, refresh, type) =>
        set({ accessToken: access, refreshToken: refresh, identityType: type as any }),
      setPhone: (phone) => set({ phone }),
      setEmail: (email) => set({ email }),
      setBirthDate: (birthDate) => set({ birthDate }),
      setRegion: (region) => set({ region }),
      setGender: (gender) => set({ gender }),
      setEmployment: (employment) => set({ employment }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLandingPage: (page) => set({ landingPage: page }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, identityType: null, phone: null, email: null }),
      isAuthenticated: () => !!get().accessToken,
    }),
    { name: 'nsi-auth' }
  )
)