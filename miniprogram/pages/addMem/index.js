// pages/addMem/index.js
const app = getApp();
const db = wx.cloud.database();
const groupDB = db.collection('group');
const images = require('../../utils/images.js')
Page({
  data: {
    images: images,
    windowHeight: app.globalData.windowHeight
  },

  onLoad: function (options) {
    var gid = options.gid;
    this.setData({gid: gid});
    var uid = app.globalData.openid;
    var _this = this;
    // 1 获取该组的数据；
    this.loadGroup(gid).then(groupInfo => {
      var listid = groupInfo.listid;
      // 2 根据该组中已经存在的成员添加label
      this.loadAllUser().then(allUser => {
        allUser = allUser.filter(item => { return item._id != uid})
        .map(item => {if (listid.indexOf(item._id) == -1) {item.isJoined = false} else {item.isJoined = true}; return item;});
        console.log(allUser);
        _this.setData({ allUser: allUser});
        // 截取全部成员的姓名
        var allUserName = allUser.map(item => {return item.name});
        _this.setData({allUserName: allUserName});
      })
    })
  },
  loadGroup(gid) {
    return new Promise((resolve,reject) => {
      groupDB.where({id: gid}).get().then(res => {
        resolve(res.data[0]);
      }).catch(res => reject(res))
    })
  },
  loadAllUser() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'queryDB',
        data: {
          queryAllUser: true,
        }
      }).then(res => { 
        var data = res.result.data;
        resolve(data)
      })
        .catch(res => {console.log(res); reject(res) })
    })
  },
  addThisUser(e) {
    var _this = this;
    var gid = this.data.gid;
    var uid = e.currentTarget.dataset.uid;
    var allUser = this.data.allUser;
    var uinfo = allUser.filter(item => {return item._id == uid})[0];
    wx.showLoading({
      title: '加载中',
    })
    // 1. 将该成员的id添加到组的listid字段以及将其他必要信息添加list字段
    wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        updateGrouplist: true,
        gid: gid,
        uinfo: uinfo
      }
    }).then(res => {
      // console.log(res);
      wx.hideLoading();
      wx.showToast({
        title: '添加成功',
      })
      // 2. 更改isJoined的值
      allUser.map(item => {if (item._id == uid) {item.isJoined = true} return item;});
      _this.setData({ allUser: allUser, showSearch: false, searchUs: []});
    })
    .catch(res => {console.log(res)})
  },
  showSearch() {
    this.setData({showSearch: true})
  },
  cancelSearch() {
    this.setData({ showSearch: false, searchUs: [] })
  },
  bindQ(e) {
    let value = e.detail.value;
    this.setData({ questionContent: value });
    var regStr = `.*${value}`
    var reg = RegExp(`${regStr}`);
    let allUser = this.data.allUser;
    // console.log(allUserName)
    let res = allUser.filter(item => {
      var name = item.name;
      if (reg.test(name)) {
        return item
      }
      var univ = item.univ;
      
      if (reg.test(univ)) {
        item.tag = "学校：" + univ;
        return item
      }
      var coll = item.coll;
      if (reg.test(coll)) {
        item.tag = "学院：" + coll;
        return item
      }
      var _class = item._class;
      
      if (reg.test(_class)) {
        item.tag = "班级：" +_class;
        return item
      }
      var phone = item.phone;
      if (reg.test(phone)) {
        return item
      }
    });
    if (value.length > 0) {
      this.setData({ searchUs: res })
    } else {
      this.setData({ searchUs: [] })
    }
  },

  confirm() {
    var searchUs = this.data.searchUs;
    var gid = this.data.gid;
    wx.showLoading({
      title: '加载中',
    })
    var tasks = [];
    for (let i = 0; i < searchUs.length; i++) {
      var uinfo = searchUs[i];
      tasks.push(wx.cloud.callFunction({
        name: 'updateDoc',
        data: {
          updateGrouplist: true,
          gid: gid,
          uinfo: uinfo
        }
      }))
    }
    Promise.all(tasks).then(res => {
      console.log(res);
      wx.hideLoading();
      wx.showToast({
        title: '添加成功',
      })
      wx.navigateBack({
        delta: 1
      })
    }).catch(res => {console.log(res)})
  }
})