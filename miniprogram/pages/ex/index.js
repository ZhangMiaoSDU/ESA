// pages/ex/index.js
const app = getApp();
const images = require('../../utils/images.js');
const fileID = 'cloud://esa.6573-esa-1301169382/EX/ex.txt';
Page({

  data: {
    images: images
  },

  onLoad: function (options) {

  },

  preview() {
    wx.previewImage({
      urls: [images.ex],
    })
  }
})