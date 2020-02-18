var dataUrl = "https://lab.ahusmart.com/nCoV/";

export function initChosen() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: dataUrl + 'api/provinceName',
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: res => {
        if (res.data.success) {
          resolve(res.data.results);
        }
      },
      fail: err => {
        reject(err)
      }
    })
  })

}


export function initCoreData(province) {
  if (province) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: dataUrl + 'api/area',
        method: "GET",
        data: { latest: 1, province: province },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: res => {
          if (res.data.success) {
            resolve(res.data.results);
          }
        },
        fail: err => {
          reject(err)
        }
      })
    }) 
  } else {
    return new Promise((resolve, reject) => {
      wx.request({
        url: dataUrl + 'api/overall',
        method: "GET",
        data: { latest: 1 },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: res => {
          if (res.data.success) {
            resolve(res.data.results);
          }
        },
        fail: err => {
          reject(err)
        }
      })
    }) 
  }
}


export function initChart(province) {
  if(province) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: dataUrl + 'api/area',
        method: "GET",
        data: { latest: 0, province: province },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: res => {
          if (res.data.success) {
            resolve(res.data.results);
          }
        },
        fail: err => {
          reject(err)
        }
      })
    }) 
  } else {
    return new Promise((resolve, reject) => {
      wx.request({
        url: dataUrl + 'api/overall',
        method: "GET",
        data: { latest: 0 },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: res => {
          if (res.data.success) {
            resolve(res.data.results);
          }
        },
        fail: err => {
          reject(err)
        }
      })
    }) 
  }
}

export function initAddChart() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: dataUrl + 'api/overall',
      method: "GET",
      data: { latest: 0},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: res => {
        if (res.data.success) {
          resolve(res.data.results);
        }
      },
      fail: err => {
        reject(err)
      }
    })
  }) 
}

export function initData() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: dataUrl + 'api/area',
      method: "GET",
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: res => {
        if (res.data.success) {
          resolve(res.data.results);
        }
      },
      fail: err => {
        reject(err)
      }
    })
  }) 
}
export function initNews(province) {
  if (province) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: dataUrl + 'api/news',
        method: "GET",
        data: { province: province},
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: res => {
          if (res.data.success) {
            resolve(res.data.results);
          }
        },
        fail: err => {
          reject(err)
        }
      })
    })  
  } else {
    return new Promise((resolve, reject) => {
      wx.request({
        url: dataUrl + 'api/news',
        method: "GET",
        data: { num: 100},
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: res => {
          if (res.data.success) {
            resolve(res.data.results);
          }
        },
        fail: err => {
          reject(err)
        }
      })
    }) 
  }
}

export function initRumors() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: dataUrl + 'api/rumors',
      method: "GET",
      data: { num: "all" },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: res => {
        if (res.data.success) {
          resolve(res.data.results);
        }
      },
      fail: err => {
        reject(err)
      }
    })
  }) 
}
