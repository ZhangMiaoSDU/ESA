// pages/addrlist/index.js
const app = getApp();
const db = wx.cloud.database();
const userDB = db.collection('user');
const groupDB = db.collection('group');
const images = require('../../utils/images.js')
Page({
  data: {
    images: images
  },
  onLoad: function (options) {
    var gid = options.gid;
    this.setData({gid: gid})
  },
  onShow() {
    var _this = this
    var gid = this.data.gid;
    wx.showLoading({
      title: '加载中',
    })
    groupDB.where({ id: gid }).get().then(res => {
      var groupInfo = res.data[0];
      var listid = groupInfo.listid;
      var creator = groupInfo.creator;
      if (creator == app.globalData.openid) { this.setData({ hasPermisson: true})}
      var gAdmin = groupInfo.administrator || [];
      _this.loadMember(listid, creator, gAdmin).then(res => {
        console.log(res);
        wx.hideLoading();
        _this.setData({ membersInfo: res })
      })
    })
  },
  loadMember(listid, creator, gAdmin) {
    let tasks = listid.map(item => {return userDB.doc(item).get()});
    return new Promise((resolve, reject) => {
      Promise.all(tasks).then(res => {
        // console.log(res);
        var membersInfo = res.map(item => { return item.data });
        membersInfo.map(item => { if (item._id == creator) {item.isCreator = true}})
        membersInfo.map(item => {if (gAdmin.indexOf(item._id) != -1) {item.isAdmin = true}})
        resolve(membersInfo)
      }).catch(res => reject(res))
    })
  },
  addMember() {
    var gid = this.data.gid;
    wx.navigateTo({
      url: '../addMem/index?gid=' + gid,
    })
  },
  viewProfile(e) {
    var gid = this.data.gid;
    var membersInfo = this.data.membersInfo;
    var uid = e.currentTarget.dataset.uid;
    var uinfo = membersInfo.filter(item => {return item._id == uid})[0];
    var requiredInfo = {
      _id: uinfo._id, name: uinfo.name, phone: uinfo.phone, QQ: uinfo.QQ, 
      univ: uinfo.univ, coll:uinfo.coll, _class: uinfo._class, stdID: uinfo.stdID, 
      currentLocation: uinfo.currentLocation
    }
    
    var uinfoStr = JSON.stringify(requiredInfo);
    wx.navigateTo({
      url: '../profile/index?uinfo=' + uinfoStr + '&gid=' + gid,
    })
  }
})