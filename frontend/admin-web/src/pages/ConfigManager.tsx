import { useState, useEffect, useCallback } from 'react'

interface ConfigItem {
  id: number
  config_key: string
  config_value: string
  config_value_raw?: string
  value_type: string
  category: string
  description: string
  editable: boolean
  sensitive: boolean
  version: number
  updated_at: string
  updated_by: string | null
}

const categories = [
  { value: '', label: '全部分类' },
  { value: 'sms', label: '短信配置' },
  { value: 'email', label: '邮件配置' },
  { value: 'ads', label: '广告配置' },
  { value: 'system', label: '系统配置' },
]

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || ''

async function fetchConfigs(category: string, search: string): Promise<ConfigItem[]> {
  const url = new URL('/api/v1/configs', window.location.origin)
  if (category) url.searchParams.set('category', category)
  if (search) url.searchParams.set('search', search)
  const resp = await fetch(url.toString(), {
    headers: { 'X-Admin-Token': ADMIN_TOKEN },
  })
  if (!resp.ok) throw new Error('Fetch failed')
  const data = await resp.json()
  return data.data || []
}

async function updateConfig(key: string, value: string, type: string, category: string, desc: string, sensitive: boolean): Promise<void> {
  const resp = await fetch(`/api/v1/configs/${key}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': ADMIN_TOKEN,
      'X-Updated-By': 'admin-web',
    },
    body: JSON.stringify({ config_value: value, value_type: type, category, description: desc, sensitive }),
  })
  if (!resp.ok) throw new Error('Update failed')
}

export default function ConfigManager() {
  const [configs, setConfigs] = useState<ConfigItem[]>([])
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<ConfigItem | null>(null)
  const [editValue, setEditValue] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchConfigs(category, search)
      setConfigs(data)
    } catch (e) {
      console.error(e)
      // Mock fallback
      setConfigs([
        { id: 1, config_key: 'sms.aliyun_enabled', config_value: 'false', value_type: 'bool', category: 'sms', description: '阿里云短信是否启用', editable: true, sensitive: false, version: 1, updated_at: '2026-05-07T12:00:00Z', updated_by: null },
        { id: 2, config_key: 'sms.aliyun_access_key_id', config_value: '********', config_value_raw: 'LTAI...', value_type: 'string', category: 'sms', description: '阿里云AccessKey ID', editable: true, sensitive: true, version: 1, updated_at: '2026-05-07T12:00:00Z', updated_by: null },
        { id: 3, config_key: 'email.smtp_host', config_value: 'smtp.163.com', value_type: 'string', category: 'email', description: 'SMTP服务器地址', editable: true, sensitive: false, version: 1, updated_at: '2026-05-07T12:00:00Z', updated_by: null },
        { id: 4, config_key: 'ads.enabled', config_value: 'false', value_type: 'bool', category: 'ads', description: '广告变现是否启用', editable: true, sensitive: false, version: 1, updated_at: '2026-05-07T12:00:00Z', updated_by: null },
        { id: 5, config_key: 'system.maintenance_mode', config_value: 'false', value_type: 'bool', category: 'system', description: '系统维护模式', editable: true, sensitive: false, version: 1, updated_at: '2026-05-07T12:00:00Z', updated_by: null },
      ])
    } finally {
      setLoading(false)
    }
  }, [category, search])

  useEffect(() => { load() }, [load])

  const startEdit = (item: ConfigItem) => {
    setEditing(item)
    setEditValue(item.config_value_raw || item.config_value)
  }

  const saveEdit = async () => {
    if (!editing) return
    try {
      await updateConfig(editing.config_key, editValue, editing.value_type, editing.category, editing.description, editing.sensitive)
      setEditing(null)
      load()
    } catch (e) {
      alert('保存失败: ' + (e as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-xs text-nsi-muted uppercase tracking-widest">配置中心 // CONFIG MANAGER</h1>
        <span className="font-mono text-[10px] text-nsi-muted">共 {configs.length} 项配置</span>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="nsi-input font-mono text-xs"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="搜索配置键或描述..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="nsi-input flex-1 font-mono text-xs"
        />
        <button onClick={load} className="nsi-btn-primary">
          <span className="font-mono text-xs">刷新</span>
        </button>
      </div>

      {/* Config Table */}
      <div className="nsi-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-nsi-border bg-nsi-bg/40">
              <th className="px-4 py-3 font-mono text-[10px] text-nsi-muted uppercase tracking-wider">配置键</th>
              <th className="px-4 py-3 font-mono text-[10px] text-nsi-muted uppercase tracking-wider">当前值</th>
              <th className="px-4 py-3 font-mono text-[10px] text-nsi-muted uppercase tracking-wider">类型</th>
              <th className="px-4 py-3 font-mono text-[10px] text-nsi-muted uppercase tracking-wider">分类</th>
              <th className="px-4 py-3 font-mono text-[10px] text-nsi-muted uppercase tracking-wider">描述</th>
              <th className="px-4 py-3 font-mono text-[10px] text-nsi-muted uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((item) => (
              <tr key={item.id} className="border-b border-nsi-border/50 hover:bg-nsi-bg/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-nsi-cyan">{item.config_key}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {item.sensitive ? (
                    <span className="text-nsi-muted">********</span>
                  ) : (
                    <span className="text-nsi-text">{item.config_value}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-[10px] text-nsi-muted uppercase">{item.value_type}</td>
                <td className="px-4 py-3 font-mono text-[10px] text-nsi-amber uppercase">{item.category}</td>
                <td className="px-4 py-3 text-xs text-nsi-muted">{item.description}</td>
                <td className="px-4 py-3">
                  {item.editable && (
                    <button onClick={() => startEdit(item)} className="font-mono text-[10px] text-nsi-cyan hover:underline">
                      编辑
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {configs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center font-mono text-xs text-nsi-muted">
                  {loading ? '加载中...' : '暂无配置项'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="nsi-card w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm text-nsi-text">编辑配置</h2>
              <button onClick={() => setEditing(null)} className="text-nsi-muted hover:text-nsi-text">✕</button>
            </div>
            <div>
              <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1">配置键</label>
              <div className="font-mono text-xs text-nsi-cyan">{editing.config_key}</div>
            </div>
            <div>
              <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1">
                配置值 {editing.sensitive && <span className="text-nsi-coral">(敏感)</span>}
              </label>
              <input
                type={editing.sensitive ? 'password' : 'text'}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="nsi-input w-full"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider block mb-1">描述</label>
              <div className="text-xs text-nsi-muted">{editing.description}</div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={saveEdit} className="nsi-btn-primary flex-1">保存</button>
              <button onClick={() => setEditing(null)} className="nsi-btn-danger">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
