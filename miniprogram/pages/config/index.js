// pages/config/index.js
const app = getApp();
const images = require('../../utils/images.js');
var dateTimePicker = require('../../utils/dateTimePicker.js');
const utils = require('../../utils/utils.js');
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
    time: ((new Date().getHours() + 1) == 24 ? '00' : (new Date().getHours() + 1)) + ':' + (new Date().getMinutes() > 10 ? new Date().getMinutes() :'0' + new Date().getMinutes()),
    retime: ((new Date().getHours() + 1) == 24 ? '00' : (new Date().getHours() + 1)) + ':' + "00",
    reminddate: 1,
    perioddate: 1,
    deadline: timestampToTime(new Date().getTime()),
    weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    selectedDay: [],
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1,
    currentDay: new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate()
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
    var label = e.currentTarget.dataset.label;
    console.log(label)
    if (label == 'remind') {
      this.setData({ reminddate: this.data.array[e.detail.value]})
    } else if (label == 'period') {
      this.setData({ perioddate: this.data.array[e.detail.value] })
    }
    this.setData({index: e.detail.value})
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
      console.log(this.data.selectedperiodDay, this.data.selectedremindDay)
      var selectedperiodDay = this.data.selectedperiodDay || [], selectedremindDay = this.data.selectedremindDay || [];
      if (selectedperiodDay.length == 0 || selectedremindDay .length == 0) {
        wx.showToast({
          title: '请至少选择一个提醒日和截止日',
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
    this.setData({showMask: false, })
  },


  displayMask(e) {
    let index = e.currentTarget.dataset.index;
    console.log(e);
    this.setData({ type: Number(index), showMask: true})
    if (index == '0') {
      var obj1 = dateTimePicker.dateTimePicker('2020', '2030');
      this.setData({
        dateTimeArray1: obj1.dateTimeArray,
        dateTime1: obj1.dateTime
      });
      var arr = this.data.dateTime1, dateArr = this.data.dateTimeArray1;
      var selectTime =
        `${dateArr[0][arr[0]]}-${dateArr[1][arr[1]]}-${dateArr[2][arr[2]]} ${dateArr[3][arr[3]]}:${dateArr[4][arr[4]]}`
      this.setData({ time: selectTime });
    } else {
      this.setData({ time: ((new Date().getHours() + 1) == 24 ? '00' : (new Date().getHours() + 1)) + ':00' });
    }
    console.log("display==========>", this.data.time, index)
  },
  changeDateTime1(e) {
    console.log("-=-----------changeDateTime1===========: ", e.detail.value)
    this.setData({ dateTime1: e.detail.value});
    var arr = this.data.dateTime1, dateArr = this.data.dateTimeArray1;
    var selectTime = `${dateArr[0][arr[0]]}-${dateArr[1][arr[1]]}-${dateArr[2][arr[2]]} ${dateArr[3][arr[3]]}:${dateArr[4][arr[4]]}`
    this.setData({ time: selectTime });
  },

  changeDateTimeColumn1(e) {
    console.log("-=-----------changeDateTimeColumn1===========: ", e.detail.value)
    var arr = this.data.dateTime1, dateArr = this.data.dateTimeArray1;
    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
    this.setData({
      dateTimeArray1: dateArr,
      dateTime1: arr
    });
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
    // 问卷的有效期
    var start = `${this.data.currentYear}/${this.data.currentMonth}/${this.data.currentDay}`;
    var end = this.data.deadline.split('-').join('/');
    var periods = [[start, end]];
    var datetime = this.data.time;
    var date = datetime.split(' ')[0], time = datetime.split(' ')[0];
    var retime = this.data.retime;
    var deadline = this.data.deadline;
    date = date.split('-').map(item => {return Number(item)});
    console.log("confirmByday ===========> date, time, retime: ", date, time, retime);
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
      reminddate: date,
      timeHour: timeHour,
      retimeHour: retimeHour,
      periods: periods,
      currentPeriod: periods[0],
      saveRecordDay: periods[0][0],
      currentRecord: 0,
      deadline: this.data.deadline,
      type: this.data.type,
      mail: info.email,
      secEmail: info.secEmail,
      _3rdEmail: info._3rdEmail,
      secPhone: info.secPhone,
      list: info.list,
      number: info.number,
      selectedGid: info.selectedGid
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
      periods: periods,
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

  getPeriods(dateList) {
    var periods = [];
    for (let i=0; i < dateList.length - 1; i++) {
      var _start = dateList[i], _end = dateList[i + 1];
      if (i == 0) {
        periods.push([_start, _end])
      } else {
        var _year = _start.split('/')[0], _month = _start.split('/')[1], _day = Number(_start.split('/')[2]);
        var dayCount = new Date(_year, _month, 0).getDate();//本月的天数
        if (_day + 1 > dayCount) {
          if (Number(_month) == 12) {
            _start = _year + '/01/01'
          } else {
            _start = _year + '/' + (Number(_month) + 1 > 10 ? Number(_month) + 1 : '0' + (Number(_month) + 1)) + '/01'
          }
          periods.push([_start, _end])
        } else {
          _start = _year + '/' + _month + '/' + (_day + 1 > 10 ? _day + 1 : '0' + (_day + 1))
          periods.push([_start, _end])
        }
      }
    }
    return periods
  },
  // 每月通知
  confirmByMonth() {
    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;
    var perioddate = Number(this.data.perioddate); // 问卷重复日
    var startTime = `${this.data.currentYear}-${this.data.currentMonth}-${this.data.currentDay}`;//开始时间
    var endTime = this.data.deadline;
    var dateList = utils.formatEveryMonthDay(startTime, endTime, perioddate);
    var periods = this.getPeriods(dateList);
    console.log("getPeriods =================> periods: ", periods)
    
    var reminddate = Number(this.data.reminddate); // 提醒日
    var time = this.data.time;
    var retime = this.data.retime;
    console.log("confirmByMonth ===========>year,month,perioddate, reminddate, time, retime: ", year, month, perioddate, reminddate, time, retime);
    var timeArr = time.split(":"), retimeArr = retime.split(":");
    var timeHour = Number(timeArr[0]), retimeHour = Number(retimeArr[0]);//时
    console.log("confirmByday ===========>perioddate, reminddate, timeHour, retime: ", perioddate, reminddate, timeHour, retimeHour);
    const intervalTime = 8 * 60 * 60 * 1000; //8个小时
    //提醒时间
    var timeGMT = new Date(`${year}/${month}/${reminddate} ${timeHour}:00`).getTime();//提醒时间的时间戳，GMT格式
    var timeISO = timeGMT - intervalTime;//将提醒时间的时间戳转为ISO格式，因为ISO慢8个小时；所以减去。
    var isoTimeDate = new Date(timeISO).getDate(), isoTimeHour = new Date(timeISO).getHours();
    //邮件发送时间
    var retimeGMT = new Date(`${year}/${month}/${reminddate} ${retimeHour}:00`).getTime();//邮件发送时间的时间戳，GMT格式
    var retimeISO = retimeGMT - intervalTime;//将邮件发送时间的时间戳转为ISO格式，因为ISO慢8个小时；所以减去。
    var isoRetimeDate = new Date(retimeISO).getDate(), isoRetimeHour = new Date(retimeISO).getHours();
    console.log("iso =====> isoTimeDate, timeHour, isoRetimeDate, retime: ", isoTimeDate, isoTimeHour, isoRetimeDate, isoRetimeHour);
    var info = this.data.info;
    // 保存问卷信息
    var saveJqInfo = {
      name: this.data.jqName,
      creationTime: new Date().getTime(),
      creator: app.globalData.openid,
      reminddate: this.data.reminddate,
      perioddate: this.data.perioddate,
      timeHour: timeHour,
      retimeHour: retimeHour,
      periods: periods,
      currentPeriod: periods[0],
      saveRecordDay: periods[0][0],
      currentRecord: 0,
      deadline: endTime,
      type: this.data.type,
      mail: info.email,
      secEmail: info.secEmail,
      _3rdEmail: info._3rdEmail,
      secPhone: info.secPhone,
      list: info.list,
      number: info.number,
      selectedGid: info.selectedGid
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
      reminddate: this.data.reminddate,
      perioddate: this.data.perioddate,
      isoTimeDate: isoTimeDate,
      timeHour: timeHour,
      isoTimeHour: isoTimeHour,
      periods: periods,
      // isoRetimeDate: isoRetimeDate,
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
    var startTime = `${this.data.currentYear}-${this.data.currentMonth}-${this.data.currentDay}`;//开始时间
    var endTime = this.data.deadline;
    var dateList = utils.formatEveryDay(startTime, endTime);
    var periods = dateList.map(item => {return [item, item]});
    console.log("confirmByday =================> periods: ", periods)
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
      periods: periods,
      currentPeriod: periods[0],
      saveRecordDay: periods[0][0],
      currentRecord: 0,
      timeHour: timeHour,
      retimeHour: retimeHour,
      deadline: this.data.deadline,
      type: this.data.type,
      mail: info.email,
      secEmail: info.secEmail,
      _3rdEmail: info._3rdEmail,
      secPhone: info.secPhone,
      list: info.list,
      number: info.number,
      selectedGid: info.selectedGid
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
      periods: periods,
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
    var label = e.currentTarget.dataset.label;
    console.log(e) 
    if (label == 'period') {
      this.setData({ selectedperiodDay: e.detail.value });
    } else if (label == 'remind') {
      this.setData({ selectedremindDay: e.detail.value });
    }
  },
  // 按周通知
  confirmByWeek() {
    var selectedperiodDay = this.data.selectedperiodDay.map(item => { return Number(item) });
    var startTime = `${this.data.currentYear}-${this.data.currentMonth}-${this.data.currentDay}`;//开始时间
    var endTime = this.data.deadline;
    var dateList = utils.formatEveryWeekDay(startTime, endTime, selectedperiodDay);
    var periods = this.getPeriods(dateList);
    console.log("getPeriods ==================> periods: ", periods)

    var selectedremindDay = this.data.selectedremindDay;
    var time = this.data.time;
    var retime = this.data.retime;
    var deadline = this.data.deadline;
    console.log("confirmByWeek ===========> selectedperiodDay,selectedremindDay time, retime: ", selectedperiodDay, selectedremindDay, time, retime)
    var timeArr = time.split(":"), retimeArr = retime.split(":");
    var timeHour = Number(timeArr[0]), retimeHour = Number(retimeArr[0]);//时
    selectedremindDay = selectedremindDay.map(item => {return Number(item)});
    console.log("confirmByWeek ===========> selectedperiodDay,selectedremindDay, timeHour, retime: ", selectedperiodDay, selectedremindDay, timeHour, retimeHour)
    // 提醒时间
    var isoSelectedDay, isoReSelectedDay, isoTimeHour, isoRetimeHour;
    if (timeHour - 8 < 0) {
      isoSelectedDay = selectedremindDay.map(item => { 
        if (item == 0) {
          return item = 6
        } else {
          return item = item - 1
        }
      });
      isoTimeHour = timeHour - 8 + 24
    } else {
      isoSelectedDay = selectedremindDay
      isoTimeHour = timeHour - 8
    }
    // 邮件发送时间
    if (retimeHour - 8 < 0) {
      isoRetimeHour = retimeHour - 8 + 24
    } else {
      isoRetimeHour = retimeHour - 8
    }
    console.log("iso =====> selectedDay, timeHour, isoReSelectedDay, retime: ", isoTimeHour, isoRetimeHour);
    var info = this.data.info;
    var saveJqInfo = {
      name: this.data.jqName,
      creationTime: new Date().getTime(),
      creator: app.globalData.openid,
      deadline: this.data.deadline,
      type: this.data.type,
      periods: periods,
      currentPeriod: periods[0],
      saveRecordDay: periods[0][0],
      currentRecord: 0,
      timeHour: timeHour,
      retimeHour: retimeHour,
      mail: info.email,
      secEmail: info.secEmail,
      _3rdEmail: info._3rdEmail,
      secPhone: info.secPhone,
      list: info.list,
      number: info.number,
      selectedGid: info.selectedGid
    }
    if (this.data.secCreator) {
      saveJqInfo.secCreator = this.data.secCreator._id
    }
    if (this.data._3rdCreator) {
      saveJqInfo._3rdCreator = this.data._3rdCreator._id
    }

    var saveTimedTaskInfo = {
      taskType: this.data.type,
      selectedremindDay: selectedremindDay,
      isoSelectedDay: isoSelectedDay,
      timeHour: timeHour,
      isoTimeHour: isoTimeHour,
      isoReSelectedDay: isoReSelectedDay,
      retimeHour: retimeHour,
      isoRetimeHour: isoRetimeHour,
      periods: periods,
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
          url: '../createJQ/index?editing=0&create=0&jq=' + this.data.jqName + '&id=' + jqid,
        })
      })
    })
      .catch(res => { reject(res) })
  }
})