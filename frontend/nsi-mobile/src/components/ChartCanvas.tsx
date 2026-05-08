import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

interface ChartCanvasProps {
  labels: string[]
  invested: number[]
  benefit: number[]
  breakEvenIndex: number
}

export default function ChartCanvas({ labels, invested, benefit, breakEvenIndex }: ChartCanvasProps) {
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: 'easeOutQuart' as any },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#7b8fa6',
          font: { family: '"JetBrains Mono", monospace', size: 10 },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#0d1526',
        titleColor: '#e8f0fe',
        bodyColor: '#e8f0fe',
        borderColor: '#1a2332',
        borderWidth: 1,
        titleFont: { family: '"JetBrains Mono", monospace', size: 11 },
        bodyFont: { family: '"JetBrains Mono", monospace', size: 11 },
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y as number
            return `${ctx.dataset.label}: ${val >= 10000 ? (val / 10000).toFixed(1) + '万' : val.toLocaleString()}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#111a2e' },
        ticks: { color: '#7b8fa6', font: { family: '"JetBrains Mono", monospace', size: 9 }, maxTicksLimit: 8 },
      },
      y: {
        grid: { color: '#111a2e' },
        ticks: {
          color: '#7b8fa6',
          font: { family: '"JetBrains Mono", monospace', size: 9 },
          callback: (v) => (v as number) >= 10000 ? (v as number / 10000) + '万' : v,
        },
      },
    },
  }

  const data = {
    labels,
    datasets: [
      {
        label: '累计投入',
        data: invested,
        borderColor: '#ffb800',
        backgroundColor: 'rgba(255,184,0,0.08)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.3,
      },
      {
        label: '累计领取',
        data: benefit,
        borderColor: '#00e5a0',
        backgroundColor: 'rgba(0,229,160,0.08)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.3,
      },
    ],
  }

  return (
    <div className="relative h-56 lg:h-72">
      <Line data={data} options={options} />
      {/* Break-even annotation overlay */}
      {breakEvenIndex >= 0 && breakEvenIndex < labels.length && labels.length > 1 && (
        <div
          className="absolute top-0 bottom-0 w-px bg-nsi-coral/40 pointer-events-none"
          style={{ left: `${(breakEvenIndex / (labels.length - 1)) * 100}%` }}
        >
          <div className="absolute -top-1 -translate-x-1/2 bg-nsi-coral text-nsi-bg font-mono text-[9px] px-1.5 py-0.5 rounded-sm whitespace-nowrap">
            回本 {labels[breakEvenIndex]}
          </div>
        </div>
      )}
    </div>
  )
}
