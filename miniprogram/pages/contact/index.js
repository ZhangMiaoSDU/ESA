// pages/contact/index.js
const app = getApp();
const images = require('../../utils/images.js');
const db = wx.cloud.database();
const userDB = db.collection("user");

Page({

  data: {
    images: images
  },

  onLoad: function (options) {
    let _this = this
    userDB.doc(app.globalData.openid).get().then(res => {
      console.log(res);
      let userInfo = res.data;
      _this.setData({
        name: userInfo.name,
        location: userInfo.currentLocation,
        contactName: userInfo.name,
        phone: userInfo.phone
      });
    })
  },
  phone() {
    wx.makePhoneCall({
      phoneNumber: '12320',
      success: res => {console.log(res)},
      fail: res => {console.log(res)}
    })
  },
  statusChange(e) {
    console.log(e);
    let status = e.detail.value;
    this.setData({ status: status})
  },
  bindName(e) {
    this.setData({name: e.detail.value})
  },  
  bindLocation(e) {
    this.setData({ location: e.detail.value })
  }, 
  bindcontactName(e) {
    this.setData({ contactName: e.detail.value })
  }, 
  bindphone(e) {
    this.setData({ phone: e.detail.value})
  },
  bindDetail(e) {
    this.setData({detail: e.detail.value})
  },

  submitEmail() {
    let text = `
    姓名：${this.data.name},\n
    状态：${this.data.status},\n
    问题：${this.data.detail},\n
    住址：${this.data.location},\n
    联系人：${this.data.contactName},\n
    电话：${this.data.phone}\n
    `;
    console.log(text)
    let email = 'doctor@people.cn';
    wx.cloud.callFunction({
      name: 'sendEmail',
      data: {
        mail: email,
        text: text
      }
    }).then(res => {console.log(res)})
    .catch(res => {console.log(res)})
  },

  bindNote(e) {
    this.setData({note: e.detail.value})
  },

  saveNote() {
    let note = this.data.note ? this.data.note : '';
    let id = app.globalData.openid;
    if (note.trim().length == 0) {
      return;
    }
    wx.cloud.callFunction({
      name: 'addDoc',
      data: {
        addNote: true,
        data: {
          note: note,
          user: id
        }
      }
    }).then(res => {
      console.log(res);
      wx.showModal({
        title: '提示',
        content: '保存成功，感谢您的留言！',
        showCancel: false,
        confirmText: '返回'
      })
    }).catch(res =>{
      console.log(res)
    })
  }
})