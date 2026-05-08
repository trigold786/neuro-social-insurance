import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ConfigManager from './pages/ConfigManager'
import AdManager from './pages/AdManager'

const navItems = [
  { path: '/', label: '仪表盘', icon: '◈' },
  { path: '/configs', label: '配置中心', icon: '⚙' },
  { path: '/ads', label: '广告管理', icon: '▣' },
]

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-nsi-bg text-nsi-text flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} bg-nsi-card border-r border-nsi-border flex flex-col transition-all duration-300 shrink-0`}>
        <div className="h-14 border-b border-nsi-border flex items-center px-4 gap-2">
          <div className="w-7 h-7 rounded bg-nsi-cyan/20 flex items-center justify-center border border-nsi-cyan/40">
            <span className="font-mono text-nsi-cyan text-[10px] font-bold">N</span>
          </div>
          {sidebarOpen && <span className="font-mono text-sm font-semibold tracking-wide">NSI Admin</span>}
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                pathname === item.path ? 'bg-nsi-cyan/10 text-nsi-cyan border border-nsi-cyan/20' : 'text-nsi-muted hover:text-nsi-text hover:bg-nsi-bg/60'
              }`}
            >
              <span className="font-mono text-sm w-4 text-center">{item.icon}</span>
              {sidebarOpen && <span className="font-mono text-xs">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-nsi-border">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center justify-center py-2 text-nsi-muted hover:text-nsi-text">
            <span className="font-mono text-xs">{sidebarOpen ? '<< 收起' : '>>'}</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-nsi-border bg-nsi-card/60 flex items-center justify-between px-6">
          <span className="font-mono text-xs text-nsi-muted uppercase tracking-wider">NSI Console v1.0.2</span>
          <div className="flex items-center gap-3">
            <span className="nsi-status-dot bg-nsi-green animate-pulse" />
            <span className="text-[10px] font-mono text-nsi-green uppercase tracking-wider">Online</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/configs" element={<ConfigManager />} />
            <Route path="/ads" element={<AdManager />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
