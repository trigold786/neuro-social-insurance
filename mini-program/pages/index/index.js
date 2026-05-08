const app = getApp()

const CITY_MAP = {
  '310000': '上海', '110000': '北京', '440100': '广州', '440300': '深圳',
  '330100': '杭州', '320100': '南京', '510100': '成都', '420100': '武汉',
  '500000': '重庆', '370100': '济南', '330200': '宁波', '610100': '西安',
  '120000': '天津', '320500': '苏州', '410100': '郑州', '430100': '长沙',
  '370200': '青岛', '441900': '东莞', '320200': '无锡', '350200': '厦门',
}

Page({
  data: {
    regionCode: '310000',
    age: 32,
    cumulativeMonths: 0,
    recentScenarios: [],
    policies: [],
    regionName: '上海',
    years: 0,
    months: 0,
  },

  onLoad() {
    this.refreshProfile()
    this.loadPolicies()
    this.loadScenarios()
  },

  onShow() {
    this.refreshProfile()
  },

  refreshProfile() {
    const regionCode = app.globalData.regionCode || '310000'
    const age = app.globalData.age || 32
    const months = app.globalData.cumulativeMonths || 0
    this.setData({
      regionCode,
      regionName: CITY_MAP[regionCode] || '上海',
      age,
      cumulativeMonths: months,
      years: Math.floor(months / 12),
      months: months % 12,
    })
  },

  async loadPolicies() {
    try {
      const res = await app.request({
        url: '/policy-hub/policies',
        data: { region_code: '310000', status: 'Verified' },
      })
      this.setData({ policies: (res.data || []).slice(0, 3) })
    } catch (e) {
      this.setData({
        policies: [
          { status: 'verified', city_name: '上海', policy_id: 'SH-2026-05-01-A', effective_date: '2026-07-01' },
        ],
      })
    }
  },

  loadScenarios() {
    const saved = wx.getStorageSync('nsi-scenarios') || []
    const formatted = saved.slice(-3).reverse().map((s) => ({
      id: s.id,
      name: s.name,
      date: new Date(s.created_at).toLocaleDateString(),
      results: (s.results || []).slice(0, 3).map((r) => ({
        strategy: r.strategy,
        label: r.strategy === 'conservative' ? '保守' : r.strategy === 'balanced' ? '均衡' : '进取',
        pension: Math.round(r.monthly_pension_estimate).toLocaleString(),
      })),
    }))
    this.setData({ recentScenarios: formatted })
  },
})
