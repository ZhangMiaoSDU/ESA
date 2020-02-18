// pages/regi/index.js
const app = getApp()
const utils = require('../../utils/utils.js')
const images = require('../../utils/images.js')
const db = wx.cloud.database();
const baidutokenDB = db.collection('baidutoken');
const userDB = db.collection('user')
Page({
  data: {
    baiduToken: null,
    windowHeight: app.globalData.windowHeight,
    screenWidth: app.globalData.screenWidth,
    images: images,
    sameLocation: true
  },

  onLoad: function (options) {
    let _this = this;
    baidutokenDB.doc("eef7e2ce-f1a8-4831-96f9-404f64f1d615").get().then(res => {
      console.log(res)
      let tokenInfo = res.data;
      let expiretime = tokenInfo.expiretime;
      let baiduToken = tokenInfo.access_token
      console.log("baiduToken: ", baiduToken)
      if (expiretime < new Date().getTime()) {
        console.log("过期");
        utils.getBaiduToken().then(res => {
          console.log(res);
          _this.setData({ baiduToken: baiduToken })
          wx.cloud.callFunction({
            name: "addDoc",
            data: {
              addBaiduToken: true,
              access_token: res.access_token,
              time: new Date().getTime()
            },
            success: res => {
              console.log("信息保存成功");
            },
            fail: res => {
              console.log(res)
            }
          })
        })
      } else {
        console.log("有效");
        _this.setData({ baiduToken: baiduToken})
      }
    })
  },

  doClick() {
    let _this = this;
    _this.getImage().then(res => {
      var filePath = res.tempFilePaths[0];
      console.log("【获取图片地址】", filePath)
      wx.getFileSystemManager().readFile({
        filePath: filePath,
        encoding: "base64",
        success: res => {
          console.log("【读取图片数据pass】", res.data)

          //扫描图片物品
          _this.scanImageInfo(res.data).then(res => {
            console.log("扫描图片物品", res)
            _this.setData({
              scanItems: res.data.words_result
            })

            if (_this.data.scanItems) {
              _this.setData({
                isHiddenScanModal: false,
                name: _this.data.scanItems['姓名'].words,
                sex: _this.data.scanItems['性别'].words,
                nation: _this.data.scanItems['民族'].words,
                idcardLocation: _this.data.scanItems['住址'].words,
                idNo: _this.data.scanItems['公民身份号码'].words,
                brith: _this.data.scanItems['出生'].words
              })

            } else {
              wx.showToast({
                title: '很遗憾没有识别到物品哦！！',
                icon: 'none',
                duration: 2000,
                mask: true
              })
            }
          })
        },
        fail: res => {
          console.log("【读取图片数据fail】", res)
          wx.showToast({
            title: '读取图片数据fail',
            icon: 'none',
            duration: 2000,
            mask: true
          })
        }
      })
    })
  },

  //获取本地图片
  getImage: function () {
    var that = this;
    // 选择图片
    return new Promise(function (resolve, reject) {
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: resolve,
        fail: reject
      })

    })
  },

  //扫描图片中的数据
  scanImageInfo: function (imageData) {
    var that = this;
    const detectUrl = `https://aip.baidubce.com/rest/2.0/ocr/v1/idcard?access_token=${that.data.baiduToken}`;
    //显示加载界面
    wx.showLoading({
      title: '识别中',
    });
    return new Promise(function (resolve, reject) {
      wx.request({
        url: detectUrl,
        data: {
          image: imageData,
          id_card_side: 'front'
        },
        method: 'POST',
        dataType: "json",
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: res => {
          console.log(res)
          resolve(res)
        },
        fail: res => {
          console.log(res);
          reject(res)
        },
        complete: res => {
          //隐藏加载界面
          wx.hideLoading()
        }
      })
    })
  },
  bindName: function(e) {
    console.log(e);
    let value = e.detail.value;
    this.setData({name: value});
  },
  bindSex(e) {
    let value = e.detail.value;
    this.setData({ sex: value });
  },
  bindNation(e) {
    let value = e.detail.value;
    this.setData({ nation: value });
  },
  bindBirth(e) {
    let value = e.detail.value;
    var reg1 = /^\d{8,8}$/;
    if (reg1.test(value)) {
      this.setData({ brith: value });
    } else {
      wx.showToast({
        title: '格式不正确',
        icon: 'none',
        duration: 500
      })
      this.setData({ brith: undefined });
    }
  },
  bindQQ(e) {
    let value = e.detail.value;
    this.setData({ QQ: value, email: value + '@qq.com' });
  },
  bindP(e) {
    let value = e.detail.value;
    var reg1 = /^\d{11,11}$/;
    if (reg1.test(value)) {
      this.setData({ phone: value });
    } else {
      wx.showToast({
        title: '格式不正确',
        icon: 'none'
      })
      this.setData({ phone: undefined });
    }
  },

  clickConfirm() {
    let info = {
      name: (this.data.name && this.data.name.trim()) || '',
      sex: (this.data.sex && this.data.sex .trim()) || '',
      nation: (this.data.nation && this.data.nation.trim()) || '',
      brith: (this.data.brith && this.data.brith.trim()) || '',
      QQ: (this.data.QQ && this.data.QQ.trim()) || '',
      phone: (this.data.phone && this.data.phone.trim()) || '',
      idNo: (this.data.idNo && this.data.idNo.trim()) || '',
      idcardLocation: (this.data.idcardLocation && this.data.idcardLocation.trim()) || '',
      currentLocation: (this.data.currentLocation && this.data.currentLocation.trim()) || '',
    };
    console.log(info);
    let flag = true;
    Object.values(info).map(item => { if (item.trim() == '') { flag = false; } });
    // console.log(flag)
    // return;
    if (!flag) {
      wx.showToast({
        title: '请检查全部信息！',
        icon: 'none'
      })
      return;
    }
    info.isregister = true;
    info['0a7d088c-1bd6-43d6-9460-f83c6f8091cd'] = info.name;
    info['ae66dd95-8a6f-4679-bc16-d9dc78215e31'] = info.sex;
    info['c035b5f7-bd8d-4c0f-8531-c7707920b3c0'] = info.nation;
    info['985bcff4-d64e-4c9c-a8ee-f3afc365c218'] = info.brith;
    info['1ec2b976-f1fa-4689-afd8-f5a94e3a1934'] = info.QQ;
    info['c8fd8c56-763b-415f-9bec-99d5f8909730'] = info.phone;
    info['cc6372c1-0bb6-4392-b951-534660622e7c'] = info.idNo;
    info['fb929da8-b0d2-45b1-9ff2-829eab9eada8'] = info.idcardLocation;
    info['6d87ffa2-68b3-484e-944f-359d26866cb1'] = info.currentLocation;
    //显示加载界面
    wx.showLoading({
      title: '提交中',
    });

    
    wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        updateUser: true,
        id: app.globalData.openid,
        data: info
      }
    }).then(res => {
      console.log(res);
      app.globalData.isregister = true;
      //隐藏加载界面
      wx.hideLoading();
      wx.switchTab({
        url: '../home/index',
      })
    }).catch(err => {
      console.log(err)
    })
  },
  checkboxChange(e) {
    console.log(e.detail.value);
    let checkedValue = e.detail.value;
    if (checkedValue == 'y') {
      this.setData({ currentLocation: this.data.idcardLocation, sameLocation: true})
    } else if (checkedValue == 'n') {
      this.setData({ sameLocation: false });
    }
  },
  chooseLocation(e) {
    let _this = this
    let index = e.currentTarget.dataset.index
    console.log("chooseLocation", e);

    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              _this.chooseLocation();
            },
            fail: res => {console.log(res)}
          })
        } else {
          wx.chooseLocation({
            success: function (res) {
              console.log(res);
              if (index == '1') {
                _this.setData({ currentLocation: res.address })
              } else if (index == '0') {
                _this.setData({ idcardLocation: res.address })
              }
            },
            fail: res => {
              console.log(res)
            }
          })
        }
      }
    })
  },

  
})