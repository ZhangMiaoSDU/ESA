// pages/coredata/index.js
const app = getApp();
const images = require('../../utils/images.js')
const db = wx.cloud.database();
const jqDB = db.collection('jq');
const questionDB = db.collection('question');
const userDB = db.collection('user');
const FileSystemManager = wx.getFileSystemManager();

function getDate(datestr) {
  var temp = datestr.split("-");
  var date = new Date(temp[0], temp[1] - 1, temp[2]);
  return date;
}
 
function formatEveryDay(start, end) {
  let dateList = [];
  var startTime = getDate(start);
  var endTime = getDate(end);

  while ((endTime.getTime() - startTime.getTime()) >= 0) {
    var year = startTime.getFullYear();
    var month = startTime.getMonth() + 1 < 10 ? '0' + (startTime.getMonth() + 1) : startTime.getMonth() + 1;
    var day = startTime.getDate().toString().length == 1 ? "0" + startTime.getDate() : startTime.getDate();
    dateList.push(year + "/" + month + "/" + day);
    startTime.setDate(startTime.getDate() + 1);
  }
  return dateList;
}

function timestampToTime(timestamp) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}-${date.getDate()}`
}

function timeToISOTiem(cstime) {
  return new Date(cstime).toISOString().split('T')[0];
}
Page({
  data: {
    images: images,
    screenWidth: app.globalData.screenWidth,
    currentDay: timestampToTime(new Date().getTime()).split('-').join('/'),
    statusBarHeight: app.globalData.statusBarHeight,
    navigatorH: app.globalData.navigatorH,
    screenWidth: app.globalData.screenWidth
  },

  onLoad: function (options) {
    let _this = this
    this.loadJQ().then(res => {
      let jqs = res.result ? res.result.data : [];
      jqs.map(item => { return item.filled = item[_this.data.currentDay] ? item[_this.data.currentDay].length : 0, item.required = item.number ? item.number : item.jqUser ? item.jqUser.length : 0 })
      _this.setData({ jqs: jqs });
      console.log(this.data.jqs)
    })
  },

  loadJQ() {
    // 由该用户创建的问卷
    let userId = app.globalData.openid;
    console.log("userId: ", userId)
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'queryDB',
        data: {
          queryJQ: true,
          userId: userId
        }
      }).then(res => {
        console.log(res);
        resolve(res);
      }).catch(res => { console.log(res); reject(res) })
    })
  },

  downloadData(e) {
    wx.showLoading({
      title: '正在生成数据',
    })
    console.log("downloadData: ", e)
    let jqid = e.currentTarget.dataset.id;
    let _this = this;
    var jqsInfo = this.data.jqs;
    var currentjqInfo = jqsInfo.filter(item => {return item._id == jqid})[0];
    console.log("currentjqInfo: ", currentjqInfo);
    var sendEmailHour = currentjqInfo.remodeDetail[0], sendEmailMinute = currentjqInfo.remodeDetail[1];
    var csTime = timestampToTime(currentjqInfo.creationTime) + ' ' + sendEmailHour + ':' + sendEmailMinute;
    let startiso = timeToISOTiem(csTime);
    console.log("csTime: ", csTime, "startiso: ", startiso);
    let nowiso = timeToISOTiem(new Date().getTime());//当前时间
    console.log("nowiso: ", nowiso)
    let deadline = currentjqInfo.deadline.split('-').join('/');//截止日期
    let endiso;
    if (new Date().getTime() < new Date(deadline).getTime()) {
      console.log('还未到截止日期');
      endiso = nowiso;
    } else {
      var deadlineiso = timeToISOTiem(deadline + ' ' + sendEmailHour + ':' + sendEmailMinute)
      endiso = deadlineiso
    }
    console.log("endiso: ", endiso)
    // end = currentjqInfo.deadline
    let dateList = formatEveryDay(startiso, endiso);
    if (currentjqInfo.type == 1) {
      console.log("按月");
      var alertDate = currentjqInfo.modeDetail[0];
      dateList = dateList.filter(item => {
        return item.split('/')[2] == alertDate;
      })
    }
    _this.setData({ dateList: dateList });
    console.log(startiso, endiso, '\n', dateList)
    let jqUser = currentjqInfo.jqUser;
    this.loadQuestion(currentjqInfo.questions).then(res => {
      
      let questionsInfo = res.map(item => { return item.data });
      // console.log("questionsInfo: ", questionsInfo);
      let summaryDict = _this.formatData(questionsInfo, jqUser, currentjqInfo, dateList);
      // console.log("summaryDict: ", JSON.stringify(summaryDict));
      wx.cloud.callFunction({
          name: 'excel',
          data: {
            name: `${jqid}/${currentjqInfo.name}`,
            summaryDict: summaryDict
          }
        }).then(res => {
          console.log(res);
          wx.showLoading({
            title: '获取下载链接',
          })
          _this.getFileUrl(res.result.fileID)
        }).catch(res => {
          console.log(res)
        })
    }).catch(res => {console.log(res)})
  },

  formatData(questionsInfo, jqUser, currentjqInfo, dateList) {
    let questionDict = {};
    let header = [];
    header.push('用户');
    console.log("questionsInfo: ", questionsInfo);
    questionsInfo.map(item => {
      questionDict[item._id] = {content:item.content, type:item.type, options:item.options ? item.options:[]};
      header.push(item.content)
    });
    console.log("questionDict: ", questionDict);
    let summaryDict = [];
    for (let i = 0; i < dateList.length; i++) {
      let date = dateList[i];
      let allUsersSummary = []
      allUsersSummary.push(header);
      jqUser.map(userId => {
        let userAnswer = currentjqInfo[userId][date] || {};
        let _array = [];
        _array.push(userId);
        for (let key in questionDict) {
          if (userAnswer[key]) {
            if (questionDict[key].type == 1) {
              _array.push(userAnswer[key])
            } else {
              var index = userAnswer[key];
              _array.push(questionDict[key].options[index])
            }
          } else {
            _array.push("未填写")
          }
        }
        // console.log(_array)
        allUsersSummary.push(_array);
      })
      // console.log("allUsersSummary: ", allUsersSummary);
      summaryDict.push({
        name: date.split('/').join('-'),
        data: allUsersSummary
      })
    }
    return summaryDict;
  },

  loadQuestion(questions) {
    let jqQuestions = questions || [];
    let tasks = jqQuestions.map(item => { return questionDB.doc(item).get() });
    return new Promise((resolve, reject) => {
      Promise.all(tasks).then(res => {resolve(res)})
      .catch(res => {console.log(res)})
    })
  },
  //获取云存储文件下载地址，这个地址有效期一天
  getFileUrl(fileID) {
    let that = this;
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        wx.hideLoading();
        // get temp file URL
        console.log("文件下载链接", res.fileList[0].tempFileURL)
        that.setData({
          showMask: true,
          fileUrl: res.fileList[0].tempFileURL
        })
      },
      fail: err => {
        wx.showToast({
          title: '获取失败，请稍后再试',
          icon: 'none'
        })
      }
    })
  },
  //复制excel文件下载链接
  copyFileUrl() {
    let that = this
    wx.setClipboardData({
      data: that.data.fileUrl,
      success(res) {
        wx.getClipboardData({
          success(res) {
            that.setData({ showMask: false,})
            console.log("复制成功", res.data) // data
          }
        })
      }
    })
  },

  getJQDetail(e) {
    let jqid = e.currentTarget.dataset.id;
    let num = e.currentTarget.dataset.num;
    console.log(e)
    app.globalData.num = num;
    console.log(app.globalData.num)
    wx.navigateTo({
      url: '../jqStat/index?id=' + jqid,
    })
  },
  onShareAppMessage(e) {
    let jqid = e.target.dataset.jqid;
    return {
      title: '分享报表统计结果',
      path: '/pages/jqStat/index?id=' + jqid,
      imageUrl: this.data.images.sharebg,
      success: res => { console.log(res) },
      fail: res => { console.log(res) }
    }
  },
  viewUnfilled(e) {
    // 获取未填写人员信息
    console.log(e);
    var jqid = e.currentTarget.dataset.id;
    var jqsInfo = this.data.jqs;
    var currentjqInfo = jqsInfo.filter(item => { return item._id == jqid })[0];
    var currentDay = this.data.currentDay;
    console.log(currentDay, currentjqInfo)
    var filledUserId = currentjqInfo[currentDay] || [];
    // 应填名单
    var list = currentjqInfo.list;
    if (list && list.length > 0) {
      let tasks = filledUserId.map(item => { return userDB.doc(item).get() });
      Promise.all(tasks).then(res => {
        let filledUserPhone = res.map(item => { return item.data.phone });
        let filledUserId = res.map(item => { return item.data._id });
        var unfilledUser = list.filter(item => { if (filledUserPhone.indexOf(item.phone) == -1) { return item } });
        console.log(unfilledUser);
        wx.navigateTo({
          url: '../detail/index?unfilled=true&data=' + JSON.stringify(unfilledUser) + '&jqid=' + jqid + '&jqName=' + currentjqInfo.name,
        })
      })
    } else if (currentjqInfo.jqUser){
      let unfilledUserId = currentjqInfo.jqUser.filter(item => { return filledUserId.indexOf(item) == -1 });
      let tasks = unfilledUserId.map(item => { return userDB.doc(item).get() });//未填写人员的ID
      Promise.all(tasks).then(res => {
        let unfilledUserInfo = res.map(item => { return item.data });//上期全部填写人员的信息
        var unfilledUser = unfilledUserInfo.map(item => { return {name: item.name, phone: item.phone}});
        console.log(unfilledUserInfo, unfilledUser);
        wx.navigateTo({
          url: '../detail/index?unfilled=true&data=' + JSON.stringify(unfilledUser) + '&jqid=' + jqid + '&jqName=' + currentjqInfo.name,
        })
      })
    }
  },
  viewfilled(e) {
    var jqid = e.currentTarget.dataset.id;
    var jqsInfo = this.data.jqs;
    var currentjqInfo = jqsInfo.filter(item => { return item._id == jqid })[0];
    var currentDay = this.data.currentDay;
    console.log(currentDay, currentjqInfo)
    var filledUserId = currentjqInfo[currentDay] || [];
    var list = currentjqInfo.list;
    
    if (list && list.length > 0) {
      let tasks = filledUserId.map(item => { return userDB.doc(item).get() });
      Promise.all(tasks).then(res => {
        let filledUserPhone = res.map(item => { return item.data.phone });
        var filledUser = list.filter(item => { if (filledUserPhone.indexOf(item.phone) != -1) { return item } });
        console.log(filledUser);
        wx.navigateTo({
          url: '../detail/index?filled=true&data=' + JSON.stringify(filledUser),
        })
      })
    } else if (currentjqInfo.jqUser) {
      let tasks = filledUserId.map(item => { return userDB.doc(item).get() });//填写人员的ID
      Promise.all(tasks).then(res => {
        let filledUserInfo = res.map(item => { return item.data });//上期全部填写人员的信息
        var filledUser = filledUserInfo.map(item => { return { name: item.name, phone: item.phone } });
        console.log(filledUserInfo, filledUser);
        wx.navigateTo({
          url: '../detail/index?filled=true&data=' + JSON.stringify(filledUser),
        })
      })
    }
  },
  goBack: function () {
    console.log("coredata back")
    wx.navigateBack({
      delta: 1
    })
  },
})