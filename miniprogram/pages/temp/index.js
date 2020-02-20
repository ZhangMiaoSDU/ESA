// pages/temp/index.js
const db = wx.cloud.database();
const jqtemplateDB = db.collection("jqtemplate");
const questionDB = db.collection('question');
const images = require('../../utils/images.js');
Page({

  data: {
    images: images
  },

  onLoad: function (options) {
    let _this = this;
    
    if (options.jqid) { this.setData({ jqid: options.jqid})}

    wx.cloud.callFunction({
      name: 'queryDB',
      data: {queryJQTemplate: true}
    }).then(res => {
      console.log(res);
      _this.setData({temps: res.result.data});
      console.log(_this.data.temps)
    })
    .catch(res => {console.log(res)})
  },

  preview(e) {
    let _this = this;
    wx.showLoading({
      title: '加载中',
    })
    this.setData({ showMask: true})
    var tempid = e.currentTarget.dataset.id;
    let temps = this.data.temps;
    let queryTemp = temps.filter(item => {return item._id == tempid})[0];
    var questionsId = queryTemp.questions;
    let tasks = questionsId.map(item => { return questionDB.doc(item).get()});
    Promise.all(tasks).then(res => {
      wx.hideLoading();
      console.log(res);
      let questionsInfo = res.map(item => { return item.data });
      _this.setData({ questionsInfo: questionsInfo })
    })
  },
  closeMask() {
    this.setData({ showMask: false})
  },

  select(e) {
    var jqid = this.data.jqid;
    // 获取该模版的questions
    var tempid = e.currentTarget.dataset.id;
    let temps = this.data.temps;
    let queryTemp = temps.filter(item => { return item._id == tempid })[0];
    var questionsId = queryTemp.questions;
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        addMultiquestions: true,
        id: jqid,
        questionsId: questionsId,
        slice: -(questionsId.length)
      }
    }).then(res => {
      console.log(res);
      wx.navigateBack({
        delta: 1,
        success: res => {
          wx.showToast({
            title: '选用成功',
          })}
      })
    })
    .catch(res => {console.log(res)})
  }
})