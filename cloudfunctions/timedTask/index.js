// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')
const COLLECTIONNAME = 'timedtask'
cloud.init({env: 'esa'})
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const execTasks = [
   
  ]; // 待执行任务栈
  const sendEmailTasks = [
    // {
    //   _id: '',
    //   jqid: "f5f6a9235e4c9fd100be0a6a3adeb5f3",
    //   mail: "2549360836@qq.com",
    //   name: "Q1",
    // }
  ]; //需要发送邮件的任务栈
  const deletTasks = []; //需要删除的任务栈
  // 1.查询是否有定时任务。（timeingTask)集合是否有数据。
  let taskRes = await db.collection(COLLECTIONNAME).limit(100).get()
  let tasks = taskRes.data;
  console.log(taskRes)
  // 2.查询定时任务的类型。
  // console.log(new Date().getTime())
  var tiemStamp = new Date().getTime();
  var currentDate = new Date(tiemStamp).getDate(), currentHour = new Date(tiemStamp).getHours(), currentMinute = new Date(tiemStamp).getMinutes();

  console.log("tiemStamp: ", tiemStamp, currentDate, currentHour, currentMinute)
  try {
    for (let i = 0; i < tasks.length; i++) {
      let taskType = tasks[i].taskType;
      let isoModeDetail = tasks[i].isoModeDetail;
      let isoDeadline = tasks[i].isoDeadLine;
      let isoDeadlineDate = isoDeadline[0];
      let isoReDetail = tasks[i].isoReDetail;
      if (taskType == 0) {
        console.log("一次性问卷");
        var alertreHour = isoReDetail[0];
        var alertreMinute = isoReDetail[1];
        console.log(alertreHour, alertreMinute, currentHour)
        if (currentHour == alertreHour && isoDeadlineDate == currentDate) {
          sendEmailTasks.push(tasks[i])
        }
        // console.log(sendEmailTasks)
      } else if (taskType == 1) {
        console.log("按月通知");
        console.log([currentDate, currentHour, currentMinute], isoModeDetail)
        // 如果当前的月份，时间和既定的月份时间相同，则将其认为是要执行的任务；
        var alertDate = isoModeDetail[0];
        var alertHour = isoModeDetail[1];
        var alertMinute = isoModeDetail[2];
        if (currentDate == alertDate && currentHour == alertHour) {
          execTasks.push(tasks[i])
        } 
        var alertreDate = isoReDetail[0];
        var alertreHour = isoReDetail[1];
        var alertreMinute = isoReDetail[2];
        if (currentDate == alertreDate && currentHour == alertreHour) {
          sendEmailTasks.push(tasks[i])
        }
      } else if (taskType == 2) {
        console.log("每日通知");
        console.log([currentDate, currentHour, currentMinute], isoModeDetail)
        // 如果当前的时间和既定的通知时间相同，则将其列为要执行的任务；
        var alertHour = isoModeDetail[0];
        var alertMinute = isoModeDetail[1];
        if (currentHour == alertHour) {
          execTasks.push(tasks[i])
        }
        var alertreHour = isoReDetail[0];
        var alertreMinute = isoReDetail[1];
        if (currentHour == alertreHour) {
          sendEmailTasks.push(tasks[i])
        }
      }

      // 查询是否到达截止日期
      let deadline = tasks[i].deadline;
      let deadlineTimestamp = new Date(deadline.join('/')).getTime() + 28800000;
      console.log("deadlineTimestamp: ", deadlineTimestamp, new Date().getTime());
      if (new Date().getTime() > deadlineTimestamp) {
        console.log("已到截止日期")
        deletTasks.push(tasks[i])
      }
    }
  } catch (e) {
    console.error(e)
  }
  // 3.处理待执行任务，依次发送通知
  for (let i = 0; i < execTasks.length; i++) {
    let task = execTasks[i];
    const alert = require('alert.js')
    try {
      await alert.alert(task.jqid, task.name)
    } catch (e) {
      console.error(e)
    }
  }
  // 处理需要发送邮件的任务
  for (let i = 0; i < sendEmailTasks.length; i++) {
    let task = sendEmailTasks[0];
    const sendEmail = require('sendEmail.js')
    try {
      // console.log(sendEmailTasks) 
      await sendEmail.sendEmail(task.jqid, task.name, task.mail)
      if (task.secEmail && task.secEmail.trim() != '') {
        await sendEmail.sendEmail(task.jqid, task.name, task.secEmail)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // 删除任务
  for (let i = 0; i < deletTasks.length; i++) {
    let task = deletTasks[i];
    let res = await db.collection(COLLECTIONNAME).doc(task._id).remove();
    console.log("删除任务： ", res)
    let jqres = await db.collection('jq').doc(task.jqid).remove();
    console.log("删除问卷： ", res)
  }
}