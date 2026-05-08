export default function Dashboard() {
  const stats = [
    { label: '注册用户', value: '12,847', color: 'text-nsi-cyan' },
    { label: 'Verified政策', value: '3,421', color: 'text-nsi-green' },
    { label: '今日精算', value: '8,293', color: 'text-nsi-amber' },
    { label: '广告展示', value: '45,102', color: 'text-nsi-coral' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-nsi-amber/20 border border-nsi-amber/50 rounded px-4 py-2 font-mono text-xs text-nsi-amber text-center uppercase tracking-widest">
        ⚠ Demo — Placeholder Data — Replace with API calls before production
      </div>
      <h1 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">仪表盘 // DASHBOARD</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="nsi-card p-4">
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-2">{s.label}</div>
            <div className={`font-mono text-2xl ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="nsi-card p-4">
          <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-3">系统状态 // SYSTEM STATUS</div>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex items-center justify-between py-1 border-b border-nsi-border/50">
              <span className="text-nsi-muted">account-center</span>
              <span className="text-nsi-green">● Online</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-nsi-border/50">
              <span className="text-nsi-muted">policy-hub</span>
              <span className="text-nsi-green">● Online</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-nsi-border/50">
              <span className="text-nsi-muted">actuarial-engine</span>
              <span className="text-nsi-green">● Online</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-nsi-border/50">
              <span className="text-nsi-muted">config-service</span>
              <span className="text-nsi-green">● Online</span>
            </div>
          </div>
        </div>

        <div className="nsi-card p-4">
          <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-3">最近配置变更 // RECENT CHANGES</div>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex items-center justify-between py-1 border-b border-nsi-border/50">
              <span className="text-nsi-text">ads.enabled</span>
              <span className="text-nsi-amber">false → true</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-nsi-border/50">
              <span className="text-nsi-text">sms.aliyun_sign_name</span>
              <span className="text-nsi-cyan">已更新</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-nsi-border/50">
              <span className="text-nsi-text">system.maintenance_mode</span>
              <span className="text-nsi-green">false</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
