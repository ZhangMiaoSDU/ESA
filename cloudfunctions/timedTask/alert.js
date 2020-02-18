const cloud = require('wx-server-sdk');
const templateMessage = require('templateMessage.js') 
const COLL_FIELD_NAME = 'wxaccesstoken';
const COLLECTIONNAME = 'jq';
const FIELD_NAME = 'ACCESS_TOKEN'
const MSGID = 'SbHczOXg6Gfj6k9mEomdOjwIx1SFpUdgWYv1EOKIqyo';
cloud.init({
  env: 'esa'
})
let year = new Date().getFullYear();
let month = new Date().getMonth() + 1;
let day = new Date().getDate();
const db = cloud.database()
const alert = async (jqid, jqName) => {
  // 根据活动id，获取参与用户信息，获取到用户的 openid 和 formid.
  let jqRes = await db.collection(COLLECTIONNAME).doc(jqid).get();
  console.log(jqRes)
  let jq = jqRes.data;
  // 从数据库中获取AccessToken
  let tokenRes = await db.collection(COLL_FIELD_NAME).doc(FIELD_NAME).get();
  let token = tokenRes.data.token; // access_token

  let page = 'pages/createJQ/index?jq=' + jqName + '&id=' + jqid;
  let msgData = {
    "thing3": { "value": "请填写今天问卷: " + jq.name},
    "date2": {"value": `${year}年${month}月${day}日`},
  };
  console.log(jq.jqUser)
  for (let i = 0; i < jq.jqUser.length; i++) {
    let openid = jq.jqUser[i];
    // let formid = '用户formid';
    await templateMessage.sendTemplateMsg(token, MSGID, msgData, openid, page);
  }
}

module.exports = {
  alert: alert,
}

