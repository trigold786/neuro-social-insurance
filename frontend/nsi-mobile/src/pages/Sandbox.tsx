import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Slider from '../components/Slider'
import ChartCanvas from '../components/ChartCanvas'
import ShareCard from '../components/ShareCard'
import { calcApi, scenarioApi, reportApi } from '../api/client'
import { useCalcStore, StrategyResult } from '../stores/calcStore'
import { useAuthStore } from '../stores/authStore'
import { FunnelContainer } from './FunnelContainer'

function SegmentedControl({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex bg-nsi-bg border border-nsi-border rounded-sm p-0.5">
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`flex-1 py-1.5 text-[11px] font-mono tracking-wider rounded-sm transition-all ${value === opt.value ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30' : 'text-nsi-muted hover:text-nsi-text'}`}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function StrategyCard({ result, isActive, onClick }: { result: StrategyResult; isActive: boolean; onClick: () => void }) {
  const strategyLabels: Record<string, { label: string; color: string }> = {
    conservative: { label: '保守稳健', color: 'amber' },
    balanced: { label: '均衡配置', color: 'cyan' },
    aggressive: { label: '进取理财', color: 'green' },
  }

  const info = strategyLabels[result.strategy] || { label: '方案', color: 'cyan' }
  const colorClass = `text-nsi-${info.color} border-nsi-${info.color}/30 bg-nsi-${info.color}/10`

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-sm border transition-all text-left w-full ${isActive ? 'bg-nsi-bg/80 border-nsi-cyan/40' : 'bg-nsi-bg/40 border-nsi-border hover:border-nsi-border/80'}`}
    >
      <div className={`inline-block px-2 py-1 rounded-sm text-[10px] font-mono tracking-wider mb-2 ${colorClass}`}>{info.label}</div>
      <div className="space-y-2">
        <div>
          <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider">月养老金</div>
          <div className="font-mono text-xl text-nsi-text">{Math.round(result.monthly_pension_estimate).toLocaleString()}<span className="text-xs text-nsi-muted">元</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="font-mono text-[9px] text-nsi-muted uppercase tracking-wider">投入成本</div>
            <div className="font-mono text-sm text-nsi-amber">{(result.total_invested / 10000).toFixed(0)}<span className="text-[10px] text-nsi-muted">万</span></div>
          </div>
          <div>
            <div className="font-mono text-[9px] text-nsi-muted uppercase tracking-wider">IRR</div>
            <div className="font-mono text-sm text-nsi-green">{(result.irr * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </button>
  )
}

export default function Sandbox() {
  const navigate = useNavigate()
  const calcStore = useCalcStore()
  const authStore = useAuthStore()
  const {
    baseSalary,
    retirementAge,
    strategy,
    cumulativeMonths,
    personalAccountBalance,
    contributionIndex,
    isTransitional,
    priorYears,
    setParams,
    setResult,
    setAllResults,
    setLoading,
    allResults,
    loading,
    currentResult,
    showAdvanced,
    setShowAdvanced,
  } = calcStore
  const [selectedStrategy, setSelectedStrategy] = useState<string>('balanced')
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveDesc, setSaveDesc] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    if (!authStore.isAuthenticated()) { navigate('/login', { replace: true }); return }
  }, [])

  const regionCode = authStore.region || '310000'
  const gender = authStore.gender || 'male'
  const employmentType = authStore.employment || 'Corporate_Employee'

  // 年龄计算（优先用生日）
  const age = useMemo(() => {
    if (authStore.birthDate) {
      const now = new Date()
      const birth = new Date(authStore.birthDate)
      let calculated = now.getFullYear() - birth.getFullYear()
      const m = now.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) calculated--
      return calculated
    }
    return calcStore.age || 32
  }, [authStore.birthDate, calcStore.age])

  // 同时计算3套方案
  const calculateAllStrategies = useCallback(
    async (additionalParams: Record<string, unknown> = {}) => {
      setLoading(true)
      try {
        const strategies: ('conservative' | 'balanced' | 'aggressive')[] = ['conservative', 'balanced', 'aggressive']
        const baseParams = {
          region_code: regionCode,
          age,
          gender,
          employment_type: employmentType,
          base_salary: baseSalary,
          retirement_age: retirementAge,
          years_paid: Math.floor(cumulativeMonths / 12),
          cumulative_months: cumulativeMonths,
          personal_account_balance: personalAccountBalance,
          contribution_index: contributionIndex,
          is_transitional: isTransitional,
          prior_years: priorYears,
          ...additionalParams,
        }

        const results: StrategyResult[] = []
        for (const s of strategies) {
          try {
            const res = await calcApi.sandbox({ ...baseParams, strategy: s })
            results.push(res as StrategyResult)
          } catch (e) {
            console.error(`Failed to calculate ${s} strategy:`, e)
          }
        }

        setAllResults(results.length > 0 ? results : null)
        if (results.length > 0) {
          const defaultResult = results.find((r) => r.strategy === selectedStrategy) || results[0]
          setResult(defaultResult as any)
        }
      } catch (e) {
        console.error('Sandbox calculation failed:', e)
      } finally {
        setLoading(false)
      }
    },
    [regionCode, gender, employmentType, age, baseSalary, retirementAge, cumulativeMonths, personalAccountBalance, contributionIndex, isTransitional, priorYears, selectedStrategy, setAllResults, setResult, setLoading]
  )

  // 初始加载
  useEffect(() => {
    calculateAllStrategies()
  }, [])

  const localResult = useMemo(() => {
    const age = calcStore.age || 32
    const yearsToRetire = retirementAge - age
    const monthlyPay = baseSalary * 0.20
    const totalInvested = monthlyPay * 12 * yearsToRetire
    const monthlyPension = baseSalary * 0.45
    const lifeExpectancy = 85
    const yearsReceive = lifeExpectancy - retirementAge
    const totalBenefit = monthlyPension * 12 * yearsReceive
    let irr = 0
    if (totalInvested > 0 && yearsReceive > 0) { const ratio = totalBenefit / totalInvested; irr = Math.pow(ratio, 1 / (yearsToRetire + yearsReceive / 2)) - 1 }
    const breakEvenAge = totalInvested > 0 && monthlyPension > 0 ? retirementAge + Math.ceil(totalInvested / (monthlyPension * 12)) : retirementAge
    const labels: string[] = [], invested: number[] = [], benefit: number[] = []
    let cumInv = 0, cumBen = 0, breakIdx = -1
    for (let y = age; y <= lifeExpectancy; y++) {
      labels.push(`${y}岁`)
      if (y < retirementAge) cumInv += monthlyPay * 12; else cumBen += monthlyPension * 12
      invested.push(Math.round(cumInv)); benefit.push(Math.round(cumBen))
      if (breakIdx === -1 && cumBen >= cumInv && y >= retirementAge) breakIdx = labels.length - 1
    }
    return { totalInvested, totalBenefit, irr, breakEvenAge, monthlyPension, labels, invested, benefit, breakIdx }
  }, [calcStore.age, baseSalary, retirementAge, strategy])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => { return () => { if (debounceRef.current) clearTimeout(debounceRef.current) } }, [])

  const handleChange = useCallback(
    (key: string, value: string | boolean | number) => {
      setParams({ [key]: value })
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        calculateAllStrategies({ [key]: value })
      }, 500)
    },
    [setParams, calculateAllStrategies]
  )

  // 用于展示的结果
  const displayResult: any = allResults ? (allResults.find((r: any) => r.strategy === selectedStrategy) || allResults[0]) : (currentResult || localResult)
  const isFallback = displayResult?.is_fallback
  const labels = displayResult?.cashflows?.map((c: any) => `${c.age}岁`) || localResult.labels
  const invested = displayResult?.cashflows?.map((c: any) => c.cumulative_invested) || localResult.invested
  const benefit = displayResult?.cashflows?.map((c: any) => c.cumulative_benefit) || localResult.benefit
  const breakIdx = useMemo(() => {
    if (!displayResult?.cashflows?.length) return localResult.breakIdx
    let idx = -1
    let found = false
    displayResult.cashflows.forEach((c: any, i: number) => {
      if (!found && c.cumulative_benefit >= c.cumulative_invested && c.age >= retirementAge) {
        idx = i
        found = true
      }
    })
    return idx !== -1 ? idx : localResult.breakIdx
  }, [displayResult, retirementAge])

  const regionName = useMemo(() => {
    const map: Record<string, string> = {
      '310000': '上海', '110000': '北京', '440100': '广州', '440300': '深圳', '330100': '杭州',
      '510100': '成都', '420100': '武汉', '500100': '重庆', '320100': '南京', '370100': '济南',
    }
    return map[regionCode] || '上海'
  }, [regionCode])

  const handleSaveScenario = async () => {
    if (!allResults || allResults.length === 0 || !saveName) return
    
    setSaveLoading(true)
    try {
      const inputParams = {
        region_code: regionCode,
        age,
        gender,
        employment_type: employmentType,
        base_salary: baseSalary,
        retirement_age: retirementAge,
        cumulative_months: cumulativeMonths,
        personal_account_balance: personalAccountBalance,
        contribution_index: contributionIndex,
        is_transitional: isTransitional,
        prior_years: priorYears,
      }

      await scenarioApi.create({
        name: saveName,
        description: saveDesc,
        input_params: inputParams,
        results: allResults as any[],
      })

      setSaveModalOpen(false)
      setSaveName('')
      setSaveDesc('')
      alert('方案保存成功！')
    } catch (e: any) {
      alert('保存失败: ' + (e.message || '未知错误'))
    } finally {
      setSaveLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (!allResults || allResults.length === 0) return
    setPdfLoading(true)
    try {
      const profileId = '1'
      const result = await reportApi.create({
        profile_id: profileId,
        report_type: 'comprehensive',
        scenarios: allResults.map((r: StrategyResult) => r.strategy),
      }) as { task_id: string; status: string }
      const taskId = result.task_id
      let status = result.status
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 1000))
        const statusResult = await reportApi.status(taskId) as { status: string }
        status = statusResult.status
        if (status === 'completed') {
          await reportApi.downloadPdf(taskId)
          break
        } else if (status === 'failed') {
          throw new Error('报告生成失败')
        }
      }
    } catch (e: any) {
      alert('导出失败: ' + (e.message || '未知错误'))
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 text-nsi-muted hover:text-nsi-text transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          <span className="font-mono text-xs">返回</span>
        </Link>
        <h1 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">精算推演沙盘 // ACTUARIAL SANDBOX</h1>
      </div>

      {loading && (
        <div className="bg-nsi-cyan/10 border border-nsi-cyan/30 p-3 rounded-sm">
          <div className="flex items-center gap-2">
            <div className="animate-pulse w-3 h-3 rounded-full bg-nsi-cyan" />
            <span className="font-mono text-[10px] text-nsi-cyan uppercase tracking-wider">计算中 // CALCULATING</span>
          </div>
        </div>
      )}

      {isFallback && (
        <div className="bg-nsi-amber/10 border border-nsi-amber/30 p-3 rounded-sm">
          <span className="font-mono text-[10px] text-nsi-amber uppercase tracking-wider">降级模式 // FALLBACK</span>
          <p className="font-mono text-xs text-nsi-amber mt-1">{displayResult?.fallback_reason || '基于国家通用模型简化计算'}</p>
        </div>
      )}

      {/* 漏斗式信息收集区域 */}
      <section className="nsi-card p-4">
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between">
          <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">信息收集 // DATA COLLECTION</h2>
          <svg className={`w-4 h-4 text-nsi-muted transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>
        {showAdvanced && (
          <div className="mt-4">
            <FunnelContainer />
          </div>
        )}
      </section>

      {/* Desktop 3-column layout */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-3 gap-4">
          {/* Column 1: Strategy Cards + Core Controls */}
          <div className="space-y-4">
            {/* 3套方案卡片 */}
            {allResults && allResults.length > 0 && (
              <section className="nsi-card p-4">
                <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest mb-4">3套方案对比</h2>
                <div className="space-y-2">
                  {allResults.map((result: any, index: number) => (
                    <StrategyCard key={index} result={result} isActive={selectedStrategy === result.strategy} onClick={() => { setSelectedStrategy(result.strategy); setResult(result); }} />
                  ))}
                </div>
              </section>
            )}

            {/* Core Controls */}
            <section className="nsi-card p-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
                  <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">参保地</div>
                  <div className="font-mono text-sm text-nsi-cyan">{regionName}</div>
                </div>
                <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
                  <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">当前年龄</div>
                  <div className="font-mono text-sm text-nsi-cyan nsi-number">{age}<span className="text-nsi-muted text-xs">岁</span></div>
                </div>
              </div>

              <div className="mb-4">
                <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-2">风险偏好</div>
                <SegmentedControl options={[{ value: 'conservative', label: '保守' }, { value: 'balanced', label: '均衡' }, { value: 'aggressive', label: '进取' }]} value={selectedStrategy}
                  onChange={(v) => { setSelectedStrategy(v); const newResult = allResults?.find((r: any) => r.strategy === v); if (newResult) setResult(newResult); }} />
              </div>

              <div className="space-y-4">
                <Slider label="缴费基数" value={baseSalary} min={5000} max={30000} step={100} unit="元" onChange={(v) => handleChange('baseSalary', v)} />
                <Slider label="退休年龄" value={retirementAge} min={50} max={70} step={1} unit="岁" onChange={(v) => handleChange('retirementAge', v)} />
              </div>

              {/* Sensitivity Hints */}
              {displayResult && displayResult.monthly_pension_estimate > 0 && (
                <div className="bg-nsi-bg/40 border border-nsi-border/60 p-3 rounded-sm space-y-2">
                  <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">灵敏度提示</div>
                  {(() => {
                    const pensionPerYuan = displayResult.monthly_pension_estimate / Math.max(displayResult.base_salary || baseSalary, 1)
                    const salaryHint = Math.round(pensionPerYuan * 1000)
                    const ageHint = Math.round(displayResult.monthly_pension_estimate * 0.06)
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-nsi-muted">基数 +¥1000</span>
                          <span className="font-mono text-[10px] text-nsi-green">月养老金 +¥{salaryHint}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-nsi-muted">退休 +1岁</span>
                          <span className="font-mono text-[10px] text-nsi-green">月养老金 +¥{ageHint}</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
            </section>
          </div>

          {/* Column 2: Results & Chart */}
          <div className="space-y-4">
            <section className="nsi-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">投入产出预测</h2>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-nsi-muted">IRR</span>
                  <span className="font-mono text-sm text-nsi-cyan text-glow-cyan nsi-number">{displayResult.irr != null && !isNaN(displayResult.irr) ? (displayResult.irr * 100).toFixed(1) : '—'}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
                  <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">预估投入成本</div>
                  <div className="font-mono text-lg text-nsi-amber nsi-number text-glow-amber">{(displayResult.total_invested / 10000).toFixed(0)}<span className="text-xs text-nsi-muted">万</span></div>
                </div>
                <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
                  <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">预估终身收益</div>
                  <div className="font-mono text-lg text-nsi-green nsi-number text-glow-green">{(displayResult.total_benefit / 10000).toFixed(0)}<span className="text-xs text-nsi-muted">万</span></div>
                </div>
              </div>

              {(displayResult.basic_pension != null || displayResult.personal_account_pension != null || displayResult.transitional_pension != null) && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {displayResult.basic_pension != null && (
                    <div className="bg-nsi-bg/60 border border-nsi-border p-2.5 rounded-sm">
                      <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">基础养老金</div>
                      <div className="font-mono text-sm text-nsi-cyan nsi-number">{Math.round(displayResult.basic_pension).toLocaleString()}<span className="text-[10px] text-nsi-muted">元/月</span></div>
                    </div>
                  )}
                  {displayResult.personal_account_pension != null && (
                    <div className="bg-nsi-bg/60 border border-nsi-border p-2.5 rounded-sm">
                      <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">个人账户</div>
                      <div className="font-mono text-sm text-nsi-amber nsi-number">{Math.round(displayResult.personal_account_pension).toLocaleString()}<span className="text-[10px] text-nsi-muted">元/月</span></div>
                    </div>
                  )}
                  {displayResult.transitional_pension != null && (
                    <div className="bg-nsi-bg/60 border border-nsi-border p-2.5 rounded-sm">
                      <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">过渡性</div>
                      <div className="font-mono text-sm text-nsi-green nsi-number">{Math.round(displayResult.transitional_pension).toLocaleString()}<span className="text-[10px] text-nsi-muted">元/月</span></div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4 bg-nsi-bg/40 border border-nsi-border p-3 rounded-sm">
                <svg className="w-4 h-4 text-nsi-cyan shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
                <div>
                  <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider">盈亏平衡点</div>
                  <div className="font-mono text-sm text-nsi-text"><span className="text-nsi-cyan nsi-number text-glow-cyan">{displayResult.break_even_age}</span><span className="text-nsi-muted text-xs"> 岁</span></div>
                </div>
              </div>

              <div className="border border-nsi-border rounded-sm p-2 bg-nsi-bg/30">
                <ChartCanvas labels={labels} invested={invested} benefit={benefit} breakEvenIndex={breakIdx} />
              </div>

              {/* Non-employee insurance recommendation */}
              {displayResult && (displayResult.employment_type === 'Flexible_Employment' || displayResult.employment_type === 'Urban_Rural_Residents') && (
                <div className="mt-4 space-y-3">
                  {/* Covered insurances */}
                  {displayResult.covered_insurances && displayResult.covered_insurances.length > 0 && (
                    <div className="bg-nsi-bg/40 border border-nsi-border p-3 rounded-sm">
                      <div className="font-mono text-[10px] text-nsi-green uppercase tracking-wider mb-2">✓ 可参保险种</div>
                      <div className="flex flex-wrap gap-1.5">
                        {displayResult.covered_insurances.map((ins: string) => (
                          <span key={ins} className="px-2 py-0.5 bg-nsi-green/10 border border-nsi-green/20 rounded-sm font-mono text-[10px] text-nsi-green">{ins}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Excluded insurances */}
                  {displayResult.excluded_insurances && displayResult.excluded_insurances.length > 0 && (
                    <div className="bg-nsi-bg/40 border border-nsi-border/50 p-3 rounded-sm">
                      <div className="font-mono text-[10px] text-nsi-amber uppercase tracking-wider mb-2">✗ 不可参保险种</div>
                      <div className="flex flex-wrap gap-1.5">
                        {displayResult.excluded_insurances.map((ins: string) => (
                          <span key={ins} className="px-2 py-0.5 bg-nsi-amber/10 border border-nsi-amber/20 rounded-sm font-mono text-[10px] text-nsi-amber">{ins}</span>
                        ))}
                      </div>
                      <div className="mt-2 font-mono text-[10px] text-nsi-muted leading-relaxed">
                        {displayResult.employment_type === 'Flexible_Employment'
                          ? '灵活就业人员无法享受失业、工伤、生育保险保障，建议通过商业保险弥补。'
                          : '城乡居民无法享受职工社保中的失业、工伤、生育及公积金保障。'}
                      </div>
                    </div>
                  )}
                  {/* Government subsidy hint */}
                  {displayResult.government_subsidy && displayResult.government_subsidy > 0 && (
                    <div className="bg-nsi-green/5 border border-nsi-green/20 p-3 rounded-sm">
                      <div className="font-mono text-[10px] text-nsi-green uppercase tracking-wider mb-1">政府补贴</div>
                      <div className="font-mono text-xs text-nsi-text">
                        该城市政府提供约{Math.round(displayResult.government_subsidy * 100)}%养老保险缴费补贴，实际个人支出可显著降低。
                      </div>
                    </div>
                  )}
                  {/* Recommendation */}
                  {displayResult.recommendation && (
                    <div className="bg-nsi-cyan/5 border border-nsi-cyan/20 p-3 rounded-sm">
                      <div className="font-mono text-[10px] text-nsi-cyan uppercase tracking-wider mb-1">个性化建议</div>
                      <div className="font-mono text-xs text-nsi-text leading-relaxed">{displayResult.recommendation}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Data source */}
              {displayResult.policy_source && (
                <div className="mt-3 font-mono text-[9px] text-nsi-muted/60">
                  {displayResult.policy_source}
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-3 font-mono text-[9px] text-nsi-muted/50 leading-relaxed border-t border-nsi-border/30 pt-2">
                ⚠️ 本测算结果仅供参考，不构成任何投资建议。实际养老金以当地社保局最终核算为准。
              </div>
            </section>
          </div>

          {/* Column 3: Advanced Params + Actions */}
          <div className="space-y-4">
            {/* Advanced Parameters */}
            <section className="nsi-card p-4">
              <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between">
                <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">高级参数</h2>
                <svg className={`w-4 h-4 text-nsi-muted transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
              {showAdvanced && (
                <div className="space-y-4 mt-4">
                  <Slider label="累计缴费月数" value={cumulativeMonths} min={0} max={360} step={1} unit="月" onChange={(v) => handleChange('cumulativeMonths', v)} />
                  <Slider label="个人账户余额" value={personalAccountBalance} min={0} max={200000} step={1000} unit="元" onChange={(v) => handleChange('personalAccountBalance', v)} />
                  <Slider label="缴费指数" value={contributionIndex} min={0.6} max={3.0} step={0.1} unit="" onChange={(v) => handleChange('contributionIndex', v)} />
                  <div className="flex items-center justify-between bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
                    <span className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider">过渡性养老金</span>
                    <button onClick={() => handleChange('isTransitional', !isTransitional)} className={`w-10 h-5 rounded-full transition-colors ${isTransitional ? 'bg-nsi-cyan/40' : 'bg-nsi-border'}`}>
                      <div className={`w-4 h-4 rounded-full transition-transform ${isTransitional ? 'translate-x-5 bg-nsi-cyan' : 'translate-x-0.5 bg-nsi-muted'}`} />
                    </button>
                  </div>
                  {isTransitional && <Slider label="视同缴费年限" value={priorYears} min={0} max={30} step={1} unit="年" onChange={(v) => handleChange('priorYears', v)} />}
                </div>
              )}
            </section>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => setSaveModalOpen(true)}
                disabled={!allResults || allResults.length === 0}
                className="w-full flex items-center justify-center gap-2 py-4 border border-nsi-cyan/40 text-nsi-cyan bg-nsi-cyan/10 hover:bg-nsi-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                <span className="font-mono text-sm tracking-wider">保存方案</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={pdfLoading || !allResults || allResults.length === 0}
                className="w-full nsi-btn-primary flex items-center justify-center gap-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pdfLoading ? (
                  <span className="font-mono text-sm tracking-wider">生成中...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span className="font-mono text-sm tracking-wider">导出 PDF 报告</span>
                  </>
                )}
              </button>
            </div>

            {/* Strategy Summary */}
            {allResults && allResults.length > 0 && (
              <div className="nsi-card p-4">
                <h3 className="font-mono text-xs text-nsi-muted uppercase tracking-widest mb-3">方案速览</h3>
                <div className="space-y-2">
                  {allResults.map((r: any) => {
                    const labels: Record<string, string> = { conservative: '保守', balanced: '均衡', aggressive: '进取' }
                    return (
                      <div key={r.strategy} className="flex items-center justify-between bg-nsi-bg/40 border border-nsi-border p-2 rounded-sm">
                        <span className="font-mono text-xs text-nsi-muted">{labels[r.strategy] || r.strategy}</span>
                        <span className="font-mono text-xs text-nsi-cyan">¥{Math.round(r.monthly_pension_estimate).toLocaleString()}/月</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ShareCard */}
            {displayResult && (
              <ShareCard
                scenarioName={`${displayResult.strategy === 'conservative' ? '保守型' : displayResult.strategy === 'balanced' ? '均衡型' : '进取型'}方案`}
                monthlyPension={displayResult.monthly_pension_estimate}
                totalInvested={displayResult.total_invested}
                irr={displayResult.irr}
                breakEvenAge={displayResult.break_even_age}
                strategy={displayResult.strategy}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile: single-column layout */}
      <div className="lg:hidden space-y-4">
        {allResults && allResults.length > 0 && (
          <section className="nsi-card p-4">
            <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest mb-4">3套方案对比 // 3 STRATEGIES</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {allResults.map((result: any, index: number) => (
                <StrategyCard key={index} result={result} isActive={selectedStrategy === result.strategy} onClick={() => { setSelectedStrategy(result.strategy); setResult(result); }} />
              ))}
            </div>
          </section>
        )}

        <section className="nsi-card p-4 lg:p-5">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">参保地</div>
              <div className="font-mono text-sm text-nsi-cyan">{regionName}</div>
            </div>
            <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">当前年龄</div>
              <div className="font-mono text-sm text-nsi-cyan nsi-number">{age}<span className="text-nsi-muted text-xs">岁</span></div>
            </div>
          </div>

          <div className="mb-5">
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-2">风险偏好 // RISK APPETITE</div>
            <SegmentedControl options={[{ value: 'conservative', label: '保守稳健' }, { value: 'balanced', label: '均衡' }, { value: 'aggressive', label: '进取理财' }]} value={selectedStrategy}
              onChange={(v) => { setSelectedStrategy(v); const newResult = allResults?.find((r: any) => r.strategy === v); if (newResult) setResult(newResult); }} />
          </div>

          <div className="space-y-4">
            <Slider label="缴费基数 // BASE SALARY" value={baseSalary} min={5000} max={30000} step={100} unit="元" onChange={(v) => handleChange('baseSalary', v)} />
            <Slider label="退休年龄 // RETIREMENT AGE" value={retirementAge} min={50} max={70} step={1} unit="岁" onChange={(v) => handleChange('retirementAge', v)} />
          </div>

          {displayResult && displayResult.monthly_pension_estimate > 0 && (
            <div className="bg-nsi-bg/40 border border-nsi-border/60 p-3 rounded-sm space-y-2 mt-4">
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">灵敏度提示</div>
              {(() => {
                const pensionPerYuan = displayResult.monthly_pension_estimate / Math.max(displayResult.base_salary || baseSalary, 1)
                const salaryHint = Math.round(pensionPerYuan * 1000)
                const ageHint = Math.round(displayResult.monthly_pension_estimate * 0.06)
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-nsi-muted">基数 +¥1000</span>
                      <span className="font-mono text-[10px] text-nsi-green">月养老金 +¥{salaryHint}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-nsi-muted">退休 +1岁</span>
                      <span className="font-mono text-[10px] text-nsi-green">月养老金 +¥{ageHint}</span>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </section>

        <section className="nsi-card p-4 lg:p-5">
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between">
            <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">高级参数 // ADVANCED</h2>
            <svg className={`w-4 h-4 text-nsi-muted transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
          </button>
          {showAdvanced && (
            <div className="space-y-4 mt-4">
              <Slider label="累计缴费月数 // CUMULATIVE MONTHS" value={cumulativeMonths} min={0} max={360} step={1} unit="月" onChange={(v) => handleChange('cumulativeMonths', v)} />
              <Slider label="个人账户余额 // PERSONAL ACCOUNT BALANCE" value={personalAccountBalance} min={0} max={200000} step={1000} unit="元" onChange={(v) => handleChange('personalAccountBalance', v)} />
              <Slider label="缴费指数 // CONTRIBUTION INDEX" value={contributionIndex} min={0.6} max={3.0} step={0.1} unit="" onChange={(v) => handleChange('contributionIndex', v)} />
              <div className="flex items-center justify-between bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
                <span className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider">过渡性养老金 // TRANSITIONAL</span>
                <button onClick={() => handleChange('isTransitional', !isTransitional)} className={`w-10 h-5 rounded-full transition-colors ${isTransitional ? 'bg-nsi-cyan/40' : 'bg-nsi-border'}`}>
                  <div className={`w-4 h-4 rounded-full transition-transform ${isTransitional ? 'translate-x-5 bg-nsi-cyan' : 'translate-x-0.5 bg-nsi-muted'}`} />
                </button>
              </div>
              {isTransitional && <Slider label="视同缴费年限 // PRIOR YEARS" value={priorYears} min={0} max={30} step={1} unit="年" onChange={(v) => handleChange('priorYears', v)} />}
            </div>
          )}
        </section>

        <section className="nsi-card p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">投入产出预测 // PROJECTION</h2>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-nsi-muted">IRR</span>
              <span className="font-mono text-sm text-nsi-cyan text-glow-cyan nsi-number">{displayResult.irr != null && !isNaN(displayResult.irr) ? (displayResult.irr * 100).toFixed(1) : '—'}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">预估投入成本</div>
              <div className="font-mono text-lg text-nsi-amber nsi-number text-glow-amber">{(displayResult.total_invested / 10000).toFixed(0)}<span className="text-xs text-nsi-muted">万</span></div>
            </div>
            <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">预估终身收益</div>
              <div className="font-mono text-lg text-nsi-green nsi-number text-glow-green">{(displayResult.total_benefit / 10000).toFixed(0)}<span className="text-xs text-nsi-muted">万</span></div>
            </div>
          </div>

          {(displayResult.basic_pension != null || displayResult.personal_account_pension != null || displayResult.transitional_pension != null) && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              {displayResult.basic_pension != null && (
                <div className="bg-nsi-bg/60 border border-nsi-border p-2.5 rounded-sm">
                  <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">基础养老金</div>
                  <div className="font-mono text-sm text-nsi-cyan nsi-number">{Math.round(displayResult.basic_pension).toLocaleString()}<span className="text-[10px] text-nsi-muted">元/月</span></div>
                </div>
              )}
              {displayResult.personal_account_pension != null && (
                <div className="bg-nsi-bg/60 border border-nsi-border p-2.5 rounded-sm">
                  <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">个人账户</div>
                  <div className="font-mono text-sm text-nsi-amber nsi-number">{Math.round(displayResult.personal_account_pension).toLocaleString()}<span className="text-[10px] text-nsi-muted">元/月</span></div>
                </div>
              )}
              {displayResult.transitional_pension != null && (
                <div className="bg-nsi-bg/60 border border-nsi-border p-2.5 rounded-sm">
                  <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">过渡性</div>
                  <div className="font-mono text-sm text-nsi-green nsi-number">{Math.round(displayResult.transitional_pension).toLocaleString()}<span className="text-[10px] text-nsi-muted">元/月</span></div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mb-4 bg-nsi-bg/40 border border-nsi-border p-3 rounded-sm">
            <svg className="w-4 h-4 text-nsi-cyan shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
            <div>
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider">盈亏平衡点</div>
              <div className="font-mono text-sm text-nsi-text"><span className="text-nsi-cyan nsi-number text-glow-cyan">{displayResult.break_even_age}</span><span className="text-nsi-muted text-xs"> 岁 (领回本金)</span></div>
            </div>
          </div>

          <div className="border border-nsi-border rounded-sm p-2 bg-nsi-bg/30">
            <ChartCanvas labels={labels} invested={invested} benefit={benefit} breakEvenIndex={breakIdx} />
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSaveModalOpen(true)}
            disabled={!allResults || allResults.length === 0}
            className="flex items-center justify-center gap-2 py-4 border border-nsi-cyan/40 text-nsi-cyan bg-nsi-cyan/10 hover:bg-nsi-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            <span className="font-mono text-sm tracking-wider">保存方案</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={pdfLoading || !allResults || allResults.length === 0}
            className="w-full nsi-btn-primary flex items-center justify-center gap-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pdfLoading ? (
              <span className="font-mono text-sm tracking-wider">生成中...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className="font-mono text-sm tracking-wider">导出 PDF 报告</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile ShareCard */}
        {displayResult && (
          <ShareCard
            scenarioName={`${displayResult.strategy === 'conservative' ? '保守型' : displayResult.strategy === 'balanced' ? '均衡型' : '进取型'}方案`}
            monthlyPension={displayResult.monthly_pension_estimate}
            totalInvested={displayResult.total_invested}
            irr={displayResult.irr}
            breakEvenAge={displayResult.break_even_age}
            strategy={displayResult.strategy}
          />
        )}
      </div>

      {/* Save Scenario Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-nsi-bg border border-nsi-border rounded-sm p-6 w-full max-w-md">
            <h3 className="font-mono text-sm text-nsi-text mb-4">保存方案</h3>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-2">
                  方案名称
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="例如：保守方案-2024"
                  className="w-full bg-nsi-bg border border-nsi-border rounded-sm px-3 py-2 font-mono text-sm text-nsi-text placeholder-nsi-muted/50 focus:outline-none focus:border-nsi-cyan/50 transition-colors"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-2">
                  备注 (可选)
                </label>
                <textarea
                  value={saveDesc}
                  onChange={(e) => setSaveDesc(e.target.value)}
                  placeholder="添加方案说明..."
                  rows={3}
                  className="w-full bg-nsi-bg border border-nsi-border rounded-sm px-3 py-2 font-mono text-sm text-nsi-text placeholder-nsi-muted/50 focus:outline-none focus:border-nsi-cyan/50 transition-colors resize-none"
                />
              </div>
              <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
                <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-2">
                  将保存 3 套方案
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-sm bg-nsi-amber/10">
                    <div className="font-mono text-[10px] text-nsi-amber">保守</div>
                    <div className="font-mono text-xs text-nsi-text">
                      ¥{allResults?.find((r: any) => r.strategy === 'conservative')?.monthly_pension_estimate?.toLocaleString() || '-'}
                    </div>
                  </div>
                  <div className="p-2 rounded-sm bg-nsi-cyan/10">
                    <div className="font-mono text-[10px] text-nsi-cyan">均衡</div>
                    <div className="font-mono text-xs text-nsi-text">
                      ¥{allResults?.find((r: any) => r.strategy === 'balanced')?.monthly_pension_estimate?.toLocaleString() || '-'}
                    </div>
                  </div>
                  <div className="p-2 rounded-sm bg-nsi-green/10">
                    <div className="font-mono text-[10px] text-nsi-green">进取</div>
                    <div className="font-mono text-xs text-nsi-text">
                      ¥{allResults?.find((r: any) => r.strategy === 'aggressive')?.monthly_pension_estimate?.toLocaleString() || '-'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSaveModalOpen(false)}
                  className="flex-1 py-3 font-mono text-sm tracking-wider rounded-sm border border-nsi-border text-nsi-muted hover:text-nsi-text hover:border-nsi-cyan/40 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveScenario}
                  disabled={saveLoading || !saveName}
                  className="flex-1 nsi-btn-primary py-3 disabled:opacity-50"
                >
                  {saveLoading ? '保存中...' : '确认保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}