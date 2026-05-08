import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import ThemeToggle from './ThemeToggle'
import NotificationCenter from './NotificationCenter'

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  useAuthStore((s) => s.isAuthenticated())
  const profileActive = pathname === '/profile' || pathname === '/settings'

  return (
    <div className="min-h-screen bg-nsi-bg text-nsi-text nsi-grid-bg flex">
      {/* CRT scan-line overlay */}
      <div className="nsi-scan-line" />
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-16 bg-nsi-card border-r border-nsi-border items-center py-6 gap-6 shrink-0">
        <div className="w-8 h-8 rounded bg-nsi-cyan/20 flex items-center justify-center border border-nsi-cyan/40">
          <span className="font-mono text-nsi-cyan text-xs font-bold">N</span>
        </div>
        <nav className="flex flex-col gap-4">
          <Link
            to="/"
            className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
              pathname === '/' ? 'bg-nsi-cyan/10 text-nsi-cyan' : 'text-nsi-muted hover:text-nsi-text'
            }`}
            title="仪表盘"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </Link>
          <Link
            to="/sandbox"
            className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
              pathname === '/sandbox' ? 'bg-nsi-cyan/10 text-nsi-cyan' : 'text-nsi-muted hover:text-nsi-text'
            }`}
            title="测算沙盘"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </Link>
          <Link
            to="/settings"
            className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
              pathname === '/settings' ? 'bg-nsi-cyan/10 text-nsi-cyan' : 'text-nsi-muted hover:text-nsi-text'
            }`}
            title="设置"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
          <Link
            to="/profile"
            className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
              profileActive ? 'bg-nsi-cyan/10 text-nsi-cyan' : 'text-nsi-muted hover:text-nsi-text'
            }`}
            title="我的"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-nsi-card/80 backdrop-blur border-b border-nsi-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-nsi-cyan/20 flex items-center justify-center border border-nsi-cyan/40">
              <span className="font-mono text-nsi-cyan text-[10px] font-bold">N</span>
            </div>
            <h1 className="font-mono text-sm font-semibold text-nsi-text tracking-wide">NSI</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <ThemeToggle />
            <span className="text-[10px] font-mono text-nsi-muted uppercase tracking-wider">社保定制速算器</span>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-6 py-3 border-b border-nsi-border bg-nsi-card/60">
          <span className="text-xs font-mono text-nsi-muted uppercase tracking-wider">NeuroSocialInsurance Terminal v1.0.1</span>
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <ThemeToggle />
            <span className="nsi-status-dot nsi-status-dot--verified" />
            <span className="text-[10px] font-mono text-nsi-green uppercase tracking-wider">System Online</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 max-w-2xl lg:max-w-none mx-auto w-full">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden sticky bottom-0 z-30 bg-nsi-card/90 backdrop-blur border-t border-nsi-border flex justify-around py-2">
          <Link to="/" className={`flex flex-col items-center gap-0.5 px-4 py-1 ${pathname === '/' ? 'text-nsi-cyan' : 'text-nsi-muted'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            <span className="text-[10px] font-mono">首页</span>
          </Link>
          <Link to="/sandbox" className={`flex flex-col items-center gap-0.5 px-4 py-1 ${pathname === '/sandbox' ? 'text-nsi-cyan' : 'text-nsi-muted'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <span className="text-[10px] font-mono">沙盘</span>
          </Link>
          <Link to="/settings" className={`flex flex-col items-center gap-0.5 px-4 py-1 ${pathname === '/settings' ? 'text-nsi-cyan' : 'text-nsi-muted'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-mono">设置</span>
          </Link>
          <Link to="/profile" className={`flex flex-col items-center gap-0.5 px-4 py-1 ${profileActive ? 'text-nsi-cyan' : 'text-nsi-muted'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span className="text-[10px] font-mono">我的</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}