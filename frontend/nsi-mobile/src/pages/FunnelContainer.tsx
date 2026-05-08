import React, { useMemo } from 'react'
import { useCalcStore, CalcState } from '../stores/calcStore'
import { FunnelStep } from './FunnelStep'
import { FunnelStep1 } from './FunnelStep1'
import { FunnelStep2 } from './FunnelStep2'
import { FunnelStep3 } from './FunnelStep3'
import { FunnelStep4 } from './FunnelStep4'

const funnelSteps = [
  { step: 1, title: '基本信息', subtitle: '年龄/参保地' },
  { step: 2, title: '参保情况', subtitle: '缴费历史/余额' },
  { step: 3, title: '偏好设置', subtitle: '目标/风险' },
  { step: 4, title: '确认预览', subtitle: '方案确认' },
]

function validateStep(step: number, state: CalcState): boolean {
  switch (step) {
    case 1:
      return !!(state.age && state.regionCode)
    case 2:
      return state.cumulativeMonths !== undefined
    case 3:
      return true
    case 4:
      return !!(state.allResults && state.allResults.length > 0)
    default:
      return true
  }
}

function computeCompleteness(state: CalcState): number {
  let score = 0
  if (state.age) score += 0.15
  if (state.regionCode) score += 0.15
  if (state.baseSalary > 0) score += 0.1
  if (state.cumulativeMonths > 0) score += 0.15
  if (state.personalAccountBalance > 0) score += 0.1
  if (state.contributionIndex !== 1.0) score += 0.05
  if (state.retirementAge !== 60) score += 0.05
  if (state.preferences.target_monthly_pension > 0) score += 0.1
  if (state.preferences.monthly_budget > 0) score += 0.05
  if (state.assumptions.inflation_rate !== 0.03) score += 0.05
  if (state.assumptions.wage_growth_rate !== 0.05) score += 0.05
  if (state.allResults && state.allResults.length > 0) score += 0.0
  return Math.min(score, 1.0)
}

export const FunnelContainer: React.FC = () => {
  const calcStore = useCalcStore()
  const { funnelStep, setFunnelStep, allResults } = calcStore

  const completeness = useMemo(() => computeCompleteness(calcStore), [calcStore])

  const renderStepContent = () => {
    switch (funnelStep) {
      case 1:
        return <FunnelStep1 />
      case 2:
        return <FunnelStep2 />
      case 3:
        return <FunnelStep3 />
      case 4:
        return <FunnelStep4 completeness={completeness} />
      default:
        return <FunnelStep1 />
    }
  }

  return (
    <div className="space-y-4">
      <section className="nsi-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-mono text-xs text-nsi-muted uppercase tracking-widest">
            信息收集
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-nsi-muted">进度</span>
            <div className="w-24 h-1.5 bg-nsi-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-nsi-cyan transition-all duration-500"
                style={{ width: `${Math.round(completeness * 100)}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-nsi-cyan nsi-number">{Math.round(completeness * 100)}%</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto">
          {funnelSteps.map((fs, idx) => {
            const isCompleted = funnelStep > fs.step
            const isActive = funnelStep === fs.step
            const isValid = validateStep(fs.step, calcStore)
            return (
              <React.Fragment key={fs.step}>
                {idx > 0 && (
                  <div className={`flex-1 h-px ${funnelStep > fs.step ? 'bg-nsi-cyan' : 'bg-nsi-border'} transition-colors`} />
                )}
                <button
                  onClick={() => setFunnelStep(fs.step)}
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-nsi-cyan/20 border-nsi-cyan/60 text-nsi-cyan'
                      : isCompleted
                      ? 'bg-nsi-green/20 border-nsi-green/40 text-nsi-green'
                      : isValid
                      ? 'bg-nsi-bg/60 border-nsi-border text-nsi-muted hover:border-nsi-cyan/40'
                      : 'bg-nsi-bg/40 border-nsi-border/50 text-nsi-muted/50'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    fs.step
                  )}
                </button>
              </React.Fragment>
            )
          })}
        </div>

        <div className="space-y-2">
          {funnelSteps.map((fs) => (
            <FunnelStep
              key={fs.step}
              step={fs.step}
              currentStep={funnelStep}
              title={fs.title}
              subtitle={fs.subtitle}
              isCompleted={funnelStep > fs.step}
              isValid={validateStep(fs.step, calcStore)}
              onClick={() => setFunnelStep(fs.step)}
            />
          ))}
        </div>
      </section>

      <section className="nsi-card p-4">
        {renderStepContent()}
      </section>

      <div className="flex gap-3">
        {funnelStep > 1 && (
          <button
            onClick={() => setFunnelStep(funnelStep - 1)}
            className="flex-1 py-3 font-mono text-sm tracking-wider rounded-sm border border-nsi-border text-nsi-muted hover:text-nsi-text hover:border-nsi-cyan/40"
          >
            上一步
          </button>
        )}
        {funnelStep < 4 && (
          <button
            onClick={() => setFunnelStep(funnelStep + 1)}
            disabled={!validateStep(funnelStep, calcStore)}
            className="flex-1 py-3 font-mono text-sm tracking-wider rounded-sm border border-nsi-cyan/40 text-nsi-cyan bg-nsi-cyan/10 hover:bg-nsi-cyan/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            下一步
          </button>
        )}
        {funnelStep === 4 && allResults && allResults.length > 0 && (
          <button
            onClick={() => setFunnelStep(1)}
            className="flex-1 py-3 font-mono text-sm tracking-wider rounded-sm border border-nsi-cyan/40 text-nsi-cyan bg-nsi-cyan/10 hover:bg-nsi-cyan/20"
          >
            重新开始
          </button>
        )}
      </div>
    </div>
  )
}
