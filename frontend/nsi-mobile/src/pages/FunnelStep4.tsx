import React from 'react'
import { useCalcStore } from '../stores/calcStore'
import { useAuthStore } from '../stores/authStore'

interface FunnelStep4Props {
  onNext?: () => void
  completeness?: number
}

export const FunnelStep4: React.FC<FunnelStep4Props> = ({ completeness = 0.6 }) => {
  const calcStore = useCalcStore()
  const authStore = useAuthStore()
  const { allResults } = calcStore

  const regionName = (() => {
    const map: Record<string, string> = {
      '310000': '上海', '110000': '北京', '440100': '广州', '440300': '深圳', '330100': '杭州',
      '510100': '成都', '420100': '武汉', '500100': '重庆', '320100': '南京', '370100': '济南',
      '610100': '西安', '120000': '天津', '320500': '苏州', '410100': '郑州', '430100': '长沙',
      '370200': '青岛', '441900': '东莞', '320200': '无锡', '350200': '厦门', '330200': '宁波',
    }
    return map[authStore.region || '310000'] || '上海'
  })()

  return (
    <div className="space-y-4">
      <div className="bg-nsi-bg/60 border border-nsi-border p-4 rounded-sm space-y-3">
        <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-3">
          数据确认 // DATA CONFIRMATION
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-nsi-bg/40 border border-nsi-border p-2.5 rounded-sm">
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">参保地</div>
            <div className="font-mono text-sm text-nsi-cyan">{regionName}</div>
          </div>
          <div className="bg-nsi-bg/40 border border-nsi-border p-2.5 rounded-sm">
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">当前年龄</div>
            <div className="font-mono text-sm text-nsi-cyan nsi-number">{calcStore.age || 32}<span className="text-xs text-nsi-muted">岁</span></div>
          </div>
        </div>

        <div className="bg-nsi-bg/40 border border-nsi-border p-2.5 rounded-sm">
          <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">数据完整度</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-nsi-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-nsi-cyan transition-all duration-500"
                style={{ width: `${Math.round(completeness * 100)}%` }}
              />
            </div>
            <span className="font-mono text-xs text-nsi-cyan nsi-number">{Math.round(completeness * 100)}%</span>
          </div>
        </div>
      </div>

      {allResults && allResults.length > 0 && (
        <div className="bg-nsi-bg/60 border border-nsi-border p-4 rounded-sm space-y-3">
          <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-2">
            方案预览 // STRATEGY PREVIEW
          </div>
          <div className="space-y-2">
            {allResults.map((r: any) => {
              const labels: Record<string, { label: string; color: string }> = {
                conservative: { label: '保守型', color: 'amber' },
                balanced: { label: '平衡型', color: 'cyan' },
                aggressive: { label: '进取型', color: 'green' },
              }
              const info = labels[r.strategy] || { label: r.strategy, color: 'cyan' }
              return (
                <div key={r.strategy} className={`flex items-center justify-between bg-nsi-${info.color}/5 border border-nsi-${info.color}/20 p-2.5 rounded-sm`}>
                  <span className="font-mono text-xs text-nsi-text">{info.label}</span>
                  <div className="text-right">
                    <div className="font-mono text-xs text-nsi-cyan nsi-number">¥{Math.round(r.monthly_pension_estimate).toLocaleString()}/月</div>
                    <div className="font-mono text-[10px] text-nsi-muted">IRR {(r.irr * 100).toFixed(1)}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="bg-nsi-cyan/10 border border-nsi-cyan/40 p-4 rounded-sm">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-nsi-cyan shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-mono text-xs text-nsi-cyan mb-1">数据已就绪</div>
            <div className="font-mono text-[10px] text-nsi-muted">
              所有数据已收集完毕，3套方案已自动计算。点击「开始精算」进入沙盘推演。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
