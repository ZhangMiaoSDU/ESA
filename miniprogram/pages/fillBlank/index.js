const app = getApp();
const images = require('../../utils/images.js');
const db = wx.cloud.database();
const jqDB = db.collection("jq");
Page({

  data: {
    screenWidth: app.globalData.screenWidth,
    statusBarHeight: app.globalData.statusBarHeight,
    navigatorH: app.globalData.navigatorH,
    options: ['是', '否'],
    images: images,
    isModifiable: true,
  },

  onLoad: function (options) {
    console.log(options);
    let _this = this;
    let jqid = options.jqid;
    this.setData({ jqid: jqid });
    if (options.editing) {
      let questionInfo = JSON.parse(options.quesJson);
      this.setData({ editing: true, questionInfo: questionInfo, index: Number(options.index) });
      // 查询问卷
      jqDB.doc(jqid).get().then(res => {
        console.log(res);
        let jqInfo = res.data;
        let jqQuestions = jqInfo.questions || [];//该问卷的所有id
        let jqQuestionsName = jqInfo.questionsName || []; //该问卷的所有问题的信息
        console.log(jqQuestionsName);
        _this.setData({ jqQuestionsName: jqQuestionsName})
      });
      this.loadTemplate(questionInfo._id)
    }    
  },
  loadTemplate(qid){
    let _this = this;
    db.collection('jqtemplate').get().then(res => {
      console.log(res);
      let templates = res.data;
      let templatesQuestions = [];
      templates.map(item => {templatesQuestions = templatesQuestions.concat(item.questions)});
      if (templatesQuestions.indexOf(qid) != -1) {
        _this.setData({ isModifiable: false });
      }
      // _this.setData({ templatesQuestions: templatesQuestions});
      // console.log("loadTemplate -----------> templatesQuestions: ", templatesQuestions)
    })
  },

  addOption() {
    let options;
    if (this.data.editing) {
      let questionInfo = this.data.questionInfo;
      options = questionInfo.options;//该问题的原始选项；
      let initLen = options.length;
      options[initLen] = `选项${initLen + 1}`;
      console.log("options: ", options)
      questionInfo.options = options;
      this.setData({ questionInfo: questionInfo });
      return;
    }
    options = this.data.options;
    let initLen = options.length;
    options[initLen] = `选项${initLen + 1}`;
    console.log("options: ", options)
    this.setData({options: options})
  },
  deleteOption(e) {
    // console.log(e);
    let index = e.currentTarget.dataset.index;
    let options;
    if (this.data.editing) {
      let questionInfo = this.data.questionInfo;
      options = questionInfo.options;//该问题的原始选项；
      if (options.length == 1) {
        wx.showToast({
          title: '请至少保留一个选项',
          icon: 'none'
        });
        return;
      }
      console.log("delete: ", index, options);
      if (index == 0) { options = options.slice(1) }
      else { options = options.slice(0, index).concat(options.slice(index + 1)); }
      console.log("delete: ", options);
      questionInfo.options = options;
      this.setData({ questionInfo: questionInfo })
      console.log(this.data.questionInfo);
      return;
    }

    options = this.data.options;
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
    let options;
    if (this.data.editing) {
      let questionInfo = this.data.questionInfo;
      options = questionInfo.options;
      options[index] = value;
      // console.log(options)
      questionInfo.options = options
      this.setData({ questionInfo: questionInfo });
      return;
    }
    options = this.data.options;
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
  bindRatio(e) {
    let questionIsRequired = e.detail.value;
    this.setData({
      questionIsRequired: questionIsRequired == 'true' ? true : false
    })
  },

  bindPlaceholder(e) {
    let value = e.detail.value;
    this.setData({
      questionPlaceholder: value
    })
  },

  typeChange: function(e) {
    console.log(e);
    let value = Number(e.detail.value);
    this.setData({questionType: value});
  },
  bindChangeName(e) {
    let questionName = e.detail.value;
    let questionInfo = this.data.questionInfo;
    questionInfo.content = questionName
    this.setData({questionInfo: questionInfo})
  },
  
  bindChangePlaceholder(e) {
    let questionPlaceholder = e.detail.value;
    let questionInfo = this.data.questionInfo;
    questionInfo.placeholder = questionPlaceholder
    this.setData({ questionInfo: questionInfo })
  },

  radioChange(e) {
    console.log("radioChange --------> e: ", e);
    let value = e.detail.value;
    let questionInfo = this.data.questionInfo;
    questionInfo.isRequired = value == 'true' ? true : false;
    this.setData({ questionInfo: questionInfo })
  },

  confirm() {
    if (this.data.editing) {
      let questionInfo = this.data.questionInfo;
      if (questionInfo.content.trim() == '') {
        wx.showToast({
          title: '标题不能为空',
          icon: 'none'
        })
      }
      let modifyquestionInfo = {};
      modifyquestionInfo[questionInfo._id] = questionInfo;
      let index = this.data.index;
      let jqid = this.data.jqid;
      let originalquestionsName = this.data.jqQuestionsName;
      let modifyquestionsName;
      if (index == 0) {
        modifyquestionsName = [modifyquestionInfo].concat(originalquestionsName.slice(1));
      } else {
        modifyquestionsName = originalquestionsName.slice(0, index).concat([modifyquestionInfo]).concat(originalquestionsName.slice(index + 1));
      }
      console.log("confirm --------------> modifyquestionsName: ", modifyquestionsName);
      wx.cloud.callFunction({
        name: 'updateDoc',
        data: {
          modify: true,
          removeJQquestion: true,
          remainder: modifyquestionsName,
          id: jqid
        }
      }).then(res => {console.log(res); wx.navigateBack({
        delta: 1
      })})
      .catch(res => {console.log(res)})
      return;
    }
    let questionType = this.data.questionType;
    let questionName = this.data.questionName || '';
    let questionIsRequired = this.data.questionIsRequired ? true : false;
    let questionPlaceholder = this.data.questionPlaceholder;
    let options = this.data.options
    let _this = this;
    let questionInfo = questionType == 1 ? {
      content: questionName,
      type: questionType,
      placeholder: questionPlaceholder,
      isReqiured: questionIsRequired
    } : {
        content: questionName,
        type: questionType,
        options: options,
        placeholder: questionPlaceholder,
        isReqiured: questionIsRequired
      };
    console.log("confirm ----------> questionInfo: ", questionInfo)

    let flag = true;
    let required = {content: questionInfo.content, type: questionInfo.type};
    if (required.content.trim() == '' || (!required.type && required.type != 0)) {flag = false}
    if (!flag) {
      wx.showToast({
        title: '必须填写标题和选择题目类型！',
        icon: 'none'
      })
      return;
    }

    wx.showLoading({
      title: '添加中',
    })
    //1 保存该题目到数据库question;
    _this.addToQuestionDB(questionInfo).then(res => {
      console.log(res);
      let questionId = res.result._id;
      let jqid = _this.data.jqid;
      let qdict = {};
      qdict[questionId] = questionInfo;
      qdict[questionId]["_id"] = questionId
      console.log("qdict: ", qdict)
      //2 保存该题目到问卷的questions字段
      wx.cloud.callFunction({
        name: 'updateDoc',
        data: {
          updateJQquestion: true,
          id: jqid,
          questionId: questionId,
          qdict: qdict
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
  },
  
})