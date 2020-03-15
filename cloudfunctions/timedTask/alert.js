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
const db = cloud.database();
const alert = async (jqid, jqName) => {
  console.log(`======================================${jqName}===============================================`)
  // 根据活动id，获取参与用户信息，获取到用户的 openid 和 formid.
  let jqRes = await db.collection(COLLECTIONNAME).doc(jqid).get();
  // console.log(jqRes)
  let jq = jqRes.data;
  let currentPeriod = jq.currentPeriod;
  console.log("currenPeriod: ", currentPeriod);
  
  var thing3 = "请填写今天的问卷。";
  if (currentPeriod) {
    if (jq.type == 1 || jq.type == 3) {
      var s = Number(currentPeriod[0].split('/')[2]);
      var e = Number(currentPeriod[1].split('/')[2]);
      thing3 = "请填写" + s + '号至' + e + '号的问卷。'
    }
  }
  console.log(thing3)
  // 从数据库中获取AccessToken
  let tokenRes = await db.collection(COLL_FIELD_NAME).doc(FIELD_NAME).get();
  let token = tokenRes.data.token; // access_token
// /pages/createJQ/index?share=0&
  let page = 'pages/createJQ/index?share=0&jq=' + jqName + '&id=' + jqid;
  let msgData = {
    "thing3": { "value": thing3},
    "date2": {"value": `${year}年${month}月${day}日`},
  };
  console.log("jq.jqUser ========> jq.jqUser: ", jq.jqUser);
  let usersSet = new Set(jq.jqUser || []);
  let list = jq.list || [];
  let tasks = [];
  for (let i = 0; i < list.length; i++) {
    tasks.push(db.collection('user').where({phone: list[i].phone}).get())
  }
  let listRes = await Promise.all(tasks);
  let listInfo = listRes.map(item => { return item.data });
  // console.log("listInfo: ", listInfo);
  for (let i = 0; i < listInfo.length; i++) {
    if (listInfo[i][0]) {
      console.log("listInfo[i][0]._id =========> listInfo[i][0]._id: ", listInfo[i][0]._id)
      usersSet.add(listInfo[i][0]._id)
    } else {
      console.log("listInfo[i][0]._id =========> listInfo[i][0]._id: ", listInfo[i], list[i])
    }
  }
  console.log("usersSet ========> usersSet: ", usersSet)
  let alertUsers = Array.from(usersSet);
  console.log("alertUsers =======> alertUsers: ", alertUsers);
  // alertUsers = ['ogesF5rLxuzlBAOjzNrKx1YHojOI'];
  // var alerttasks = [];
  for (let i = 0; i < alertUsers.length; i++) {
    let openid = alertUsers[i];
    // let formid = '用户formid';
    console.log("sendTemplateMsg ===============> sendTemplateMsg", openid);
    // alerttasks.push(templateMessage.sendTemplateMsg(token, MSGID, msgData, openid, page))
    await templateMessage.sendTemplateMsg(token, MSGID, msgData, openid, page);
  }
  // Promise.all(alerttasks).then(res => {
  //   console.log(res)
  // }).catch(res => {console.log(res)})
}

module.exports = {
  alert: alert,
}

