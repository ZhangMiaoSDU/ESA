// pages/config/index.js
const app = getApp();
const images = require('../../utils/images.js')
Page({

  data: {
    images: images,
    index: 0,
    time: (new Date().getHours() + 1) + ':' + new Date().getMinutes(),
    retime: (new Date().getHours() + 1) + ':' + new Date().getMinutes(),
    date: 1,
    deadline: new Date().getFullYear() + '-' + (new Date().getMonth() + 2) + '-' + new Date().getDate()
  },

  onLoad: function (options) {
    let stringJson = options.stringJson;
    let optionjson = JSON.parse(stringJson)
    this.setData({ jqName: optionjson.name, info: optionjson})
    let array = [];
    for (let i = 0; i < 31; i++) {
      array.push(i + 1)
    }
    console.log(array)
    this.setData({array: array})
  },
  bindDateChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);

    this.setData({
      index: e.detail.value,
      date: this.data.array[e.detail.value]
    })
  },
  bindTimeChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    
    this.setData({
      time: e.detail.value
    })
  },
  bindReTimeChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      retime: e.detail.value
    })
  },

  bindDChange(e){
    console.log('picker发送选择改变，携带值为', e.detail.value);
    var value = e.detail.value;
    var dealineTimestamp = new Date(value.split('-').join('/')).getTime();
    if (dealineTimestamp >= new Date().getTime()) {
      this.setData({
        deadline: e.detail.value
      })
    } else {
      wx.showToast({
        title: '请重新设置截止日期！',
        icon: 'none'
      })
    }
    
  },

  confirm() {
    let _this = this;
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    // 提醒时间
    let date = Number(this.data.date);
    let hour = Number(this.data.time.split(":")[0]);
    let minute = Number(this.data.time.split(":")[1]);
    let isoTime = new Date(`${year}/${month}/${date} ${hour}:${minute}`).toGMTString();
    var isoTimeSringArr = isoTime.split(' ');
    var isoDate = Number(isoTimeSringArr[1]);
    var isoHour = Number(isoTimeSringArr[4].split(':')[0]), isoMinute = Number(isoTimeSringArr[4].split(':')[1]);
    console.log("[日，时，分] = ", [date, hour, minute]);
    let modeDetail = this.data.type === 1 ? [date, hour, minute] : [hour, minute];
    this.setData({ modeDetail: modeDetail})
    let isoModeDetail = this.data.type === 1 ? [isoDate, isoHour, isoMinute] : [isoHour, isoMinute]
    console.log(modeDetail);
    // 邮件发送时间
    let rehour = Number(this.data.retime.split(":")[0]);
    let reminute = Number(this.data.retime.split(":")[1]);
    let remodeDetail = this.data.type === 1 ? [date, rehour, reminute] : [rehour, reminute];
    this.setData({ remodeDetail: remodeDetail })
    let isoReTime = new Date(`${year}/${month}/${date} ${rehour}:${reminute}`).toGMTString();
    var isoReTimeSringArr = isoReTime.split(' ');
    var isoReDate = Number(isoReTimeSringArr[1]),
        isoReHour = Number(isoReTimeSringArr[4].split(':')[0]), 
        isoReMinute = Number(isoReTimeSringArr[4].split(':')[1]);
    let isoReDetail = this.data.type === 1 ? [isoReDate, isoReHour, isoReMinute] : [isoReHour, isoReMinute]
    // 截止日期
    let deadline = this.data.deadline;
    let isoDeadline = new Date(deadline.split('-').join('/') + ' ' + hour + ':' + minute).toGMTString().split(' ');
    let isoDeadlineDate = Number(isoDeadline[1]), 
        isoDeadlineHour = Number(isoDeadline[4].split(':')[0]),
        isoDeadlineMinute = Number(isoDeadline[4].split(':')[1]);
    wx.showLoading({
      title: '创建中',
    });
    // return;1581420677513 1581420722775
    this.addTojq().then(res => {
      console.log(res);
      let jqid = res.result._id;
      wx.cloud.callFunction({
        name: 'addDoc',
        data: {
          addTimedTask: true,
          data: {
            taskType: _this.data.type,
            modeDetail: modeDetail,
            isoModeDetail: isoModeDetail,
            remodeDetail: remodeDetail,//邮件发送时间
            isoReDetail: isoReDetail,//邮件发送时间（iso格式）
            jqid: jqid,
            name: _this.data.jqName,
            deadline: this.data.deadline.split('-'),
            isoDeadLine: [isoDeadlineDate, isoDeadlineHour, isoDeadlineMinute],
            mail: this.data.info.email,
            secEmail: this.data.info.secEmail,
            list: this.data.list
          }
        }
      }).then(res => {
        console.log(res)
        wx.hideLoading();
        wx.navigateTo({
          url: '../createJQ/index?editing=0&jq=' + this.data.jqName + '&id=' + jqid,
        })
      })
    })
  },
  cancelMask() {
    this.setData({showMask: false})
  },
  cancelEmailMask() {
    this.setData({ showEmailMask: false})
  },

  displayMask(e) {
    let index = e.currentTarget.dataset.index;
    console.log(e);
    this.setData({ type: Number(index)})
    if (index === '0') {
      this.setData({ showEmailMask: true })
    } else {
      this.setData({ showMask: true})
    }
  },

  addTojq() {
    let _this = this;
    let info = this.data.info;
    console.log("info: ", info)
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'addDoc',
        data: {
          addjq: true,
          data: {
            name: _this.data.jqName,
            creationTime: new Date().getTime(),
            creator: app.globalData.openid,
            deadline: _this.data.deadline,
            type: _this.data.type,
            modeDetail: _this.data.modeDetail,
            remodeDetail: _this.data.remodeDetail,
            mail: info.mail,
            secEmail: info.secEmail,
            list: info.list,
            number: info.number
          }
        }
      }).then(res => {resolve(res)})
      .catch(res => {reject(res)})
    })
  }

})