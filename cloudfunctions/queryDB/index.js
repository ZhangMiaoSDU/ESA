// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: 'esa'})
const db = cloud.database();
const _ = db.command
const userDB = db.collection('user')
const jqDB = db.collection('jq');
const jqtemplateDB = db.collection("jqtemplate");

const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  if (event._DBName === 'question') {
    // 先取出集合记录总数
    const countResult = await db.collection(event._DBName).count()
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection(event._DBName).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      tasks.push(promise)
    }
    if (tasks.length > 0) {
      // 等待所有
      return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
          data: acc.data.concat(cur.data),
          errMsg: acc.errMsg,
        }
      })
    } else {
      return;
    }
  } else if (event._DBName == 'jq') {
    // 先取出集合记录总数
    const countResult = await jqDB.count()
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = jqDB.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      tasks.push(promise)
    }
    if (tasks.length > 0) {
      // 等待所有
      return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
          data: acc.data.concat(cur.data),
          errMsg: acc.errMsg,
        }
      })
    } else {
      return;
    }
  } else if (event.queryJQ) {
    // 先取出集合记录总数
    const countResult = await jqDB.count()
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = jqDB.where({ creator: event.userId })
        .skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      tasks.push(promise)
    }
    console.log(tasks)
    if (tasks.length > 0) {
      // 等待所有
      return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
          data: acc.data.concat(cur.data),
          errMsg: acc.errMsg,
        }
      })
    } else {
      return;
    }
  } else if (event.queryJQTemplate) {
    // 先取出集合记录总数
    const countResult = await jqtemplateDB.count()
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = jqtemplateDB.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      tasks.push(promise)
    }
    console.log(tasks)
    if (tasks.length > 0) {
      // 等待所有
      return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
          data: acc.data.concat(cur.data),
          errMsg: acc.errMsg,
        }
      })
    } else {
      return;
    }
  } else if (event.queryJQPhone) {
    let currentUser = await db.collection('user').doc(event.userId).get();
    let userphone = currentUser.data.phone;
    let jqRes = await db.collection('jq').where({
      list: _.elemMatch({ phone: userphone})
    }).get();
    console.log(jqRes)
    let jqsInfo = jqRes.data;
    let usersId = jqsInfo.map(item => {return item.creator});
    let tasks = [];
    for (let i = 0; i < usersId.length; i++) {
      tasks.push(userDB.doc(usersId[i]).get())
    }
    let usersRes = await Promise.all(tasks);
    console.log(usersRes);
    let usersInfo = usersRes.map(item => { return item.data });
    for (let i = 0; i < jqsInfo.length; i++) {
      let user = usersInfo.filter(item => {return item._id == jqsInfo[i].creator})[0];
      console.log(user, user.name);
      jqsInfo[i].creatorName = user.name;
    }
    // console.log(jqsInfo);
    return jqsInfo
  } else if (event.queryJQId) {
    let jqRes = await db.collection('jq').where({
      creationTime: event.id
    }).get();
    if (jqRes.data.length > 0) {
      let jqInfo = jqRes.data[0];
      console.log(jqInfo)
      let creatorRes = await userDB.doc(jqInfo.creator).get();
      jqInfo.creatorName = creatorRes.data.name;
      return jqInfo
    } else {
      return null;
    }
  } else if (event.queryUnfilled) {
    var data = event.data;
    for (let i = 0; i<data.length; i++) {
      let userRes = await userDB.where({phone: data[i].phone}).get();
      console.log("userRes: ", i, userRes);
      data[i].id = userRes.data[0] ? userRes.data[0]._id : undefined;
    }
    console.log(data);
    return data;
  }
}