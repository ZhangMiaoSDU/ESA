// pages/ques/index.js
const app = getApp();
const images = require("../../utils/images.js");
const db = wx.cloud.database();
const userDB = db.collection('user');
const FileSystemManager = wx.getFileSystemManager();
Page({
  data: {
    screenWidth: app.globalData.screenWidth,
    statusBarHeight: app.globalData.statusBarHeight,
    navigatorH: app.globalData.navigatorH,
    showMask: false,
    images: images,
    list: [],
    count: 0
  },

  onLoad: function (options) {
    userDB.doc(app.globalData.openid).get().then(res => {
      console.log(res);
      if (res.data.email) {
        this.setData({ email: res.data.email})
      } else {
        this.setData({hasMail: false})
      }
    })
  },
  loadJQ() {
    // 由该用户创建的问卷
    let userId = app.globalData.openid;
    // console.log("userId: ", userId)
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'queryDB',
        data: {
          queryJQ: true,
          userId: userId
        }
      }).then(res => {
        // console.log(res);
        resolve(res);
      }).catch(res => { console.log(res); reject(res) })
    })
  },
  onShow() {
    let _this = this;
    wx.showTabBar({
      success: res => {
        console.log(res);
      },
      fail: res => {
        console.log(res)
      }
    })
    this.loadJQ().then(res => {
      let jqs = res.result ? res.result.data : [];
      jqs.map(jq => {
        jq.questionNum = jq.questions ? jq.questions.length : 0;
        jq.userNum = jq.jqSummarys ? jq.jqSummarys.length : 0;
      })
      _this.setData({ jqs: res.result ? res.result.data : [] })
    })
  },
  createJQ: function() {
    this.setData({
      showMask: true
    })
  },

  cancelCreate(e){
    // console.log(e)
    this.setData({
      showMask: false
    })
  },

  create(e) {
    let _this = this;
    wx.showLoading({
      title: '加载中'
    })
    let info = {
      name: this.data.jq,
      email: this.data.email,
      secEmail: this.data.secEmail || '',
      number: this.data.number || 0,
      list: this.data.list || []
    }
    if (!info.name || (info.name.trim() == '') || !info.email || (info.email.trim() == '') ) {
      wx.showToast({
        title: '请填写相关信息',
        icon: 'none'
      })
      return;
    }
    let stringfy = JSON.stringify(info);
    // console.log(stringfy)
    
    wx.navigateTo({
      url: '../config/index?stringJson=' + stringfy,
      success: res => {
        wx.hideLoading()
        _this.setData({showMask: false})
      }
    })
    
    
  },
  bindQName(e) {
    let value = e.detail.value;
    this.setData({jq: value})
  },
  goBack: function () {
    console.log("ques back")
    wx.navigateBack({
      delta: 1
    })
  },
  toJQ(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: '../createJQ/index?editing=0&jq=' + name + '&id=' + id,
    })
  },
  onShareAppMessage(e) {
    let jqid = e.target.dataset.jqid;
    let jqName = e.target.dataset.name;
    return {
      title: '分享调查问卷',
      path: '/pages/createJQ/index?jq=' + jqName + '&id=' + jqid,
      imageUrl: this.data.images.sharebg,
      success: res => {console.log(res)},
      fail: res => {console.log(res)}
    }
  },
  deletejq(e) {
    let _this = this;
    // console.log(e);
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定删除该问卷？',
      success: res => {
        if (res.confirm) {
          // console.log('用户点击确定');
          wx.cloud.callFunction({
            name: 'updateDoc',
            data: {
              removejq: true,
              jqid: id
            }
          }).then(res => {
            wx.cloud.callFunction({
              name: 'updateDoc',
              data: {
                deleteTimedtask: true,
                id: id
              }
            }).then(res => {
              console.log(res);
              wx.hideLoading();
              _this.onShow();
            })
            // console.log(res);
          }).catch(res => {
            console.log(res)
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
 
  },

  chooseFile() {
    let _this = this;
    console.log("choose file")
    wx.chooseMessageFile({
      count: 1,
      type: 'all',
      success(res) {
        console.log(res);
        wx.showLoading({
          title: '上传中',
        })
        const tempFilePath = res.tempFiles[0].path;
        FileSystemManager.readFile({
          filePath: tempFilePath,
          encoding: 'utf-8',
          success: res => { 
            
            // console.log(res);
            var dataArr = res.data.split("\n");
            var number = dataArr.length;
            let list = []
            for (let i = 0; i < number; i++) {
              if (i > 0) {
                list.push({
                  name: dataArr[i].split('\t')[0],
                  phone: dataArr[i].split('\t')[1].trim(),
                })
              }
            }
            console.log(list)
            _this.setData({ number: list.length, list: list});
            wx.hideLoading()
            wx.showToast({
              title: '上传成功'
            })
          },
          fail: res => {console.log(res)}
        });
      },
      fail: res => {
        console.log(res)
      }
    })
  },
  bindsecEmail(e) {
    this.setData({ secEmail: e.detail.value})
  },
  bindEmail(e) {
    this.setData({email: e.detail.value})
  },
  checkEx() {
    wx.navigateTo({
      url: '../ex/index',
    })
  },
  inputList() {
    this.setData({ inputList: true})
  },
  addName(e) {
    this.setData({addMemberName: e.detail.value})
  },
  addPhone(e) {
    this.setData({ addMemberPhone: e.detail.value })
  },

  addMember() {
    let count = this.data.count;
    let addMemberInfo = {
      name: (this.data.addMemberName && this.data.addMemberName.trim()) || '',
      phone: (this.data.addMemberPhone && this.data.addMemberPhone.trim()) || '',
    };
    let flag = true;
    Object.values(addMemberInfo).map(item => { if (item.trim() == '') { flag = false; } });
    if (!flag) {
      wx.showToast({
        title: '无效的信息！',
        icon: 'none'
      })
      return;
    }
    
    let list = this.data.list;
    addMemberInfo.id = count;
    count = count + 1;
    this.setData({count: count})
    list.push(addMemberInfo);
    this.setData({ list: list, addMemberName: '',addMemberPhone: ''});
    wx.showToast({
      title: `添加 ${addMemberInfo.name} 成功！`,
      icon: 'none'
    })
    console.log(this.data.list)
  },
  deleteMember(e) {
    let memberid = e.currentTarget.dataset.id;
    var list = this.data.list.filter(item => {return item.id != memberid});
    this.setData({list: list})
    wx.showToast({
      title: `删除成功！`,
      icon: 'none'
    })
  },
  complete() {
    let list = this.data.list;
    this.setData({ inputList: false, number: list.length});
  },
  cancelAdd() {
    this.setData({ inputList: false})
  }
})