import { useState, useCallback } from 'react'
import { calcApi } from '../api/client'

interface TaxResult {
  annual_income: number
  total_deductions: number
  taxable_income: number
  annual_tax: number
  after_tax_income: number
  effective_rate: number
  monthly_breakdown: {
    month: number
    cumulative_income: number
    cumulative_deduct: number
    cumulative_taxable: number
    cumulative_tax: number
    monthly_tax: number
    after_tax_income: number
    effective_rate: number
  }[]
  deduction_detail: {
    social_insurance: number
    pollution_removal: number
    special_deduction: number
    additional_total: number
    taxable_income: number
  }
}

interface SpecialDeductions {
  children_education: number
  continuing_education: number
  serious_illness_medical: number
  housing_rent: number
  housing_loan_interest: number
  elderly_care: number
  childcare_under_3: number
}

export default function TaxCalculator() {
  const [annualIncome, setAnnualIncome] = useState(150000)
  const [socialInsurance, setSocialInsurance] = useState(18000)
  const [regionCode, setRegionCode] = useState('310000')
  const [special, setSpecial] = useState<SpecialDeductions>({
    children_education: 0,
    continuing_education: 0,
    serious_illness_medical: 0,
    housing_rent: 0,
    housing_loan_interest: 0,
    elderly_care: 0,
    childcare_under_3: 0,
  })
  const [result, setResult] = useState<TaxResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateSpecial = useCallback((key: keyof SpecialDeductions, value: number) => {
    setSpecial((prev) => ({ ...prev, [key]: value }))
  }, [])

  const calculate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await calcApi.tax({
        annual_income: annualIncome,
        region_code: regionCode,
        social_insurance: socialInsurance,
        special_deductions: special,
      }) as TaxResult
      setResult(res)
    } catch (e: any) {
      setError(e.message || '计算失败')
    } finally {
      setLoading(false)
    }
  }, [annualIncome, socialInsurance, regionCode, special])

  const cityTier = (() => {
    if (['310000', '110000', '440300', '440100'].includes(regionCode)) return 1
    if (['330100', '320100', '510100', '420100', '500000', '370100', '330200', '320500', '610100', '120000', '410100', '430100', '370200', '441900', '320200', '350200'].includes(regionCode)) return 2
    return 3
  })()

  const rentMap: Record<number, number> = { 1: 1500, 2: 1100, 3: 800 }

  return (
    <div className="space-y-4">
      <div className="nsi-card p-4">
        <div className="font-mono text-xs text-nsi-muted uppercase tracking-widest mb-3">
          个税计算器 // INCOME TAX
        </div>

        <div className="space-y-3">
          <div>
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">年度税前收入</div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={60000}
                max={1000000}
                step={10000}
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-sm text-nsi-cyan nsi-number w-28 text-right">
                ¥{annualIncome.toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">社保公积金年缴</div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100000}
                step={1000}
                value={socialInsurance}
                onChange={(e) => setSocialInsurance(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-sm text-nsi-cyan nsi-number w-24 text-right">
                ¥{socialInsurance.toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">就业城市</div>
            <select
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value)}
              className="w-full bg-nsi-bg border border-nsi-border rounded-sm px-3 py-2 font-mono text-sm text-nsi-text"
            >
              {Object.entries({
                '310000': '上海', '110000': '北京', '440100': '广州', '440300': '深圳',
                '330100': '杭州', '320100': '南京', '510100': '成都', '420100': '武汉',
                '500000': '重庆', '370100': '济南', '330200': '宁波', '610100': '西安',
                '120000': '天津', '320500': '苏州', '410100': '郑州', '430100': '长沙',
              }).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="nsi-card p-4">
        <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-3">
          专项附加扣除 (7项)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="font-mono text-[10px] text-nsi-muted mb-1">子女教育 (每孩¥1000/月)</div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={3000}
                step={1000}
                value={special.children_education}
                onChange={(e) => updateSpecial('children_education', Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-xs text-nsi-cyan w-12 text-right">¥{special.children_education}</span>
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-nsi-muted mb-1">继续教育 (¥400/月)</div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={4800}
                step={400}
                value={special.continuing_education}
                onChange={(e) => updateSpecial('continuing_education', Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-xs text-nsi-cyan w-12 text-right">¥{special.continuing_education}</span>
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-nsi-muted mb-1">大病医疗 (上限¥8万)</div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={80000}
                step={5000}
                value={special.serious_illness_medical}
                onChange={(e) => updateSpecial('serious_illness_medical', Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-xs text-nsi-cyan w-16 text-right">¥{special.serious_illness_medical.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-nsi-muted mb-1">住房租金 (¥{rentMap[cityTier]}/月)</div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={rentMap[cityTier] * 12}
                step={rentMap[cityTier]}
                value={special.housing_rent}
                onChange={(e) => updateSpecial('housing_rent', Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-xs text-nsi-cyan w-16 text-right">¥{special.housing_rent.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-nsi-muted mb-1">住房贷款利息 (¥1000/月)</div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={12000}
                step={1000}
                value={special.housing_loan_interest}
                onChange={(e) => updateSpecial('housing_loan_interest', Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-xs text-nsi-cyan w-12 text-right">¥{special.housing_loan_interest}</span>
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-nsi-muted mb-1">赡养老人 (¥2000/月)</div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={24000}
                step={2000}
                value={special.elderly_care}
                onChange={(e) => updateSpecial('elderly_care', Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-xs text-nsi-cyan w-12 text-right">¥{special.elderly_care / 1000}k</span>
            </div>
          </div>

          <div className="col-span-2">
            <div className="font-mono text-[10px] text-nsi-muted mb-1">3岁以下婴幼儿照护 (每孩¥1000/月)</div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={3000}
                step={1000}
                value={special.childcare_under_3}
                onChange={(e) => updateSpecial('childcare_under_3', Number(e.target.value))}
                className="flex-1 max-w-xs"
              />
              <span className="font-mono text-xs text-nsi-cyan w-12 text-right">¥{special.childcare_under_3}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex justify-between items-center text-[10px] text-nsi-muted font-mono">
          <span>专项附加扣除合计:</span>
          <span className="text-nsi-green">
            ¥{Object.values(special).reduce((a, b) => a + b, 0).toLocaleString()}/年
          </span>
        </div>
      </div>

      <button
        onClick={calculate}
        disabled={loading}
        className="w-full nsi-btn-primary py-3 disabled:opacity-50"
      >
        {loading ? '计算中...' : '计算个税'}
      </button>

      {error && (
        <div className="bg-nsi-amber/10 border border-nsi-amber/30 p-3 rounded-sm">
          <span className="font-mono text-xs text-nsi-amber">{error}</span>
        </div>
      )}

      {result && (
        <div className="nsi-card p-4 space-y-4">
          <div className="font-mono text-xs text-nsi-muted uppercase tracking-widest mb-3">
            税务分析结果
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">年度税前收入</div>
              <div className="font-mono text-lg text-nsi-text nsi-number">¥{result.annual_income.toLocaleString()}</div>
            </div>
            <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">年度应纳税</div>
              <div className="font-mono text-lg text-nsi-amber nsi-number text-glow-amber">¥{Math.round(result.annual_tax).toLocaleString()}</div>
            </div>
            <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">扣除总计</div>
              <div className="font-mono text-sm text-nsi-cyan nsi-number">¥{result.total_deductions.toLocaleString()}</div>
            </div>
            <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">税后年收入</div>
              <div className="font-mono text-lg text-nsi-green nsi-number text-glow-green">¥{Math.round(result.after_tax_income).toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-2">扣除明细</div>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-nsi-muted">社保公积金</span>
                <span className="text-nsi-text">¥{result.deduction_detail.social_insurance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-nsi-muted">基本减除费用</span>
                <span className="text-nsi-text">¥60,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-nsi-muted">专项附加扣除</span>
                <span className="text-nsi-green">-¥{result.deduction_detail.additional_total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-nsi-border pt-1 mt-1">
                <span className="text-nsi-muted">应纳税所得额</span>
                <span className="text-nsi-cyan">¥{result.deduction_detail.taxable_income.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-2">月度明细</div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {result.monthly_breakdown.map((m) => (
                <div key={m.month} className="grid grid-cols-4 gap-2 text-[10px] font-mono">
                  <span className="text-nsi-muted">{m.month}月</span>
                  <span className="text-nsi-text">税前¥{Math.round(m.cumulative_income / m.month).toLocaleString()}/月</span>
                  <span className="text-nsi-amber">个税¥{Math.round(m.monthly_tax)}</span>
                  <span className="text-nsi-green">实收¥{Math.round(m.after_tax_income).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-[10px] font-mono text-nsi-muted">
            实际税率: <span className="text-nsi-cyan">{(result.effective_rate * 100).toFixed(2)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}
