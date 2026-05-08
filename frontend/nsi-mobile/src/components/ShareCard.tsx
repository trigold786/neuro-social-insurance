import { useState, useRef } from 'react'

interface ShareCardProps {
  scenarioName?: string
  monthlyPension?: number
  totalInvested?: number
  irr?: number
  breakEvenAge?: number
  strategy?: string
}

export default function ShareCard({
  scenarioName = '我的社保方案',
  monthlyPension = 5000,
  totalInvested = 450000,
  irr = 0.048,
  breakEvenAge = 71,
  strategy = 'balanced',
}: ShareCardProps) {
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const strategyColors: Record<string, string> = {
    conservative: '#F59E0B',
    balanced: '#06B6D4',
    aggressive: '#10B981',
  }

  const strategyLabels: Record<string, string> = {
    conservative: '保守稳健',
    balanced: '均衡配置',
    aggressive: '进取理财',
  }

  const handleCopy = () => {
    const text = `NSI社保方案: ${scenarioName}\n月养老金: ¥${monthlyPension.toLocaleString()}\n投入成本: ${(totalInvested / 10000).toFixed(0)}万\nIRR: ${(irr * 100).toFixed(1)}%\n回本年龄: ${breakEvenAge}岁`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="nsi-card p-4 space-y-4">
      <h3 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">
        分享方案 // SHARE
      </h3>

      {/* Preview card */}
      <div
        ref={canvasRef}
        className="relative overflow-hidden rounded-sm border border-nsi-border"
        style={{ background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 100%)' }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10"
          style={{ background: `radial-gradient(circle, ${strategyColors[strategy]} 0%, transparent 70%)` }}
        />

        <div className="relative p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider">NSI 社保定制速算器</div>
            <div
              className="px-2 py-0.5 rounded-sm font-mono text-[10px]"
              style={{ color: strategyColors[strategy], backgroundColor: `${strategyColors[strategy]}15`, border: `1px solid ${strategyColors[strategy]}40` }}
            >
              {strategyLabels[strategy]}
            </div>
          </div>

          {/* Scenario name */}
          <div className="font-mono text-lg text-nsi-text">{scenarioName}</div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">预估月养老金</div>
              <div className="font-mono text-2xl text-nsi-cyan" style={{ color: strategyColors[strategy] }}>
                ¥{monthlyPension.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">投入成本</div>
              <div className="font-mono text-xl text-nsi-amber">{(totalInvested / 10000).toFixed(0)}<span className="text-sm text-nsi-muted">万</span></div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">IRR</div>
              <div className="font-mono text-xl text-nsi-green">{(irr * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">回本年龄</div>
              <div className="font-mono text-xl text-nsi-text">{breakEvenAge}<span className="text-sm text-nsi-muted">岁</span></div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-nsi-border/50 flex items-center justify-between">
            <div className="font-mono text-[9px] text-nsi-muted">社保定制速算器 · 仅供参考</div>
            <div className="font-mono text-[9px] text-nsi-muted">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Share actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 py-3 border border-nsi-border rounded-sm text-nsi-muted hover:text-nsi-text hover:border-nsi-cyan/40 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          <span className="font-mono text-[10px] tracking-wider">{copied ? '已复制' : '复制文本'}</span>
        </button>

        <button
          className="flex items-center justify-center gap-2 py-3 border border-nsi-border rounded-sm text-nsi-muted hover:text-nsi-text hover:border-nsi-cyan/40 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
          </svg>
          <span className="font-mono text-[10px] tracking-wider">生成二维码</span>
        </button>

        <button
          className="flex items-center justify-center gap-2 py-3 border border-nsi-border rounded-sm text-nsi-muted hover:text-nsi-text hover:border-nsi-cyan/40 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span className="font-mono text-[10px] tracking-wider">保存图片</span>
        </button>
      </div>
    </div>
  )
}
