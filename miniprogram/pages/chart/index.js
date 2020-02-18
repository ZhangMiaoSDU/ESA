// pages/chart/index.js

import * as echarts from '../../components/ec-canvas/echarts';
let chartLine;
function getOption(xlabel, data) {
  let options = {
    xAxis: {
      data: xlabel,
      axisTick: { show: false },
      axisLabel: {}
    },
    yAxis: {
      splitLine: { show: false }
    },
    series: [{
      type: 'bar',
      itemStyle: {
        normal: {}
      },
      slient: true,
      barWidth: 40,
      data: data
    }]
  };
  return options;
}

Page({

  data: {
    ecline: {
      onInit: function (canvas, width, height) {
        //初始化echart元素，绑定到全局变量，方便更改数据
        chartLine = echarts.init(canvas, null, { width: width, height: height });
        console.log("cha: ",chartLine)
        canvas.setChart(chartLine);
      }
    },
  },

  onLoad: function (options) {
    console.log(options)
    let label = JSON.parse(options.label);
    let data = JSON.parse(options.data);
    console.log(data, label)
    this.setData({data: data, label: label})
  },

  onReady() {
    let option = getOption(this.data.label, this.data.data);
    console.log(chartLine)
    chartLine.setOption(option)
  }
  
})