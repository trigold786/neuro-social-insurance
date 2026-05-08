import { useState, useEffect } from 'react'

interface OnboardingStep {
  id: string
  title: string
  subtitle: string
  targetSelector: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '欢迎使用 NSI 社保定制速算器',
    subtitle: '3步获取您的专属社保方案',
    targetSelector: 'body',
    position: 'bottom',
  },
  {
    id: 'dashboard',
    title: '智能档案 // SMART PROFILE',
    subtitle: '您的参保地、年龄、累计时长一目了然',
    targetSelector: '[data-tour="dashboard-profile"]',
    position: 'bottom',
  },
  {
    id: 'policy-radar',
    title: '政策情报雷达 // POLICY RADAR',
    subtitle: '实时追踪您所在地区的最新社保政策',
    targetSelector: '[data-tour="policy-radar"]',
    position: 'top',
  },
  {
    id: 'sandbox',
    title: '启动智能测算沙盘',
    subtitle: '调整参数，实时查看3套方案的投入产出预测',
    targetSelector: '[data-tour="sandbox-btn"]',
    position: 'top',
  },
]

export default function OnboardingGuide() {
  const [currentStep, setCurrentStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [hasSeen, setHasSeen] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('nsi-onboarding-seen')
    if (!seen) {
      setVisible(true)
    } else {
      setHasSeen(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    setVisible(false)
    localStorage.setItem('nsi-onboarding-seen', 'true')
  }

  const handleComplete = () => {
    setVisible(false)
    setHasSeen(true)
    localStorage.setItem('nsi-onboarding-seen', 'true')
  }

  if (!visible || hasSeen) return null

  const step = steps[currentStep]

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />

      {/* Spotlight ring (simplified) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-48 border-2 border-nsi-cyan/50 rounded-sm" />
      </div>

      {/* Tooltip card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80">
        <div className="nsi-card p-5 space-y-4">
          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-nsi-cyan' : 'bg-nsi-border'
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="space-y-2">
            <div className="font-mono text-xs text-nsi-cyan uppercase tracking-wider">
              Step {currentStep + 1} / {steps.length}
            </div>
            <h3 className="font-mono text-sm text-nsi-text">{step.title}</h3>
            <p className="font-mono text-xs text-nsi-muted leading-relaxed">{step.subtitle}</p>
          </div>

          {/* Example personas preview (on first step) */}
          {currentStep === 0 && (
            <div className="bg-nsi-bg/60 border border-nsi-border rounded-sm p-3 space-y-2">
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider">示例用户</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: '小王', age: 25, type: '进取型设计师', icon: '💻' },
                  { name: '李姐', age: 40, type: '稳健转型者', icon: '🔄' },
                  { name: '老张', age: 55, type: '补缴优化型', icon: '📈' },
                  { name: '陈工', age: 35, type: '跨区域务工', icon: '🚄' },
                ].map((p) => (
                  <div key={p.name} className="bg-nsi-bg border border-nsi-border p-2 rounded-sm text-center">
                    <div className="text-lg mb-1">{p.icon}</div>
                    <div className="font-mono text-[10px] text-nsi-text">{p.name} · {p.age}岁</div>
                    <div className="font-mono text-[9px] text-nsi-muted">{p.type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleSkip}
              className="font-mono text-[10px] text-nsi-muted hover:text-nsi-text transition-colors"
            >
              跳过引导
            </button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-3 py-2 font-mono text-[10px] tracking-wider rounded-sm border border-nsi-border text-nsi-muted hover:text-nsi-text"
                >
                  上一步
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-2 font-mono text-[10px] tracking-wider rounded-sm bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/40 hover:bg-nsi-cyan/25"
              >
                {currentStep === steps.length - 1 ? '开始使用' : '下一步'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
