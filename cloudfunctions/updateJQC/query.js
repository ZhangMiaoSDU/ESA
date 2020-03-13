const cloud = require('wx-server-sdk');
cloud.init({env: 'esa'})
const db = cloud.database();
const MAX_LIMIT = 100;
const query = async (name) => {
  // 先取出集合记录总数
  const countResult = await db.collection(name).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection(name).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
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
}

module.exports = {
  query: query
}

