// pages/createJQ/index.js
/**
 * 有三种方式跳转至该界面：
 * （1）创建问卷，由config
 * （2）查看问卷，由ques
 * （3）填写问卷，由fillJQ
 */
const app = getApp();
const images = require('../../utils/images.js');
const db = wx.cloud.database();
const questionDB = db.collection('question');
const jqDB = db.collection('jq');
const userDB = db.collection('user');
const requiredQuestionId = [
  "50d28a07-bc53-420a-b715-4a43a68195e2", "a0a9b783-1201-4410-b358-88807a57c943", "e38c5ea9-05f4-41de-b41b-521a3ce2ef67",
  "032032b3-62d9-48d4-8589-e28ac7b29465", '22c88c33-ae9f-45ad-99a5-d90d9563f7fa', '72529d59-22a5-4fcc-8ea6-556ee62f7283',
  'c2997719-aeab-488f-8d3b-3c83a8f86578',
  '13ea9ed0-e029-4644-b98b-9d00177ef0d5',//本人是否有发热情况，是，否
  '4d58186c-48d2-4164-9a17-f27ad8d6f998',//
  '66e28d49-070e-433b-8bcb-64f521fb147e', //目前本人状况
  "96388225-6d99-4d4b-b0b4-04f8251a92e1",
  "79596ff4-dbf9-4651-95e8-779d65e7ec8e",
  'd373a160-02a6-4003-8dcb-5ba014d5a698',
  '5ed3af17-5551-4f35-8fb8-f09e8c058dc3',
  'c135e246-c78e-4d98-8974-796aa6c2b2ef',
  '94e0b507-b302-41a1-8f5b-bac6e833f92f'
];
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
    console.log(e)
    // wx.showLoading({
    //   title: '正在删除',
    // })
    let questionId = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    let originalquestionsName = this.data.jqQuestionsName;
    let remainderquestionsName;
    if (index == 0) {
      remainderquestionsName = originalquestionsName.slice(1,);
    } else {
      remainderquestionsName = originalquestionsName.slice(0, index).concat(originalquestionsName.slice(index+1,));
    }

    let jqid = this.data.jqid;
    let _this = this;
    // 1 jq 更新questions字段，删除该问题的id
    wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        removeJQquestion: true,
        id: jqid,
        questionId: questionId,
        remainder: remainderquestionsName
      }
    }).then(res => {
      console.log("res: ", res);
      _this.loadQuestion().then(res => {
        console.log(res);
        let questionsInfo = res;
        console.log("deleteQuestion =======> questionsInfo", questionsInfo)
        _this.setData({ questionsInfo: questionsInfo });
        // Promise.all(res).then(res => {
        //   console.log(res);
        //   wx.hideLoading();
        //   let questionsInfo = res.map(item => { return item.data });
        //   _this.setData({ questionsInfo: questionsInfo })
        // })
      });
    }).catch(res => {console.log(res)})
  },
  onLoad: function (options) {
    let _this = this;
    
    console.log(options)
    let jq = options.jq;
    this.setData({ title: jq, jqid: options.id});
    if (options.editing) { this.setData({ editing: true})}
    if (options.ques) {this.setData({ques: true})}
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
    this.loadQuestion().then(res => {
      console.log(res);
      let questionsInfo = res;
      console.log("onShow =======> questionsInfo", questionsInfo)
      _this.setData({ questionsInfo: questionsInfo });
      if (!this.data.editing) {
        userDB.doc(app.globalData.openid).get().then(res => {
          // console.log(res)
          var userInfo = res.data;
          (_this.data.jqInfo.questions || []).map(quesId => {
            // console.log(quesId)
            if (userInfo[quesId] || userInfo[quesId] == 0) {
              answerInfo[quesId] = userInfo[quesId];
            } else {
              answerInfo[quesId] = undefined;
            }
          })
          console.log(answerInfo)
          _this.setData({ answerInfo: answerInfo })
        })
      }
    })
    
    /*this.loadQuestion().then((tasks) => {
      console.log(tasks)
      Promise.all(tasks).then(res => {
        console.log(res); //该问卷的所有问题信息
        let questionsInfo = res.map(item => {return item.data});
        console.log("onShow =======> questionsInfo", questionsInfo)
        _this.setData({ questionsInfo: questionsInfo});
        //  
        if (!this.data.editing) {
          userDB.doc(app.globalData.openid).get().then(res => {
            // console.log(res)
            var userInfo = res.data;
            (_this.data.jqInfo.questions || []).map(quesId => {
              // console.log(quesId)
              if (userInfo[quesId] || userInfo[quesId] == 0) {
                answerInfo[quesId] = userInfo[quesId];
                // console.log(answerInfo)
                _this.setData({ answerInfo: answerInfo })
              }
            })
          })
        }
      })
    })*/
  },
  loadQuestion() {
    let _this = this;
    let jqid = this.data.jqid;
    // let jqid = "4278fc3a5e4b73f300479a495929ea48";
    return new Promise((resolve, reject) => {
      jqDB.doc(jqid).get().then(res => {
        console.log(res);
        let jqInfo = res.data;
        _this.setData({jqInfo:jqInfo, list: jqInfo.list || []})
        _this.setData({ creationTime: jqInfo.creationTime})
        let jqQuestions = res.data.questions || [];//该问卷的所有id
        let jqQuestionsName = res.data.questionsName || []; //该问卷的所有问题的信息
        console.log(jqQuestionsName);
        _this.setData({ jqQuestionsName: jqQuestionsName})
        // 根据id，查询
        let questionsInfo = jqQuestionsName.filter(item => {
          let _qid = Object.keys(item)[0];//问题的id
          if (jqQuestions.indexOf(_qid) != -1) {
            console.log("loadQuestion =======>  问卷中有该问题");
            return item;
          }
        }).map(item => {
          let _qid = Object.keys(item)[0];//问题的id
          return item[_qid]
        })
        console.log("loadQuestion =======>  questionsInfo: ", questionsInfo);
        resolve(questionsInfo);
        // let tasks = jqQuestions.map(item => { return questionDB.doc(item).get() });
        // resolve(tasks);
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
    if (this.data.ques) {
      console.log("check back");
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
    // 记录当前问卷所有的问题id
    let questionsId = this.data.jqInfo.questions || [];
    let questionId = e.currentTarget.dataset.id;
    if (questionsId.indexOf(questionId) != -1) {
      wx.showToast({
        title: '已存在该问题！',
        icon: 'none'
      })
      return;
    }
    let questionName = e.currentTarget.dataset.name;
    let questionInfo = e.currentTarget.dataset.item;
    delete questionInfo.isChecked;
    let qdict = {};
    
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '将该题目设为：',
      cancelText: '非必答',
      cancelColor: '#ea644a',
      confirmText: '必答',
      confirmColor: '#ea644a',
      success(res) {
        if (res.confirm) {
          console.log('用户点击必答');
          questionInfo.isRequired = true;
          qdict[questionId] = questionInfo;
          console.log("用户点击必答 ======> :", qdict);
        } else if (res.cancel) {
          console.log('用户点击非必答');
          questionInfo.isRequired = false;
          qdict[questionId] = questionInfo;
          console.log("用户点击非必答 ======> :", qdict);
        }

        wx.showLoading({
          title: '添加中',
        })
        wx.cloud.callFunction({
          name: 'updateDoc',
          data: {
            updateJQquestion: true,
            id: _this.data.jqid,
            questionId: questionId,
            qdict: qdict
          }
        }).then(res => {
          // console.log(res);
          wx.hideLoading();
          _this.setData({ showMask: false, searchQs: [] });
          _this.loadQuestion().then(res => {
            console.log(res);
            let questionsInfo = res;
            console.log("addtheQuestion =======> questionsInfo", questionsInfo)
            _this.setData({ questionsInfo: questionsInfo });
          })
        }).catch(res => {
          console.log(res)
        })
      }
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
          if (_this.data.ques) {
            wx.navigateBack({
              delta: 1
            });
            return;
          }
          wx.navigateBack({
            delta: 2
          })  
        }
      },
      fail: res => {console.log(res)}
    })
  },


  cancelAddFromDB() {
    console.log("cancelAddFromDB...")
    this.setData({ showMask: false})
  },
  cancelSearch() {
    console.log("cancelAddFromDB...")
    this.setData({ showMask: false })
  },

  bindAnswer(e) {
    let value = e.detail.value;
    let id = e.currentTarget.dataset.id;
    // console.log(e);
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
    
    let jqId = this.data.jqid;
    let jqSummarys = this.data.jqInfo.jqSummarys ? this.data.jqInfo.jqSummarys : [];
    let isExist = false;
    jqSummarys.map(item => {
      if (item.userid == userId) {
        isExist = true;
      }
    })
    console.log("是否存在该用户的答卷: ", isExist, answerInfo);
    let requiredQuestionsId = this.data.questionsInfo.filter(item => {return item.isRequired}).map(item => {return item._id});
    console.log("submit ========> requiredQuestionsId: ", requiredQuestionsId);
    let requiredAnswer = {};
    for (let key in answerInfo) {
      if (requiredQuestionsId.indexOf(key) != -1) {
        requiredAnswer[key] = answerInfo[key];
      }
    }
    console.log("submit =======> requiredAnswer: ", requiredAnswer)
    // return;
    let flag = true;
    Object.values(requiredAnswer).map(item => { 
      // console.log(item);
      if (typeof(item) != 'number') {
        if (!item || item.trim() == '') {
          console.log(item, false)
          flag = false;
        }
      }
    });
    if (!flag) {
      wx.showToast({
        title: '请填写全部必答信息！',
        icon: 'none'
      })
      return;
    }
    answerInfo.submitTime = new Date().getTime();
    let summary = {};
    // summary[userId] = answerInfo;
    summary[userId] = {};
    summary[userId][isoTime] = answerInfo;

    console.log("Summary: ", summary);
    wx.showLoading({
      title: '加载中',
    })
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
      wx.hideLoading();
      wx.showToast({
        title: '提交成功',
      })
      wx.navigateTo({
        url: '../tip/index',
      })
    }).catch(err => {
      console.log(err);
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      })
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
    addMemberInfo.id = new Date().getTime() + list.length;
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
  },
  modifyQuestion(e) {
    const item = e.currentTarget.dataset.item;
    console.log("modifyQuestion --------------> ", item);
    if (requiredQuestionId.indexOf(item._id) != -1) {
      wx.showModal({
        title: '提示',
        content: '该问题为监控问题，不允许修改！',
        showCancel: false
      });
      return;
    }
    const index = e.currentTarget.dataset.index;
    const jqid = this.data.jqid;
    wx.navigateTo({
      url: '../fillBlank/index?editing=0&jqid=' + this.data.jqid + '&quesJson=' + JSON.stringify(item) + '&index=' + index,
    })
    let originalquestionsName = this.data.jqQuestionsName;
    let remainderquestionsName;

    if (index == 0) {
      remainderquestionsName = originalquestionsName.slice(1);
    } else {
      remainderquestionsName = originalquestionsName.slice(0, index).concat(originalquestionsName.slice(index + 1));
      
    }
  }
})