import { useState } from 'react'

interface Persona {
  id: string
  name: string
  age: number
  occupation: string
  avatar: string
  strategy: 'conservative' | 'balanced' | 'aggressive'
  description: string
  params: {
    regionCode: string
    baseSalary: number
    retirementAge: number
    cumulativeMonths: number
    personalAccountBalance: number
  }
  results: {
    monthlyPension: number
    totalInvested: number
    irr: number
    breakEvenAge: number
  }
}

const personas: Persona[] = [
  {
    id: 'designer',
    name: '小王',
    age: 25,
    occupation: 'UI设计师',
    avatar: '🎨',
    strategy: 'aggressive',
    description: '25岁灵活就业设计师，收入波动大但增长潜力高，建议选择进取型方案最大化长期收益。',
    params: { regionCode: '310000', baseSalary: 12000, retirementAge: 65, cumulativeMonths: 24, personalAccountBalance: 15000 },
    results: { monthlyPension: 8200, totalInvested: 980000, irr: 0.052, breakEvenAge: 73 },
  },
  {
    id: 'transformer',
    name: '李姐',
    age: 40,
    occupation: '待业转型中',
    avatar: '🔄',
    strategy: 'balanced',
    description: '40岁正在职业转型，需要平衡当前支出与未来保障，建议选择均衡型方案。',
    params: { regionCode: '110000', baseSalary: 8000, retirementAge: 60, cumulativeMonths: 120, personalAccountBalance: 80000 },
    results: { monthlyPension: 5600, totalInvested: 420000, irr: 0.048, breakEvenAge: 71 },
  },
  {
    id: 'older',
    name: '老张',
    age: 55,
    occupation: '工厂技师',
    avatar: '⚙️',
    strategy: 'conservative',
    description: '55岁临近退休，重点在于补缴优化和最低保障，建议选择保守型方案确保底线。',
    params: { regionCode: '440100', baseSalary: 6000, retirementAge: 60, cumulativeMonths: 300, personalAccountBalance: 180000 },
    results: { monthlyPension: 4200, totalInvested: 180000, irr: 0.035, breakEvenAge: 68 },
  },
  {
    id: 'migrant',
    name: '陈工',
    age: 35,
    occupation: '建筑工程师',
    avatar: '🏗️',
    strategy: 'balanced',
    description: '35岁跨区域务工人员，多段参保历史需要合并计算，建议选择均衡型方案。',
    params: { regionCode: '440300', baseSalary: 10000, retirementAge: 62, cumulativeMonths: 96, personalAccountBalance: 55000 },
    results: { monthlyPension: 6800, totalInvested: 650000, irr: 0.049, breakEvenAge: 72 },
  },
]

const strategyColors: Record<string, { bg: string; text: string }> = {
  conservative: { bg: 'bg-nsi-amber/10', text: 'text-nsi-amber' },
  balanced: { bg: 'bg-nsi-cyan/10', text: 'text-nsi-cyan' },
  aggressive: { bg: 'bg-nsi-green/10', text: 'text-nsi-green' },
}

const strategyLabels: Record<string, string> = {
  conservative: '保守稳健',
  balanced: '均衡配置',
  aggressive: '进取理财',
}

interface ExamplePersonaCardProps {
  onSelectPersona?: (persona: Persona) => void
}

export default function ExamplePersonaCard({ onSelectPersona }: ExamplePersonaCardProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="nsi-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">
          示例用户 // EXAMPLE PERSONAS
        </h3>
        <span className="font-mono text-[10px] text-nsi-muted">快速体验</span>
      </div>

      <div className="space-y-3">
        {personas.map((persona) => {
          const isExpanded = expanded === persona.id
          const colors = strategyColors[persona.strategy]

          return (
            <div
              key={persona.id}
              className="bg-nsi-bg/60 border border-nsi-border rounded-sm overflow-hidden hover:border-nsi-cyan/30 transition-colors"
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : persona.id)}
                className="w-full p-3 flex items-center gap-3 text-left"
              >
                <span className="text-2xl">{persona.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-sm text-nsi-text">{persona.name}</span>
                    <span className="font-mono text-[10px] text-nsi-muted">{persona.age}岁 · {persona.occupation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-1.5 py-0.5 rounded-sm font-mono text-[9px] ${colors.bg} ${colors.text}`}>
                      {strategyLabels[persona.strategy]}
                    </span>
                    <span className="font-mono text-[10px] text-nsi-cyan">月领 ¥{persona.results.monthlyPension.toLocaleString()}</span>
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-nsi-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-3">
                  <p className="font-mono text-[10px] text-nsi-muted leading-relaxed">
                    {persona.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-nsi-bg border border-nsi-border p-2 rounded-sm">
                      <div className="font-mono text-[9px] text-nsi-muted">缴费基数</div>
                      <div className="font-mono text-xs text-nsi-text">¥{persona.params.baseSalary.toLocaleString()}</div>
                    </div>
                    <div className="bg-nsi-bg border border-nsi-border p-2 rounded-sm">
                      <div className="font-mono text-[9px] text-nsi-muted">退休年龄</div>
                      <div className="font-mono text-xs text-nsi-text">{persona.params.retirementAge}岁</div>
                    </div>
                    <div className="bg-nsi-bg border border-nsi-border p-2 rounded-sm">
                      <div className="font-mono text-[9px] text-nsi-muted">投入成本</div>
                      <div className="font-mono text-xs text-nsi-amber">{(persona.results.totalInvested / 10000).toFixed(0)}万</div>
                    </div>
                    <div className="bg-nsi-bg border border-nsi-border p-2 rounded-sm">
                      <div className="font-mono text-[9px] text-nsi-muted">IRR</div>
                      <div className="font-mono text-xs text-nsi-green">{(persona.results.irr * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectPersona?.(persona)}
                    className="w-full py-2 font-mono text-[10px] tracking-wider rounded-sm border border-nsi-cyan/40 text-nsi-cyan bg-nsi-cyan/10 hover:bg-nsi-cyan/20 transition-colors"
                  >
                    应用此方案参数
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
