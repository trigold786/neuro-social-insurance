const app = getApp()

const CITY_MAP = {
  '310000': '上海', '110000': '北京', '440100': '广州', '440300': '深圳',
  '330100': '杭州', '320100': '南京', '510100': '成都', '420100': '武汉',
}

const STRATEGY_LABELS = {
  conservative: '保守型',
  balanced: '平衡型',
  aggressive: '进取型',
}

Page({
  data: {
    regionCode: '310000',
    age: 32,
    baseSalary: 7384,
    retirementAge: 60,
    selectedStrategy: 'balanced',
    allResults: [],
    currentResult: null,
    loading: false,
    regionName: '上海',
  },

  onLoad() {
    const regionCode = app.globalData.regionCode || '310000'
    const age = app.globalData.age || 32
    this.setData({
      regionCode,
      regionName: CITY_MAP[regionCode] || '上海',
      age,
      baseSalary: app.globalData.baseSalary || 7384,
      retirementAge: app.globalData.retirementAge || 60,
    })
    this.calculateAll()
  },

  async calculateAll() {
    this.setData({ loading: true })
    const { regionCode, age, baseSalary, retirementAge, selectedStrategy } = this.data

    try {
      const strategies = ['conservative', 'balanced', 'aggressive']
      const results = []

      for (const strategy of strategies) {
        const res = await app.request({
          url: '/calc/sandbox',
          method: 'POST',
          data: {
            region_code: regionCode,
            age,
            employment_type: app.globalData.employmentType || 'Corporate_Employee',
            base_salary: baseSalary,
            retirement_age: retirementAge,
            strategy,
          },
        })
        results.push(res)
      }

      const current = results.find((r) => r.strategy === selectedStrategy) || results[0]

      this.setData({
        allResults: results.map((r) => ({
          ...r,
          label: STRATEGY_LABELS[r.strategy] || r.strategy,
          pension: Math.round(r.monthly_pension_estimate).toLocaleString(),
          irr: ((r.irr || 0) * 100).toFixed(1),
          invested: ((r.total_invested || 0) / 10000).toFixed(0),
          basicPension: r.basic_pension ? Math.round(r.basic_pension).toLocaleString() : null,
          personalAccountPension: r.personal_account_pension ? Math.round(r.personal_account_pension).toLocaleString() : null,
          transitionalPension: r.transitional_pension ? Math.round(r.transitional_pension).toLocaleString() : null,
          totalInvested: ((r.total_invested || 0) / 10000).toFixed(0),
          totalBenefit: ((r.total_benefit || 0) / 10000).toFixed(0),
          breakEvenAge: r.break_even_age || '-',
        })),
        currentResult: {
          ...current,
          label: STRATEGY_LABELS[current.strategy],
          pension: Math.round(current.monthly_pension_estimate).toLocaleString(),
          irr: ((current.irr || 0) * 100).toFixed(1),
          invested: ((current.total_invested || 0) / 10000).toFixed(0),
          totalInvested: ((current.total_invested || 0) / 10000).toFixed(0),
          totalBenefit: ((current.total_benefit || 0) / 10000).toFixed(0),
          breakEvenAge: current.break_even_age || '-',
          basicPension: current.basic_pension ? Math.round(current.basic_pension).toLocaleString() : null,
          personalAccountPension: current.personal_account_pension ? Math.round(current.personal_account_pension).toLocaleString() : null,
          transitionalPension: current.transitional_pension ? Math.round(current.transitional_pension).toLocaleString() : null,
        },
      })
    } catch (e) {
      wx.showToast({ title: '计算失败: ' + e.message, icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  selectStrategy(e) {
    const strategy = e.currentTarget.dataset.strategy
    const result = this.data.allResults.find((r) => r.strategy === strategy)
    this.setData({
      selectedStrategy: strategy,
      currentResult: result,
    })
  },

  onSliderChange(e) {
    const key = e.currentTarget.dataset.key
    const value = e.detail.value
    this.setData({ [key]: value })

    app.globalData[key] = value

    this.calculateAll()
  },

  saveScenario() {
    if (!this.data.allResults.length) return
    const saved = wx.getStorageSync('nsi-scenarios') || []
    saved.push({
      id: `scenario-${Date.now()}`,
      name: `${this.data.regionName}-${this.data.selectedStrategy}-${new Date().toLocaleDateString()}`,
      created_at: new Date().toISOString(),
      results: this.data.allResults.map((r) => ({
        strategy: r.strategy,
        monthly_pension_estimate: parseFloat(r.pension.replace(/,/g, '')),
        total_invested: parseFloat(r.invested) * 10000,
        irr: parseFloat(r.irr) / 100,
      })),
    })
    wx.setStorageSync('nsi-scenarios', saved)
    wx.showToast({ title: '方案已保存', icon: 'success' })
  },

  exportReport() {
    wx.showToast({ title: '报告生成中...', icon: 'loading' })
    app.request({
      url: '/reports',
      method: 'POST',
      data: {
        profile_id: String(wx.getStorageSync('profile_id') || '1'),
        report_type: 'standard',
      },
    })
      .then((res) => {
        wx.showToast({ title: '报告生成中', icon: 'none' })
        setTimeout(() => {
          wx.showModal({
            title: '报告就绪',
            content: `任务ID: ${res.task_id}`,
            showCancel: false,
          })
        }, 2000)
      })
      .catch(() => {
        wx.showToast({ title: '报告生成失败', icon: 'none' })
      })
  },
})
