// pages/tip/index.js
const images = require('../../utils/images.js')
Page({

  data: {
    images: images
  },

  onLoad: function (options) {
    if (options.share) {this.setData({share: true})};
  },

  onUnload() {
    console.log('onUnload');
    if (this.data.share) {
      wx.redirectTo({
        url: '../index/index',
      });
      return;
    }
    wx.switchTab({
      url: '../home/index',
    })
  }
})