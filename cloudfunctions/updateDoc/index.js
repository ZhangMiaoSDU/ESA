// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'esa'})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
const userDB = db.collection('user')
const jqDB = db.collection('jq');
const univcollDB = db.collection('univ-coll');
const timedtaskDB = db.collection('timedtask');

// 云函数入口函数
exports.main = async (event, context) => {
  if (event.updateUser) {
    return await userDB.doc(event.id).update({
      data: event.data
    })
  } else if (event.updateRecord) {
    var obj = {};
    obj[event.date] = event.usersId;
    // console.log("obj", obj);
    return await jqDB.doc(event.id).update({
      data: obj
    })
  } else if (event.updateAnswers) {
    return await userDB.doc(event.id).update({
      data: event.answers
    })
  } else if (event.updateJQs) {
    return await userDB.doc(event.id).update({
      data: {
        jqs: _.addToSet(event.jqid)
      }
    })
  } else if (event.updateJQquestion) {
    return await jqDB.doc(event.id).update({
      data: {
        questions: _.addToSet(event.questionId),
        questionsName: _.addToSet(event.qdict)
      }
    })
  } else if (event.addMultiquestions) {
    let questionsId = event.questionsId;
    let tasks = [];
    for (let i = 0; i < questionsId.length; i++) {
      tasks.push(db.collection("question").doc(questionsId[i]).get())
    }
    let questionsRes = await Promise.all(tasks);
    console.log(questionsRes)
    let questionsInfo = questionsRes.map(item => { return item.data });
    let _dictArr = questionsInfo.map(item => { let _dict = {}; _dict[item._id] = item; return _dict; });
    console.log("_dictArr: ", _dictArr)
    let addquestions = await jqDB.doc(event.id).update({
      data: {
        questions: _.push({
          each: questionsId,
          slice: event.slice
        })
      }
    })
    let addName = await jqDB.doc(event.id).update({
      data: {
        questionsName: _.push({
          each: _dictArr,
          slice: event.slice
        })
      }
    })
    return [addquestions, addName];
  } else if (event.removeJQquestion) {
    let res = await jqDB.doc(event.id).update({
      data: {
        questionsName: event.remainder
      }
    });
    console.log(res);
    if (event.modify) {
      return;
    }
    let questionId = event.questionId;
    return await jqDB.doc(event.id).update({
      data: {
        questions: _.pullAll([questionId])
      }
    })
  } else if (event.updateJQSummary) {
    let summary = event.summary;
      // { "ogesF5rLxuzlBAOjzNrKx1YHojOI": { "2020/02/22": { "f7a1cfd1-f7e6-4fc3-ba0c-1e3eb42770a5": 1, "0a7d088c1bd643d69460f83c": "张淼", "50d28a07-bc53-420a-b715-4a43a68195e2": 1, "a0a9b783-1201-4410-b358-88807a57c943": 0, "88c4f335-5021-4dc6-80a4-f36a2134e451": 0, "e682ed67-6585-4c40-8f36-6ceeda28a531": 0, "e38c5ea9-05f4-41de-b41b-521a3ce2ef67": 0, "032032b3-62d9-48d4-8589-e28ac7b29465": 1, "22c88c33-ae9f-45ad-99a5-d90d9563f7fa": "36.5度", "72529d59-22a5-4fcc-8ea6-556ee62f7283": 1, "c2997719-aeab-488f-8d3b-3c83a8f86578": "36.5度", "8727263e-fb7e-450e-ab95-44a68f3d1bd4": 0, "8dd557ee-7a6d-42ee-a0f2-4645b091f1c6": "无", "7aac6806-9200-496a-becc-bb35c028a495": "山东省", "b250830e-a5e3-4100-8a27-76ae8ded13ea": "菏泽市", "6e6f99df-baeb-4854-8cea-18a617dd1a2d": "郓城县", "33c59194-fc0b-4415-b69b-5c132c49eda7": "详细地址", "4908cf0f-5596-497c-94a1-0fd7cde3a44f": 1, "2fbf16e9-0cca-4a6a-8574-edef2c5ef482": "无", "c8dde463-f35f-45a9-b852-654253994947": "无", "63201958-91a3-47c0-bab6-cab9c661b625": "无", "submitTime": 1582338219852 } } }
    let userId = Object.keys(summary)[0];//用户
    let userTimeAnswer = Object.values(summary)[0];//保存的日期及问题答案
    let userTime = Object.keys(userTimeAnswer)[0];//保存的日期
    let userAnsewer = Object.values(userTimeAnswer)[0];//保存的答案
    for (let key in userAnsewer) {
      if (userAnsewer[key] == 0) {
        userAnsewer[key] = '0'
      }
      // if (key == '' && userAnsewer[key] == )
    }
    console.log(userAnsewer);
    let fsummary = {};
    fsummary[userId] = {};
    fsummary[userId][userTime] = userAnsewer;
    console.log(JSON.stringify(fsummary))
    // return;
    return await jqDB.doc(event.id).update({
      data: fsummary
    })
  } else if (event.addjqUser) {
    return await jqDB.doc(event.id).update({
      data: {
        jqUser: _.addToSet(event.userId),
      }
    })
  } else if (event.updateJQName) {
    return await jqDB.doc(event.id).update({
      data: {
        name: event.name
      }
    })
  }  else if (event.addUniv) {
    return await univcollDB.doc('UNIV').update({
      data: {
        name: _.addToSet(event.univ),
        id: _.addToSet(event.univid)
      }
    })
  } else if (event.addColl) {
    return await univcollDB.doc('COLL').update({
      data: {
        name: _.addToSet(event.coll),
        id: _.addToSet(event.collid)
      }
    })
  } else if (event.addClass) {
    return await univcollDB.doc('_CLASS').update({
      data: {
        name: _.addToSet(event._class),
        id: _.addToSet(event._classid)
      }
    })
  } else if (event.removejq) {
    return await jqDB.doc(event.jqid).remove();
  } else if (event.updateList) {
    let length = event.list.length;
    let numRes = await jqDB.doc(event.jqid).update({
      data: {
        number: _.set(length)
      }
    })
    return await jqDB.doc(event.jqid).update({
      data: {
        list: _.set(event.list)
      }
    })
  } else if (event.deleteTimedtask) {
    return await timedtaskDB.where({jqid: event.id}).remove();
  } else if (event.deleteGroup) {
    return await db.collection('group').where({ id: event.gid }).remove();
  } else if (event.updateGrouplist) {
    var gid = event.gid
    var uinfo = event.uinfo;
    var uid = uinfo._id;
    var urequired = {
      id: uid,
      name: uinfo.name || '',
      phone: uinfo.phone || ''
    };
    var groupRes = await db.collection('group').where({ id: gid }).get();
    var grouplist = groupRes.data[0].list;
    var length = grouplist.filter(item => { return item.id == uid }).length;
    if (length == 0) {
      return await db.collection('group').where({ id: gid }).update({
        data: {
          listid: _.addToSet(uid),
          list: _.addToSet(urequired),
        }
      })
    } else {
      return await db.collection('group').where({ id: gid }).update({
        data: {
          listid: _.addToSet(uid),
        }
      })
    }
    
  } else if (event.removeGroupM) {
    var gid = event.gid;
    var uid = event.uid;
    var groupRes = await db.collection('group').where({ id: gid }).get();
    var grouplist = groupRes.data[0].list;
    console.log(grouplist);
    var uinfo = grouplist.filter(item => {return item.id != uid});//剩余的数组
    console.log("uinfo:", uinfo)
    return await db.collection('group').where({ id: gid }).update({
      data: { listid: _.pullAll([uid]), list: _.set(uinfo)}
    })
  } else if (event.addGroupAdmin) {
    var uid = event.uid, gid = event.gid;
    return await db.collection('group').where({id: gid}).update({
      data: { administrator: _.addToSet(uid)}
    })
  } else if (event.removeGroupAdmin) {
    var uid = event.uid, gid = event.gid;
    return await db.collection('group').where({ id: gid }).update({
      data: { administrator: _.pullAll([uid]) }
    })
  }
}