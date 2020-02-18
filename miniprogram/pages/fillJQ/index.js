// pages/send/index.js
const app = getApp();
const images = require('../../utils/images.js');
const db = wx.cloud.database();
const userDB = db.collection('user');

function timestampToTime(timestamp) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}/${date.getDate()}`
}
Page({
  data: {
    images: images,
    currentDay: timestampToTime(new Date()),
    screenWidth: app.globalData.screenWidth,
    statusBarHeight: app.globalData.statusBarHeight,
    navigatorH: app.globalData.navigatorH
  },

  onLoad: function (options) {
    
  },

  onShow() {
    wx.cloud.callFunction({
      name: 'queryDB',
      data: {
        queryJQPhone: true,
        userId: app.globalData.openid
      }
    }).then(res => {
      console.log(res);
      // var jqsInfo = res.result;
      var jqsInfo = this.checkJq(res.result);
      this.setData({ jqsInfo: jqsInfo })
    }).catch(res => { console.log(res) })
  },

  checkJq(jqsInfo) {
    let displayJqs = [];
    // 判断这些问卷是否需要今天填写
    for (let i = 0; i < jqsInfo.length; i++) {
      if (jqsInfo[i].type == 0) {
        console.log("一次性问卷");
        if (timestampToTime(jqsInfo[i].creationTime) == timestampToTime(new Date().getTime())) {
          console.log(jqsInfo[i][this.data.currentDay])
          var currentDayRecord = jqsInfo[i][this.data.currentDay] || []
          if (currentDayRecord.indexOf(app.globalData.openid) != -1) {
            jqsInfo[i].isFill = true;
          }
          displayJqs.push(jqsInfo[i]);
        }
      } else if (jqsInfo[i].type == 1) {
        console.log("按月")
        var date = jqsInfo[i].modeDetail[0];
        var deaeline = jqsInfo[i].deadline.split('-').join('/');
        if (date == new Date().getDate() && (timestampToTime(new Date().getTime()) < deaeline)) {
          var currentDayRecord = jqsInfo[i][this.data.currentDay] || []
          if (currentDayRecord.indexOf(app.globalData.openid) != -1) {
            jqsInfo[i].isFill = true;
          }
          displayJqs.push(jqsInfo[i]);
        }
      } else if (jqsInfo[i].type == 2) {
        console.log("按日")
        var deaeline = jqsInfo[i].deadline.split('-').join('/');
        if (timestampToTime(new Date().getTime() < deaeline)) {
          console.log(jqsInfo[i][this.data.currentDay])
          var currentDayRecord = jqsInfo[i][this.data.currentDay] || []
          if (currentDayRecord.indexOf(app.globalData.openid) != -1) {
            jqsInfo[i].isFill = true;
          }
          displayJqs.push(jqsInfo[i]);
        }
      }
    }
    return displayJqs;
  },

  fillJQ(e) {
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: '../createJQ/index?jq=' + name + '&id=' + id
    })
    this.setData({ resJQ: null})
  },
  bindQ(e) {
    this.setData({queryid: e.detail.value})
  },
  search() {
    var queryid = Number(this.data.queryid);
    if (queryid == 0 || !queryid) {
      return;
    }
    wx.cloud.callFunction({
      name: 'queryDB',
      data: {
        queryJQId: true,
        id: queryid
      }
    }).then(res => {
      console.log(res);
      if (res.result) {
        this.setData({ resJQ: [res.result]})
      }
    }).catch(res => {console.log(res)})
  },
  cancel() {
    this.setData({ resJQ: null, })
  },
  goBack: function () {
    console.log("fillJQ back")
    wx.navigateBack({
      delta: 1
    })
  },
})