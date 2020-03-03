// pages/mem/index.js
const app = getApp()
const images = require('../../utils/images.js')
Page({
  data: {
    images: images
  },
  onLoad: function (options) {
  },
  onShow() {
    var _this = this;
    this.loadGroup().then(res => {
      // console.log(res)
      _this.setData({ groupsInfo: res })
    })
  },
  loadGroup() {
    var _this = this;
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'queryDB',
        data: {
          queryGroup: true,
          userId: app.globalData.openid
        }
      }).then(res => {
        console.log(res)
        var groupsInfo = res.result ? res.result.data : [];
        resolve(groupsInfo)
      })
        .catch(res => { reject(res) })
    })  
  },

  createGroup() {
    wx.navigateTo({
      url: '../RCompany/index',
      fail:res => {console.log(res)}
    })
  },

  copyGID(e) {
    var gid = e.currentTarget.dataset.gid;
    wx.setClipboardData({
      data: String(gid),
      success: res => { console.log(res) },
      fail: res => { console.log(res) }
    });
  },
  viewGroup(e) {
    var gid = e.currentTarget.dataset.gid;
    wx.navigateTo({
      url: '../addrlist/index?gid=' + gid,
    })
  },
  deleteGroup(e) {
    var _this = this;
    var gid = e.currentTarget.dataset.gid;
    wx.showModal({
      title: '提示',
      content: '确定删除该组?',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
          })
          wx.cloud.callFunction({
            name: 'updateDoc',
            data: {
              deleteGroup: true,
              gid: gid
            }
          }).then(res => {
            wx.hideLoading();
            console.log(res)
            this.loadGroup().then(res => {
              _this.setData({ groupsInfo: res })
            })
          })
          .catch(res => {console.log(res);})
        }
      },
    })
  },

  onShareAppMessage(e) {
    let gid = e.target.dataset.gid;
    let gname = e.target.dataset.name;
    var uid = app.globalData.openid;
    return {
      title: '邀请加入群组: \n' + gname,
      path: '/pages/invite/index?uid=' + uid + '&gid=' + gid,
      imageUrl: this.data.images.sharebg,
      success: res => { console.log(res) },
      fail: res => { console.log(res) }
    }
  },

  
})
