import React from 'react'
import { useCalcStore } from '../stores/calcStore'

interface FunnelStep2Props {
  onNext?: () => void
}

export const FunnelStep2: React.FC<FunnelStep2Props> = () => {
  const calcStore = useCalcStore()
  const {
    cumulativeMonths,
    personalAccountBalance,
    contributionIndex,
    isTransitional,
    priorYears,
    setParams,
  } = calcStore

  const handleChange = (key: string, value: any) => {
    setParams({ [key]: value })
  }

  return (
    <div className="space-y-4">
      <div className="bg-nsi-bg/60 border border-nsi-border p-4 rounded-sm space-y-4">
        <div>
          <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-2">
            累计缴费月数
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="480"
              value={cumulativeMonths}
              onChange={(e) => handleChange('cumulativeMonths', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="font-mono text-sm text-nsi-cyan w-16 text-right nsi-number">
              {cumulativeMonths}
              <span className="text-xs text-nsi-muted ml-1">月</span>
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[10px] text-nsi-muted">0</span>
            <span className="font-mono text-[10px] text-nsi-muted">240</span>
            <span className="font-mono text-[10px] text-nsi-muted">480</span>
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-2">
            个人账户余额
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="500000"
              step="1000"
              value={personalAccountBalance}
              onChange={(e) => handleChange('personalAccountBalance', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="font-mono text-sm text-nsi-cyan w-24 text-right nsi-number">
              ¥{Math.round(personalAccountBalance / 1000)}.0
              <span className="text-xs text-nsi-muted ml-1">万</span>
            </span>
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-2">
            平均缴费指数
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.6"
              max="3"
              step="0.1"
              value={contributionIndex}
              onChange={(e) => handleChange('contributionIndex', parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="font-mono text-sm text-nsi-cyan w-12 text-right nsi-number">
              {contributionIndex.toFixed(1)}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider">
              过渡性养老金
            </div>
            <button
              onClick={() => handleChange('isTransitional', !isTransitional)}
              className={`w-10 h-5 rounded-full transition-colors ${isTransitional ? 'bg-nsi-cyan/40' : 'bg-nsi-border'}`}
            >
              <div className={`w-4 h-4 rounded-full transition-transform ${isTransitional ? 'translate-x-5 bg-nsi-cyan' : 'translate-x-0.5 bg-nsi-muted'}`} />
            </button>
          </div>
          {isTransitional && (
            <div className="mt-3">
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-2">
                视同缴费年限
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={priorYears}
                  onChange={(e) => handleChange('priorYears', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="font-mono text-sm text-nsi-cyan w-12 text-right nsi-number">
                  {priorYears}
                  <span className="text-xs text-nsi-muted ml-1">年</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-nsi-amber/10 border border-nsi-amber/40 p-4 rounded-sm">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-nsi-amber shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-mono text-xs text-nsi-amber mb-1">精度提升提示</div>
            <div className="font-mono text-[10px] text-nsi-muted">
              完善参保情况可将方案精度提升至约 85%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
