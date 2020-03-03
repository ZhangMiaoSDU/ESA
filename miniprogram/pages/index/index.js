//index.js
const app = getApp()
const wxrequest = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
import geoJson from './mapData.js';
import chinaJson from './china.js';
import * as echarts from '../../components/ec-canvas/echarts';
const db = wx.cloud.database();
const userDB = db.collection('user');
let chartGeo;

function getGeoOption(data, max) {
  // console.log("data: ", data)
  var option = {
    visualMap: {
      type: 'piecewise',
      min: 0,
      max: max,
      pieces: [
        {gte: 1, lte: 9},
        {gte: 10, lte: 99},
        {gte: 100, lte: 499},
        {gte: 500, lte: 999},
        {gte: 1000, lte: 9999},
        {gte: 10000}
      ],
      
      inRange: {
         // 地图不同省份填充的颜色
        color: [
          'rgb(252,222,211)', 'rgb(255,177,146)',
          'rgb(255,130,85)', 'rgb(255, 65, 27)', 'rgb(137,40,13)', 'rgb(82,3,15)'
        ]
      },
      itemWidth: 15,
      itemHeight: 10,
      textStyle: {
        fontSize: 10
      },
      calculable: false
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'map',
      mapType: 'china',
      label: {
        show: true,
        fontSize: 5,
        color: '#000',
      },
      itemStyle: {
        borderColor: "rgb(224, 149, 103)"
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 5,
          color: '#000',

        }
      },
      animation: false,
      data: data
      }],

  };
  return option;
}

Page({
  data: {
    ecgeo: {
      onInit: function (canvas, width, height) {
        //初始化echart元素，绑定到全局变量，方便更改数据
        chartGeo = echarts.init(canvas, null, { width: width, height: height });
        console.log(chartGeo)
        canvas.setChart(chartGeo);
        echarts.registerMap('china', chinaJson);
      }
    },
    screenWidth: app.globalData.screenWidth,
    windowHeight: app.globalData.windowHeight,
    screenHeight: app.globalData.screenHeight
  },

  onLoad: function (options) {
    let _this = this;
    wx.hideHomeButton();
    wx.showLoading({
      title: '加载中',
    })
   
    this.initData();
    wx.cloud.callFunction({
      name: 'wxrequest',
      data: { initCoreData: true }
    })
    // wxrequest.initCoreData()
    .then(res => {
      res = res.result;
      console.log(res);
      wx.hideLoading();
      _this.setData({
        confirm: res[0].confirmedCount,
        curedCount: res[0].curedCount,
        deadCount: res[0].deadCount
      })
    }) 
    
  },
 
  initData() {
    let _this = this;
    wx.cloud.callFunction({
      name: 'wxrequest',
      data: { initData: true }
    }).then(res => { 
      // console.log(res)
    // })
    // wxrequest.initData().then(res => {
      // console.log(res);
      let areaData = res.result;
      let confirmedN = [];
      let max = 0;
      console.log(areaData[0].updateTime)
      _this.setData({ updateTime: utils.formatDate(areaData[0].updateTime) })
      for (let i in areaData) {
        if (areaData[i].country == "中国") {
          confirmedN.push({
            name: areaData[i].provinceShortName,
            value: areaData[i].confirmedCount
          })
          if (areaData[i].confirmedCount > max) {
            max = areaData[i].confirmedCount;
          }
        }
      }
      // console.log("confirmedN: ", confirmedN)
      var option = getGeoOption(confirmedN, max);
      chartGeo.setOption(option);
    })
  },

  wechatLog: function (e) {
    console.log(app.globalData.openid)
    if (!app.globalData.openid) {
      return;
    }
    userDB.doc(app.globalData.openid).get().then(res => {
      console.log(res.data)
      //修改登录状态
      app.globalData.login = true
      if (res.data.isregister) { app.globalData.isregister = true}
      console.log("修改登录状态")
      //跳转至我的界面
      wx.switchTab({
        url: '../home/index',
      });
    }).catch(res => {
      console.log(res)
      let userData = JSON.parse(e.detail.rawData);
      console.log(userData);
      let userInfo = {
        name: userData.nickName,
        phone: "",
        mail: "",
        userHeader: userData.avatarUrl
      };
      wx.cloud.callFunction({
        name: "addDoc",
        data: {
          addUser: true,
          userId: app.globalData.openid,
          data: userInfo
        },
        success: res => {
          console.log("信息保存成功");
          //修改登录状态
          app.globalData.login = true
          console.log("修改登录状态")
          //跳转至我的界面
          wx.switchTab({
            url: '../home/index',
          });
        },
        fail: res => {
          console.log(res)
        }
      })
    })
  },


})
