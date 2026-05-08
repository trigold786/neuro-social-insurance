import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi, scenarioApi } from '../api/client'
import { useAuthStore } from '../stores/authStore'
import { useCalcStore } from '../stores/calcStore'

import { CITIES } from '../constants/cities'

interface UserInfo {
  phone?: string
  email?: string
  real_name?: string
  birth_date?: string
  deletion_scheduled_at?: string
  [key: string]: unknown
}

const CATEGORIES = [
  { value: 'calculation_history', label: '测算记录' },
  { value: 'profile_data', label: '个人资料' },
  { value: 'policy_preferences', label: '政策偏好' },
]

const PROFILE_TABS = [
  { id: 'info', label: '基础信息' },
  { id: 'contribution', label: '参保历史' },
  { id: 'scenarios', label: '方案历史' },
]

interface ScenarioItem {
  scenario_id: string
  name: string
  description?: string
  created_at: string
  is_bookmarked: boolean
}

export default function Profile() {
  const navigate = useNavigate()
  const { isAuthenticated, phone: storePhone, email: storeEmail, region, gender, employment, birthDate, setRegion, setGender, setEmployment, setBirthDate } = useAuthStore()
  const calcStore = useCalcStore()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState('')
  const [bindPhone, setBindPhone] = useState('')
  const [bindPhoneCode, setBindPhoneCode] = useState('')
  const [bindEmailVal, setBindEmailVal] = useState('')
  const [bindEmailCode, setBindEmailCode] = useState('')
  const [localRegion, setLocalRegion] = useState(region || '310000')
  const [localGender, setLocalGender] = useState(gender || 'male')
  const [localEmployment, setLocalEmployment] = useState(employment || 'Corporate_Employee')
  const [localBirthDate, setLocalBirthDate] = useState(birthDate || '')
  const [deleteCategories, setDeleteCategories] = useState<string[]>([])
  const [deleteCode, setDeleteCode] = useState('')
  const [deleteTarget, setDeleteTarget] = useState('')
  
  // Tabs and scenarios
  const [activeTab, setActiveTab] = useState('info')
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([])
  const [scenariosLoading, setScenariosLoading] = useState(false)
  
  // Contribution History
  const { contributionHistory, addContributionRecord, removeContributionRecord } = calcStore

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login', { replace: true }); return }
    loadUser()
  }, [])

  useEffect(() => {
    setLocalRegion(region || '310000')
    setLocalGender(gender || 'male')
    setLocalEmployment(employment || 'Corporate_Employee')
    setLocalBirthDate(birthDate || '')
  }, [region, gender, employment, birthDate])

  const loadUser = async () => {
    setLoading(true)
    try {
      const res: any = await authApi.me()
      setUser(res)
      setError('')
    } catch (e: any) {
      setError(e.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const loadScenarios = async () => {
    setScenariosLoading(true)
    try {
      const res: any = await scenarioApi.list(1, 20)
      setScenarios(res.items || [])
    } catch (e: any) {
      console.error('Failed to load scenarios:', e)
    } finally {
      setScenariosLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'scenarios') {
      loadScenarios()
    }
  }, [activeTab])

  const sendCode = async (target: string, channel: string, purpose: string) => {
    try {
      await authApi.sendCode(target, channel, purpose)
      setActionMsg('验证码已发送')
    } catch (e: any) {
      setActionMsg(e.message || '发送失败')
    }
  }

  const doAction = async (fn: () => Promise<void>, successMsg: string) => {
    setActionLoading(true); setActionMsg('')
    try {
      await fn()
      setActionMsg(successMsg)
      setActivePanel(null)
      if (successMsg !== '数据导出成功') loadUser()
    } catch (e: any) {
      setActionMsg(e.message || '操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBindPhone = () => doAction(
    async () => { if (bindPhone && bindPhoneCode) await authApi.bindPhone(bindPhone, bindPhoneCode) },
    '手机绑定成功'
  )
  const handleBindEmail = () => doAction(
    async () => { if (bindEmailVal && bindEmailCode) await authApi.bindEmail(bindEmailVal, bindEmailCode) },
    '邮箱绑定成功'
  )
  const handleDeleteData = () => doAction(
    async () => {
      if (deleteCategories.length > 0 && deleteCode && deleteTarget)
        await authApi.deleteData(deleteCategories, deleteTarget.includes('@') ? 'email' : 'phone', deleteTarget, deleteCode)
    }, '数据删除请求已提交'
  )
  const handleSaveProfile = () => doAction(
    async () => {
      setRegion(localRegion)
      setGender(localGender)
      setEmployment(localEmployment)
      setBirthDate(localBirthDate)
    }, '个人信息已保存'
  )

  const maskPhone = (p?: string | null) => p ? p.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定'
  const maskEmail = (e?: string | null) => e ? e.replace(/(.{2}).+(@.+)/, '$1***$2') : '未绑定'
  const toggleCategory = (cat: string) => {
    setDeleteCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }
  const ic = 'w-full bg-nsi-bg border border-nsi-border rounded-sm px-3 py-2 font-mono text-sm text-nsi-text placeholder-nsi-muted/50 focus:outline-none focus:border-nsi-cyan/50 transition-colors'
  const sb = (onClick: () => void, disabled: boolean) => (
    <button onClick={onClick} disabled={disabled}
      className="shrink-0 px-3 py-2 text-[10px] font-mono tracking-wider rounded-sm border border-nsi-cyan/40 text-nsi-cyan bg-nsi-cyan/10 hover:bg-nsi-cyan/20 disabled:opacity-40 transition-all">发送</button>
  )

  const calculateAge = (birthDate: string): number | null => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="font-mono text-sm text-nsi-cyan animate-pulse">加载中...</div>
          <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider">LOADING USER DATA</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 text-nsi-muted hover:text-nsi-text transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="font-mono text-xs">返回</span>
        </Link>
        <h1 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">我的 // PROFILE</h1>
      </div>

      {error && <div className="bg-nsi-coral/10 border border-nsi-coral/30 p-3 rounded-sm"><span className="font-mono text-[10px] text-nsi-coral uppercase tracking-wider">{error}</span></div>}

      {user?.deletion_scheduled_at && (
        <div className="bg-nsi-amber/10 border border-nsi-amber/30 p-3 rounded-sm space-y-2">
          <span className="font-mono text-[10px] text-nsi-amber uppercase tracking-wider">账号注销冷却中 // COOLING PERIOD</span>
          <p className="font-mono text-xs text-nsi-amber">计划注销: {user.deletion_scheduled_at}</p>
          <button onClick={() => authApi.cancelDeletion()} disabled={actionLoading}
            className="px-3 py-1.5 text-[10px] font-mono tracking-wider rounded-sm border border-nsi-amber/40 text-nsi-amber bg-nsi-amber/10 hover:bg-nsi-amber/20 disabled:opacity-50 transition-all">撤销注销</button>
        </div>
      )}

      {actionMsg && <div className="bg-nsi-cyan/10 border border-nsi-cyan/30 p-3 rounded-sm"><span className="font-mono text-[10px] text-nsi-cyan uppercase tracking-wider">{actionMsg}</span></div>}

      {/* Profile Tabs */}
      <div className="flex border border-nsi-border rounded-sm overflow-hidden">
        {PROFILE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-mono tracking-wider transition-colors ${
              activeTab === tab.id
                ? 'bg-nsi-cyan/15 text-nsi-cyan'
                : 'text-nsi-muted hover:text-nsi-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Info Tab */}
      {activeTab === 'info' && (
        <>
          <section className="nsi-card p-4 lg:p-5 mt-4">
        <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest mb-4">用户信息 // USER INFO</h2>
        <div className="space-y-3">
          <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm flex items-center justify-between">
            <div><div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-0.5">手机号</div><div className="font-mono text-sm text-nsi-text">{maskPhone(user?.phone || storePhone)}</div></div>
            <button onClick={() => { setActivePanel('bindPhone'); setActionMsg('') }} className="text-[10px] font-mono tracking-wider text-nsi-cyan hover:text-nsi-cyan/80">绑定</button>
          </div>
          <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm flex items-center justify-between">
            <div><div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-0.5">邮箱</div><div className="font-mono text-sm text-nsi-text">{maskEmail(user?.email || storeEmail)}</div></div>
            <button onClick={() => { setActivePanel('bindEmail'); setActionMsg('') }} className="text-[10px] font-mono tracking-wider text-nsi-cyan hover:text-nsi-cyan/80">绑定</button>
          </div>
          <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
            <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-0.5">真实姓名</div>
            <div className="font-mono text-sm text-nsi-text">{user?.real_name || '未填写'}</div>
          </div>
          {localBirthDate && (
            <div className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
              <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-0.5">年龄</div>
              <div className="font-mono text-sm text-nsi-text">
                <span className="text-nsi-cyan">{calculateAge(localBirthDate)}</span>
                <span className="text-nsi-muted text-xs ml-1">岁</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="nsi-card p-4 lg:p-5">
        <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest mb-4">个人信息 // PERSONAL INFO</h2>
        <div className="space-y-3">
          <div>
            <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1.5">出生日期 // BIRTH DATE</label>
            <input
              type="date"
              value={localBirthDate}
              onChange={(e) => setLocalBirthDate(e.target.value)}
              className={ic}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1.5">参保地 // REGION</label>
            <select
              value={localRegion}
              onChange={(e) => setLocalRegion(e.target.value)}
              className="w-full bg-nsi-bg border border-nsi-border rounded-sm px-3 py-2 font-mono text-sm text-nsi-text focus:outline-none focus:border-nsi-cyan/50 appearance-none cursor-pointer"
            >
              {CITIES.map(r => (<option key={r.code} value={r.code}>{r.name}</option>))}
            </select>
          </div>
          <div>
            <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1.5">性别 // GENDER</label>
            <div className="flex bg-nsi-bg border border-nsi-border rounded-sm p-0.5">
              <button
                onClick={() => setLocalGender('male')}
                className={`flex-1 py-2 text-[11px] font-mono tracking-wider rounded-sm transition-all ${
                  localGender === 'male' ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30' : 'text-nsi-muted hover:text-nsi-text'
                }`}
              >男</button>
              <button
                onClick={() => setLocalGender('female')}
                className={`flex-1 py-2 text-[11px] font-mono tracking-wider rounded-sm transition-all ${
                  localGender === 'female' ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30' : 'text-nsi-muted hover:text-nsi-text'
                }`}
              >女</button>
            </div>
          </div>
          <div>
            <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1.5">就业类型 // EMPLOYMENT</label>
            <div className="flex bg-nsi-bg border border-nsi-border rounded-sm p-0.5">
              <button
                onClick={() => setLocalEmployment('Corporate_Employee')}
                className={`flex-1 py-2 text-[11px] font-mono tracking-wider rounded-sm transition-all ${
                  localEmployment === 'Corporate_Employee' ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30' : 'text-nsi-muted hover:text-nsi-text'
                }`}
              >单位职工</button>
              <button
                onClick={() => setLocalEmployment('Flexible_Employment')}
                className={`flex-1 py-2 text-[11px] font-mono tracking-wider rounded-sm transition-all ${
                  localEmployment === 'Flexible_Employment' ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30' : 'text-nsi-muted hover:text-nsi-text'
                }`}
              >灵活就业</button>
            </div>
          </div>
            <button onClick={handleSaveProfile} disabled={actionLoading}
            className="w-full nsi-btn-primary py-2.5 text-xs disabled:opacity-50">
            保存个人信息
          </button>
        </div>
      </section>

      <section className="nsi-card p-4 lg:p-5 mt-4">
        <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest mb-4">隐私与数据 // PRIVACY & DATA</h2>
        <div className="space-y-2">
          <button onClick={() => { setActivePanel('deleteData'); setActionMsg('') }}
            className="w-full text-left bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm flex items-center justify-between hover:border-nsi-coral/30 transition-colors">
            <span className="font-mono text-xs text-nsi-text">类别数据删除 (PIPL)</span>
            <svg className="w-3 h-3 text-nsi-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
          </button>
        </div>
      </section>

      <Link to="/settings"
        className="w-full block text-center py-3 font-mono text-sm tracking-wider rounded-sm border border-nsi-cyan/40 text-nsi-cyan bg-nsi-cyan/10 hover:bg-nsi-cyan/20 transition-all">
        前往设置 // SETTINGS
      </Link>
        </>
      )}

      {/* Contribution History Tab */}
      {activeTab === 'contribution' && (
        <section className="nsi-card p-4 lg:p-5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">参保历史</h2>
            <button
              onClick={() => {
                const newRecord = {
                  id: `record-${Date.now()}`,
                  start_date: new Date().toISOString().split('T')[0],
                  end_date: new Date().toISOString().split('T')[0],
                  region_code: '310000',
                  base_salary: 8000,
                  employment_type: 'Corporate_Employee',
                  is_transitional: false,
                }
                addContributionRecord(newRecord as any)
              }}
              className="text-[10px] font-mono tracking-wider text-nsi-cyan hover:underline"
            >
              + 添加记录
            </button>
          </div>

          {contributionHistory.length === 0 ? (
            <div className="text-center py-8 text-nsi-muted font-mono text-[10px]">
              暂无参保记录，添加记录可提高方案精度
            </div>
          ) : (
            <div className="space-y-3">
              {contributionHistory.map((record) => (
                <div key={record.id} className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <div className="font-mono text-[10px] text-nsi-muted">地区</div>
                      <div className="font-mono text-sm text-nsi-text">{record.region_code}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-nsi-muted">工资基数</div>
                      <div className="font-mono text-sm text-nsi-cyan">¥{record.base_salary}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-nsi-muted">开始日期</div>
                      <div className="font-mono text-sm text-nsi-text">{record.start_date}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-nsi-muted">结束日期</div>
                      <div className="font-mono text-sm text-nsi-text">{record.end_date}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => removeContributionRecord(record.id)}
                      className="text-[10px] font-mono tracking-wider text-nsi-coral hover:underline"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 bg-nsi-amber/10 border border-nsi-amber/40 p-3 rounded-sm">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-nsi-amber shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="font-mono text-[10px] text-nsi-amber mb-1">精度提示</div>
                <div className="font-mono text-[10px] text-nsi-muted">
                  完善参保历史可将方案精度提升至约 95%
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Scenarios History Tab */}
      {activeTab === 'scenarios' && (
        <section className="nsi-card p-4 lg:p-5 mt-4">
          <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest mb-4">方案历史</h2>

          {scenariosLoading ? (
            <div className="text-center py-8 text-nsi-muted font-mono text-[10px] animate-pulse">
              加载中...
            </div>
          ) : scenarios.length === 0 ? (
            <div className="text-center py-8 text-nsi-muted font-mono text-[10px]">
              暂无保存的方案，前往沙盘计算后可保存
            </div>
          ) : (
            <div className="space-y-3">
              {scenarios.map((scenario) => (
                <div key={scenario.scenario_id} className="bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm hover:border-nsi-cyan/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-nsi-text">{scenario.name}</span>
                        {scenario.is_bookmarked && (
                          <svg className="w-3 h-3 text-nsi-amber" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                      </div>
                      {scenario.description && (
                        <div className="font-mono text-[10px] text-nsi-muted mb-1">{scenario.description}</div>
                      )}
                      <div className="font-mono text-[10px] text-nsi-muted">
                        {new Date(scenario.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            await scenarioApi.update(scenario.scenario_id, {
                              is_bookmarked: !scenario.is_bookmarked,
                            })
                            setScenarios((prev) =>
                              prev.map((s) =>
                                s.scenario_id === scenario.scenario_id
                                  ? { ...s, is_bookmarked: !s.is_bookmarked }
                                  : s
                              )
                            )
                          } catch (e) {
                            console.error('Failed to update bookmark:', e)
                          }
                        }}
                        className="text-[10px] font-mono tracking-wider text-nsi-cyan hover:underline"
                      >
                        {scenario.is_bookmarked ? '取消收藏' : '收藏'}
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await scenarioApi.delete(scenario.scenario_id)
                            setScenarios((prev) =>
                              prev.filter((s) => s.scenario_id !== scenario.scenario_id)
                            )
                          } catch (e) {
                            console.error('Failed to delete scenario:', e)
                          }
                        }}
                        className="text-[10px] font-mono tracking-wider text-nsi-coral hover:underline"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link to="/sandbox" className="block mt-4">
            <button className="w-full nsi-btn-primary py-2.5 text-xs">
              前往智能测算沙盘
            </button>
          </Link>
        </section>
      )}

      {activePanel === 'bindPhone' && (
        <section className="nsi-card p-4 space-y-3 border-nsi-cyan/30">
          <h3 className="font-mono text-[10px] text-nsi-cyan uppercase tracking-widest">绑定手机 // BIND PHONE</h3>
          <input type="tel" value={bindPhone} onChange={(e) => setBindPhone(e.target.value)} placeholder="手机号" className={ic} />
          <div className="flex gap-2">
            <input type="text" value={bindPhoneCode} onChange={(e) => setBindPhoneCode(e.target.value)} placeholder="验证码" maxLength={6} className={"flex-1 " + ic} />
            {sb(() => bindPhone && sendCode(bindPhone, 'phone', 'bind'), !bindPhone)}
          </div>
          <div className="flex gap-2">
            <button onClick={handleBindPhone} disabled={actionLoading} className="flex-1 nsi-btn-primary py-2 text-xs disabled:opacity-50">确认绑定</button>
            <button onClick={() => setActivePanel(null)} className="px-3 py-2 text-[10px] font-mono text-nsi-muted border border-nsi-border rounded-sm hover:text-nsi-text">取消</button>
          </div>
        </section>
      )}

      {activePanel === 'bindEmail' && (
        <section className="nsi-card p-4 space-y-3 border-nsi-cyan/30">
          <h3 className="font-mono text-[10px] text-nsi-cyan uppercase tracking-widest">绑定邮箱 // BIND EMAIL</h3>
          <input type="email" value={bindEmailVal} onChange={(e) => setBindEmailVal(e.target.value)} placeholder="邮箱" className={ic} />
          <div className="flex gap-2">
            <input type="text" value={bindEmailCode} onChange={(e) => setBindEmailCode(e.target.value)} placeholder="验证码" maxLength={6} className={"flex-1 " + ic} />
            {sb(() => bindEmailVal && sendCode(bindEmailVal, 'email', 'bind'), !bindEmailVal)}
          </div>
          <div className="flex gap-2">
            <button onClick={handleBindEmail} disabled={actionLoading} className="flex-1 nsi-btn-primary py-2 text-xs disabled:opacity-50">确认绑定</button>
            <button onClick={() => setActivePanel(null)} className="px-3 py-2 text-[10px] font-mono text-nsi-muted border border-nsi-border rounded-sm hover:text-nsi-text">取消</button>
          </div>
        </section>
      )}

      {activePanel === 'deleteData' && (
        <section className="nsi-card p-4 space-y-3 border-nsi-coral/30">
          <h3 className="font-mono text-[10px] text-nsi-coral uppercase tracking-widest">类别数据删除 // CATEGORY DELETION (PIPL)</h3>
          <div className="space-y-2">
            {CATEGORIES.map(cat => (
              <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={deleteCategories.includes(cat.value)} onChange={() => toggleCategory(cat.value)}
                  className="w-4 h-4 rounded border-nsi-border bg-nsi-bg text-nsi-cyan focus:ring-nsi-cyan/30" />
                <span className="font-mono text-xs text-nsi-text">{cat.label}</span>
              </label>
            ))}
          </div>
          <input type="text" value={deleteTarget} onChange={(e) => setDeleteTarget(e.target.value)} placeholder="手机号或邮箱" className={ic} />
          <div className="flex gap-2">
            <input type="text" value={deleteCode} onChange={(e) => setDeleteCode(e.target.value)} placeholder="验证码" maxLength={6} className={"flex-1 " + ic} />
            {sb(() => deleteTarget && sendCode(deleteTarget, deleteTarget.includes('@') ? 'email' : 'phone', 'delete_data'), !deleteTarget)}
          </div>
          <div className="flex gap-2">
            <button onClick={handleDeleteData} disabled={actionLoading || deleteCategories.length === 0}
              className="flex-1 py-2 text-xs font-mono tracking-wider rounded-sm border border-nsi-coral/40 text-nsi-coral bg-nsi-coral/10 hover:bg-nsi-coral/20 disabled:opacity-50 transition-all">确认删除</button>
            <button onClick={() => setActivePanel(null)} className="px-3 py-2 text-[10px] font-mono text-nsi-muted border border-nsi-border rounded-sm hover:text-nsi-text">取消</button>
          </div>
        </section>
      )}


    </div>
  )
}