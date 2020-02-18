// 云函数入口文件
const cloud = require('wx-server-sdk')
const COLL_FIELD_NAME = 'wxaccesstoken';
const FIELD_NAME = 'ACCESS_TOKEN';
const MSGID = 'SbHczOXg6Gfj6k9mEomdOjwIx1SFpUdgWYv1EOKIqyo';
const rp = require('request-promise');
cloud.init({
  env: 'esa'
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  // 从数据库中获取AccessToken
  let tokenRes = await db.collection(COLL_FIELD_NAME).doc(FIELD_NAME).get();
  let token = tokenRes.data.token; // access_token
  let openids = event.openids;//需要发送消息的用户

  let msgData = {
    "thing3": { "value": "请填写今天问卷: " + event.jqName},
    "date2": { "value": event.time },
  };
  let page = 'pages/createJQ/index?jq=' + event.jqName + '&id=' + event.jqid;

  for (let i = 0;i < openids.length; i++) {
    let openid = openids[i].id;
    let sendRes = await rp({
      json: true,
      method: 'POST',
      uri: 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=' + token,
      body: {
        touser: openid,
        template_id: MSGID,
        page: page,
        data: msgData
      }
    }).then(res => {
      console.log(res);
      if (res.errcode == 43101) {
        openids[i].accept = false
      } else {
        openids[i].accept = true
      }
    }).catch(err => {
      console.error(err)
    })
  }
  return openids;
  
}