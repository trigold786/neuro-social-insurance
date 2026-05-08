import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, configApi } from '../api/client'
import { useAuthStore } from '../stores/authStore'

type Tab = 'login' | 'register'
type LoginMode = 'sms' | 'password'

function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = [
    { label: '8+ 字符', ok: password.length >= 8 },
    { label: '大写字母', ok: /[A-Z]/.test(password) },
    { label: '小写字母', ok: /[a-z]/.test(password) },
    { label: '数字', ok: /\d/.test(password) },
    { label: '特殊字符', ok: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]
  const passed = checks.filter(c => c.ok).length
  const levels = ['bg-nsi-coral', 'bg-nsi-coral/60', 'bg-nsi-amber', 'bg-nsi-cyan']

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-sm transition-colors ${i < passed ? levels[Math.min(passed - 1, 3)] : 'bg-nsi-border'}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-1">
            <span className={`text-[9px] font-mono ${c.ok ? 'text-nsi-green' : 'text-nsi-muted/50'}`}>
              {c.ok ? '✓' : '·'} {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SliderCaptcha({ onVerify, target }: { onVerify: () => void; target: string }) {
  const [dragging, setDragging] = useState(false)
  const [offset, setOffset] = useState(0)
  const [verified, setVerified] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setVerified(false)
    setOffset(0)
    setIsReady(false)
  }, [target])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (verified) return
    setIsReady(true)
    setDragging(true)
    startXRef.current = e.clientX
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (verified) return
    setIsReady(true)
    setDragging(true)
    startXRef.current = e.touches[0].clientX
  }

  useEffect(() => {
    if (!dragging) return
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const trackWidth = trackRef.current?.offsetWidth || 260
      const handleWidth = 44
      const maxOffset = trackWidth - handleWidth - 4
      const newOffset = Math.max(0, Math.min(maxOffset, clientX - startXRef.current))
      setOffset(newOffset)
    }
    const handleUp = () => {
      setDragging(false)
      const trackWidth = trackRef.current?.offsetWidth || 260
      const handleWidth = 44
      const maxOffset = trackWidth - handleWidth - 4
      if (offset >= maxOffset - 5) {
        setOffset(maxOffset)
        setVerified(true)
        setTimeout(onVerify, 200)
      } else {
        setOffset(0)
      }
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleMove as any)
    window.addEventListener('touchend', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleMove as any)
      window.removeEventListener('touchend', handleUp)
    }
  }, [dragging, offset])

  return (
    <div className="mb-3">
      <div className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider mb-1.5">
        真人验证 // HUMAN VERIFY
      </div>
      <div ref={trackRef} className="relative h-11 bg-nsi-bg/60 border border-nsi-border rounded-sm overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {!verified ? (
            <span className="font-mono text-[10px] text-nsi-muted/60">
              {!isReady ? '请先完成真人验证' : '拖动滑块完成验证 →'}
            </span>
          ) : (
            <span className="font-mono text-[10px] text-nsi-green flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              已验证
            </span>
          )}
        </div>
        <div
          className={`absolute top-1 bottom-1 w-[44px] rounded-sm transition-colors ${dragging ? 'bg-nsi-cyan/30' : 'bg-nsi-cyan/20'} border border-nsi-cyan/40 flex items-center justify-center cursor-grab active:cursor-grabbing`}
          style={{ left: offset + 2 }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <svg className="w-4 h-4 text-nsi-cyan" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { isAuthenticated, setTokens, setPhone: storeSetPhone, landingPage } = useAuthStore()

  const [tab, setTab] = useState<Tab>('login')
  const [loginMode, setLoginMode] = useState<LoginMode>('sms')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [channel, setChannel] = useState<'phone' | 'email'>('phone')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('')
  const [userAgreementUrl, setUserAgreementUrl] = useState('')

  useEffect(() => {
    if (isAuthenticated()) navigate('/', { replace: true })
  }, [])

  useEffect(() => {
    configApi.get('system.privacy_policy_url').then((res: any) => {
      if (res?.config_value) setPrivacyPolicyUrl(res.config_value)
    }).catch(() => {})
    configApi.get('system.user_agreement_url').then((res: any) => {
      if (res?.config_value) setUserAgreementUrl(res.config_value)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  useEffect(() => {
    setCaptchaVerified(false)
  }, [channel, phone, email])

  const target = channel === 'phone' ? phone : email

  const handleSendCode = async () => {
    if (!target) { setError(channel === 'phone' ? '请输入手机号' : '请输入邮箱'); return }
    if (!captchaVerified) { setError('请先完成真人验证'); return }
    try {
      await authApi.sendCode(target, channel, tab === 'register' ? 'register' : 'login')
      setCountdown(60)
      setError('')
    } catch (e: any) {
      setError(e.message || '发送失败')
    }
  }

  const handleSmsLogin = async () => {
    if (!phone || !code) { setError('请填写手机号和验证码'); return }
    setLoading(true); setError('')
    try {
      const res: any = await authApi.loginSms(phone, code)
      setTokens(res.access_token, res.refresh_token, res.identity_type || 'individual')
      storeSetPhone(phone)
      navigate(landingPage, { replace: true })
    } catch (e: any) {
      setError(e.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async () => {
    if (!target || !password) { setError('请填写账号和密码'); return }
    setLoading(true); setError('')
    try {
      const res: any = await authApi.loginPassword(target, password, channel)
      setTokens(res.access_token, res.refresh_token, res.identity_type || 'individual')
      if (channel === 'phone') storeSetPhone(phone)
      navigate(landingPage, { replace: true })
    } catch (e: any) {
      setError(e.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!target || !code) { setError('请填写账号和验证码'); return }
    setLoading(true); setError('')
    try {
      const res: any = await authApi.register(target, channel, code, password || undefined)
      setTokens(res.access_token, res.refresh_token, res.identity_type || 'individual')
      if (channel === 'phone') storeSetPhone(phone)
      navigate(landingPage, { replace: true })
    } catch (e: any) {
      setError(e.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (tab === 'register') return handleRegister()
    if (loginMode === 'sms') return handleSmsLogin()
    return handlePasswordLogin()
  }

  const showCaptcha = (tab === 'register' || loginMode === 'password') && !!target

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded bg-nsi-cyan/20 flex items-center justify-center border border-nsi-cyan/40">
            <span className="font-mono text-nsi-cyan text-lg font-bold">N</span>
          </div>
          <h1 className="font-mono text-lg text-nsi-text tracking-wider">NSI TERMINAL</h1>
          <p className="font-mono text-[10px] text-nsi-muted uppercase tracking-widest">NeuroSocialInsurance · 身份验证</p>
        </div>

        <div className="flex bg-nsi-bg border border-nsi-border rounded-sm p-0.5">
          <button
            onClick={() => { setTab('login'); setError(''); setCaptchaVerified(false) }}
            className={`flex-1 py-2 text-[11px] font-mono tracking-wider rounded-sm transition-all ${
              tab === 'login' ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30' : 'text-nsi-muted hover:text-nsi-text'
            }`}
          >登录</button>
          <button
            onClick={() => { setTab('register'); setError(''); setCaptchaVerified(false) }}
            className={`flex-1 py-2 text-[11px] font-mono tracking-wider rounded-sm transition-all ${
              tab === 'register' ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30' : 'text-nsi-muted hover:text-nsi-text'
            }`}
          >注册</button>
        </div>

        {tab === 'login' && (
          <div className="flex bg-nsi-bg border border-nsi-border rounded-sm p-0.5">
            <button
              onClick={() => { setLoginMode('sms'); setError(''); setCaptchaVerified(false) }}
              className={`flex-1 py-1.5 text-[10px] font-mono tracking-wider rounded-sm transition-all ${
                loginMode === 'sms' ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30' : 'text-nsi-muted hover:text-nsi-text'
              }`}
            >短信登录</button>
            <button
              onClick={() => { setLoginMode('password'); setError(''); setCaptchaVerified(false) }}
              className={`flex-1 py-1.5 text-[10px] font-mono tracking-wider rounded-sm transition-all ${
                loginMode === 'password' ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30' : 'text-nsi-muted hover:text-nsi-text'
              }`}
            >密码登录</button>
          </div>
        )}

        {(tab === 'register' || loginMode === 'password') && (
          <div className="flex bg-nsi-bg border border-nsi-border rounded-sm p-0.5">
            <button
              onClick={() => { setChannel('phone'); setError(''); setCaptchaVerified(false) }}
              className={`flex-1 py-1.5 text-[10px] font-mono tracking-wider rounded-sm transition-all ${
                channel === 'phone' ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30' : 'text-nsi-muted hover:text-nsi-text'
              }`}
            >手机号</button>
            <button
              onClick={() => { setChannel('email'); setError(''); setCaptchaVerified(false) }}
              className={`flex-1 py-1.5 text-[10px] font-mono tracking-wider rounded-sm transition-all ${
                channel === 'email' ? 'bg-nsi-cyan/15 text-nsi-cyan border border-nsi-cyan/30' : 'text-nsi-muted hover:text-nsi-text'
              }`}
            >邮箱</button>
          </div>
        )}

        <div className="nsi-card p-4 space-y-4">
          {(loginMode === 'sms' || channel === 'phone') && (
            <div>
              <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1.5">
                手机号 // PHONE
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setCaptchaVerified(false) }}
                placeholder="13800138000"
                className="w-full bg-nsi-bg border border-nsi-border rounded-sm px-3 py-2.5 font-mono text-sm text-nsi-text placeholder-nsi-muted/50 focus:outline-none focus:border-nsi-cyan/50 transition-colors"
              />
            </div>
          )}

          {(loginMode === 'password' || tab === 'register') && channel === 'email' && (
            <div>
              <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1.5">
                邮箱 // EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setCaptchaVerified(false) }}
                placeholder="user@example.com"
                className="w-full bg-nsi-bg border border-nsi-border rounded-sm px-3 py-2.5 font-mono text-sm text-nsi-text placeholder-nsi-muted/50 focus:outline-none focus:border-nsi-cyan/50 transition-colors"
              />
            </div>
          )}

          {showCaptcha && (
            <SliderCaptcha onVerify={() => setCaptchaVerified(true)} target={target} />
          )}

          {(loginMode === 'sms' || tab === 'register') && (
            <div>
              <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1.5">
                验证码 // VERIFICATION CODE
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6位数字"
                  maxLength={6}
                  className="flex-1 bg-nsi-bg border border-nsi-border rounded-sm px-3 py-2.5 font-mono text-sm text-nsi-text placeholder-nsi-muted/50 focus:outline-none focus:border-nsi-cyan/50 transition-colors"
                />
                <button
                  onClick={handleSendCode}
                  disabled={countdown > 0 || !target || !captchaVerified}
                  className="shrink-0 px-3 py-2.5 text-[10px] font-mono tracking-wider rounded-sm border border-nsi-cyan/40 text-nsi-cyan bg-nsi-cyan/10 hover:bg-nsi-cyan/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
              </div>
            </div>
          )}

          {(loginMode === 'password' || tab === 'register') && (
            <div>
              <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1.5">
                密码 // PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'register' ? '设置密码 (6位以上)' : '输入密码'}
                className="w-full bg-nsi-bg border border-nsi-border rounded-sm px-3 py-2.5 font-mono text-sm text-nsi-text placeholder-nsi-muted/50 focus:outline-none focus:border-nsi-cyan/50 transition-colors"
              />
              <PasswordStrengthIndicator password={password} />
            </div>
          )}

          {error && (
            <div className="bg-nsi-coral/10 border border-nsi-coral/30 p-2.5 rounded-sm">
              <span className="font-mono text-[10px] text-nsi-coral uppercase tracking-wider">{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full nsi-btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            {loading ? (
              <span className="font-mono text-sm tracking-wider animate-pulse">处理中...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span className="font-mono text-sm tracking-wider">
                  {tab === 'register' ? '注册' : '登录'}
                </span>
              </>
            )}
          </button>
        </div>

        <p className="text-center font-mono text-[10px] text-nsi-muted uppercase tracking-wider">
          {userAgreementUrl || privacyPolicyUrl ? (
            <>
              登录即表示同意
              {userAgreementUrl && (
                <a href={userAgreementUrl} target="_blank" rel="noopener noreferrer" className="text-nsi-cyan hover:underline ml-1">《用户协议》</a>
              )}
              {userAgreementUrl && privacyPolicyUrl && <span className="mx-0.5">与</span>}
              {privacyPolicyUrl && (
                <a href={privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="text-nsi-cyan hover:underline">《隐私政策》</a>
              )}
            </>
          ) : (
            <>登录即表示同意《用户协议》与《隐私政策》</>
          )}
        </p>
      </div>
    </div>
  )
}