// pages/invite/index.js
const app = getApp();
const db = wx.cloud.database();
const userDB = db.collection('user');
const groupDB = db.collection('group')
Page({

  data: {
  },

  onLoad: function (options) {
    var _this = this;
    var uid = options.uid || 'ogesF5rLxuzlBAOjzNrKx1YHojOI';
    var gid = options.gid || '002001001';
    this.setData({gid: gid})
    userDB.doc(uid).get().then(res => {
      console.log(res);
      var invitorInfo = res.data;
      _this.setData({ invitorInfo: invitorInfo})
    })
    groupDB.where({id: gid}).get().then(res => {
      console.log(res);
      var groupInfo = res.data[0];
      var glist = groupInfo.listid;
      _this.setData({ groupInfo: groupInfo })
    })
  },
  confirmJoin() {
    var gid = this.data.gid;
    var uid = app.globalData.openid;
    var _this = this;
    userDB.doc(uid).get().then(res => {
      var uinfo = res.data;
      wx.cloud.callFunction({
        name: 'updateDoc',
        data: {
          updateGrouplist: true,
          gid: gid,
          uinfo: uinfo
        }
      }).then(res => {
        console.log(res);
        _this.setData({isJoin: true})
      })
    })
  },
  goback() {
    wx.redirectTo({
      url: '../index/index',
    })
  }

})