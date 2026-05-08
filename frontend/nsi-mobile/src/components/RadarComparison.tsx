import { useMemo } from 'react'

interface RadarData {
  label: string
  conservative: number
  balanced: number
  aggressive: number
}

interface RadarComparisonProps {
  data?: RadarData[]
}

const defaultData: RadarData[] = [
  { label: '月养老金', conservative: 40, balanced: 70, aggressive: 100 },
  { label: '投入成本', conservative: 30, balanced: 60, aggressive: 100 },
  { label: 'IRR', conservative: 50, balanced: 75, aggressive: 90 },
  { label: '回本速度', conservative: 80, balanced: 65, aggressive: 50 },
  { label: '风险等级', conservative: 20, balanced: 50, aggressive: 85 },
  { label: '生活品质', conservative: 45, balanced: 70, aggressive: 95 },
]

const strategyColors = {
  conservative: { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.15)' },
  balanced: { stroke: '#06B6D4', fill: 'rgba(6, 182, 212, 0.15)' },
  aggressive: { stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.15)' },
}

const strategyLabels: Record<string, string> = {
  conservative: '保守稳健',
  balanced: '均衡配置',
  aggressive: '进取理财',
}

export default function RadarComparison({ data = defaultData }: RadarComparisonProps) {
  const size = 280
  const center = size / 2
  const radius = 100
  const levels = 5

  const axes = useMemo(() => {
    return data.map((_, i) => {
      const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        angle,
      }
    })
  }, [data])

  const getPolygonPoints = (values: number[]) => {
    return values
      .map((value, i) => {
        const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
        const r = (value / 100) * radius
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`
      })
      .join(' ')
  }

  return (
    <div className="nsi-card p-4">
      <h3 className="font-mono text-xs text-nsi-muted uppercase tracking-widest mb-4">
        方案多维对比 // RADAR COMPARISON
      </h3>

      <div className="flex justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Grid circles */}
          {Array.from({ length: levels }, (_, i) => {
            const r = ((i + 1) / levels) * radius
            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
                strokeDasharray="3,3"
              />
            )
          })}

          {/* Axis lines */}
          {axes.map((axis, i) => (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={axis.x}
              y2={axis.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
          ))}

          {/* Strategy polygons */}
          {(Object.keys(strategyColors) as Array<keyof typeof strategyColors>).map((strategy) => {
            const values = data.map((d) => d[strategy])
            const points = getPolygonPoints(values)
            const color = strategyColors[strategy]
            return (
              <g key={strategy}>
                <polygon
                  points={points}
                  fill={color.fill}
                  stroke={color.stroke}
                  strokeWidth={1.5}
                  opacity={0.8}
                />
                {values.map((value, i) => {
                  const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
                  const r = (value / 100) * radius
                  return (
                    <circle
                      key={i}
                      cx={center + r * Math.cos(angle)}
                      cy={center + r * Math.sin(angle)}
                      r={3}
                      fill={color.stroke}
                    />
                  )
                })}
              </g>
            )
          })}

          {/* Labels */}
          {axes.map((axis, i) => {
            const labelX = center + (radius + 20) * Math.cos(axis.angle)
            const labelY = center + (radius + 20) * Math.sin(axis.angle)
            return (
              <text
                key={i}
                x={labelX}
                y={labelY}
                textAnchor={labelX > center ? 'start' : labelX < center ? 'end' : 'middle'}
                dominantBaseline="middle"
                fill="#8899a6"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {data[i].label}
              </text>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {(Object.keys(strategyColors) as Array<keyof typeof strategyColors>).map((strategy) => (
          <div key={strategy} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: strategyColors[strategy].stroke }}
            />
            <span className="font-mono text-[10px] text-nsi-muted">{strategyLabels[strategy]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
