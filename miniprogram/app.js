//app.js
App({
  onLaunch: function () {
    const updateManager = wx.getUpdateManager();    // 获取更新管理器对象
    updateManager.onCheckForUpdate(function (res) {
      // console.log(res)    检测更新结果
      if (res.hasUpdate) {
        updateManager.onUpdateReady(function () {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，点击确定重新启动',
            showCancel: false,
            success: res => {
              if (res.confirm) {
                updateManager.applyUpdate();
              }
            }
          })
        })
        updateManager.onUpdateFailed(function () {
          // 新的版本下载失败
          wx.showModal({
            title: '已经有新版本了哟~',
            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
          })
        })
      }
    })

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'esa',
        traceUser: true,
      })
      let _this = this
      //openid 
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log("云函数 [login] user openid: ", res.result.openid)
          _this.globalData.openid = res.result.openid;
        },
        fail: res => {
          console.log("云函数 [login] 调用失败", res)
        }
      })
      const {
        screenHeight,
        screenWidth,
        statusBarHeight,
        windowHeight,
        model
      } = wx.getSystemInfoSync()
      const totalTopHeight = model.indexOf('iPhone X') > -1
        ? 88
        : model.indexOf('iPhone') > -1
          ? 64
          : 68
      this.globalData.navigatorH = totalTopHeight - statusBarHeight
      let capsuleInfo = wx.getMenuButtonBoundingClientRect();
      this.globalData.windowHeight = windowHeight
      this.globalData.statusBarHeight = statusBarHeight
      this.globalData.screenHeight = screenHeight
      this.globalData.screenWidth = screenWidth
      this.globalData.capsuleInfo = capsuleInfo
    }
  },
  globalData: {
    userInfo: null,
    navigatorH: 0,
    statusBarHeight: 0,
    router: null
  }


})
