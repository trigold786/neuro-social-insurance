import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/client'
import { useAuthStore } from '../stores/authStore'

const FONT_SIZES = [
  { value: 'small', label: '小', px: '12px' },
  { value: 'medium', label: '中', px: '14px' },
  { value: 'large', label: '大', px: '16px' },
  { value: 'xlarge', label: '特大', px: '18px' },
  { value: 'xxlarge', label: '极大', px: '20px' },
]

export default function Settings() {
  const navigate = useNavigate()
  const { isAuthenticated, logout, fontSize, setFontSize, landingPage, setLandingPage } = useAuthStore()

  const [fontSizePref, setFontSizePref] = useState(fontSize || 'medium')
  const [landingPagePref, setLandingPagePref] = useState(landingPage || '/')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState('')
  const [error, setError] = useState('')

  const [pwOld, setPwOld] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwCode, setPwCode] = useState('')
  const [pwTarget, setPwTarget] = useState('')
  const [pwActivePanel, setPwActivePanel] = useState(false)

  const [delTarget, setDelTarget] = useState('')
  const [delCode, setDelCode] = useState('')
  const [delReason, setDelReason] = useState('')
  const [delActivePanel, setDelActivePanel] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login', { replace: true }); return }
  }, [])

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZES.find(f => f.value === fontSizePref)?.px || '14px'
  }, [fontSizePref])

  useEffect(() => {
    localStorage.setItem('nsi-font-size', fontSizePref)
    setFontSize(fontSizePref)
  }, [fontSizePref])

  useEffect(() => {
    setLandingPage(landingPagePref as '/' | '/sandbox')
  }, [landingPagePref])

  const sendCode = async (target: string, channel: string, purpose: string) => {
    try {
      await authApi.sendCode(target, channel, purpose)
      setActionMsg('验证码已发送')
    } catch (e: any) {
      setError(e.message || '发送失败')
    }
  }

  const doAction = async (fn: () => Promise<void>, successMsg: string) => {
    setActionLoading(true); setError(''); setActionMsg('')
    try {
      await fn()
      setActionMsg(successMsg)
    } catch (e: any) {
      setError(e.message || '操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleChangePassword = () => doAction(
    async () => {
      if (!pwNew) throw new Error('请输入新密码')
      if (pwNew !== pwConfirm) throw new Error('两次密码不一致')
      if (!pwCode || !pwTarget) throw new Error('请填写验证码和目标账号')
      await authApi.changePassword(pwNew, pwCode, pwTarget.includes('@') ? 'email' : 'phone', pwTarget, pwOld || undefined)
    }, '密码修改成功'
  )

  const handleDeleteAccount = () => doAction(
    async () => {
      if (!delCode || !delTarget) throw new Error('请填写验证码和目标账号')
      await authApi.requestDeletion(delTarget.includes('@') ? 'email' : 'phone', delTarget, delCode, delReason || undefined)
    }, '注销申请已提交，30天冷却期后生效'
  )

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  const ic = 'w-full bg-nsi-bg border border-nsi-border rounded-sm px-3 py-2 font-mono text-sm text-nsi-text placeholder-nsi-muted/50 focus:outline-none focus:border-nsi-cyan/50 transition-colors'
  const sb = (onClick: () => void, disabled: boolean) => (
    <button onClick={onClick} disabled={disabled}
      className="shrink-0 px-3 py-2 text-[10px] font-mono tracking-wider rounded-sm border border-nsi-cyan/40 text-nsi-cyan bg-nsi-cyan/10 hover:bg-nsi-cyan/20 disabled:opacity-40 transition-all">发送</button>
  )

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/profile" className="flex items-center gap-1 text-nsi-muted hover:text-nsi-text transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="font-mono text-xs">返回</span>
        </Link>
        <h1 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">设置 // SETTINGS</h1>
      </div>

      {error && <div className="bg-nsi-coral/10 border border-nsi-coral/30 p-3 rounded-sm"><span className="font-mono text-[10px] text-nsi-coral uppercase tracking-wider">{error}</span></div>}
      {actionMsg && <div className="bg-nsi-cyan/10 border border-nsi-cyan/30 p-3 rounded-sm"><span className="font-mono text-[10px] text-nsi-cyan uppercase tracking-wider">{actionMsg}</span></div>}

      <section className="nsi-card p-4 lg:p-5">
        <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest mb-4">字体大小 // FONT SIZE</h2>
        <div className="grid grid-cols-5 gap-2">
          {FONT_SIZES.map((size) => (
            <button
              key={size.value}
              onClick={() => setFontSizePref(size.value)}
              className={`py-2.5 rounded-sm text-[11px] font-mono tracking-wider transition-all ${
                fontSizePref === size.value
                  ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30'
                  : 'bg-nsi-bg/60 border border-nsi-border text-nsi-muted hover:text-nsi-text hover:border-nsi-border/80'
              }`}
            >
              {size.label}
              <span className="block text-[9px] opacity-60 mt-0.5">{size.px}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 bg-nsi-bg/40 border border-nsi-border p-2 rounded-sm">
          <span className="font-mono text-[10px] text-nsi-muted">当前: </span>
          <span className="font-mono text-[10px] text-nsi-cyan">{FONT_SIZES.find(f => f.value === fontSizePref)?.px}</span>
        </div>
      </section>

      <section className="nsi-card p-4 lg:p-5">
        <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest mb-4">默认落地页 // DEFAULT LANDING</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setLandingPagePref('/')}
            className={`py-2.5 rounded-sm text-[11px] font-mono tracking-wider transition-all ${
              landingPagePref === '/'
                ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30'
                : 'bg-nsi-bg/60 border border-nsi-border text-nsi-muted hover:text-nsi-text hover:border-nsi-border/80'
            }`}
          >
            仪表盘
          </button>
          <button
            onClick={() => setLandingPagePref('/sandbox')}
            className={`py-2.5 rounded-sm text-[11px] font-mono tracking-wider transition-all ${
              landingPagePref === '/sandbox'
                ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30'
                : 'bg-nsi-bg/60 border border-nsi-border text-nsi-muted hover:text-nsi-text hover:border-nsi-border/80'
            }`}
          >
            测算沙盘
          </button>
        </div>
        <div className="mt-3 bg-nsi-bg/40 border border-nsi-border p-2 rounded-sm">
          <span className="font-mono text-[10px] text-nsi-muted">当前: </span>
          <span className="font-mono text-[10px] text-nsi-cyan">{landingPagePref === '/' ? '仪表盘' : '测算沙盘'}</span>
        </div>
      </section>

      <section className="nsi-card p-4 lg:p-5">
        <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest mb-4">密码管理 // PASSWORD MANAGEMENT</h2>
        {!pwActivePanel ? (
          <button onClick={() => { setPwActivePanel(true); setActionMsg(''); setError('') }}
            className="w-full text-left bg-nsi-bg/60 border border-nsi-border p-3 rounded-sm flex items-center justify-between hover:border-nsi-amber/30 transition-colors">
            <span className="font-mono text-xs text-nsi-text">修改密码</span>
            <svg className="w-3 h-3 text-nsi-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        ) : (
          <div className="space-y-3 border border-nsi-amber/30 rounded-sm p-3 bg-nsi-amber/5">
            <h3 className="font-mono text-[10px] text-nsi-amber uppercase tracking-widest">修改密码 // CHANGE PASSWORD</h3>
            <input type="text" value={pwTarget} onChange={(e) => setPwTarget(e.target.value)} placeholder="手机号或邮箱" className={ic} />
            <div className="flex gap-2">
              <input type="text" value={pwCode} onChange={(e) => setPwCode(e.target.value)} placeholder="验证码" maxLength={6} className={"flex-1 " + ic} />
              {sb(() => pwTarget && sendCode(pwTarget, pwTarget.includes('@') ? 'email' : 'phone', 'change_password'), !pwTarget)}
            </div>
            <input type="password" value={pwOld} onChange={(e) => setPwOld(e.target.value)} placeholder="旧密码 (可选)" className={ic} />
            <input type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} placeholder="新密码" className={ic} />
            <input type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} placeholder="确认新密码" className={ic} />
            <div className="flex gap-2">
              <button onClick={handleChangePassword} disabled={actionLoading} className="flex-1 nsi-btn-primary py-2 text-xs disabled:opacity-50">确认修改</button>
              <button onClick={() => setPwActivePanel(false)} className="px-3 py-2 text-[10px] font-mono text-nsi-muted border border-nsi-border rounded-sm hover:text-nsi-text">取消</button>
            </div>
          </div>
        )}
      </section>

      <section className="nsi-card p-4 lg:p-5">
        <h2 className="font-mono text-xs text-nsi-muted uppercase tracking-widest mb-4">账号注销 // ACCOUNT DELETION</h2>
        {!delActivePanel ? (
          <div className="space-y-3">
            <div className="bg-nsi-coral/5 border border-nsi-coral/20 p-3 rounded-sm">
              <div className="font-mono text-[10px] text-nsi-coral uppercase tracking-wider mb-1">⚠ 危险操作警告</div>
              <p className="font-mono text-xs text-nsi-muted">账号注销后将进入30天冷却期，冷却期结束后所有数据将被永久删除且无法恢复。</p>
            </div>
            <button onClick={() => { setDelActivePanel(true); setActionMsg(''); setError('') }}
              className="w-full py-2.5 font-mono text-xs tracking-wider rounded-sm border border-nsi-coral/40 text-nsi-coral bg-nsi-coral/10 hover:bg-nsi-coral/20 transition-all">
              申请注销账号
            </button>
          </div>
        ) : (
          <div className="space-y-3 border border-nsi-coral/30 rounded-sm p-3 bg-nsi-coral/5">
            <h3 className="font-mono text-[10px] text-nsi-coral uppercase tracking-widest">注销账号 // DELETE ACCOUNT (30-DAY COOLING)</h3>
            <input type="text" value={delTarget} onChange={(e) => setDelTarget(e.target.value)} placeholder="手机号或邮箱" className={ic} />
            <div className="flex gap-2">
              <input type="text" value={delCode} onChange={(e) => setDelCode(e.target.value)} placeholder="验证码" maxLength={6} className={"flex-1 " + ic} />
              {sb(() => delTarget && sendCode(delTarget, delTarget.includes('@') ? 'email' : 'phone', 'delete_account'), !delTarget)}
            </div>
            <input type="text" value={delReason} onChange={(e) => setDelReason(e.target.value)} placeholder="注销原因 (可选)" className={ic} />
            <div className="bg-nsi-amber/10 border border-nsi-amber/30 p-2 rounded-sm">
              <span className="font-mono text-[10px] text-nsi-amber">确认注销后，30天内可随时撤销，30天后账号及所有数据将被永久删除。</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDeleteAccount} disabled={actionLoading}
                className="flex-1 py-2 text-xs font-mono tracking-wider rounded-sm border border-nsi-coral/40 text-nsi-coral bg-nsi-coral/10 hover:bg-nsi-coral/20 disabled:opacity-50 transition-all">确认注销</button>
              <button onClick={() => setDelActivePanel(false)} className="px-3 py-2 text-[10px] font-mono text-nsi-muted border border-nsi-border rounded-sm hover:text-nsi-text">取消</button>
            </div>
          </div>
        )}
      </section>

      <button onClick={handleLogout}
        className="w-full py-3 font-mono text-sm tracking-wider rounded-sm border border-nsi-border text-nsi-muted bg-nsi-bg hover:text-nsi-coral hover:border-nsi-coral/30 transition-all">
        退出登录 // LOGOUT
      </button>
    </div>
  )
}