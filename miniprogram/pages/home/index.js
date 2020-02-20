// pages/home/index.js
const app = getApp()
const images = require('../../utils/images.js')
const wxrequest = require('../../utils/request.js')
const utils = require('../../utils/utils.js');
const db = wx.cloud.database();
const questionDB = db.collection('question');
const jqDB = db.collection('jq');
const userDB = db.collection('user');
Page({

  data: {
    screenWidth: app.globalData.screenWidth,
    screenHeight: app.globalData.screenHeight,
    windowHeight: app.globalData.windowHeight,
    statusBarHeight: app.globalData.statusBarHeight,
    navigatorH: app.globalData.navigatorH,
    images: images,
    showMask: false,
    tabs: ['资讯', '辟谣'],
    currentIndex: 0,
  },

  onLoad: function (options) {
    let _this = this;
    wx.showLoading({
      title: '加载中',
    })
    this.initNews();
    this.initRumors();
    this.loadUser();
  },
  loadUser() {
    if (app.globalData.isregister) {
      userDB.doc(app.globalData.openid).get().then(res => {
        console.log(res);
        let info = res.data;
        let flag = true;
        let requiredInfo = {
          name: info.name, phone: info.phone,
          coll: info.coll, stdID: info.stdID, _class: info._class
        };
        Object.values(requiredInfo).map(item => { if (!item || item.trim() == '') { flag = false; } });
        if (!flag) {
          wx.showModal({
            title: '提示',
            content: '应上级要求，请补全姓名、手机号、学院、班级和学号/工号信息，建议只需填写一次，方便您以后填表，谢谢！',
            showCancel: false,
            success: res => {
              wx.navigateTo({
                url: '../profile/index',
              })
            }
          })
        }
      }).catch(res => {
        console.log(res)
      })
    }
  
  },
  initNews() {
    let _this = this
    wxrequest.initNews().then(res => {
      // console.log(res);
      wx.hideLoading();
      res.map(item => { return item.time = utils.formatDate(item.pubDate) })
      _this.setData({ news: res })
    })
  },

  initRumors() {
    let _this = this;
    wxrequest.initRumors().then(res => {
      // console.log("initRumors: ", res);
      let rumors = []
      let id = 0;
      for (let i = 0; i < res.length; i++) {
        if (id != res[i].id) {
          rumors.push(res[i]);
          id = res[i].id
        }
      }
      // console.log("rumors: ", rumors)
      _this.setData({ rumors: rumors })
    })
  },

  bindreport(e) {
    // console.log(e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index;
    if (!app.globalData.isregister) {
      wx.switchTab({
        url: '../award/index',
      })
    } else {

      if (index == 0) {
        console.log("查看报表");
        wx.navigateTo({
          url: '../coredata/index',
        })
      }
      if (index == 1) {
        console.log("创建调查")
        wx.navigateTo({
          url: '../ques/index',
        })
      }
      if (index == 2) {
        console.log("填写表格");
        wx.navigateTo({
          url: '../fillJQ/index',
        })
        // this.setData({ showMask: true });
        // wx.hideTabBar();
      }
    }
  },
  bindcreateQ() { },
  bindfillForm() { },
  bindQName(e) {
    let value = e.detail.value;
    this.setData({ qName: value})
  },
  toJQ() {
    wx.showLoading({
      title: '加载中',
    })
    let _this = this
    let qName = Number(this.data.qName);
    jqDB.where({ creationTime: qName}).get().then(res => {
      wx.hideLoading()
      wx.showTabBar();
      _this.setData({ showMask: false });
      console.log("res", res);
      if (res.data.length > 0) {
        let jqid = res.data[0]._id;
        let jqName = res.data[0].name;
        wx.navigateTo({
          url: '../createJQ/index?jq=' + jqName + '&id=' + jqid
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '很抱歉，没有满足条件的问卷！',
          showCancel: false,
          success(res) {
            // console.log(res);
          }
        })
      }
    }).catch(err => {
      console.log(err);
      wx.hideLoading()
      wx.showTabBar();
    })
  },
  cancelMask() {
    this.setData({showMask: false});
    wx.showTabBar();
  },

  /**
   * tab
   */
  itemClick: function (e) {
    // console.log(e);
    let index = e.currentTarget.dataset.index;
    this.setData({ currentIndex: index });
    if (index == 0) { 
      this.initNews();
    } else {
      this.initRumors();
    }
  }, 

  innerScroll(e) {
    let scrollTop = e.detail.scrollTop;
    // console.log(scrollTop);
    this.setData({
      scrollTop: scrollTop
    })
  }
})