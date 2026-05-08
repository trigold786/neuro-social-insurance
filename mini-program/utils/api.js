const app = getApp()

function request(options) {
  const token = app.globalData.accessToken
  const header = {
    'Content-Type': 'application/json',
    ...(options.header || {}),
  }
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${getApp().getApiBase()}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res) => {
        if (res.statusCode === 401) {
          reject(new Error('登录已过期'))
        } else if (res.statusCode >= 400) {
          reject(new Error(res.data?.detail || '请求失败'))
        } else {
          resolve(res.data)
        }
      },
      fail: reject,
    })
  })
}

export default {
  calcSandbox: (params) => request({ url: '/calc/sandbox', method: 'POST', data: params }),
  calcDeepPlan: (params) => request({ url: '/calc/deep-plan', method: 'POST', data: params }),
  calcTax: (params) => request({ url: '/calc/tax', method: 'POST', data: params }),
  getProfile: () => request({ url: '/profiles/me' }),
  updateProfile: (data) => request({ url: '/profiles/me', method: 'PATCH', data }),
  listScenarios: (page = 1) => request({ url: `/scenarios?page=${page}&page_size=20` }),
  createScenario: (data) => request({ url: '/scenarios', method: 'POST', data }),
  deleteScenario: (id) => request({ url: `/scenarios/${id}`, method: 'DELETE' }),
  createReport: (data) => request({ url: '/reports', method: 'POST', data }),
  getReportStatus: (taskId) => request({ url: `/reports/${taskId}` }),
}
