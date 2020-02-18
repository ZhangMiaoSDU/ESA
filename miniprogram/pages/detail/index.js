// pages/detail/index.js
const images = require("../../utils/images.js")
Page({

  data: {
    images: images,
    currentDay: new Date().getFullYear() + '年' + (new Date().getMonth() + 1) + '月' + new Date().getDate() + '日'
  },

  onLoad: function (options) {
    console.log(options)
    if (options.unfilled) {
      let data = JSON.parse(options.data);
      console.log(data);
      this.setData({ unfilled: true, data: data, jqName: options.jqName, jqid: options.jqid })
      return;
    }
    if (options.filled) {
      let data = JSON.parse(options.data);
      console.log(data);
      this.setData({ filled: true, data: data })
      return;
    }
    let data = JSON.parse(options.data);
    this.setData({ data: data})
  },

  makeCall(e) {
    let phone = e.currentTarget.dataset.phone;
    console.log(e);
    wx.makePhoneCall({
      phoneNumber: phone,
      success: res => { console.log(res) },
      fail: res => { console.log(res) }
    })
  },

  sendMsg() {
    console.log("sendMsg")
    let _this = this;
    var data = this.data.data;
    data.map(item => {return item.phone = item.phone.split(' ').join('')});
    console.log("sendMsg --- data: ", data);
    wx.cloud.callFunction({
      name: 'queryDB',
      data: {
        queryUnfilled: true,
        data: data
      }
    }).then(res => {
      console.log(res);
      let result = res.result;
      let openids = result.filter(item => {return item.id != undefined});
      console.log(openids)
      let unregi = result.filter(item => {return item.id == undefined}).map(item => {return item.name});
      console.log(unregi);
      if (unregi.length > 0) {
        wx.showModal({
          title: '提示',
          content: `未查询到“${unregi.toString()}”成员的信息，是否继续向其余成员发送消息？`,
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定');
              wx.showLoading({
                title: '发送中',
              })
              wx.cloud.callFunction({
                name: 'sendTemplate',
                data: {
                  openids: openids,
                  time: _this.data.currentDay,
                  jqName: _this.data.jqName,
                  jqid: _this.data.jqid,
                }
              }).then(res => {
                wx.hideLoading();

                // console.log(res);
                let acceptName = res.result.filter(item => { return item.accept }).map(item => { return item.name });
                let rejectName = res.result.filter(item => { return !item.accept }).map(item => { return item.name});
                console.log(acceptName, rejectName);
                if (rejectName.length > 0) {
                  wx.showModal({
                    title: '提示',
                    content: `以下成员未同意接收消息: ${rejectName.toString()}，您可以电话通知。`,
                    showCancel: false
                  })
                } else {
                  wx.showToast({
                    title: '发送成功',
                    icon: 'none'
                  })
                }
              })
                .catch(res => { console.log(res) })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      } else {
        wx.cloud.callFunction({
          name: 'sendTemplate',
          data: {
            openids: openids,
            time: _this.data.currentDay,
            jqName: _this.data.jqName,
            jqid: _this.data.jqid,
          }
        }).then(res => {
          wx.hideLoading();

          // console.log(res);
          let acceptName = res.result.filter(item => { return item.accept }).map(item => { return item.name });
          let rejectName = res.result.filter(item => { return !item.accept }).map(item => { return item.name });
          console.log(acceptName, rejectName);
          if (rejectName.length > 0) {
            wx.showModal({
              title: '提示',
              content: `以下成员未同意接收消息: ${rejectName.toString()}，您可以电话通知。`,
              showCancel: false
            })
          } else {
            wx.showToast({
              title: '发送成功',
              icon: 'none'
            })
          }
        })
      }
     
    }).catch(res => {console.log(res)})
  }

})