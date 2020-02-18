//app.js
App({
  onLaunch: function () {
    
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
