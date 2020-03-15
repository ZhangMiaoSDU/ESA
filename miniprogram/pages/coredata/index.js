// pages/coredata/index.js
const app = getApp();
const images = require('../../utils/images.js');
const utils = require('../../utils/utils.js');
const db = wx.cloud.database();
const jqDB = db.collection('jq');
const questionDB = db.collection('question');
const userDB = db.collection('user');
const FileSystemManager = wx.getFileSystemManager();

function timestampToTime(timestamp) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate() }`
}

Page({
  data: {
    images: images,
    screenWidth: app.globalData.screenWidth,
    currentDay: timestampToTime(new Date().getTime()).split('-').join('/'),
    statusBarHeight: app.globalData.statusBarHeight,
    navigatorH: app.globalData.navigatorH,
    screenWidth: app.globalData.screenWidth,
    windowHeight: app.globalData.windowHeight
  },

  onLoad: function (options) {
    let _this = this
    this.loadJQ(app.globalData.openid).then(res => {
      let jqs = res.result ? res.result.data : [];
      jqs.map(item => { 
        if (item.type == 0) {
          console.log("一次性问卷 所有提交的人个数");
          var resOneTime = this.getDayandPeriod(item);
          console.log("resOneTime: ", resOneTime)
          var currentDay = resOneTime[0], period = resOneTime[1];
          item.filled = item.jqUser ? item.jqUser.length : 0;
          item.required = item.number ? item.number : item.jqUser ? item.jqUser.length : 0;
          item.period = period;
        } else {
          var resWeek = this.getDayandPeriod(item);
          console.log("resWeek: ", resWeek)
          var currentDay = resWeek[0], period = resWeek[1];
          item.filled = item.currentRecord ? item.currentRecord : 0;
          item.required = item.number ? item.number : item.jqUser ? item.jqUser.length : 0;
          item.period = period;
        }
      })
      _this.setData({ jqs: jqs });
      console.log(this.data.jqs)
    })

  },

  getDayandPeriod(jqInfo) {
    return [jqInfo.saveRecordDay, jqInfo.currentPeriod]
  },

  loadJQ(userId) {
    console.log("userId: ", userId)
    // 由该用户创建的问卷
    // let userId = app.globalData.openid;
    // let userId = "ogesF5sRy3mAxrLAVJ1fqe8yuseU";

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
    var _this = this;
    console.log("downloadData: ", e)
    let jqid = e.currentTarget.dataset.id;
    var jqsInfo = this.data.jqs;
    var currentjqInfo = jqsInfo.filter(item => { return item._id == jqid })[0];
    wx.cloud.callFunction({
      name: 'excel',
      data: {
        name: `${jqid}/${currentjqInfo.name}`,
        jqid: jqid,
      }
    }).then(res => {
      console.log(res);
      if (res.result == 0) {
        wx.showToast({
          title: '当前问卷中没有问题',
          icon: 'none'
        });
        return;
      }
      wx.showLoading({
        title: '获取下载链接',
      })
      _this.getFileUrl(res.result.fileID)
    }).catch(res => {
      console.log(res)
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
    // let jqid = 'fb16f7905e4e896b0198a1167f08b1a7';
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
      path: '/pages/jqStat/index?share=0&id=' + jqid,
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
    var currentDay = currentjqInfo.saveRecordDay;
    // console.log(currentDay, currentjqInfo)
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
    var currentDay = currentjqInfo.saveRecordDay;
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
    wx.switchTab({
      url: '../home/index',
    })
  },

  createJQ() {
    wx.navigateTo({
      url: '../ques/index',
    })
  }
})