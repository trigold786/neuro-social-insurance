const app = getApp()

Page({
  data: {
    userInfo: null,
    contributionHistory: [],
    scenarios: [],
    taxIncome: 150000,
    taxInsurance: 18000,
    taxResult: null,
    deductionItems: [
      { key: 'children_education', label: '子女教育', value: 0 },
      { key: 'continuing_education', label: '继续教育', value: 0 },
      { key: 'housing_rent', label: '住房租金', value: 0 },
      { key: 'housing_loan_interest', label: '房贷利息', value: 0 },
      { key: 'elderly_care', label: '赡养老人', value: 0 },
    ],
  },

  onShow() {
    const userInfo = app.globalData.userInfo
    this.setData({ userInfo })
    this.loadScenarios()
  },

  loadScenarios() {
    const saved = wx.getStorageSync('nsi-scenarios') || []
    const formatted = saved.map((s) => ({
      id: s.id,
      name: s.name,
      date: new Date(s.created_at).toLocaleDateString(),
      results: (s.results || []).map((r) => {
        const colors = { conservative: 'amber', balanced: 'cyan', aggressive: 'green' }
        return {
          strategy: r.strategy,
          color: colors[r.strategy] || 'cyan',
          pension: Math.round(r.monthly_pension_estimate).toLocaleString(),
        }
      }),
    }))
    this.setData({ scenarios: formatted })
  },

  onTaxChange(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ [key]: e.detail.value, taxResult: null })
  },

  onDeductionInput(e) {
    const key = e.currentTarget.dataset.key
    const value = parseFloat(e.detail.value) || 0
    const items = this.data.deductionItems.map((d) =>
      d.key === key ? { ...d, value } : d
    )
    this.setData({ deductionItems: items, taxResult: null })
  },

  calculateTax() {
    const { taxIncome, taxInsurance, deductionItems } = this.data
    const deductions = {}
    deductionItems.forEach((d) => { deductions[d.key] = d.value })

    const additionalMonthly = Object.values(deductions).reduce((a, b) => a + b, 0)
    const totalDeductions = taxInsurance + 60000 + additionalMonthly
    const taxableIncome = Math.max(0, taxIncome - totalDeductions)

    let annualTax = 0
    if (taxableIncome > 0) {
      if (taxableIncome <= 36000) {
        annualTax = taxableIncome * 0.03
      } else if (taxableIncome <= 144000) {
        annualTax = taxableIncome * 0.10 - 2520
      } else if (taxableIncome <= 300000) {
        annualTax = taxableIncome * 0.20 - 16920
      } else if (taxableIncome <= 420000) {
        annualTax = taxableIncome * 0.25 - 31920
      } else if (taxableIncome <= 660000) {
        annualTax = taxableIncome * 0.30 - 52920
      } else if (taxableIncome <= 960000) {
        annualTax = taxableIncome * 0.35 - 85920
      } else {
        annualTax = taxableIncome * 0.45 - 181920
      }
    }

    const afterTaxIncome = taxIncome - annualTax - taxInsurance
    const effectiveRate = taxIncome > 0 ? (annualTax / taxIncome * 100).toFixed(2) : '0.00'

    this.setData({
      taxResult: {
        annualTax: Math.round(annualTax),
        afterTaxIncome: Math.round(afterTaxIncome),
        effectiveRate,
      },
    })
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/index/index?login=1' })
  },

  logout() {
    app.clearAuth()
    app.globalData.userInfo = null
    this.setData({ userInfo: null })
    wx.showToast({ title: '已退出登录', icon: 'success' })
  },
})
