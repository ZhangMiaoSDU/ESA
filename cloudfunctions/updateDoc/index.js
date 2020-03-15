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
    console.log("updateRecord: obj:", obj);
    console.log("length: ", obj.length)
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
    let userId = Object.keys(summary)[0];//用户
    let userTimeAnswer = Object.values(summary)[0];//保存的日期及问题答案
    let userTime = Object.keys(userTimeAnswer)[0];//保存的日期
    let userAnsewer = Object.values(userTimeAnswer)[0];//保存的答案
    for (let key in userAnsewer) {
      if (userAnsewer[key] == 0) {
        userAnsewer[key] = '0'
      }
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
    console.log("-----------------添加大学-----------------", event.univ)
    var res = await univcollDB.get();
    var UNIV = res.data.filter(item => { return item._id == "UNIV" })[0];
    var univName = UNIV.name;
    var univId = UNIV.id;
    var univLen = UNIV.name.length + 1;
    var univ = event.univ;
    var univid;
    if (univName.indexOf(univ) == -1) {
      univid = univLen < 10 ? '00' + univLen : univLen < 100 ? '0' + univLen : String(univLen);
    } else {
      univid = univId[univName.indexOf(univ)]
    }
    await univcollDB.doc('UNIV').update({
      data: {
        name: _.addToSet(univ),
        id: _.addToSet(univid)
      }
    })
    return univid;
  } else if (event.addColl) {
    console.log("-----------------添加学院-----------------", event.coll)
    var res = await univcollDB.get();
    var COLL = res.data.filter(item => { return item._id == "COLL" })[0];
    var collName = COLL.name;
    var collId = COLL.id;
    var collLen = COLL.name.length + 1;
    var coll = event.coll;
    var collid;
    console.log(collName.indexOf(coll), collName)
    if (collName.indexOf(coll) == -1) {
      collid = collLen < 10 ? '00' + collLen : collLen < 100 ? '0' + collLen : String(collLen);
    } else {
      collid = collId[collName.indexOf(coll)]
      
    }
    await univcollDB.doc('COLL').update({
      data: {
        name: _.addToSet(event.coll),
        id: _.addToSet(collid)
      }
    })
    return collid;
  } else if (event.addClass) {
    console.log("-----------------添加班级-----------------", event._class)
    var res = await univcollDB.get();
    var _CLASS = res.data.filter(item => { return item._id == "_CLASS" })[0];
    var _className = _CLASS.name;
    var _classId = _CLASS.id;
    var _classLen = _CLASS.name.length + 1;
    var _class = event._class;
    var _classid;
    if (_className.indexOf(_class) == -1) {
      _classid = _classLen < 10 ? '00' + _classLen : _classLen < 100 ? '0' + _classLen : String(_classLen);
    } else {
      _classid = _classId[_className.indexOf(_class)]
    }
    console.log("_classid：", _classid)
    await univcollDB.doc('_CLASS').update({
      data: {
        name: _.addToSet(_class),
        id: _.addToSet(_classid)
      }
    })
    return _classid;
  } else if (event.removejq) {
    return await jqDB.doc(event.jqid).remove();
  } else if (event.updateList) {
    console.log("--------updateList--------")
    let length = event.list.length;
    var list = event.list;
    var last = list[length - 1];
    var lastInfo = await userDB.where({phone: last.phone}).get();
    console.log(lastInfo.data)
    var lastid;
    if (lastInfo.data.length > 0) {
      lastid = lastInfo.data[0]._id;
    } else {
      lastid = list[length - 1].id
    }
    list[length - 1].id = lastid;
    let numRes = await jqDB.doc(event.jqid).update({
      data: {
        number: _.set(length)
      }
    })
    return await jqDB.doc(event.jqid).update({
      data: {
        list: _.set(list)
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
  } else if (event.submitJQ) {
    console.log("---------------------------保存答卷---------------------------")
    var jqId = event.jqId; // 保存该问卷的答卷
    var userId = event.userId; //提交该用户的答卷
    var currentDay = event.currentDay; //保存日期
    var answerInfo = event.answerInfo; //用户的答卷
    var jqRes = await jqDB.doc(jqId).get();
    var jqInfo = jqRes.data;
    var userRes = await userDB.doc(userId).get();
    var userInfo = userRes.data;
    // 1. 保存该用户的id到jqUser，保存该问卷本阶段提交的人数
    var currentRecord;
    if (jqInfo[currentDay].indexOf(userId) == -1) {
      currentRecord = jqInfo.currentRecord + 1;
    } else {
      currentRecord = jqInfo.currentRecord;
    }
    var task1 = await jqDB.doc(jqId).update({
      data: { jqUser: _.addToSet(userId), currentRecord: currentRecord}
    });
    // 更新用户的答案
    var task2 = await userDB.doc(userId).update({ data: answerInfo })

    // 2. 记录本阶段提交的用户的id， 保存答卷
    var usersId = jqInfo[currentDay] || [];
    usersId = Array.from(new Set(usersId.concat(userId)));
    var obj = {};
    obj[currentDay] = usersId;
    for (let key in answerInfo) {
      if (answerInfo[key] == 0) { answerInfo[key] = '0' }
    }
    obj[userId] = {};
    obj[userId][currentDay] = answerInfo;

    // 
    var list = jqInfo.list;
    var listid = list.map(item => { return item.id }).filter(item => { return item });
    var listphone = list.map(item => { return item.phone });
    // 名单没有该用户
    if (listid.indexOf(userId) == -1) {
      var phone = userInfo.phone || '';
      var index = phone == '' ? listphone.indexOf(phone) : -1;
      if (index != -1) {console.log("有该用户的手机号");list[index].id = userId;
      } else {console.log("没有该用户，手机号")
        var info = {id: uinfo.openid,phone: uinfo.phone,name: uinfo.name}
        list.push(info)
      }
      obj['list'] = list;
    }
    console.log("task2: 记录本阶段提交的用户的id， 保存答卷，更新list。obj:", obj);
    var task3 = await jqDB.doc(jqId).update({ data: obj });
    console.log(task1, task2, task3)
    return task3;
  }
}