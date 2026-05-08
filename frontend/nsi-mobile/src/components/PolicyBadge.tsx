interface PolicyBadgeProps {
  status: 'verified' | 'conflict' | 'draft'
  label?: string
  showText?: boolean
  size?: 'sm' | 'md'
}

export default function PolicyBadge({ status, label, showText = true, size = 'sm' }: PolicyBadgeProps) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
  const map = {
    verified: {
      dotClass: 'nsi-status-dot--verified',
      text: 'VERIFIED',
      colorClass: 'text-nsi-green',
    },
    conflict: {
      dotClass: 'nsi-status-dot--conflict',
      text: 'CONFLICT',
      colorClass: 'text-nsi-amber',
    },
    draft: {
      dotClass: 'nsi-status-dot--draft',
      text: 'DRAFT',
      colorClass: 'text-nsi-coral',
    },
  }
  const s = map[status]
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`nsi-status-dot ${dotSize} ${s.dotClass}`} />
      {showText && (
        <span className={`font-mono text-[10px] ${s.colorClass} uppercase tracking-wider`}>
          {label || s.text}
        </span>
      )}
    </div>
  )
}
