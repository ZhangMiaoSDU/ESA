// pages/send/index.js
const app = getApp();
const images = require('../../utils/images.js');
const db = wx.cloud.database();
const userDB = db.collection('user');

function timestampToTime(timestamp) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}/${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`
}

function timestampToTimeByM(timestamp) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`
}

function getDate(datestr) {
  var temp = datestr.split("-");
  var date = new Date(temp[0], temp[1] - 1, temp[2]);
  return date;
}

function formatEveryMonthDay(start, end, day) {
  console.log("========formatEveryMonthDay========")
  let dateList = [];
  dateList.push(start.split('-').join('/'))
  var startTime = getDate(start);
  var endTime = getDate(end);
  var dayCount = 0;
  console.log((endTime.getTime() - startTime.getTime()))
  while ((endTime.getTime() - startTime.getTime()) >= 0) {
    var year = startTime.getFullYear();
    var month = startTime.getMonth() + 1 < 10 ? '0' + (startTime.getMonth() + 1) : startTime.getMonth() + 1;
    dayCount = new Date(year, month, 0).getDate();//本月的天数
    var date = startTime.getDate().toString().length == 1 ? "0" + startTime.getDate() : startTime.getDate();
    // console.log(year, month, date, Number(date), day)
    if (day == Number(date)) {
      var dayf = day < 10 ? '0' + day : day;
      dateList.push(year + "/" + month + "/" + dayf);
    }
    // 如果设定日大于本月的天数，只添加一次
    if (Number(date) == dayCount) {
      if (day > dayCount) {
        dateList.push(year + "/" + month + "/" + dayCount);
      }
    }
    startTime.setDate(startTime.getDate() + 1);
  }
  return dateList;
}

function formatEveryWeekDay(start, end, weekday) {
  let dateList = [];
  dateList.push(start.split('-').join('/'))
  var startTime = getDate(start);
  var endTime = getDate(end);
  console.log()
  while ((endTime.getTime() - startTime.getTime()) >= 0) {
    var year = startTime.getFullYear();
    var month = startTime.getMonth() + 1 < 10 ? '0' + (startTime.getMonth() + 1) : startTime.getMonth() + 1;
    var date = startTime.getDate().toString().length == 1 ? "0" + startTime.getDate() : startTime.getDate();
    // 查看周几
    var time = year + "/" + month + "/" + date;
    var day = new Date(time).getDay();
    if (weekday.indexOf(day) != -1) {
      dateList.push(time);
    }
    startTime.setDate(startTime.getDate() + 1);
  }
  return dateList;
}

Page({
  data: {
    images: images,
    currentDay: timestampToTime(new Date()),
    screenWidth: app.globalData.screenWidth,
    statusBarHeight: app.globalData.statusBarHeight,
    navigatorH: app.globalData.navigatorH,
    windowHeight: app.globalData.windowHeight
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

  getDayandPeriod(jqInfo) {
    return [jqInfo.saveRecordDay, jqInfo.currentPeriod]
  },

  checkAdd(jqInfo) {
    console.log("checkAdd")
    var res = this.getDayandPeriod(jqInfo);
    var currentDay = res[0], currentPeriod = res[1];
    var now = new Date().getTime();
    var previous = new Date(currentPeriod[0]).getTime();
    var next = new Date(currentPeriod[1]).getTime();
    // console.log(previous, now, next)
    if (now >= previous && now <= next) {
      // 查看有没有填写
      console.log(currentDay)
      var filled = jqInfo[currentDay] || [];
      if (filled.indexOf(app.globalData.openid) != -1) {
        return [true, true, currentPeriod];//该问卷已经填写
      } else {
        return [true, false, currentPeriod];
      }
    } else { return [false, false, false] }
  },

  checkJq(jqsInfo) {
    let displayJqs = [];
    // 判断这些问卷是否需要今天填写
    for (let i = 0; i < jqsInfo.length; i++) {
      var weekRes = this.checkAdd(jqsInfo[i])
      var isAdd = weekRes[0];
      var isFilled = weekRes[1];
      if (isAdd) {
        jqsInfo[i].period = weekRes[2];
        if (isFilled) { jqsInfo[i].isFill = true; }
        displayJqs.push(jqsInfo[i]);
      }

      // if (jqsInfo[i].type == 0) {
      //   console.log("一次性问卷");
      //   var oneTimeRes = this.checkAdd(jqsInfo[i])
      //   var isAdd = oneTimeRes[0];
      //   var isFilled = oneTimeRes[1];
      //   if (isAdd) { 
      //     jqsInfo[i].period = oneTimeRes[2];
      //     if (isFilled) { jqsInfo[i].isFill = true;}
      //     displayJqs.push(jqsInfo[i]);
      //   }
      // } else if (jqsInfo[i].type == 1) {
      //   console.log("按月");
      //   var monthRes = this.checkAdd(jqsInfo[i])
      //   var isAdd = monthRes[0];
      //   var isFilled = monthRes[1];
      //   if (isAdd) {
      //     jqsInfo[i].period = monthRes[2];
      //     if (isFilled) { jqsInfo[i].isFill = true;  }
      //     displayJqs.push(jqsInfo[i]);
      //   }
      // } else if (jqsInfo[i].type == 2) {
      //   console.log("按日", this.data.currentDay)
      //   var deaeline = jqsInfo[i].deadline.split('-').join('/');
      //   if (timestampToTime(new Date().getTime()) < deaeline) {
      //     console.log(jqsInfo[i][this.data.currentDay])
      //     var currentDayRecord = jqsInfo[i][this.data.currentDay] || []
      //     if (currentDayRecord.indexOf(app.globalData.openid) != -1) {
      //       jqsInfo[i].isFill = true;
      //     }
      //     displayJqs.push(jqsInfo[i]);
      //   }
      // } else if (jqsInfo[i].type == 3) {
      //   console.log("按周");
        
      // }
    }
    return displayJqs;
  },

  fillJQ(e) {
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    this.setData({ resJQ: null, queryid: ''})
    wx.navigateTo({
      url: '../createJQ/index?jq=' + name + '&id=' + id
    })
    
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
    this.setData({ resJQ: null, queryid: '', showSearch: false, })
  },
  goBack: function () {
    console.log("fillJQ back")
    wx.switchTab({
      url: '../home/index',
    })
  },
  showSearch() {
    this.setData({ showSearch: true })
  },
  cancelSearch() {
    this.setData({ showSearch: false, searchUs: [] })
  },
})