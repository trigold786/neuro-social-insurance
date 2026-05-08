import { useState } from 'react'

export default function AdManager() {
  const [enabled, setEnabled] = useState(false)
  const [provider, setProvider] = useState('none')
  const [showBanner, setShowBanner] = useState(true)
  const [showInterstitial, setShowInterstitial] = useState(true)
  const [showRewardVideo, setShowRewardVideo] = useState(false)
  const [maxPerSession, setMaxPerSession] = useState(5)
  const [cooldown, setCooldown] = useState(30)

  const providers = [
    { value: 'none', label: '未接入' },
    { value: 'gdt', label: '腾讯广点通' },
    { value: 'pangle', label: '穿山甲 (Pangle)' },
    { value: 'ksad', label: '快手广告' },
  ]

  const save = () => {
    alert('广告配置已保存（演示模式）')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">广告管理 // AD MANAGER</h1>
        <div className="flex items-center gap-2">
          <span className={`nsi-status-dot ${enabled ? 'bg-nsi-green animate-pulse' : 'bg-nsi-coral'}`} />
          <span className={`font-mono text-[10px] uppercase tracking-wider ${enabled ? 'text-nsi-green' : 'text-nsi-coral'}`}>
            {enabled ? '已启用' : '已关闭'}
          </span>
        </div>
      </div>

      {/* 总开关 */}
      <section className="nsi-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-sm text-nsi-text mb-1">广告变现总开关</div>
            <div className="font-mono text-[10px] text-nsi-muted">开启后，移动端将按照下方配置展示广告</div>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative w-14 h-7 rounded-full transition-colors ${enabled ? 'bg-nsi-green/30' : 'bg-nsi-border'}`}
          >
            <div className={`absolute top-0.5 w-6 h-6 rounded-full transition-transform ${enabled ? 'translate-x-7 bg-nsi-green' : 'translate-x-0.5 bg-nsi-muted'}`} />
          </button>
        </div>
      </section>

      {/* 广告提供商 */}
      <section className="nsi-card p-5 space-y-4">
        <h2 className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider">广告提供商配置</h2>
        <div>
          <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-2">选择提供商</label>
          <select value={provider} onChange={(e) => setProvider(e.target.value)} className="nsi-input w-full md:w-64">
            {providers.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {provider === 'gdt' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1">App ID</label>
              <input type="text" placeholder="1101234567" className="nsi-input w-full" />
            </div>
            <div>
              <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1">Banner 广告位 ID</label>
              <input type="text" placeholder="xxx" className="nsi-input w-full" />
            </div>
            <div>
              <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1">插屏广告位 ID</label>
              <input type="text" placeholder="xxx" className="nsi-input w-full" />
            </div>
            <div>
              <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1">激励视频广告位 ID</label>
              <input type="text" placeholder="xxx" className="nsi-input w-full" />
            </div>
          </div>
        )}

        {provider === 'pangle' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1">App ID</label>
              <input type="text" placeholder="8012345678" className="nsi-input w-full" />
            </div>
            <div>
              <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1">Code ID</label>
              <input type="text" placeholder="xxx" className="nsi-input w-full" />
            </div>
          </div>
        )}
      </section>

      {/* 展示策略 */}
      <section className="nsi-card p-5 space-y-4">
        <h2 className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider">展示策略</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between bg-nsi-bg/40 border border-nsi-border p-3 rounded-sm">
            <div>
              <div className="font-mono text-xs text-nsi-text">Banner 广告</div>
              <div className="font-mono text-[10px] text-nsi-muted">页面底部横幅</div>
            </div>
            <button
              onClick={() => setShowBanner(!showBanner)}
              className={`relative w-10 h-5 rounded-full transition-colors ${showBanner ? 'bg-nsi-green/30' : 'bg-nsi-border'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${showBanner ? 'translate-x-5 bg-nsi-green' : 'translate-x-0.5 bg-nsi-muted'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between bg-nsi-bg/40 border border-nsi-border p-3 rounded-sm">
            <div>
              <div className="font-mono text-xs text-nsi-text">插屏广告</div>
              <div className="font-mono text-[10px] text-nsi-muted">页面切换时展示</div>
            </div>
            <button
              onClick={() => setShowInterstitial(!showInterstitial)}
              className={`relative w-10 h-5 rounded-full transition-colors ${showInterstitial ? 'bg-nsi-green/30' : 'bg-nsi-border'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${showInterstitial ? 'translate-x-5 bg-nsi-green' : 'translate-x-0.5 bg-nsi-muted'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between bg-nsi-bg/40 border border-nsi-border p-3 rounded-sm">
            <div>
              <div className="font-mono text-xs text-nsi-text">激励视频</div>
              <div className="font-mono text-[10px] text-nsi-muted">PDF导出等场景</div>
            </div>
            <button
              onClick={() => setShowRewardVideo(!showRewardVideo)}
              className={`relative w-10 h-5 rounded-full transition-colors ${showRewardVideo ? 'bg-nsi-green/30' : 'bg-nsi-border'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${showRewardVideo ? 'translate-x-5 bg-nsi-green' : 'translate-x-0.5 bg-nsi-muted'}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1">单会话最大展示次数</label>
            <input type="number" value={maxPerSession} onChange={(e) => setMaxPerSession(Number(e.target.value))} className="nsi-input w-full" />
          </div>
          <div>
            <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1">展示冷却时间（秒）</label>
            <input type="number" value={cooldown} onChange={(e) => setCooldown(Number(e.target.value))} className="nsi-input w-full" />
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <button onClick={save} className="nsi-btn-primary px-8">保存配置</button>
        <button onClick={() => alert('已下发配置到所有客户端')} className="nsi-btn-primary px-8 bg-nsi-green/10 border-nsi-green/40 text-nsi-green hover:bg-nsi-green/20">立即下发</button>
      </div>
    </div>
  )
}
