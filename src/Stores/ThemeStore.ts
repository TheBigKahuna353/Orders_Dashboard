import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: prefersDark ? 'dark' : 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
    }),
    { name: 'theme' }
  )
)