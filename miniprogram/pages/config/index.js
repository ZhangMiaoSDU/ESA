// pages/config/index.js
const app = getApp();
const images = require('../../utils/images.js');
const db = wx.cloud.database();
const userDB = db.collection('user')
function timestampToTime(timestamp) {
  let nextTimestamp = timestamp + 2592000000;
  const date = new Date(nextTimestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`
}

Page({

  data: {
    images: images,
    index: 0,
    time: ((new Date().getHours() + 1) == 24 ? '00' : (new Date().getHours() + 1)) + ':' + new Date().getMinutes(),
    retime: ((new Date().getHours() + 1) == 24 ? '00' : (new Date().getHours() + 1)) + ':' + new Date().getMinutes(),
    date: 1,
    deadline: timestampToTime(new Date().getTime()),
    weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    selectedDay: []
  },

  onLoad: function (options) {
    console.log(options)
    let _this = this;
    let stringJson = options.stringJson;
    let optionjson = JSON.parse(stringJson)
    this.setData({ jqName: optionjson.name, info: optionjson})
    let array = [];
    for (let i = 0; i < 31; i++) {
      array.push(i + 1)
    } 
    console.log(array)
    this.setData({array: array});
    if (optionjson.secPhone == '') {
      _this.setData({ secCreator: undefined});
    } else {
      userDB.where({ phone: optionjson.secPhone }).get().then(res => {
        let secCreator = res.data[0];
        _this.setData({ secCreator: secCreator })
        console.log(secCreator)
      });
    }
    if (optionjson._3rdPhone == '') {
      _this.setData({ _3rdCreator: undefined });
    } else {
      userDB.where({ phone: optionjson._3rdPhone }).get().then(res => {
        let _3rdCreator = res.data[0];
        _this.setData({ _3rdCreator: _3rdCreator })
        console.log(_3rdCreator)
      });
    }
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
    if (this.data.type == 0) {
      this.confirmByOneTime();
      return;
    }
    if (this.data.type == 1) {
      this.confirmByMonth();
      return;
    }
    if (this.data.type == 2) {
      this.confirmByday();
      return;
    }
    if (this.data.type == 3) {
      if (this.data.selectedDay.length == 0) {
        wx.showToast({
          title: '请至少选择一个提醒日',
          icon: 'none'
        })
        return;
      } else {
        this.confirmByWeek();
        return;
      }
    }
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
    } else if (index === '3') {
      this.setData({ showMask: true, week: true })
    } else {
      this.setData({ showMask: true})
    }
  },

  addTojq(data) {
    let _this = this;
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'addDoc',
        data: {
          addjq: true,
          data: data
        }
      }).then(res => {resolve(res)})
      .catch(res => {reject(res)})
    })
  },
  // 一次性问卷
  confirmByOneTime() {
    var time = this.data.time;
    var retime = this.data.retime;
    var deadline = this.data.deadline;
    console.log("confirmByday ===========> time, retime: ", time, retime);
    var timeArr = time.split(":"), retimeArr = retime.split(":");
    var timeHour = Number(timeArr[0]), retimeHour = Number(retimeArr[0]);//时
    console.log("confirmByday ===========> timeHour, retime: ", timeHour, retimeHour);
    // 提醒时间
    var isoTimeHour;
    isoTimeHour = timeHour - 8 < 0 ? timeHour - 8 + 24 : timeHour - 8;
    //邮件发送时间
    const intervalTime = 8 * 60 * 60 * 1000; //8个小时
    var retimeGMT = new Date(`${deadline.split('-').join('/')} ${retimeHour}:00`).getTime();//邮件发送时间的时间戳，GMT格式
    var retimeISO = retimeGMT - intervalTime;//将邮件发送时间的时间戳转为ISO格式，因为ISO慢8个小时；所以减去。
    var isoRetimeDate = new Date(retimeISO).getDate(), isoRetimeHour = new Date(retimeISO).getHours();
    console.log("iso =====> timeHour, isoRetimeDate, retime: ",  isoTimeHour, isoRetimeDate, isoRetimeHour);
    var info = this.data.info;
    // 保存问卷信息
    var saveJqInfo = {
      name: this.data.jqName,
      creationTime: new Date().getTime(),
      creator: app.globalData.openid,
      timeHour: timeHour,
      retimeHour: retimeHour,
      deadline: this.data.deadline,
      type: this.data.type,
      mail: info.email,
      secEmail: info.secEmail,
      _3rdEmail: info._3rdEmail,
      secPhone: info.secPhone,
      list: info.list,
      number: info.number
    };
    if (this.data.secCreator) {
      saveJqInfo.secCreator = this.data.secCreator._id
    }
    if (this.data._3rdCreator) {
      saveJqInfo._3rdCreator = this.data._3rdCreator._id
    }
    // 保存任务信息
    var saveTimedTaskInfo = {
      taskType: this.data.type,
      timeHour: timeHour,
      isoTimeHour: isoTimeHour,
      isoRetimeDate: isoRetimeDate,
      retimeHour: retimeHour,
      isoRetimeHour: isoRetimeHour,
      name: this.data.jqName,
      deadline: this.data.deadline.split('-'),
      mail: this.data.info.email,
      secEmail: this.data.info.secEmail,
      secPhone: this.data.info.secPhone,
      _3rdEmail: this.data.info._3rdEmail,
      _3rdPhone: this.data.info._3rdPhone,
      list: this.data.list
    }
    this.addTojq(saveJqInfo).then(res => {
      var jqid = res.result._id;
      saveTimedTaskInfo.jqid = jqid;
      wx.cloud.callFunction({
        name: 'addDoc',
        data: {
          addTimedTask: true,
          data: saveTimedTaskInfo
        }
      }).then(res => {
        console.log(res)
        wx.hideLoading();
        wx.navigateTo({
          url: '../createJQ/index?editing=0&jq=' + this.data.jqName + '&id=' + jqid,
        })
      })
    }).catch(res => { console.log(res) })
  },

  // 每月通知
  confirmByMonth() {
    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;
    var date = Number(this.data.date);
    var time = this.data.time;
    var retime = this.data.retime;
    var deadline = this.data.deadline;
    console.log("confirmByMonth ===========>year,month, date, time, retime: ", year,month, date, time, retime);
    var timeArr = time.split(":"), retimeArr = retime.split(":");
    var timeHour = Number(timeArr[0]), retimeHour = Number(retimeArr[0]);//时
    console.log("confirmByday ===========>date, timeHour, retime: ", date, timeHour, retimeHour);
    const intervalTime = 8 * 60 * 60 * 1000; //8个小时
    //提醒时间
    var timeGMT = new Date(`${year}/${month}/${date} ${timeHour}:00`).getTime();//提醒时间的时间戳，GMT格式
    var timeISO = timeGMT - intervalTime;//将提醒时间的时间戳转为ISO格式，因为ISO慢8个小时；所以减去。
    var isoTimeDate = new Date(timeISO).getDate(), isoTimeHour = new Date(timeISO).getHours();
    //邮件发送时间
    var retimeGMT = new Date(`${year}/${month}/${date} ${retimeHour}:00`).getTime();//邮件发送时间的时间戳，GMT格式
    var retimeISO = retimeGMT - intervalTime;//将邮件发送时间的时间戳转为ISO格式，因为ISO慢8个小时；所以减去。
    var isoRetimeDate = new Date(retimeISO).getDate(), isoRetimeHour = new Date(retimeISO).getHours();
    console.log("iso =====> isoTimeDate, timeHour, isoRetimeDate, retime: ", isoTimeDate, isoTimeHour, isoRetimeDate, isoRetimeHour);
    var info = this.data.info;
    // 保存问卷信息
    var saveJqInfo = {
      name: this.data.jqName,
      creationTime: new Date().getTime(),
      creator: app.globalData.openid,
      date: date,
      timeHour: timeHour,
      retimeHour: retimeHour,
      deadline: this.data.deadline,
      type: this.data.type,
      mail: info.email,
      secEmail: info.secEmail,
      _3rdEmail: info._3rdEmail,
      secPhone: info.secPhone,
      list: info.list,
      number: info.number
    };
    if (this.data.secCreator) {
      saveJqInfo.secCreator = this.data.secCreator._id
    }
    if (this.data._3rdCreator) {
      saveJqInfo._3rdCreator = this.data._3rdCreator._id
    }
    // 保存任务信息
    var saveTimedTaskInfo = {
      taskType: this.data.type,
      date: date,
      isoTimeDate: isoTimeDate,
      timeHour: timeHour,
      isoTimeHour: isoTimeHour,
      isoRetimeDate: isoRetimeDate,
      retimeHour: retimeHour,
      isoRetimeHour: isoRetimeHour,
      name: this.data.jqName,
      deadline: this.data.deadline.split('-'),
      mail: this.data.info.email,
      secEmail: this.data.info.secEmail,
      secPhone: this.data.info.secPhone,
      _3rdEmail: this.data.info._3rdEmail,
      _3rdPhone: this.data.info._3rdPhone,
      list: this.data.list
    }
    this.addTojq(saveJqInfo).then(res => {
      var jqid = res.result._id;
      saveTimedTaskInfo.jqid = jqid;
      wx.cloud.callFunction({
        name: 'addDoc',
        data: {
          addTimedTask: true,
          data: saveTimedTaskInfo
        }
      }).then(res => {
        console.log(res)
        wx.hideLoading();
        wx.navigateTo({
          url: '../createJQ/index?editing=0&jq=' + this.data.jqName + '&id=' + jqid,
        })
      })
    }).catch(res => { console.log(res) })
  },

  // 每日通知
  confirmByday() {
    var time = this.data.time;
    var retime = this.data.retime;
    var deadline = this.data.deadline;
    console.log("confirmByday ===========> time, retime: ", time, retime);
    var timeArr = time.split(":"), retimeArr = retime.split(":");
    var timeHour = Number(timeArr[0]), retimeHour = Number(retimeArr[0]);//时
    console.log("confirmByday ===========> timeHour, retime: ", timeHour, retimeHour);
    // 提醒时间
    var isoTimeHour, isoRetimeHour;
    isoTimeHour = timeHour - 8 < 0 ? timeHour - 8 + 24 : timeHour - 8;
    //邮件发送时间
    isoRetimeHour = retimeHour - 8 < 0 ? retimeHour - 8 + 24 : retimeHour - 8;
    console.log("iso =====> timeHour, retime: ", isoTimeHour, isoRetimeHour);
    var info = this.data.info;
    // 保存问卷信息
    var saveJqInfo = {
      name: this.data.jqName,
      creationTime: new Date().getTime(),
      creator: app.globalData.openid,
      timeHour: timeHour,
      retimeHour: retimeHour,
      deadline: this.data.deadline,
      type: this.data.type,
      mail: info.email,
      secEmail: info.secEmail,
      _3rdEmail: info._3rdEmail,
      secPhone: info.secPhone,
      list: info.list,
      number: info.number
    };
    if (this.data.secCreator) {
      saveJqInfo.secCreator = this.data.secCreator._id
    }
    if (this.data._3rdCreator) {
      saveJqInfo._3rdCreator = this.data._3rdCreator._id
    }
    // 保存任务信息
    var saveTimedTaskInfo = {
      taskType: this.data.type,
      timeHour: timeHour,
      isoTimeHour: isoTimeHour,
      retimeHour: retimeHour,
      isoRetimeHour: isoRetimeHour,
      // jqid: jqid,
      name: this.data.jqName,
      deadline: this.data.deadline.split('-'),
      // isoDeadLine: [isoDeadlineDate, isoDeadlineHour, isoDeadlineMinute],
      mail: this.data.info.email,
      secEmail: this.data.info.secEmail,
      secPhone: this.data.info.secPhone,
      _3rdEmail: this.data.info._3rdEmail,
      _3rdPhone: this.data.info._3rdPhone,
      list: this.data.list
    }
    this.addTojq(saveJqInfo).then(res => {
      var jqid = res.result._id;
      saveTimedTaskInfo.jqid = jqid;
      wx.cloud.callFunction({
        name: 'addDoc',
        data: {
          addTimedTask: true,
          data: saveTimedTaskInfo
        }
      }).then(res => {
        console.log(res)
        wx.hideLoading();
        wx.navigateTo({
          url: '../createJQ/index?editing=0&jq=' + this.data.jqName + '&id=' + jqid,
        })
      })
    }).catch(res => {console.log(res)})
  },

  checkWeekChange(e) {
    console.log(e);
    this.setData({ selectedDay: e.detail.value});
  },
  // 按周通知
  confirmByWeek() {
    var selectedDay = this.data.selectedDay;
    var time = this.data.time;
    var retime = this.data.retime;
    var deadline = this.data.deadline;
    console.log("confirmByWeek ===========> selectedDay, time, retime: ", selectedDay, time, retime)
    var timeArr = time.split(":"), retimeArr = retime.split(":");
    var timeHour = Number(timeArr[0]), retimeHour = Number(retimeArr[0]);//时
    selectedDay = selectedDay.map(item => {return Number(item)});
    console.log("confirmByWeek ===========> selectedDay, timeHour, retime: ", selectedDay, timeHour, retimeHour)
    // 提醒时间
    var isoSelectedDay, isoReSelectedDay, isoTimeHour, isoRetimeHour;
    if (timeHour - 8 < 0) {
      isoSelectedDay = selectedDay.map(item => { 
        if (item == 0) {
          return item = 6
        } else {
          return item = item - 1
        }
      });
      isoTimeHour = timeHour - 8 + 24
    } else {
      isoSelectedDay = selectedDay
      isoTimeHour = timeHour - 8
    }
    // 邮件发送时间
    if (retimeHour - 8 < 0) {
      isoReSelectedDay = selectedDay.map(item => {
        if (item == 0) {
          return item = 6
        } else {
          return item = item - 1
        }
      });
      isoRetimeHour = retimeHour - 8 + 24
    } else {
      isoReSelectedDay = selectedDay
      isoRetimeHour = retimeHour - 8
    }
    console.log("iso =====> selectedDay, timeHour, isoReSelectedDay, retime: ", isoSelectedDay, isoTimeHour, isoReSelectedDay, isoRetimeHour);
    var info = this.data.info;
    var saveJqInfo = {
      name: this.data.jqName,
      creationTime: new Date().getTime(),
      creator: app.globalData.openid,
      deadline: this.data.deadline,
      type: this.data.type,
      selectedDay: selectedDay,
      timeHour: timeHour,
      retimeHour: retimeHour,
      mail: info.email,
      secEmail: info.secEmail,
      _3rdEmail: info._3rdEmail,
      secPhone: info.secPhone,
      list: info.list,
      number: info.number
    }
    if (this.data.secCreator) {
      saveJqInfo.secCreator = this.data.secCreator._id
    }
    if (this.data._3rdCreator) {
      saveJqInfo._3rdCreator = this.data._3rdCreator._id
    }

    var saveTimedTaskInfo = {
      taskType: this.data.type,
      selectedDay: selectedDay,
      isoSelectedDay: isoSelectedDay,
      timeHour: timeHour,
      isoTimeHour: isoTimeHour,
      isoReSelectedDay: isoReSelectedDay,
      retimeHour: retimeHour,
      isoRetimeHour: isoRetimeHour,
      // jqid: jqid,
      name: this.data.jqName,
      deadline: this.data.deadline.split('-'),
      // isoDeadLine: [isoDeadlineDate, isoDeadlineHour, isoDeadlineMinute],
      mail: this.data.info.email,
      secEmail: this.data.info.secEmail,
      secPhone: this.data.info.secPhone,
      _3rdEmail: this.data.info._3rdEmail,
      _3rdPhone: this.data.info._3rdPhone,
      list: this.data.list
    }

    this.addTojq(saveJqInfo).then(res => { 
      console.log(res);
      var jqid = res.result._id;
      saveTimedTaskInfo.jqid = jqid;
      wx.cloud.callFunction({
        name: 'addDoc',
        data: {
          addTimedTask: true,
          data: saveTimedTaskInfo
        }
      }).then(res => {
        console.log(res)
        wx.hideLoading();
        wx.navigateTo({
          url: '../createJQ/index?editing=0&jq=' + this.data.jqName + '&id=' + jqid,
        })
      })
    })
      .catch(res => { reject(res) })
  }
})