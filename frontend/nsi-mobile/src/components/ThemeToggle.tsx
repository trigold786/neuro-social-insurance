import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('nsi-theme') as 'dark' | 'light' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.classList.toggle('light-theme', saved === 'light')
    }
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('nsi-theme', next)
    document.documentElement.classList.toggle('light-theme', next === 'light')
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 p-2 rounded-sm border border-nsi-border text-nsi-muted hover:text-nsi-text hover:border-nsi-cyan/40 transition-all"
      title={theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
    >
      {theme === 'dark' ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      )}
      <span className="font-mono text-[10px] tracking-wider">{theme === 'dark' ? '深色' : '浅色'}</span>
    </button>
  )
}
