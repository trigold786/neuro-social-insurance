import React from 'react'
import { useCalcStore } from '../stores/calcStore'
import { useAuthStore } from '../stores/authStore'

interface FunnelStep1Props {
  onNext?: () => void
}

export const FunnelStep1: React.FC<FunnelStep1Props> = () => {
  const calcStore = useCalcStore()
  const authStore = useAuthStore()

  const regionCode = authStore.region || '310000'
  const age = calcStore.age || 32

  const regionName = (() => {
    const map: Record<string, string> = {
      '310000': '上海', '110000': '北京', '440100': '广州', '440300': '深圳', '330100': '杭州',
      '510100': '成都', '420100': '武汉', '500100': '重庆', '320100': '南京', '370100': '济南',
    }
    return map[regionCode] || '上海'
  })()

  return (
    <div className="space-y-4">
      <div className="bg-nsi-bg/60 border border-nsi-border p-4 rounded-sm">
        <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-2">
          当前状态
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">参保地</div>
            <div className="font-mono text-sm text-nsi-cyan">{regionName}</div>
          </div>
          <div>
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">当前年龄</div>
            <div className="font-mono text-sm text-nsi-cyan nsi-number">{age}<span className="text-xs text-nsi-muted">岁</span></div>
          </div>
        </div>
      </div>

      <div className="bg-nsi-cyan/10 border border-nsi-cyan/40 p-4 rounded-sm">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-nsi-cyan shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-mono text-xs text-nsi-cyan mb-1">快速体验提示</div>
            <div className="font-mono text-[10px] text-nsi-muted">
              基本信息已从您的个人资料读取。您可以继续进行精算，或前往个人资料修改信息。
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">
          进度
        </div>
        <div className="text-xs font-mono text-nsi-cyan">基础方案可用 - 精度约 60%</div>
      </div>
    </div>
  )
}
