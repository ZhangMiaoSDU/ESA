const app = getApp();
const images = require('../../utils/images.js')
Page({

  data: {
    screenWidth: app.globalData.screenWidth,
    statusBarHeight: app.globalData.statusBarHeight,
    navigatorH: app.globalData.navigatorH,
    options: ['是', '否'],
    images: images
  },

  onLoad: function (options) {
    console.log(options);
    let jqid = options.jqid;
    this.setData({jqid: jqid})
  },

  addOption() {
    let options = this.data.options;
    let initLen = options.length;
    options[initLen] = `选项${initLen + 1}`;
    console.log("options: ", options)
    this.setData({options: options})
  },
  deleteOption(e) {
    // console.log(e);
    let index = e.currentTarget.dataset.index;
    let options = this.data.options;
    if (options.length == 1) {
      wx.showToast({
        title: '请至少保留一个选项',
        icon: 'none'
      });
      return;
    }
    console.log("delete: ", index, options)
    if (index == 0) {options = options.slice(1,)}
    else { options = options.slice(0, index).concat(options.slice(index + 1));}
    console.log("delete: ", options)
    this.setData({options: options})
    console.log(this.data.options)
  },

  bindOption(e) {
    let index = e.currentTarget.dataset.index;
    let value = e.detail.value;
    let options = this.data.options;
    options[index] = value;
    console.log(options)
    this.setData({options: options})
  },

  goBack: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  bindQName(e){
    let questionName = e.detail.value;
    this.setData({
      questionName: questionName
    })
  },
  typeChange: function(e) {
    console.log(e);
    let value = Number(e.detail.value);
    this.setData({questionType: value});
  },
  confirm() {
    let questionType = this.data.questionType;
    let questionName = this.data.questionName;
    let options = this.data.options
    let _this = this;
    let questionInfo = questionType == 1 ? {
      content: questionName,
      type: questionType
    } : {
        content: questionName,
        type: questionType,
        options: options
      };
    wx.showLoading({
      title: '添加中',
    })
    //1 保存该题目到数据库question;
    _this.addToQuestionDB(questionInfo).then(res => {
      console.log(res);
      let questionId = res.result._id;
      let jqid = _this.data.jqid;
      //2 保存该题目到问卷的questions字段
      wx.cloud.callFunction({
        name: 'updateDoc',
        data: {
          updateJQquestion: true,
          id: jqid,
          questionId: questionId
        }
      }).then(res => {
        //添加成功
        wx.hideLoading();
        console.log(res);
        wx.navigateBack({delta: 1})
      }).catch(res => {
        console.log(res)
      })
    })
  },

  addToQuestionDB(questionInfo) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: "addDoc",
        data: {
          addquestion: true,
          data: questionInfo
        }
      }).then(res => {
        resolve(res)
      }).catch(err => {reject(err)})
    })
  }
})