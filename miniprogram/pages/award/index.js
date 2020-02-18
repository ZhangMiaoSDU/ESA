// pages/award/index.js
const app = getApp()
const images = require('../../utils/images.js')
const db = wx.cloud.database();
const userDB = db.collection('user');
const univcollDB = db.collection('univ-coll');
const utils = require('../../utils/utils.js')
const baidutokenDB = db.collection('baidutoken');
Page({
  // ogesF5sRNp2pEg-PDfN2yG8LBOHA
  data: {
    windowHeight: app.globalData.windowHeight,
    screenWidth: app.globalData.screenWidth,
    univs: ['手动输入'],
    univ: '',
    colls: ['手动输入'],
    coll: '',
    images: images,
    baiduToken: null,
    sameLocation: true,
    isTip: false
  },

  onLoad: function (options) {
    let _this = this
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
        _this.setData({ baiduToken: baiduToken })
      }
    })
    userDB.doc(app.globalData.openid).get().then(res => {
      console.log(res.data);
      _this.setData({ isFill: res.data.isFill })
    })
    univcollDB.doc('UNIV').get().then(res => {
      console.log(res.data.name);
      _this.setData({ univs: res.data.name.concat('手动输入')})
    })
    univcollDB.doc('COLL').get().then(res => {
      console.log(res.data.name);
      _this.setData({ colls: res.data.name.concat('手动输入') })
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
  bindName: function (e) {
    console.log(e);
    let value = e.detail.value;
    this.setData({ name: value });
  },
  bindIdN: function(e) {
    console.log(e);
    let value = e.detail.value;
    this.setData({ idNo: value });
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

  bindUnivChange(e) {
    console.log(e);
    let index = e.detail.value;
    let univ = this.data.univs[index];
    if (univ == '手动输入') {
      this.setData({
        showUInput: true
      })
    } else {
      this.setData({ univ: univ, showUInput: false})
    }
  },
  bindUniv(e) {
    this.setData({univ: e.detail.value})
  },
  bindCollChange(e) {
    console.log(e);
    let index = e.detail.value;
    let coll = this.data.colls[index];
    if (coll == '手动输入') {
      this.setData({
        showCInput: true
      })
    } else {
      this.setData({ coll: coll, showCInput: false })
    }
  },
  bindColl(e) {
    this.setData({ coll: e.detail.value })
  },
  bindStdID(e) {
    this.setData({ stdID: e.detail.value})
  },
  bindEmail(e) {
    this.setData({ email: e.detail.value })
  },

  bindCourseChange(e) {
    console.log(e);
    let checkedCourses = e.detail.value;
    if (checkedCourses.length == 0) {
      this.setData({ isCheckedCourse: false })
    } else {
      if (!this.data.isTip) {
        this.setData({isTip: true})
        wx.showModal({
          title: '温馨提示',
          content: '若您选择领取奖学金，请确保填写全部信息。',
          showCancel: false,
          confirmText: '确定'
        })
      }
      this.setData({ isCheckedCourse: true, checkedCourses: checkedCourses });
    }
  },
  bindCommitment(e) {
    console.log(e);
    let checked = e.detail.value;
    if (checked.length == 2) {
      this.setData({ checkedCommitment: true })
    } else {
      this.setData({checkedCommitment: false})
    }
    console.log("checkedCommitment: ", this.data.checkedCommitment)
  },

  bindNo(e) {
    console.log(e)
    let value = e.detail.value;
    if (value[0] == '2') {
      this.setData({ checkdedNo: true})
    } else {
      this.setData({ checkdedNo: false})
    }
    console.log("checkdedNo: ", this.data.checkdedNo)

  },

  clickConfirm() {
    utils.reuqestSubscribMessage()
      .then(res => { 
        console.log(res) 
        let isCheckedCourse = this.data.isCheckedCourse;
        let info = 
        // isCheckedCourse ? 
        {
          name: (this.data.name && this.data.name.trim()) || '',
          sex: (this.data.sex && this.data.sex.trim()) || '',
          nation: (this.data.nation && this.data.nation.trim()) || '',
          brith: (this.data.brith && this.data.brith.trim()) || '',
          QQ: (this.data.QQ && this.data.QQ.trim()) || '',
          phone: (this.data.phone && this.data.phone.trim()) || '',
          idNo: (this.data.idNo && this.data.idNo.trim()) || '',
          idcardLocation: (this.data.idcardLocation && this.data.idcardLocation.trim()) || '',
          currentLocation: (this.data.currentLocation && this.data.currentLocation.trim()) || '',
          email: (this.data.email && this.data.email.trim()) || '',
          univ: (this.data.univ && this.data.univ.trim()) || '',
          coll: (this.data.coll && this.data.coll.trim()) || '',
          stdID: (this.data.stdID && this.data.stdID.trim()) || '',
        } 
        // : {
        //     name: (this.data.name && this.data.name.trim()) || '',
        //     phone: (this.data.phone && this.data.phone.trim()) || '',
        //   };
        console.log(info);
        let flag = true;
        if (isCheckedCourse) {
          Object.values(info).map(item => { if (item.trim() == '') { flag = false; } });
        } else {
          let required = {name: info.name, phone: info.phone};
          Object.values(required).map(item => { if (item.trim() == '') { flag = false; } });
        }
        
        if (!flag) {
          wx.showToast({
            title: '请检查全部信息！',
            icon: 'none'
          })
          return;
        }
        info.isregister = true;
        info['0a7d088c1bd643d69460f83c'] = info.name;
        info['ae66dd95-8a6f-4679-bc16-d9dc78215e31'] = info.sex ? info.sex : '';
        info['c035b5f7-bd8d-4c0f-8531-c7707920b3c0'] = info.nation ? info.nation : '';
        info['985bcff4-d64e-4c9c-a8ee-f3afc365c218'] = info.brith ? info.brith : '';
        info['1ec2b976-f1fa-4689-afd8-f5a94e3a1934'] = info.QQ ? info.QQ : '';
        info['c8fd8c56-763b-415f-9bec-99d5f8909730'] = info.phone;
        info['cc6372c1-0bb6-4392-b951-534660622e7c'] = info.idNo ? info.idNo : '';
        info['fb929da8-b0d2-45b1-9ff2-829eab9eada8'] = info.idcardLocation ? info.idcardLocation : '';
        info['6d87ffa2-68b3-484e-944f-359d26866cb1'] = info.currentLocation ? info.currentLocation : '';
        info['6ae6348e-1285-4bd9-821a-36f8be522c23'] = info.coll ? info.coll : '';
        info['da755c4e-397b-4a8e-94c1-8167a63f976c'] = info.univ ? info.univ : '';
        info['6bfe20da-c970-433a-a23f-0305630c842f'] = info.email ? info.email : '';
        info['3218ed04-9cf5-4ce3-8511-b16f8c608897'] = info.stdID ? info.stdID : '';
        info["checkedCourses"] = this.data.checkedCourses;//勾选的课程
        info["isInterested"] = !this.data.checkdedNo;//是否感兴趣
        info["isFill"] = true
        // 将大学和学院名称保存至数据库
        this.saveUnivColl(info);
        if (this.data.isCheckedCourse) {
          // 勾选课程
          if (!this.data.checkedCommitment) {
            // 未勾选承诺
            wx.showToast({
              title: '请勾选全部承诺信息！',
              icon: 'none',
            });
            return;
          } else {
            this.saveUserInfo(info).then(res => {
              console.log("res: ", res);
              this.saveToIntstd(info.name, info.email).then(res => {
                console.log(res);
                wx.showModal({
                  title: '提示',
                  content: '注册成功，相关信息将会发到您的邮箱:' + this.data.email,
                  showCancel: false
                });
                app.globalData.isregister = true;
                this.setData({ isFill: true })
              })
            })
          }
        } else {
          // // 未勾选课程
          // if (!this.data.checkdedNo) {
          //   // 未勾选不感兴趣
          //   wx.showToast({
          //     title: '若不参加课程，请勾选不感兴趣选项！',
          //     icon: 'none'
          //   })
          // } else {
          this.saveUserInfo(info).then(res => {
            wx.showModal({
              title: '提示',
              content: '注册成功',
              showCancel: false
            })
            app.globalData.isregister = true;

            this.setData({ isFill: true })
          })
          // }
        }
      
      })
      .catch(res => { console.log(res) });
    
  },
  saveToIntstd(name, mail) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'addDoc',
        data: {
          addIntStd: true,
          data: {
            name: name,
            mail: mail,
            isSend: false
          }
        }
      }).then(res => {resolve(res)})
      .catch(res => {reject(res)})
    })
    
  },
  saveUnivColl(info) {
    var univ = this.data.univ;
    var coll = this.data.coll;
    console.log(univ, coll);
    if (univ.trim() == '' || coll.trim() == '') {
      // wx.showToast({
      //   title: '大学信息和学院信息无效',
      //   icon: 'none'
      // })
      // return;
    } else {
      var tasks = [];
      tasks.push(wx.cloud.callFunction({
        name: 'updateDoc',
        data: {
          addUniv: true,
          univ: univ
        }
      }));
      tasks.push(wx.cloud.callFunction({
        name: 'updateDoc',
        data: {
          addColl: true,
          coll: coll
        }
      }));

      return new Promise((resolve, reject) => {
        Promise.all(tasks).then(res => {
          resolve(res)
        }).catch(res => {
          reject(res)
        })
      })
    }
    
  },
  saveUserInfo(info) {
   return new Promise((resolve, reject) => {
     wx.cloud.callFunction({
       name: 'updateDoc',
       data: {
         updateUser: true,
         id: app.globalData.openid,
         data: info
       }
     }).then(res => resolve(res))
     .catch(res => {reject(res)})
   })
  },
  checkboxChange(e) {
    console.log(e.detail.value);
    let checkedValue = e.detail.value;
    if (checkedValue == 'y') {
      this.setData({ currentLocation: this.data.idcardLocation, sameLocation: true })
    } else if (checkedValue == 'n') {
      this.setData({ sameLocation: false });
    }
  },
  chooseLocation(e) {
    let _this = this
    console.log("chooseLocation", e);
    let index = e.currentTarget.dataset.index
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              _this.chooseLocation();
            },
            fail: res => { console.log(res) }
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