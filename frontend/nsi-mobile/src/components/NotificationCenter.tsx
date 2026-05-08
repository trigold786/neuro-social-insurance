import { useState } from 'react'

interface NotificationItem {
  id: string
  type: 'policy' | 'scenario' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
}

const demoNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'policy',
    title: '上海社保基数调整',
    message: '2026年度社保缴费基数下限调整为8092元，上限40458元，7月1日起生效。',
    timestamp: '2026-05-07T10:00:00Z',
    read: false,
  },
  {
    id: '2',
    type: 'scenario',
    title: '方案保存成功',
    message: '您的方案"保守方案-2026"已成功保存到云端。',
    timestamp: '2026-05-06T15:30:00Z',
    read: true,
  },
  {
    id: '3',
    type: 'system',
    title: '账户安全提醒',
    message: '检测到您在新设备登录，如非本人操作请及时修改密码。',
    timestamp: '2026-05-05T08:00:00Z',
    read: true,
  },
]

const typeConfig: Record<string, { icon: string; color: string }> = {
  policy: { icon: '📋', color: 'nsi-cyan' },
  scenario: { icon: '💾', color: 'nsi-green' },
  system: { icon: '⚙️', color: 'nsi-amber' },
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(demoNotifications)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-nsi-muted hover:text-nsi-text transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-nsi-coral text-white text-[9px] font-mono rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 z-50 nsi-card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-nsi-border">
              <h3 className="font-mono text-xs text-nsi-muted uppercase tracking-wider">
                通知中心 // NOTIFICATIONS
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="font-mono text-[10px] text-nsi-cyan hover:underline"
                >
                  全部已读
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-nsi-muted font-mono text-[10px]">
                  暂无通知
                </div>
              ) : (
                <div className="divide-y divide-nsi-border/50">
                  {notifications.map((n) => {
                    const config = typeConfig[n.type]
                    return (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-4 cursor-pointer hover:bg-nsi-bg/40 transition-colors ${
                          !n.read ? 'bg-nsi-cyan/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg shrink-0">{config.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-mono text-[10px] ${!n.read ? 'text-nsi-text' : 'text-nsi-muted'}`}>
                                {n.title}
                              </span>
                              {!n.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-nsi-coral shrink-0" />
                              )}
                            </div>
                            <p className="font-mono text-[10px] text-nsi-muted leading-relaxed truncate">
                              {n.message}
                            </p>
                            <div className="font-mono text-[9px] text-nsi-muted/60 mt-1">
                              {new Date(n.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
