export function initCoreData(province) {
  let _this = this;
  wxrequest.initCoreData(province).then(res => {
    console.log(res)
    var confirm = 0;
    var suspectedCount = 0;
    var curedCount = 0;
    var deadCount = 0;
    for (let i = 0; i < res.length; i++) {
      confirm += res[i].confirmedCount;
      suspectedCount += res[i].suspectedCount;
      curedCount += res[i].curedCount;
      deadCount += res[i].deadCount;
    }
    _this.setData({
      confirm: confirm,
      curedCount: curedCount,
      deadCount: deadCount
    })
  })
}

export function formatDate(date) {
  let year = new Date(date).getFullYear();
  let month = String(new Date(date).getMonth() + 1).length == 2 ? new Date(date).getMonth() + 1 : '0' + (new Date(date).getMonth() + 1);
  let day = String(new Date(date).getDate()).length == 2 ? new Date(date).getDate() : '0' + new Date(date).getDate();
  let hour = String(new Date(date).getHours()).length == 2 ? new Date(date).getHours() : '0' + new Date(date).getHours();
  let minute = String(new Date(date).getMinutes()).length == 2 ? new Date(date).getMinutes() : '0' + new Date(date).getMinutes();;
  return year + '.' + month + '.' + day + ' ' + hour + ':' + minute
}


export function getBaiduToken() {
  const apiKey = 'KlLX5vtChMscgZpZnP62IqUI';//'HKOi4inoUpckUZ1ZXbK1RFuG';
  const secretKey = 'FuokQEHxbYUdX3w8E5T3HEnbKfWezM1k';//'TMSAySZjinamico3Na3Om2MyRXwGpjoI';
  const tokenUrl = 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id='+ apiKey + '&client_secret=' + secretKey;
  var _this = this;
  return new Promise ((resolve, reject) => {
    wx.request({
      url: tokenUrl,
      method: "POST",
      dataType: 'json',
      header: { 'content-type': 'application/json; charset=UTF-8' },
      success: res => {
        // console.log(res.data)
        resolve(res.data);//24.c065aabf756f3bbbda3d222d4079d2d8.2592000.1583573361.282335-18400910
      },
      fail: res => {
        reject(res)
      }
    })
  })
}


export function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

export function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

export function reuqestSubscribMessage() {
  return new Promise((resolve, reject) => {
    wx.requestSubscribeMessage({
      tmplIds: ['SbHczOXg6Gfj6k9mEomdOjwIx1SFpUdgWYv1EOKIqyo'],
      success: res => {
        console.log(res);
        resolve(res);
      },
      fail: res => {
        console.log(res)
      }
    })
  })
}