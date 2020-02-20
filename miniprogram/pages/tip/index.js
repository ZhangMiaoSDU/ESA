// pages/tip/index.js
const images = require('../../utils/images.js')
Page({

  data: {
    images: images
  },

  onUnload() {
    console.log('onUnload');
    wx.switchTab({
      url: '../home/index',
    })
  }
})