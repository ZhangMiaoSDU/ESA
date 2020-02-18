// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')
cloud.init({ env: 'esa' })
const db = cloud.database();
COLLECTIONNAME = 'intstd'
// 云函数入口函数
exports.main = async (event, context) => {
  const execTasks = []; // 待执行任务栈
  // 1.查询是否有定时任务。（timeingTask)集合是否有数据。
  let taskRes = await db.collection(COLLECTIONNAME).limit(100).get();
  let tasks = taskRes.data;
  console.log(taskRes);
  try {
    for (let i = 0; i < tasks.length; i++) {
      execTasks.push(tasks[i]);
      // 定时任务数据库中删除该任务
      let res = await db.collection(COLLECTIONNAME).doc(tasks[i]._id).remove();
      console.log(res);
    }
  } catch (e) {
    console.error(e)
  }
  // 3.处理待执行任务，依次发送通知
  for (let i = 0; i < execTasks.length; i++) {
    let task = execTasks[i];
    const sendEmail = require('sendEmail.js')
    try {
      await sendEmail.sendEmail(task.name, task.mail)
    } catch (e) {
      console.error(e)
    }
  }

}