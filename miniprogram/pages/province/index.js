// pages/province/index.js
const app = getApp()
const wxrequest = require('../../utils/request.js')
import * as echarts from '../../components/ec-canvas/echarts';
 
let chartLine;
let chartAddLine;
let chartLineA;
let chartAddLineA;
function getOption(xData, data_cur, title) {
  var option = {
    title: {
      text: title,
      left: 'center',
      bottom: '2%',
      textStyle: {
        color: "#fff",
        fontSize: 10
      }
    },
    backgroundColor: {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [{
        offset: 0, color: '#c86589' // 0% 处的颜色
      }, {
        offset: 1, color: '#06a7ff' // 100% 处的颜色
      }],
      global: false // 缺省为 false
    },
    grid: {
      top: '20',
      left: '10',
      right: '5',
      bottom: '15',
      containLabel: true,
    },
    color: ["#37A2DA"],
    legend: {
      data: ['A'],
      top: 50,
      left: 'center',
      z: 100
    },
    grid: {
      top: '20%',
      left: '5%',
      right: '5%',
      bottom: '15%',
      containLabel: true,
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    xAxis: {
      nameTextStyle: {
        fontSize: 5
      },
      splitNumber: 1,
      type: 'category',
      boundaryGap: false,
      data: xData || [],
      axisLabel: {
        margin: 5,
        color: 'rgba(255, 255, 255, .5)',
        fontSize: 5
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: true,
        length: 5,
        lineStyle: {
          color: 'rgba(255, 255, 255, .5)'
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(255, 255, 255, .5)'
        }
      },
      
    },
    yAxis: {
      type: 'value',
      position: 'right',
      axisLabel: {
        margin: 5,
        color: 'rgba(255, 255, 255, .5)',
        fontSize: 5
      },
  
      axisTick: {
        show: true,
        length: 5,
        lineStyle: {
          color: 'rgba(255, 255, 255, .5)',
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(255, 255, 255, .5)'
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, .5)',
          width: 2
        }
      }
      // show: false
    },
    series: [{
      name: '总数量',
      type: 'line',
      smooth: true,
      showAllSymbol: true,
      lineStyle: {
        normal: {
          color: "#fff", // 线条颜色
        },
      },
      label: {
        show: true,
        position: 'top',
        textStyle: {
          color: '#fff',
          fontSize: 5
        }
      },
      itemStyle: {
        color: "red",
        borderColor: "#fff",
        borderWidth: 3
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#eb64fb'
          },
          {
            offset: 1,
            color: '#3fbbff'
          }
          ], false),
        }
      },
      data: data_cur || []
      // [549, 730, 1058, 1423, 2714, 3554, 4903, 5806, 7153, 9074, 11177, 13522]
    }]

  };
  return option;
}

function getAOption(date, confirmedNCoV, curedNCoV, deadNCoV, suspectedNCoV, title) {
  var option = {
    backgroundColor: '#394056',
    title: {
      text: title,
      textStyle: {
        fontWeight: 'normal',
        fontSize: 10,
        color: '#ebffa1'
      },
      left: '2%'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        lineStyle: {
          color: '#57617B'
        }
      }
    },
    legend: {
      icon: 'rect',
      itemWidth: 14,
      itemHeight: 5,
      itemGap: 1,
      data: ['确诊', '治愈', '死亡', '疑似'],
      right: '2%',
      textStyle: {
        fontSize: 10,
        color: '#F1F1F3'
      }
    },
    grid: {
      left: '5%',
      right: '2%',
      bottom: '2%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      axisLabel: {
        fontSize: 5
      },
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#57617B'
        }
      },
      data: date
    }
    ],
    yAxis: [{
      type: 'value',
      position: 'right',
      axisLabel: {
        fontSize: 5
      },
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: '#57617B'
        }
      },
      axisLabel: {
        margin: 4,
        textStyle: {
          fontSize: 8
        }
      },
      splitLine: {
        lineStyle: {
          color: '#57617B'
        }
      }
    }],
    series: [{
      name: '确诊',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      showSymbol: true,
      lineStyle: {
        normal: {
          width: 1
        }
      },
      label: {
        show: true,
        position: 'top',
        textStyle: {
          color: '#fff',
          fontSize: 5
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(137, 189, 27, 0.3)'
          }, {
            offset: 0.8,
            color: 'rgba(137, 189, 27, 0)'
          }], false),
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10
        }
      },
      itemStyle: {
        normal: {
          color: '#f1a325',
          borderColor: 'rgba(137,189,2,0.27)',
          borderWidth: 12

        }
      },
      data: confirmedNCoV
    }, {
      name: '治愈',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      showSymbol: false,
      lineStyle: {
        normal: {
          width: 1
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(0, 136, 212, 0.3)'
          }, {
            offset: 0.8,
            color: 'rgba(0, 136, 212, 0)'
          }], false),
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10
        }
      },
      itemStyle: {
        normal: {
          color: '#38b03f',
          borderColor: 'rgba(0,136,212,0.2)',
          borderWidth: 10
        }
      },
      data: curedNCoV
    }, {
      name: '死亡',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      showSymbol: false,
      lineStyle: {
        normal: {
          width: 1
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(0, 136, 212, 0.3)'
          }, {
            offset: 0.8,
            color: 'rgba(0, 136, 212, 0)'
          }], false),
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10
        }
      },
      itemStyle: {
        normal: {
          color: '#ea644a',
          borderColor: 'rgba(0,136,212,0.2)',
          borderWidth: 12

        }
      },
      data: deadNCoV
    }
      , {
      name: '疑似',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      showSymbol: false,
      lineStyle: {
        normal: {
          width: 1
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(0, 136, 212, 0.3)'
          }, {
            offset: 0.8,
            color: 'rgba(0, 136, 212, 0)'
          }], false),
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10
        }
      },
      itemStyle: {
        normal: {
          color: '#03b8cf',
          borderColor: 'rgba(77,136,212,0.2)',
          borderWidth: 12

        }
      },
      data: suspectedNCoV
    }]
  };
  return option;
}

Page({
  data: {
    windowHeight: app.globalData.windowHeight,
    tabs: ['全国数据', '各省数据'],
    currentIndex: 0,
    region: '湖北省',
    selectShow: false,//控制下拉列表的显示隐藏，false隐藏、true显示
    selectData: ['15:10', '15:15', '15:20'],//下拉列表的数据
    index: 0,//选择的下拉列表下标
    ecline: {
      onInit: function (canvas, width, height) {
        //初始化echart元素，绑定到全局变量，方便更改数据
        chartLine = echarts.init(canvas, null, { width: width, height: height });
        canvas.setChart(chartLine);
      }
    },
    ecaddline: {
      onInit: function (canvas, width, height) {
        //初始化echart元素，绑定到全局变量，方便更改数据
        chartAddLine = echarts.init(canvas, null, { width: width, height: height });
        canvas.setChart(chartAddLine);
      }
    },
    eclineA: {
      onInit: function (canvas, width, height) {
        //初始化echart元素，绑定到全局变量，方便更改数据
        chartLineA = echarts.init(canvas, null, { width: width, height: height });
        canvas.setChart(chartLineA);
      }
    },
    ecaddlineA: {
      onInit: function (canvas, width, height) {
        //初始化echart元素，绑定到全局变量，方便更改数据
        chartAddLineA = echarts.init(canvas, null, { width: width, height: height });
        canvas.setChart(chartAddLineA);
      }
    },
    screenWidth: app.globalData.screenWidth
  },

  // 点击下拉显示框
  selectTap() {
    this.setData({
      selectShow: !this.data.selectShow
    });
  },
  // 点击下拉列表
  optionTap(e) {
    let Index = e.currentTarget.dataset.index;//获取点击的下拉列表的下标
    this.setData({
      index: Index,
      selectShow: !this.data.selectShow
    });
    this.initCoreData(this.data.provinces[Index])
    this.initChart(this.data.provinces[Index])
  },

  onLoad: function (options) {
    let _this = this;
    // 全国
    wxrequest.initCoreData().then(res => {
      // console.log(res);
      _this.setData({
        confirmA: res[0].confirmedCount,
        curedCountA: res[0].curedCount,
        deadCountA: res[0].deadCount
      })
    })
    _this.initAddChart();
    wxrequest.initChosen().then(res => {
      _this.setData({ provinces: res })
    })
    _this.initCoreData('湖北省');
    _this.initChart("湖北省");
  },

  initCoreData(province) {
    let _this = this;
    wx.showLoading({
      title: '加载中',
    })
    wxrequest.initCoreData(province).then(res => {
      console.log(res)
      wx.hideLoading();
      _this.setData({ cities: res[0].cities})
      var confirm = 0;
      var suspectedCount = 0;
      var curedCount = 0;
      var deadCount = 0;
      for (let i = 0; i < res.length; i++) {
        confirm += res[i].confirmedCount;
        suspectedCount += res[i].suspectedCount;
        curedCount += res[i].curedCount;
        deadCount += res[i].deadCount;
      }
      _this.setData({
        confirm: confirm,
        curedCount: curedCount,
        deadCount: deadCount
      })
    })
  },

  initChart(province) {
    wx.showLoading({
      title: '加载中',
    })
    let _this = this;
    wxrequest.initChart(province).then(res => {
      wx.hideLoading()
      let chartData = res;
      var dateTrend = [];
      var dateAdd = [];
      var confirm = [];
      var confirmAdd = [];
      var datalist = [];
      for (let i = 0; i < chartData.length; i++) {
        var dataTime = new Date(chartData[i].updateTime);
        var dateformat = String(dataTime.getDate()).length == 1 ? '0' + dataTime.getDate() : dataTime.getDate();
        // console.log("dateformat: ", dateformat)
        var showTime = [dataTime.getFullYear(), dataTime.getMonth() + 1, dateformat].join('/');
        if (dateTrend.includes(showTime)) {
          continue;
        }
        if (!datalist[showTime] || datalist[showTime] < chartData[i].confirmedCount) {
          datalist[showTime] = chartData[i].confirmedCount;
        }
      }
      //时间排序
      const dataListOrdered = {};
      Object.keys(datalist).sort().forEach(function (key) {
        dataListOrdered[key] = datalist[key];
      });
      console.log("dataListOrdered: ", dataListOrdered)
      //use data
      for (let i in dataListOrdered) {
        dateTrend.push(i)
        confirm.push(dataListOrdered[i])
        // console.log(confirm)
        var t = new Date(i);
        t.setDate(t.getDate() - 1);
        var yesterday = [t.getFullYear(), t.getMonth() + 1, t.getDate()].join('/');
        if (!dataListOrdered[yesterday]) {
          continue;
        }
        dateAdd.push(i)
        confirmAdd.push(dataListOrdered[i] - dataListOrdered[yesterday]);
      }

      _this.setData({
        dateTrend: dateTrend,
        dateconfirm: confirm,
        confirmAdd: confirmAdd,
        dateAdd: dateAdd,
        country: chartData[0].country,
        provinceShortName: chartData[0].provinceShortName
      })
      var title = "确诊总量(" + chartData[0].country + "-" + chartData[0].provinceShortName + ")";
      var option = getOption(dateTrend, confirm, title);
      chartLine.setOption(option);
      var title2 = "确诊增量(" + chartData[0].country + "-" + chartData[0].provinceShortName + ")";
      var option2 = getOption(dateAdd, confirmAdd, title2);
      chartAddLine.setOption(option2)
    })
  },

  initAddChart() {
    wx.showLoading({
      title: '加载中',
    })
    let _this = this;
    wxrequest.initChart().then(res => {
      wx.hideLoading();
      console.log(res)
      let chartData = res;
      let date = [];
      let dateA = [];

      let dataNCov1 = [];
      // init pre data
      dataNCov1['2020/1/24'] = { "confirm": 897, "suspect": 1076, "cure": 36, "dead": 26 };
      dataNCov1['2020/1/25'] = { "confirm": 1408, "suspect": 2032, "cure": 39, "dead": 42 };
      dataNCov1['2020/1/26'] = { "confirm": 2076, "suspect": 2692, "cure": 49, "dead": 56 };
      dataNCov1['2020/1/27'] = { "confirm": 2857, "suspect": 5794, "cure": 56, "dead": 82 };
      dataNCov1['2020/1/28'] = { "confirm": 4630, "suspect": 6973, "cure": 73, "dead": 106 };
      let confirmedNCoV = [];
      let confirmedNCoVA = [];
      let suspectedNCoV = [];
      let suspectedNCoVA = [];
      let curedNCoV = [];
      let curedNCoVA = [];
      let deadNCoV = [];
      let deadNCoVA = [];

      for (let i in chartData) {
        var dataTime = new Date(chartData[i].updateTime);
        var dateformat = String(dataTime.getDate()).length == 1 ? '0' + dataTime.getDate() : dataTime.getDate();
        // console.log("dateformat: ", dateformat)
        var showTime = [dataTime.getFullYear(), dataTime.getMonth() + 1, dateformat].join('/');
        var confirmedCount = chartData[i].confirmedCount ? chartData[i].confirmedCount : chartData[i].confirmed;
        var suspectedCount = chartData[i].suspectedCount ? chartData[i].suspectedCount : chartData[i].suspectedCount;
        var curedCount = chartData[i].curedCount ? chartData[i].curedCount : chartData[i].curedCount;
        var deadCount = chartData[i].deadCount ? chartData[i].deadCount : chartData[i].deadCount;

        if (!dataNCov1[showTime] || dataNCov1[showTime]['confirm'] < confirmedCount) {
          dataNCov1[showTime] = [];
          dataNCov1[showTime]['confirm'] = confirmedCount;
          dataNCov1[showTime]['suspect'] = suspectedCount;
          dataNCov1[showTime]['cure'] = curedCount;
          dataNCov1[showTime]['dead'] = deadCount;
        }
      }
      //时间排序
      const dataNCoVOrdered = {};
      Object.keys(dataNCov1).sort().forEach(function (key) {
        // console.log("key: ", key)
        dataNCoVOrdered[key] = dataNCov1[key];
      });

      // use data
      for (let i in dataNCoVOrdered) {
        // console.log("i: ", i)
        date.push(i)
        confirmedNCoV.push(dataNCoVOrdered[i]['confirm']);
        suspectedNCoV.push(dataNCoVOrdered[i]['suspect']);
        curedNCoV.push(dataNCoVOrdered[i]['cure']);
        deadNCoV.push(dataNCoVOrdered[i]['dead']);

        var t = new Date(i);
        t.setDate(t.getDate() - 1);
        // var dataTime = new Date(chartData[i].updateTime);
        var yesterday = [t.getFullYear(), t.getMonth() + 1, t.getDate()].join('/');
        if (!dataNCoVOrdered[yesterday]) {
          continue;
        }
        // confitmedNCovA
        dateA.push(i);
        confirmedNCoVA.push(dataNCoVOrdered[i]['confirm'] - dataNCoVOrdered[yesterday]['confirm']);
        suspectedNCoVA.push(dataNCoVOrdered[i]['suspect'] - dataNCoVOrdered[yesterday]['suspect']);
        curedNCoVA.push(dataNCoVOrdered[i]['cure'] - dataNCoVOrdered[yesterday]['cure']);
        deadNCoVA.push(dataNCoVOrdered[i]['dead'] - dataNCoVOrdered[yesterday]['dead']);

      }
      var title0 = "全国NCoV总数量";
      console.log("date: ", date)
      console.log("confirmedNCov: ", confirmedNCoV)
      var option0 = getAOption(date, confirmedNCoV, curedNCoV, deadNCoV, suspectedNCoV, title0);
      chartLineA.setOption(option0)

      var title = "全国NCoV新增量";
      var option = getAOption(dateA, confirmedNCoVA, curedNCoVA, deadNCoVA, suspectedNCoVA,title);
      chartAddLineA.setOption(option)
    })
  },


  /**
   * tab
   */
  itemClick: function(e) {
    console.log(e);
    let index = e.currentTarget.dataset.index;
    this.setData({currentIndex: index})
    if (index == 0) {
      this.initAddChart();
    } else {
      this.initChart('湖北省')
    }
  }
})