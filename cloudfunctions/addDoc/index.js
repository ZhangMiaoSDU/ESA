// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'esa'})
const db = cloud.database();
const _ = db.command
const timedTaskDB = db.collection('timedtask');
const noteDB = db.collection('note');
const intStdDB = db.collection("intstd");
// 云函数入口函数
exports.main = async (event, context) => {
  if (event.addUser) {
    return await db.collection('user').doc(event.userId).set({
      data: event.data
    })
  } else if (event.addBaiduToken) {
    return await 
      db.collection('baidutoken')
        .doc('eef7e2ce-f1a8-4831-96f9-404f64f1d615')
        .set({
          data: {
            savetime: event.time,
            access_token: event.access_token,
            expiretime: event.time + 2592000 - 600
          }
        })
  } else if (event.addjq) {
    console.log("---------------------addjq-创建问卷------------------------")
    var data = event.data
    var addjqRes = await db.collection('jq').add({
      data: data
    });
    var jqid = addjqRes._id;
    var selectedGid = data.selectedGid;
    for (let i = 0; i < selectedGid.length; i++) {
      var groupRes = await db.collection('group').where({ id: selectedGid[i] }).update({ data: { jqs: _.addToSet(jqid)}})
    }
    return addjqRes;
  } else if (event.addquestion) {
    return await db.collection('question').add({
      data: event.data
    })
  } else if (event.addTimedTask) {
    return await timedTaskDB.add({
      data: event.data
    })
  } else if (event.addNote) {
    return await noteDB.add({
      data: event.data
    })
  } else if (event.addIntStd) {
    return await intStdDB.add({
      data: event.data
    })
  } else if (event.addGroup) {
    var data = event.data;
    var gid = data.id;
    let gres = await db.collection('group').where({id: gid}).get();
    if (gres.data.length == 1) {
      return new Promise((resolve, reject) => {resolve(0)});
    }
    return await db.collection('group').add({
      data: event.data
    })
  }
}