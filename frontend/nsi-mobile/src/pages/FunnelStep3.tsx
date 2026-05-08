import React from 'react'
import { useCalcStore } from '../stores/calcStore'

interface FunnelStep3Props {
  onNext?: () => void
}

export const FunnelStep3: React.FC<FunnelStep3Props> = () => {
  const calcStore = useCalcStore()
  const { preferences, assumptions, setParams } = calcStore

  const handleChange = (key: string, value: any) => {
    if (key.startsWith('prefs.')) {
      setParams({ preferences: { ...preferences, [key.split('.')[1]]: value } })
    } else if (key.startsWith('assumptions.')) {
      setParams({ assumptions: { ...assumptions, [key.split('.')[1]]: value } })
    } else {
      setParams({ [key]: value })
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-nsi-bg/60 border border-nsi-border p-4 rounded-sm space-y-4">
        <div>
          <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-2">
            目标月养老金
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="20000"
              step="500"
              value={preferences.target_monthly_pension}
              onChange={(e) => handleChange('prefs.target_monthly_pension', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="font-mono text-sm text-nsi-cyan w-24 text-right nsi-number">
              ¥{Math.round(preferences.target_monthly_pension / 1000)}k
            </span>
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-2">
            月预算
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={preferences.monthly_budget}
              onChange={(e) => handleChange('prefs.monthly_budget', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="font-mono text-sm text-nsi-cyan w-20 text-right nsi-number">
              ¥{Math.round(preferences.monthly_budget)}
            </span>
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-2">
            优先级
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'max-pension', label: '最大养老金' },
              { value: 'balance', label: '平衡兼顾' },
              { value: 'min-cost', label: '最小成本' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange('prefs.priority', opt.value)}
                className={`py-2 text-[10px] font-mono tracking-wider rounded-sm border ${
                  preferences.priority === opt.value
                    ? 'bg-nsi-cyan/15 text-nsi-cyan border-nsi-cyan/40'
                    : 'bg-nsi-bg/60 text-nsi-muted border-nsi-border hover:text-nsi-text'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-nsi-bg/60 border border-nsi-border p-4 rounded-sm">
        <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-3">
          高级假设
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">
              通胀率
            </div>
            <input
              type="range"
              min="0"
              max="0.1"
              step="0.01"
              value={assumptions.inflation_rate}
              onChange={(e) => handleChange('assumptions.inflation_rate', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-right font-mono text-xs text-nsi-cyan">
              {(assumptions.inflation_rate * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">
              工资增长率
            </div>
            <input
              type="range"
              min="0"
              max="0.15"
              step="0.01"
              value={assumptions.wage_growth_rate}
              onChange={(e) => handleChange('assumptions.wage_growth_rate', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-right font-mono text-xs text-nsi-cyan">
              {(assumptions.wage_growth_rate * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">
              预期收益率
            </div>
            <input
              type="range"
              min="0.02"
              max="0.12"
              step="0.01"
              value={assumptions.expected_return}
              onChange={(e) => handleChange('assumptions.expected_return', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-right font-mono text-xs text-nsi-cyan">
              {(assumptions.expected_return * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">
              预期寿命
            </div>
            <input
              type="range"
              min="70"
              max="100"
              step="1"
              value={assumptions.life_expectancy}
              onChange={(e) => handleChange('assumptions.life_expectancy', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-right font-mono text-xs text-nsi-cyan">
              {assumptions.life_expectancy}岁
            </div>
          </div>
        </div>
      </div>

      <div className="bg-nsi-green/10 border border-nsi-green/40 p-4 rounded-sm">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-nsi-green shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <div className="font-mono text-xs text-nsi-green mb-1">最大精度</div>
            <div className="font-mono text-[10px] text-nsi-muted">
              所有偏好信息已完善，方案精度提升至约 100%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
