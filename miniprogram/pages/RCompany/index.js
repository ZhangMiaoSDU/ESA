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
    this.saveUnivColl(requiredInfo).then(res => {
      console.log(res);
      var groupId = res.map(item => {return item.result}).join('');
      // return;
      this.saveGroup(groupId).then(res => {
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
  },


  saveUnivColl(info) {
    console.log(" ========== saveUnivColl ========== ", )
    var univ = info.univ;
    var coll = info.coll;
    var _class = info._class
    var tasks = [];
    tasks.push(wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        addUniv: true,
        univ: univ,
      }
    }));
    tasks.push(wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        addColl: true,
        coll: coll,
      }
    }));
    tasks.push(wx.cloud.callFunction({
      name: 'updateDoc',
      data: {
        addClass: true,
        _class: _class,
      }
    }))
    return new Promise((resolve, reject) => {
      Promise.all(tasks).then(res => {
        console.log(res)
        resolve(res)
      }).catch(res => {
        reject(res)
      })
    })
  },
  saveGroup(groupId) {
    var univ = this.data.univ;
    var coll = this.data.coll;
    var _class = this.data._class;
    var creatorId = app.globalData.openid, uname = this.data.uname, 
                    uphone = this.data.uphone, uemail = this.data.uemail;
    console.log(groupId)
    var data = {
      creator: creatorId,//创建人id
      email: uemail,//创建人联系电话
      phone: uphone,//创建人邮箱
      creationTime: new Date().getTime(),//创建时间
      id: groupId,//组id
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