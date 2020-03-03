// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')
const COLLECTIONNAME = 'timedtask'
cloud.init({env: 'esa'})
const db = cloud.database();


// 云函数入口函数
exports.main = async (event, context) => {
  let assignedTask = [];
  let execTasks = []; // 待执行任务栈
  let sendEmailTasks = [
  ]; //需要发送邮件的任务栈
  let deletTasks = []; //需要删除的任务栈
  // 1.查询是否有定时任务。（timeingTask)集合是否有数据。
  let taskRes = await db.collection(COLLECTIONNAME).limit(100).get()
  let tasks = taskRes.data;
  // console.log(taskRes)
  // 2.查询定时任务的类型。
  // console.log(new Date().getTime())
  var tiemStamp = new Date().getTime();
  var currentDate = new Date(tiemStamp).getDate(), currentHour = new Date(tiemStamp).getHours(), currentMinute = new Date(tiemStamp).getMinutes();
  var currentDay = new Date(tiemStamp).getDay();
  console.log("tiemStamp: ", tiemStamp, currentDate, currentHour, currentMinute)
  try {
    for (let i = 0; i < tasks.length; i++) {
      let taskType = tasks[i].taskType;
      if (taskType == 0) {
        console.log("一次性问卷", tasks[i]._id);
        // 处理提醒事件
        var isoTimeHour = tasks[i].isoTimeHour;
        // 小时对应
        if (currentHour == isoTimeHour) {
          console.log("一次性问卷 添加一条提醒任务,isoTimeHour, currentHour\n", isoTimeHour, currentHour);
          execTasks.push(tasks[i])
        }
        // 处理邮件时间
        var isoRetimeDate = tasks[i].isoRetimeDate;
        var isoRetimeHour = tasks[i].isoRetimeHour;
        // 小时对应，且提醒日对应
        if (currentHour == isoRetimeHour && isoRetimeDate == currentDate) {
          console.log("一次性问卷 添加一条邮件任务, isoRetimeDate, currentDate, isoRetimeHour, currentHour\n", isoRetimeDate, currentDate, isoRetimeHour, currentHour);
          sendEmailTasks.push(tasks[i])
        }
      } else if (taskType == 1) {
        console.log("按月通知", tasks[i]._id);
        // 处理提醒事件
        var isoTimeDate = tasks[i].isoTimeDate;
        var isoTimeHour = tasks[i].isoTimeHour;
        // 小时对应，且提醒日对应
        if (currentHour == isoTimeHour && isoTimeDate == currentDate) {
          console.log("按月通知 添加一条提醒任务,isoTimeDate, currentDate, isoTimeHour, currentHour\n", isoTimeDate, currentDate, isoTimeHour, currentHour);
          execTasks.push(tasks[i])
        }
        // 处理邮件时间
        var isoRetimeDate = tasks[i].isoRetimeDate;
        var isoRetimeHour = tasks[i].isoRetimeHour;
        // 小时对应，且提醒日对应
        if (currentHour == isoRetimeHour && isoRetimeDate == currentDate) {
          console.log("按月通知 添加一条邮件任务, isoRetimeDate, currentDate, isoRetimeHour, currentHour\n", isoRetimeDate, currentDate, isoRetimeHour, currentHour);
          sendEmailTasks.push(tasks[i])
        }
      } else if (taskType == 2) {
        console.log("每日通知", tasks[i]._id);
        // 处理提醒事件
        var isoTimeHour = tasks[i].isoTimeHour;
        // 小时对应
        if (currentHour == isoTimeHour) {
          console.log("每日通知 添加一条提醒任务,isoTimeHour, currentHour\n", isoTimeHour, currentHour);
          execTasks.push(tasks[i])
        }
        // 处理邮件时间
        var isoRetimeHour = tasks[i].isoRetimeHour;
        // 小时对应
        if (currentHour == isoRetimeHour) {
          console.log("每日通知 添加一条邮件任务, isoRetimeHour, currentHour\n", isoRetimeHour, currentHour);
          sendEmailTasks.push(tasks[i])
        }
      } else if (taskType == 3) {
        console.log("按周通知", tasks[i]._id);
        // 处理提醒事件
        var isoSelectedDay = tasks[i].isoSelectedDay;
        var isoTimeHour = tasks[i].isoTimeHour;
        // 小时对应，且提醒日对应
        if (currentHour == isoTimeHour && isoSelectedDay.indexOf(currentDay) != -1) {
          console.log("按周通知 添加一条提醒任务, currentHour, isoTimeHour, isoSelectedDay, currentDay\n", currentHour, isoTimeHour, isoSelectedDay, currentDay);
          execTasks.push(tasks[i])
        }
        // 处理邮件事件
        var isoReSelectedDay = tasks[i].isoReSelectedDay;
        var isoRetimeHour = tasks[i].isoRetimeHour;
        // 小时对应，且提醒日对应
        if (currentHour == isoRetimeHour && isoReSelectedDay.indexOf(currentDay) != -1) {
          console.log("按周通知 添加一条邮件任务, currentHour, isoTimeHour, isoSelectedDay, currentDay\n", currentHour, isoRetimeHour, isoReSelectedDay, currentDay);
          sendEmailTasks.push(tasks[i])
        }
      }

      // 查询是否到达截止日期
      let deadline = tasks[i].deadline;
      let deadlineTimestamp = new Date(deadline.join('/')).getTime() + 28800000;
      console.log("deadlineTimestamp: ", deadlineTimestamp, new Date().getTime());
      if (new Date().getTime() > deadlineTimestamp) {
        console.log("已到截止日期", tasks[i]._id, deadline)
        deletTasks.push(tasks[i])
      }
    }
  } catch (e) {
    console.error(e)
  }
  // execTasks = [];
  
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
  for (let i = 0; i < assignedTask.length; i++) {
    let task = assignedTask[i];
    const sendEmail = require('sendEmail.js')
    try {
      let mail = 'liangguo349@163.com';
      // console.log(sendEmailTasks) 
      let res = await sendEmail.sendEmail(task.jqid, task.name, mail);
    } catch (e) {
      console.error(e)
    }
  }
  // sendEmailTasks = [
  //   {
  //     _id: '',
  //     jqid: "7d79e8035e4eac9701a42a146735458b",
  //     mail: "2549360836@qq.com",
  //     name: "Q1",
  //   }
  // ]
  
  // 处理需要发送邮件的任务
  for (let i = 0; i < sendEmailTasks.length; i++) {
    let task = sendEmailTasks[i];
    const sendEmail = require('sendEmail.js')
    try {
      // console.log(sendEmailTasks) 
      let res = await sendEmail.sendEmail(task.jqid, task.name, task.mail);
      console.log(res)
      if (task.secEmail && task.secEmail.trim() != '') {
        await sendEmail.sendEmail(task.jqid, task.name, task.secEmail)
      }
    } catch (e) {
      console.error(e)
    }
  }
  // deletTasks = []
  // 删除任务
  for (let i = 0; i < deletTasks.length; i++) {
    let task = deletTasks[i];
    let res = await db.collection(COLLECTIONNAME).doc(task._id).remove();
    console.log("删除任务： ", res)
    let jqres = await db.collection('jq').doc(task.jqid).remove();
    console.log("删除问卷： ", res)
  }
}