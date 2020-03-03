// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')
const APPID = 'wx989231d9fc00cd9f';
const APPSECRET = '8f36c557b9f1cbac589bacf53cc1393e';
const COLLECTIONNAME = 'wxaccesstoken';
const FIELDNAME = 'ACCESS_TOKEN';
const URL = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + APPID + "&secret=" + APPSECRET
cloud.init({env: 'esa'})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let res = await rq({
      url: URL,
      method: 'GET',
    });
    res = JSON.parse(res);
    let resUpdate = await db.collection(COLLECTIONNAME).doc(FIELDNAME).update({
      data: {
        token: res.access_token
      }
    })
  } catch(e) {
    console.log(e)
  }
}