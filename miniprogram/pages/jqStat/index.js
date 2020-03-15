// pages/jqStat/index.js
const app = getApp();
var wxCharts = require('../../utils/wxcharts.js');

// var chart = require('../../utils/chart.js')
const utils = require("../../utils/utils.js")
const db = wx.cloud.database();
const jqDB = db.collection('jq');
const questionDB = db.collection('question')
import * as echarts from '../../components/ec-canvas/echarts';
var columnChart = [];

function timestampToTime(timestamp) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`
}

Page({
  data: {
    tabs: ['详细数据', '统计结果'],
    currentIndex: 0,
    windowHeight: app.globalData.windowHeight,
    screenWidth: app.globalData.screenWidth,
    // vars: initChart(100)
    index: 0,//选择的下拉列表下标
  },

  onLoad: function (options) {
    console.log("pages/jqStat/index: ", options)
    let _this = this;
    if (options.share) {this.setData({share: true})}
    this.setData({ jqid: options.id });
    jqDB.doc(this.data.jqid).get().then(res => {
      console.log(res);
      let jqInfo = res.data;
      _this.setData({ jqInfo: jqInfo});
      _this.setData({ periods: jqInfo.periods})
      console.log('jqInfo \n', this.data.periods);
      let allAnswer = _this.formatSummary(jqInfo)
      _this.setData({ summary: allAnswer });
    })
  },

  // 点击下拉显示框
  selectTap() {
    this.setData({
      selectShow: !this.data.selectShow
    });
  },
  // 点击下拉列表
  optionTap(e) {
    let _this = this;
    let Index = e.currentTarget.dataset.index;//获取点击的下拉列表的下标
    this.setData({
      index: Index,
      selectShow: !this.data.selectShow
    });
    let allAnswer = _this.formatSummary(this.data.jqInfo)
    _this.setData({ summary: allAnswer });

  },

  cancelMask() {
    this.setData({ showMask: false });
  },

  loadQuestions(questions) {
    let tasks = (questions||[]).map(item => {return questionDB.doc(item).get()});
    return tasks;
  }, 

  formatSummary(jqInfo) {
    let questionDict = {};
    let allAnswer = [];
    let _this = this;
    let jqUser = jqInfo.jqUser || [];
    let sendEmailTime = jqInfo.remodeDetail;
    let jqQuestions = jqInfo.questions || [];//该问卷的所有id
    let jqQuestionsName = jqInfo.questionsName || []; //该问卷的所有问题的信息
    console.log(jqQuestionsName);
    _this.setData({ jqQuestionsName: jqQuestionsName })
    // 根据id，查询
    let questionsInfo = jqQuestionsName.filter(item => {
      let _qid = Object.keys(item)[0];//问题的id
      if (jqQuestions.indexOf(_qid) != -1) {
        console.log("downloadData =======>  问卷中有该问题");
        return item;
      }
    }).map(item => {
      let _qid = Object.keys(item)[0];//问题的id
      return item[_qid]
    })
    console.log("downloadData =======>  questionsInfo: ", questionsInfo);
    questionsInfo.map(item => {
      questionDict[item._id] = { content: item.content, type: item.type, options: item.options ? item.options : [], answers: [] }
    });
    var periods = this.data.periods;
    var dateindex = this.data.index
    let selectTime = periods[dateindex][0];
    console.log("selectTime: ", selectTime);
    if(jqInfo.type == 0) {
      selectTime = selectTime[1]
    }
    // let selectTimeISO = new Date(selectTime).toISOString().split('T')[0].split('-').join('/'); //格式："2020/02/16"
    console.log("selectTime: ", selectTime)
    jqUser.map(userId => {
      let userAnswer = jqInfo[userId][selectTime];
      console.log("user: ", userAnswer)
      if (userAnswer) {
        userAnswer['id'] = userId;
        userAnswer['time'] = utils.formatDate(userAnswer.submitTime);
        userAnswer['qa'] = [];
        let count = 0;
        for (let key in questionDict) {
          if (userAnswer[key] != undefined) {
            // console.log(questionDict[key])
            questionDict[key].answers.push(userAnswer[key]);
            let qc = questionDict[key].content;
            if (questionDict[key].type == 1) {
              userAnswer['qa'].push({ question: qc, answer: userAnswer[key] })
            } else {
              questionDict[key].index = count;
              count += 1
              var index = userAnswer[key];
              userAnswer['qa'].push({ question: qc, answer: questionDict[key].options[index] })
            }
          } else {
            userAnswer['qa'].push({ question: questionDict[key].content, answer: '(空)' });
            // console.log("KEY:", key, questionDict[key])
          }
        }
        // console.log("userAnswer: ", userAnswer)
        allAnswer.push(userAnswer)//当有答案时添加
      }

    })

    console.log("questionDict: ", questionDict)
    _this.setData({ questionDict: questionDict });
    allAnswer.sort((a, b) => b.submitTime - a.submitTime)
    return allAnswer;
  },
  viewChart(e) {
    let questionDict = this.data.questionDict;
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    questionDict[id].showChart = !questionDict[id].showChart;
    this.setData({ questionDict: questionDict})
    let label = e.currentTarget.dataset.label;
    let data = e.currentTarget.dataset.data;
    let length = label.length;
    var counted = data.reduce(function (alldata, data) {
      if (data in alldata) {
        alldata[data]++;
      }
      else {
        alldata[data] = 1;
      }
      return alldata;
    }, {});
    let fdata = []
    let flabel = []
    for (let n = 0; n < length; n++) {
      let c = counted[n] ? counted[n] : 0;
      fdata.push(c);
      flabel.push(n)
    }
    console.log(fdata)
    let name = `canvas${index}`;
    let _this = this;
    let a = {
      title: '',
      data: fdata,
      categories: flabel
    }
    console.log(a);

    columnChart[0] = new wxCharts({
      canvasId: name,
      type: 'column',
      animation: true,
      categories: a.categories,
      series: [{
        name: '',
        data: a.data,
      }],
      legend: false,
      yAxis: {
        format: function (val) {
          return '';
        },
        fontColor: '#fff',
        title: '',
        min: 0
      },
      xAxis: {
        disableGrid: false,
        type: 'calibration'
      },
      extra: {
        column: {
          width: 15
        }
      },
      width: _this.data.screenWidth,
      height: 180,
    });
  },

  viewTable(e) {
    let questionDict = this.data.questionDict;
    let id = e.currentTarget.dataset.id;
    let data = e.currentTarget.dataset.data;
    wx.navigateTo({
      url: '../detail/index?data=' + JSON.stringify(data),
    })
  },

  /**
   * tab
   */
  itemClick: function (e) {
    console.log(e);
    let index = e.currentTarget.dataset.index;
    this.setData({ currentIndex: index });
    console.log(this.data.currentIndex);
    let questionDict = this.data.questionDict;
    // for (let key in questionDict) {
    //   let index = questionDict[key].index || questionDict[key].index == 0 ? questionDict[key].index : -1
    //   if (index >= 0) {
    //     console.log(questionDict[key].index)
    //     let data = questionDict[key].answers, label = questionDict[key].options;
    //     let option = getOption(label, data);
    //     // console.log(option, chartLine)
    //     chartLine[index].setOption(option)
    //   }
    // }
  },

  showDetail(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({ userIndex: index, show: !this.data.show})
  },
  closeDetail() {
    this.setData({ userIndex: null, show: false })
  },
  onUnload() {
    if (this.data.share) {
      wx.redirectTo({
        url: '../index/index',
      })
    }
  }

})