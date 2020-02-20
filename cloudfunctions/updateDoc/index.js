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
    return await jqDB.doc(event.id).update({
      data: event.summary
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
        name: _.addToSet(event.univ)
      }
    })
  } else if (event.addColl) {
    return await univcollDB.doc('COLL').update({
      data: {
        name: _.addToSet(event.coll)
      }
    })
  } else if (event.addClass) {
    return await univcollDB.doc('_CLASS').update({
      data: {
        name: _.addToSet(event._class)
      }
    })
  } else if (event.removejq) {
    return await jqDB.doc(event.jqid).remove();
  } else if (event.updateList) {
    return await jqDB.doc(event.jqid).update({
      data: {
        list: _.set(event.list)
      }
    })
  } else if (event.deleteTimedtask) {
    return await timedtaskDB.where({jqid: event.id}).remove();
  }
}