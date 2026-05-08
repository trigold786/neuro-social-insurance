App({
  globalData: {
    userInfo: null,
    regionCode: '310000',
    age: 32,
    baseSalary: 7384,
    retirementAge: 60,
    strategy: 'balanced',
    employmentType: 'Corporate_Employee',
    cumulativeMonths: 0,
    personalAccountBalance: 0,
    accessToken: null,
    identityId: null,
  },

  onLaunch() {
    const token = wx.getStorageSync('access_token')
    const identityId = wx.getStorageSync('identity_id')
    if (token) {
      this.globalData.accessToken = token
      this.globalData.identityId = identityId
    }

    const savedRegion = wx.getStorageSync('region_code')
    if (savedRegion) {
      this.globalData.regionCode = savedRegion
    }
  },

  setAuth(token, identityId) {
    this.globalData.accessToken = token
    this.globalData.identityId = identityId
    wx.setStorageSync('access_token', token)
    wx.setStorageSync('identity_id', identityId)
  },

  clearAuth() {
    this.globalData.accessToken = null
    this.globalData.identityId = null
    wx.removeStorageSync('access_token')
    wx.removeStorageSync('identity_id')
  },

  request(options) {
    const token = this.globalData.accessToken
    const header = {
      'Content-Type': 'application/json',
      ...(options.header || {}),
    }
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.getApiBase()}${options.url}`,
        method: options.method || 'GET',
        data: options.data,
        header,
        success: (res) => {
          if (res.statusCode === 401) {
            this.clearAuth()
            wx.redirectTo({ url: '/pages/index/index' })
            reject(new Error('登录已过期'))
          } else if (res.statusCode >= 400) {
            reject(new Error(res.data?.detail || '请求失败'))
          } else {
            resolve(res.data)
          }
        },
        fail: (err) => {
          reject(err)
        },
      })
    })
  },

  getApiBase() {
    // 开发环境: Nginx Gateway
    // 生产环境: 替换为实际域名，如 https://api.nsi.com/v1
    return 'http://localhost:30310/v1'
  },

  async loginWithToken() {
    try {
      const token = wx.getStorageSync('access_token')
      if (!token) return null
      const res = await this.request({ url: '/users/me' })
      return res
    } catch (e) {
      this.clearAuth()
      return null
    }
  },
})
