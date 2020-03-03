// pages/RCompany/index.js
const app = getApp()
const db = wx.cloud.database();
const userDB = db.collection('user');
const univcollDB = db.collection('univ-coll');
const groupDB = db.collection('group');
const images = require('../../utils/images.js')
Page({
  data: {
    univs: ['手动输入'],
    univ: '',
    colls: ['手动输入'],
    coll: '',
    _classes: ['手动输入'],
    _class: '',
    images: images,
  },
  onLoad: function (options) {
    let _this = this
    univcollDB.doc('UNIV').get().then(res => {
      // console.log(res.data.name);
      _this.setData({ univs: res.data.name.concat('手动输入') , univsids:res.data.id})
    })
    univcollDB.doc('COLL').get().then(res => {
      // console.log(res.data.name);
      _this.setData({ colls: res.data.name.concat('手动输入'), collsids: res.data.id })
    })
    univcollDB.doc('_CLASS').get().then(res => {
      // console.log(res.data.name);
      _this.setData({ _classes: res.data.name.concat('手动输入'), _classesids: res.data.id })
    })
    userDB.doc(app.globalData.openid).get().then(res => {
      
      _this.setData({ uname: res.data.name, 
        uphone: res.data.phone, 
        uemail: res.data.email
      })
    });
  },
  bindUnivChange(e) {
    // console.log(e);
    let index = e.detail.value;
    let univ = this.data.univs[index];
    let univid = this.data.univsids[index];
    if (univ == '手动输入') {
      this.setData({
        showUInput: true,
        univ: null
      })
    } else {
      this.setData({ univ: univ, showUInput: false, univid: univid})
    }
  },
  bindUniv(e) {
    if (e.detail.value == '无') {
      wx.showToast({
        title: '填写信息无效！',
        icon: 'none'
      })
      return;
    }
    this.setData({ univ: e.detail.value.trim() })
  },

  bindCollChange(e) {
    console.log(e);
    let index = e.detail.value;
    let coll = this.data.colls[index];
    let collid = this.data.collsids[index];
    if (coll == '手动输入') {
      this.setData({
        showCInput: true,
        coll: null
      })
    } else {
      this.setData({ coll: coll, showCInput: false, collid: collid})
    }
  },
  bindColl(e) {
    if (e.detail.value == '无') {
      wx.showToast({
        title: '填写信息无效！',
        icon: 'none'
      })
      return;
    }
    this.setData({ coll: e.detail.value.trim() })
  },

  bindClassChange(e) {
    // console.log(e);
    let index = e.detail.value;
    let _class = this.data._classes[index];
    let _classid = this.data._classesids[index];
    if (_class == '手动输入') {
      this.setData({
        showClassInput: true,
        _class: null
      })
    } else {
      this.setData({ _class: _class, showClassInput: false, _classid: _classid})
    }
  },
  bindClass(e) {
    if (e.detail.value == '无') {
      wx.showToast({
        title: '填写信息无效！',
        icon: 'none'
      })
      return;
    }
    this.setData({ _class: e.detail.value.trim() })
  },
  bindEmail(e) {
    this.setData({ uemail: e.detail.value.trim() })
  },
  bindPhone(e) {
    let value = e.detail.value;
    var reg1 = /^\d{11,11}$/;
    if (reg1.test(value)) {
      this.setData({ uphone: value.trim() });
    } else {
      wx.showToast({
        title: '格式不正确',
        icon: 'none'
      })
      this.setData({ uphone: undefined });
    }
  },
  confirmCreate() {
    
    var requiredInfo = {
      univ: this.data.univ || '',
      coll: this.data.coll || '',
      _class: this.data._class || '',
      phone: this.data.uphone || '',
      email: this.data.uemail || ''
    };
    // console.log(requiredInfo)
    let flag = true;
    Object.values(requiredInfo).map(item => { if (item.trim() == '') {flag = false;}});
    console.log(`-------------flag = ${flag}----------------`);
    if (!flag) {
      wx.showToast({
        title: '请填写上述全部信息',
        icon: 'none'
      })
      return;
    }
    wx.showLoading({
      title: '加载中',
    })
    // 保存
    // console.log(typeof (this.saveUnivColl(requiredInfo)));
    if (this.checkSave(requiredInfo) == true) {
      var groupId = this.saveUnivColl(requiredInfo);
      console.log("confirmCreate =======> groupId: ", groupId);
      this.saveGroup().then(res => {
        console.log(res);
        wx.hideLoading();
        if (res.result == 0) {
          wx.showModal({
            title: '提示',
            content: '该组已存在',
            showCancel: false
          })
          return;
        }
        wx.switchTab({
          url: '../mem/index',
        })
      })
      .catch(res => {console.log(res)})
    } else {
      var univLen, collLen, classLen;
      this.reGetLength().then(resData => {
        for (let i = 0; i < resData.length; i++) {
          if (resData[i]._id == 'UNIV') { univLen = resData[i].name.length}
          if (resData[i]._id == 'COLL') { collLen = resData[i].name.length }
          if (resData[i]._id == '_CLASS') { classLen = resData[i].name.length }
        }
        console.log("univLen, collLen, classLen ====> ", univLen, collLen, classLen)
        this.saveUnivColl(requiredInfo, univLen, collLen, classLen).then(res => {
          console.log(res);
          // return;
          this.saveGroup().then(res => {
            console.log(res);
            wx.hideLoading();
            if (res.result == 0) {
              wx.showModal({
                title: '提示',
                content: '该组已存在',
                showCancel: false
              })
              return;
            }
            wx.switchTab({
              url: '../mem/index',
            })
          })
          .catch(res => { console.log(res); })
        })
      })
     
    }
  },
  reGetLength() {
    return new Promise((resolve, reject) => {
      univcollDB.get().then(res => {
        var data = res.data;
        resolve(data)
      }).catch(res => {reject(res)})
    })
  },
  checkSave(info) {
    var univ = info.univ;
    var coll = info.coll;
    var _class = info._class
    console.log("checkSave ======> info", info)
    var univIndex = this.data.univs.indexOf(univ);
    var isNewUniv = univIndex == -1 ? true : false;
    var collIndex = this.data.colls.indexOf(coll);
    var isNewColl = collIndex == -1 ? true : false;
    var classIndex = this.data._classes.indexOf(_class);
    var isNewClass = classIndex == -1 ? true : false;
    console.log("isNewUniv: ", isNewUniv, "isNewColl: ", isNewColl, "isNewClass: ", isNewClass)
    if (isNewUniv == false && isNewColl == false && isNewClass == false) {
      console.log("--true---")
      return true;
    } else {
      console.log("--false---")
      return false;
    }
  },
  saveUnivColl(info, univLen, collLen, classLen) {
    console.log("saveUnivColl ==========> univLen, collLen, classLen: ", univLen, collLen, classLen)
    var univ = info.univ;
    var coll = info.coll;
    var _class = info._class
    var tasks = [];
    var univIndex = this.data.univs.indexOf(univ);
    var isNewUniv = univIndex == -1 ? true : false;
    if (isNewUniv) {
      console.log("isNewUniv: ", isNewUniv, univ)
      var univlen = univLen + 1;
      var univid = univlen < 10 ? '00' + univlen : univlen < 100 ? '0' + univlen : String(univlen);
      this.setData({ univid: univid })
      tasks.push(wx.cloud.callFunction({
        name: 'updateDoc',
        data: {
          addUniv: true,
          univ: univ,
          univid: univid
        }
      }));
    } else {
      this.setData({ univid: this.data.univsids[univIndex] })
    }
    var collIndex = this.data.colls.indexOf(coll);
    var isNewColl = collIndex == -1 ? true : false;
    if (isNewColl) {
      console.log("isNewColl: ", isNewColl, coll)
      var colllen = collLen + 1;
      var collid = colllen < 10 ? '00' + colllen : colllen < 100 ? '0' + colllen : String(colllen);
      this.setData({collid: collid})
      tasks.push(wx.cloud.callFunction({
        name: 'updateDoc',
        data: {
          addColl: true,
          coll: coll,
          collid: collid
        }
      }));
    } else {
      this.setData({ collid: this.data.collsids[collIndex] })
    }
    var classIndex = this.data._classes.indexOf(_class);
    var isNewClass = classIndex == -1 ? true : false;
    if (isNewClass) {
      console.log("isNewClass: ", isNewClass, _class)
      var _classlen = classLen + 1;
      var _classid = _classlen < 10 ? '00' + _classlen : _classlen < 100 ? '0' + _classlen : String(_classlen);
      this.setData({ _classid: _classid })
      tasks.push(wx.cloud.callFunction({
        name: 'updateDoc',
        data: {
          addClass: true,
          _class: _class,
          _classid: _classid
        }
      }))
    } else {
      this.setData({ _classid: this.data._classesids[classIndex] })
    }
    if (tasks.length == 0) {
      return `${this.data.univsids[univIndex]}${this.data.collsids[collIndex]}${this.data._classesids[classIndex]}`;
    } else {
      return new Promise((resolve, reject) => {
        Promise.all(tasks).then(res => {
          console.log(res)
          resolve(res)
        }).catch(res => {
          reject(res)
        })
      })
    }
  },
  saveGroup() {
    var univ = this.data.univ, univid = this.data.univid;
    var coll = this.data.coll, collid = this.data.collid;
    var _class = this.data._class, _classid = this.data._classid;
    var creatorId = app.globalData.openid, uname = this.data.uname, 
                    uphone = this.data.uphone, uemail = this.data.uemail;
    console.log(`${univid}${collid}${_classid}`)
    var data = {
      creator: creatorId,//创建人id
      email: uemail,//创建人联系电话
      phone: uphone,//创建人邮箱
      creationTime: new Date().getTime(),//创建时间
      id: `${univid}${collid}${_classid}`,//组id
      name: `${univ}>${coll}>${_class}`,//组名
      listid: [creatorId],
      list: [{name: uname, id: creatorId, phone: uphone}]
    }
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'addDoc',
        data: {addGroup: true,data: data}
      }).then(res => {resolve(res)})
      .catch(res => {reject(res)})
    })
  }
})