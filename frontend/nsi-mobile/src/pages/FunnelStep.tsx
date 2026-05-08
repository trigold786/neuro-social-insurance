import React from 'react'

interface FunnelStepProps {
  step: number
  currentStep: number
  title: string
  subtitle: string
  isCompleted: boolean
  isValid?: boolean
  onClick: () => void
}

export const FunnelStep: React.FC<FunnelStepProps> = ({
  step,
  currentStep,
  title,
  subtitle,
  isCompleted,
  isValid = true,
  onClick,
}) => {
  const isActive = currentStep === step

  let bgClass = 'bg-nsi-bg/60 border-nsi-border'
  let textClass = 'text-nsi-muted'
  let circleClass = 'bg-nsi-bg/60 border-nsi-border text-nsi-muted'

  if (isActive) {
    bgClass = 'bg-nsi-cyan/10 border-nsi-cyan/40'
    textClass = 'text-nsi-text'
    circleClass = 'bg-nsi-cyan/20 border-nsi-cyan/40 text-nsi-cyan'
  } else if (isCompleted) {
    bgClass = 'bg-nsi-green/10 border-nsi-green/40'
    textClass = 'text-nsi-text'
    circleClass = 'bg-nsi-green/20 border-nsi-green/40 text-nsi-green'
  } else if (!isValid) {
    bgClass = 'bg-nsi-bg/40 border-nsi-border/50'
    circleClass = 'bg-nsi-bg/40 border-nsi-border/50 text-nsi-muted/50'
  }

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-sm border transition-all text-left w-full ${bgClass} ${isValid ? 'hover:border-nsi-cyan/40' : 'cursor-not-allowed'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${circleClass}`}>
          {isCompleted ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="font-mono text-xs">{step}</span>
          )}
        </div>
        <div>
          <div className={`font-mono text-xs ${textClass}`}>{title}</div>
          <div className="font-mono text-[10px] text-nsi-muted">{subtitle}</div>
        </div>
      </div>
    </button>
  )
}
