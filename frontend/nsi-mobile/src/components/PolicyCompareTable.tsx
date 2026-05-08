import { useState } from 'react'

interface PolicyCompareItem {
  city: string
  regionCode: string
  minBase: number
  maxBase: number
  personalPension: string
  employerPension: string
  personalMedical: string
  employerMedical: string
  housingFund: string
  effectiveDate: string
}

const demoPolicies: PolicyCompareItem[] = [
  {
    city: '上海', regionCode: '310000', minBase: 8092, maxBase: 40458,
    personalPension: '8%', employerPension: '16%', personalMedical: '2%', employerMedical: '9.8%', housingFund: '12%', effectiveDate: '2026-07-01',
  },
  {
    city: '北京', regionCode: '110000', minBase: 8358, maxBase: 41790,
    personalPension: '8%', employerPension: '16%', personalMedical: '2%', employerMedical: '9.8%', housingFund: '12%', effectiveDate: '2026-07-01',
  },
  {
    city: '深圳', regionCode: '440300', minBase: 8238, maxBase: 41190,
    personalPension: '8%', employerPension: '16%', personalMedical: '2%', employerMedical: '5.2%', housingFund: '12%', effectiveDate: '2026-07-01',
  },
  {
    city: '广州', regionCode: '440100', minBase: 7917, maxBase: 39582,
    personalPension: '8%', employerPension: '16%', personalMedical: '2%', employerMedical: '5.5%', housingFund: '12%', effectiveDate: '2026-07-01',
  },
]

export default function PolicyCompareTable() {
  const [selectedCities, setSelectedCities] = useState<string[]>(['310000', '110000'])

  const toggleCity = (code: string) => {
    setSelectedCities((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const filtered = demoPolicies.filter((p) => selectedCities.includes(p.regionCode))

  return (
    <div className="nsi-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">
          城市政策对比 // CITY COMPARE
        </h3>
        <span className="font-mono text-[10px] text-nsi-muted">{filtered.length} cities</span>
      </div>

      {/* City selector */}
      <div className="flex flex-wrap gap-2">
        {demoPolicies.map((p) => (
          <button
            key={p.regionCode}
            onClick={() => toggleCity(p.regionCode)}
            className={`px-3 py-1.5 font-mono text-[10px] tracking-wider rounded-sm border transition-all ${
              selectedCities.includes(p.regionCode)
                ? 'bg-nsi-cyan/15 text-nsi-cyan border-nsi-cyan/40'
                : 'text-nsi-muted border-nsi-border hover:border-nsi-cyan/30'
            }`}
          >
            {p.city}
          </button>
        ))}
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nsi-border">
              <th className="text-left font-mono text-[10px] text-nsi-muted uppercase tracking-wider py-2 pr-4">项目</th>
              {filtered.map((p) => (
                <th key={p.regionCode} className="text-left font-mono text-[10px] text-nsi-cyan uppercase tracking-wider py-2 px-3">
                  {p.city}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-nsi-border/50">
            {([
              { label: '基数下限', key: 'minBase' as keyof PolicyCompareItem, format: (v: string | number) => `¥${Number(v).toLocaleString()}` },
              { label: '基数上限', key: 'maxBase' as keyof PolicyCompareItem, format: (v: string | number) => `¥${Number(v).toLocaleString()}` },
              { label: '个人养老', key: 'personalPension' as keyof PolicyCompareItem, format: (v: string | number) => String(v) },
              { label: '单位养老', key: 'employerPension' as keyof PolicyCompareItem, format: (v: string | number) => String(v) },
              { label: '个人医疗', key: 'personalMedical' as keyof PolicyCompareItem, format: (v: string | number) => String(v) },
              { label: '单位医疗', key: 'employerMedical' as keyof PolicyCompareItem, format: (v: string | number) => String(v) },
              { label: '公积金', key: 'housingFund' as keyof PolicyCompareItem, format: (v: string | number) => String(v) },
            ] as { label: string; key: keyof PolicyCompareItem; format: (v: string | number) => string }[]).map((row) => (
              <tr key={row.label}>
                <td className="font-mono text-[10px] text-nsi-muted py-2 pr-4">{row.label}</td>
                {filtered.map((p) => (
                  <td key={p.regionCode} className="font-mono text-xs text-nsi-text py-2 px-3">
                    {row.format(p[row.key] as string | number)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-nsi-amber/10 border border-nsi-amber/30 p-3 rounded-sm">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-nsi-amber shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-mono text-[10px] text-nsi-amber mb-1">数据说明</div>
            <div className="font-mono text-[10px] text-nsi-muted">
              以上数据仅供参考，实际以各地人社局公布为准。生效日期: 2026-07-01
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
