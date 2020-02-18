// pages/createJQ/index.js
const app = getApp();
const images = require('../../utils/images.js');
const db = wx.cloud.database();
const questionDB = db.collection('question');
const jqDB = db.collection('jq');
const userDB = db.collection('user');
function timestampToTime(timestamp) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}/${date.getDate()}`
}
Page({
  data: {
    screenWidth: app.globalData.screenWidth,
    statusBarHeight: app.globalData.statusBarHeight,
    navigatorH: app.globalData.navigatorH,
    screenHeight: app.globalData.screenHeight,
    images: images,
    showMask: false,
    answerInfo: {},
    currentIndex: 0,
    list: [],
    count: 0
  },
  focusIndex(e) {
    let index = e.currentTarget.dataset.index;
    console.log("currentIndex: ", index);
    this.setData({currentIndex: index})
  },
  deleteQuestion(e) {
    wx.showLoading({
      title: '正在删除',
    })
    let questionId = e.currentTarget.dataset.id;
    let jqid = this.data.jqid;
    let _this = this;
    // 1 jq 更新questions字段，删除该问题的id
    wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        removeJQquestion: true,
        id: jqid,
        questionId: questionId
      }
    }).then(res => {
      console.log("res: ", res);
      _this.loadQuestion().then(res => {
        Promise.all(res).then(res => {
          console.log(res);
          wx.hideLoading();
          let questionsInfo = res.map(item => { return item.data });
          _this.setData({ questionsInfo: questionsInfo })
        })
      });
    }).catch(res => {console.log(res)})
  },
  onLoad: function (options) {
    let _this = this;
    
    console.log(options)
    let jq = options.jq;
    this.setData({ title: jq, jqid: options.id});
    if (options.editing) { this.setData({ editing: true})}
    wx.cloud.callFunction({ name: 'queryDB', data: { _DBName: 'question' } })
    .then(res => {
      // console.log(res.result.data); 
      let questions = res.result.data
      _this.setData({ questions: questions});
      // 用户填写模式
      let questionsId = questions.map(item => {return item._id})
    });
    
  },
  onShow() {
    let _this = this;
    let answerInfo = this.data.answerInfo
    this.loadQuestion().then((tasks) => {
      // console.log(tasks)
      Promise.all(tasks).then(res => {
        console.log(res); //该问卷的所有问题信息
        let questionsInfo = res.map(item => {return item.data});
        _this.setData({ questionsInfo: questionsInfo});
        // 
        if (!this.data.editing) {
          userDB.doc(app.globalData.openid).get().then(res => {
            // console.log(res)
            var userInfo = res.data;
            (_this.data.jqInfo.questions || []).map(quesId => {
              // console.log(quesId)
              if (userInfo[quesId]) {
                answerInfo[quesId] = userInfo[quesId];
                // console.log(answerInfo)
                _this.setData({ answerInfo: answerInfo })
              }
            })
          })
        }
      })
    })
  },
  loadQuestion() {
    let _this = this;
    return new Promise((resolve, reject) => {
      
      jqDB.doc(this.data.jqid).get().then(res => {
        console.log(res);
        let jqInfo = res.data;
        _this.setData({jqInfo:jqInfo, list: jqInfo.list || []})
        _this.setData({ creationTime: jqInfo.creationTime})
        let jqQuestions = res.data.questions || [];
  
        let tasks = jqQuestions.map(item => { return questionDB.doc(item).get() });
        resolve(tasks);
      }).catch(res => {reject(res)})
    })
  },
  addQuestionMethod: function() {
    let _this = this
    wx.showActionSheet({
      itemList: ['选择问卷模版', '从题库添加', '自定义题目'],
      success: res => {
        console.log(res);
        if (res.tapIndex == 0) {
          console.log('点击模版');
          wx.navigateTo({
            url: '../temp/index?jqid=' + _this.data.jqid,
          })
        } else if (res.tapIndex == 1) {
          _this.setData({ showMask: true})
        } else if (res.tapIndex == 2) {
          wx.navigateTo({
            url: '../fillBlank/index?jqid=' + _this.data.jqid,
          })
        }
      },
      fail: res => {

      }
    })
  },
  goBack: function() {
    if (!this.data.editing) {
      console.log('fill back')
      wx.navigateBack({
        delta: 1
      });
      return;
    }
    console.log("create back")
    wx.navigateBack({
      delta: 2
    });
  },
  bindQ(e) {
    let value = e.detail.value;
    this.setData({questionContent: value});
    var regStr = `.*${value}`
    var reg = RegExp(`${regStr}`);
    let questions = this.data.questions;
    // console.log(questions)
    let res = questions.filter(item => {
      let content = item.content;
      item.isChecked = false;
      if (reg.test(content)) {
        return item
      }
    });
    if (value.length > 0) {
      this.setData({ searchQs: res })
    } else {
      this.setData({ searchQs: [] })
    }
  },
  changeStatus(e){
    // console.log(e);
    let status = e.currentTarget.dataset.check;
    let id = e.currentTarget.dataset.id;
    let searchQs = this.data.searchQs;
    searchQs.map(item => {
      if(item._id == id) {
        item.isChecked = !status;
      }
    })
    this.setData({ searchQs: searchQs})
  },
  addtheQuestion(e) {
    let questionId = e.currentTarget.dataset.id;
    // console.log(e)
    // console.log(this.data.jqid)
    let _this = this;
    wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        updateJQquestion: true,
        id: _this.data.jqid,
        questionId: questionId
      }
    }).then(res => {
      // console.log(res);
      _this.setData({ showMask: false, searchQs: []});
      _this.loadQuestion().then(res => {
        Promise.all(res).then(res => {
          console.log(res);
          let questionsInfo = res.map(item => { return item.data });
          _this.setData({ questionsInfo: questionsInfo })
        })
      })
    }).catch(res => {
      console.log(res)
    })
  },

  saveJQ() {
    let _this = this;
    this.setData({isClick: true})
    wx.showModal({
      title: '提示(复制分享给需要填写该调查的好友)',
      content: `该问卷的ID为${_this.data.creationTime}`,
      confirmText: '点击复制',
      showCancel: false,
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          wx.setClipboardData({
            data: String(_this.data.creationTime),
            success: res => {console.log(res)},
            fail: res => {console.log(res)}
          });
          wx.navigateBack({
            delta: 2
          })  
        }
      },
      fail: res => {console.log(res)}
    })
  },
  onUnload() {
    let _this = this;
    if (this.data.isClick) {return;}
    console.log("onunload");
    if (this.data.editing) {
      wx.showModal({
        title: '提示\n(复制分享给需要填写该调查的好友)',
        content: `该问卷的ID为${_this.data.creationTime}`,
        confirmText: '点击复制',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定');
            wx.setClipboardData({
              data: String(_this.data.creationTime),
              success: res => { console.log(res) },
              fail: res => { console.log(res) }
            });
          }
        },
        fail: res => { console.log(res) }
      })
    }
  },

  

  cancelAdd() {
    this.setData({ showMask: false})
  },

  bindAnswer(e) {
    let value = e.detail.value;
    let id = e.currentTarget.dataset.id;
    console.log(e);
    let answerInfo = this.data.answerInfo;
    answerInfo[id] = value;
    this.setData({ answerInfo: answerInfo})
  },
  bindAnswerS(e) {
    console.log(e);
    let answerInfo = this.data.answerInfo;
    let id = e.currentTarget.dataset.id
    let checkedValue = e.detail.value;
    answerInfo[id] = Number(checkedValue);
    console.log(answerInfo)
    this.setData({ answerInfo: answerInfo })
  },


  submitJQ() {
    let sendEmailTime = this.data.jqInfo.remodeDetail; //记录邮件的发送时间
    let csTime = [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()].join('/') 
      + ' ' + sendEmailTime[0] + ":" + sendEmailTime[1];
    let isoTime = new Date(csTime).toISOString().split('T')[0].split('-').join('/'); //格式："2020/02/16"
    let userId = app.globalData.openid;
    let answerInfo = this.data.answerInfo;
    answerInfo.submitTime = new Date().getTime();
    let jqId = this.data.jqid;
    let jqSummarys = this.data.jqInfo.jqSummarys ? this.data.jqInfo.jqSummarys : [];
    let isExist = false;
    jqSummarys.map(item => {
      if (item.userid == userId) {
        isExist = true;
      }
    })
    console.log("是否存在该用户的答卷: ", isExist);
    let summary = {};
    // summary[userId] = answerInfo;
    summary[userId] = {};
    summary[userId][isoTime] = answerInfo
    console.log("Summary: ", summary)
    let tasks = [];
    // 1 jq 保存提交问卷的用户id
    tasks.push(wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        addjqUser: true,
        id: jqId,
        userId: userId
      }
    }))
    let currentDay = timestampToTime(new Date().getTime());
    var usersId;
    if (this.data.jqInfo[currentDay]) {
      console.log("存在字段");
      usersId = new Set(this.data.jqInfo[currentDay]);
      usersId.add(app.globalData.openid);
    } else {
      usersId = new Set([app.globalData.openid]);
    }
    tasks.push(wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        updateRecord: true,
        id: jqId,
        date: currentDay,
        usersId: Array.from(usersId)
      }
    }))
    // 2 jq 保存用户的问卷答案
    tasks.push(wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        updateJQSummary: true,
        id: jqId,
        summary: summary,
      }
    }))
    // 3 user 更新最新答案
    tasks.push(wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        updateAnswers: true,
        id: userId,
        answers: answerInfo
      }
    }))
    // 4 user 添加填写问卷的id
    tasks.push(wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        updateJQs: true,
        id: userId,
        jqid: jqId
      }
    }))
    Promise.all(tasks).then(res => {
      console.log(res);
      wx.navigateTo({
        url: '../tip/index',
      })
    }).catch(err => {
      console.log(err)
    })
  },
  changeName(){
    this.setData({ changeName: true })
  },
  bindJQName(e) {
    this.setData({_jqName: e.detail.value});
  },
  confirm() {
    let _this = this;
    let jqid = this.data.jqid;
    let name = this.data._jqName || '';
    if (name == '' || name.trim() == '') {
      this.setData({ changeName: false })
      return;
    }
    wx.showLoading({
      title: '加载中',
    })
    
    wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        updateJQName: true,
        id: jqid,
        name: name
      }
    }).then(res => {
      console.log(res);
      wx.hideLoading();
      _this.setData({ title: name, changeName: false})
    }).catch(res => {console.log(res)})
  },
  cancelChangeName() {
    this.setData({ changeName: false })
  },

  inputList() {
    this.setData({ inputList: true })
  },
  addName(e) {
    this.setData({ addMemberName: e.detail.value })
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
    this.setData({ count: count })
    list.push(addMemberInfo);
    this.setData({ list: list, addMemberName: '', addMemberPhone: '' });
    wx.showToast({
      title: `添加 ${addMemberInfo.name} 成功！`,
      icon: 'none'
    })
    console.log(this.data.list)
  },
  deleteMember(e) {
    let memberid = e.currentTarget.dataset.id;
    var list = this.data.list.filter(item => { return item.id != memberid });
    this.setData({ list: list })
    wx.showToast({
      title: `删除成功！`,
      icon: 'none'
    })
  },

  complete() {
    let list = this.data.list;
    let jqid = this.data.jqid;
    console.log(list);
    this.setData({ inputList: false, number: list.length });
    wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        updateList: true,
        jqid: jqid,
        list: list
      }
    }).then(res => {
      console.log(res)
    }).catch(res => {console.log(res)})
  },
  cancelAdd() {
    this.setData({ inputList: false })
  }
})