import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { policyApi } from '../api/client'
import { usePolicyStore } from '../stores/policyStore'
import { useAuthStore } from '../stores/authStore'
import { useCalcStore } from '../stores/calcStore'
import PolicyBadge from '../components/PolicyBadge'
import TaxCalculator from '../components/TaxCalculator'
import ExamplePersonaCard from '../components/ExamplePersonaCard'
import RadarComparison from '../components/RadarComparison'

import { CITY_MAP } from '../constants/cities'

interface PolicyItem {
  status: 'verified' | 'conflict' | 'draft'
  source_type?: string
  policy_id: string
  city_name: string
  effective_date: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { isAuthenticated, region, birthDate } = useAuthStore()
  const { policies, lastFetchAt, setPolicies } = usePolicyStore()
  const { savedScenarios, age: calcAge, cumulativeMonths } = useCalcStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'tax'>('overview')
  const [showPersonas, setShowPersonas] = useState(false)
  const [showRadar, setShowRadar] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login', { replace: true }); return }
  }, [])

  const regionCode = region || '310000'

  // 计算当前年龄
  const currentAge = (() => {
    if (birthDate) {
      const now = new Date()
      const birth = new Date(birthDate)
      let calculated = now.getFullYear() - birth.getFullYear()
      const m = now.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) calculated--
      return calculated
    }
    return calcAge || 32
  })()

  // 最近的方案展示
  const recentScenarios = savedScenarios.slice(-3).reverse()

  useEffect(() => {
    if (policies.length === 0 || Date.now() - lastFetchAt > 300000) {
      setLoading(true)
      policyApi
        .list('310000', 'Verified')
        .then((res: any) => {
          setPolicies(res.data || [])
          setError('')
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false))
    }
  }, [])

  // 兜底展示数据
  const isDemoData = policies.length === 0
  const displayPolicies: PolicyItem[] =
    policies.length > 0
      ? (policies as PolicyItem[])
      : [
          { status: 'verified', source_type: '官方核实', policy_id: 'SH-2026-05-01-A', city_name: '上海', effective_date: '2026-07-01' },
          { status: 'conflict', source_type: '社区情报', policy_id: 'SH-2026-05-02-B', city_name: '上海', effective_date: '2026-07-01' },
          { status: 'draft', source_type: '众包校准', policy_id: 'SH-2026-05-03-C', city_name: '上海', effective_date: '2026-07-01' },
        ]

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Tab Switcher */}
      <div className="flex bg-nsi-bg border border-nsi-border rounded-sm p-0.5">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 text-xs font-mono tracking-wider rounded-sm transition-all ${activeTab === 'overview' ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30' : 'text-nsi-muted hover:text-nsi-text'}`}
        >
          社保概览
        </button>
        <button
          onClick={() => setActiveTab('tax')}
          className={`flex-1 py-2 text-xs font-mono tracking-wider rounded-sm transition-all ${activeTab === 'tax' ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30' : 'text-nsi-muted hover:text-nsi-text'}`}
        >
          个税计算
        </button>
      </div>

      {activeTab === 'tax' ? (
        <TaxCalculator />
      ) : (
      <>
      {/* 档案卡片 */}
      <section className="nsi-card p-4 lg:p-5" data-tour="dashboard-profile">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">智能档案 // SMART PROFILE</h2>
          <div className="flex items-center gap-2">
            <span className="nsi-status-dot nsi-status-dot--verified" />
            <span className="font-mono text-[10px] text-nsi-green uppercase tracking-wider">Online</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">参保地</div>
            <div className="font-mono text-sm text-nsi-text">{CITY_MAP[regionCode] || '上海'}</div>
            <div className="font-mono text-[10px] text-nsi-muted">{regionCode}</div>
          </div>
          <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">当前年龄</div>
            <div className="font-mono text-sm text-nsi-cyan">{currentAge}<span className="text-sm text-nsi-muted">岁</span></div>
          </div>
          <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm col-span-2">
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1">累计参保</div>
            <div className="font-mono text-2xl text-nsi-cyan text-glow-cyan">
              {Math.floor(cumulativeMonths / 12)}<span className="text-sm text-nsi-muted">年</span>
              {cumulativeMonths % 12}<span className="text-sm text-nsi-muted">个月</span>
            </div>
          </div>
        </div>
      </section>

      {/* 方案概览区域 */}
      <section className="nsi-card p-4 lg:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">方案概览 // RECENT PLANS</h2>
          <Link to="/sandbox" className="font-mono text-[10px] text-nsi-cyan hover:underline">查看全部 →</Link>
        </div>

        {recentScenarios.length > 0 ? (
          <div className="space-y-3">
            {recentScenarios.map((scenario) => (
              <div key={scenario.id} className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
                <div className="flex items-start justify-between">
                  <div className="font-mono text-sm text-nsi-text">{scenario.name}</div>
                  <div className="font-mono text-[10px] text-nsi-muted">{new Date(scenario.created_at).toLocaleDateString()}</div>
                </div>
                {scenario.results.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {scenario.results.slice(0, 3).map((result, idx) => {
                      const color = result.strategy === 'conservative' ? 'nsi-amber' :
                        result.strategy === 'balanced' ? 'nsi-cyan' : 'nsi-green';
                      return (
                        <div key={idx} className={`text-center p-2 rounded-sm bg-${color}/10`}>
                          <div className={`font-mono text-[10px] text-${color}`}>{
                            result.strategy === 'conservative' ? '保守' :
                            result.strategy === 'balanced' ? '均衡' : '进取'
                          }</div>
                          <div className="font-mono text-sm text-nsi-text">{Math.round(result.monthly_pension_estimate).toLocaleString()}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-nsi-muted font-mono text-[10px]">
            暂未保存方案，启动沙盘计算后可保存
          </div>
        )}
      </section>

      {isDemoData && (
        <div className="bg-nsi-coral/10 border border-nsi-coral/30 p-3 rounded-sm text-center">
          <span className="font-mono text-[10px] text-nsi-coral uppercase tracking-wider">⚠ DEMO DATA — 当前展示为示例数据，非真实政策</span>
        </div>
      )}

      {/* 政策情报雷达 */}
      <section className="nsi-card p-4 lg:p-5" data-tour="policy-radar">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">政策情报雷达 // POLICY RADAR</h2>
          <span className="font-mono text-[10px] text-nsi-muted">{displayPolicies.length} sources</span>
        </div>
        {loading && <div className="font-mono text-xs text-nsi-muted animate-pulse">同步政策数据中...</div>}
        {error && <div className="font-mono text-xs text-nsi-coral">{error}</div>}
        <ul className="space-y-3">
          {displayPolicies.map((p, i) => (
            <li key={i} className="flex items-start gap-3 bg-nsi-bg/40 border border-nsi-border p-3 rounded-sm hover:border-nsi-cyan/20 transition-colors">
              <PolicyBadge status={p.status?.toLowerCase() as any} showText={false} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <PolicyBadge status={p.status?.toLowerCase() as any} size="sm" />
                  <span className="font-mono text-[10px] text-nsi-muted">|</span>
                  <span className="font-mono text-[10px] text-nsi-muted">{p.city_name}</span>
                </div>
                <p className="text-sm text-nsi-text leading-relaxed truncate">{p.policy_id} · 生效 {p.effective_date}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 典型用户参考 */}
      <section className="nsi-card p-4">
        <button onClick={() => setShowPersonas(!showPersonas)} className="w-full flex items-center justify-between">
          <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">典型用户参考 // EXAMPLE PERSONAS</h2>
          <svg className={`w-4 h-4 text-nsi-muted transition-transform ${showPersonas ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>
        {showPersonas && (
          <div className="mt-4 space-y-3">
            <ExamplePersonaCard />
          </div>
        )}
      </section>

      {/* 策略雷达图 */}
      <section className="nsi-card p-4">
        <button onClick={() => setShowRadar(!showRadar)} className="w-full flex items-center justify-between">
          <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">策略雷达对比 // STRATEGY RADAR</h2>
          <svg className={`w-4 h-4 text-nsi-muted transition-transform ${showRadar ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>
        {showRadar && (
          <div className="mt-4 flex justify-center">
            <RadarComparison />
          </div>
        )}
      </section>

      {/* 启动按钮 */}
      <Link to="/sandbox" className="block" data-tour="sandbox-btn">
        <button className="w-full nsi-btn-primary flex items-center justify-center gap-2 py-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-mono text-sm tracking-wider">启动智能测算沙盘</span>
        </button>
      </Link>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-nsi-bg/40 border border-nsi-border/30 rounded-sm">
        <div className="font-mono text-[10px] text-nsi-muted/60 leading-relaxed">
          ⚠️ <strong>免责声明</strong>：本平台所有测算结果仅供参考，不构成任何投资建议。社保政策数据来源于各城市人力资源和社会保障局官网，实际养老金以当地社保局最终核算为准。政策信息可能存在更新延迟，请以官方最新公告为准。
        </div>
      </div>
      </>
      )}
    </div>
  )
}
