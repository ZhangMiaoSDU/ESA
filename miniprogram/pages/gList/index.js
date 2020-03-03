// pages/gList/index.js
const app = getApp()
const images = require('../../utils/images.js');
const db = wx.cloud.database();
const groupDB = db.collection('group');
const userDB = db.collection('user');
Page({
  data: {
    images: images,
    selectedGroup: []
  },

  onLoad: function (options) {
    var _this = this;
    
    this.loadGroup().then(res => {
      // console.log(res)
      res.map(item => {return item.isChecked = false});
      if (options.gids) { 
        var gids = JSON.parse(options.gids);
        res = res.filter(item => {return gids.indexOf(item.id) == -1})
      }
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

  changeStatu(e) {
    var groupsInfo = this.data.groupsInfo;
    var gid = e.currentTarget.dataset.gid;
    var selectedGroup = this.data.selectedGroup;
    groupsInfo.map(item => {
      if (item.id == gid) {
        item.isChecked = !item.isChecked;//切换状态
        if (item.isChecked) {
          console.log("切换为选中状态")
          selectedGroup.push(item)
        } else {
          console.log("切换为未选中状态")
          selectedGroup = selectedGroup.filter(selectedItem => { return selectedItem.id != gid})
        }
      }
    })
    console.log("changeStatu ========> selectedGroup:", selectedGroup)
    this.setData({ selectedGroup: selectedGroup, groupsInfo: groupsInfo})
  },
  viewGroup(e) {
    var _this = this;
    this.setData({viewGroup: true})
    var gid = e.currentTarget.dataset.gid;
    var groupsInfo = this.data.groupsInfo;
    var currentGroup = groupsInfo.filter(item => {return item.id == gid})[0];
    var listid = currentGroup.listid;
    _this.loadMember(listid).then(res => {
      console.log(res);
      _this.setData({ membersInfo: res })
    })
  },
  
  loadMember(listid) {
    let tasks = listid.map(item => { return userDB.doc(item).get() });
    return new Promise((resolve, reject) => {
      Promise.all(tasks).then(res => {
        // console.log(res);
        var membersInfo = res.map(item => { return item.data });
        resolve(membersInfo)
      }).catch(res => reject(res))
    })
  },
  closeMask() {
    this.setData({ viewGroup: false, membersInfo: [] })
  },
  confirm() {
    var selectedGroup = this.data.selectedGroup;
    var pages = getCurrentPages();//获取当前页面信息
    var prevPage = pages[pages.length - 2];//获取上一页面信息；
    prevPage.setData({
      selectedGroup: selectedGroup
    });
    wx.navigateBack({
      delta: 1
    })
  }
})