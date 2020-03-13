// 云函数入口文件
const cloud = require('wx-server-sdk')
const COLLECTIONNAME = 'timedtask'
cloud.init({ env: 'esa' })
const db = cloud.database();
const query = require('query.js');
const formatTime = require('formatTime.js');
const intervalTime = 8 * 60 * 60 * 1000; //8个小时
function timestampToTime(timestamp) {
  var gmtTimestamp = new Date(timestamp).getTime();
  const date = new Date(gmtTimestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`
}
// 云函数入口函数
exports.main = async (event, context) => {
  var res = await query.query('jq');
  console.log(res);
  var jqs = res.data;
  for (let i = 0; i<jqs.length; i++) {
    var jq = jqs[i];
    if (jq.type == 0) {
      console.log("一次性：", jq._id);
      var startTime = timestampToTime(jq.creationTime);//开始时间，gmt
      console.log("startTime: ", startTime);
      let deadline = jq.deadline.split('-').join('/');//截止日期
      var currentPeriod = [startTime.split('-').join('/'), deadline];
      var resU = await db.collection('jq').doc(jq._id).update({data: {currentPeriod: currentPeriod}})
      console.log(resU)
    }
    if (jq.type == 1) {
      console.log("按月通知：", jq._id);
      var day = jq.date;
      var startTime = timestampToTime(jq.creationTime);//开始时间，gmt
      console.log("startTime: ", startTime);
      let deadline = jq.deadline.split('-').join('/');//截止日期
      let endTime;
      var deadlineTime = timestampToTime(deadline)
      endTime = deadlineTime;
      console.log("endTime: ", endTime)
      var dateList = formatTime.formatEveryMonthDay(startTime, endTime, day);
      console.log(dateList);
      var currentDay, currentPeriod, priviousPeriod;
      var now = new Date().getTime();//当前时间戳
      for (let i = 0; i < dateList.length; i++) {
        var dateTimestamp = new Date(dateList[i]).getTime();
        var nextdateTimestamp = new Date(dateList[i + 1]).getTime();
        if (now >= dateTimestamp && now < nextdateTimestamp) {
          currentDay = dateList[i];
          if (i > 0) {
            priviousPeriod = [dateList[i - 1], dateList[i]]
          }
          currentPeriod = [dateList[i], dateList[i + 1]];
        }
        if (now >= dateTimestamp && !nextdateTimestamp) {
          currentDay = dateList[i];
          if (i > 0) {
            priviousPeriod = [dateList[i - 1], dateList[i]]
          }
          currentPeriod = [dateList[i], endTime.split('-').join('/')];
        }
      }
      console.log("current period: ", currentPeriod, "priviousPeriod: ", priviousPeriod);
      var resU = await db.collection('jq').doc(jq._id).update({ 
        data: { currentPeriod: currentPeriod, priviousPeriod: priviousPeriod } 
      })
      console.log(resU)
    }
    if (jq.type == 2) {
      console.log("按日通知", jq._id);
      var currentPeriod = timestampToTime(new Date());
      var resU = await db.collection('jq').doc(jq._id).update({ data: { currentPeriod: currentPeriod } })
      console.log(resU)
    }
    if (jq.type == 3) {
      console.log("按周通知：", jq._id)
      var selectedDay = jq.selectedDay;
      var startTime = timestampToTime(jq.creationTime);//开始时间，gmt
      console.log("startTime: ", startTime);
      let deadline = jq.deadline.split('-').join('/');//截止日期
      let endTime;
      var deadlineTime = timestampToTime(deadline)
      endTime = deadlineTime;
      console.log("endTime: ", endTime)
      var dateList = formatTime.formatEveryWeekDay(startTime, endTime, selectedDay);
      // console.log(dateList);
      var currentDay, currentPeriod, priviousPeriod;
      var now = new Date().getTime();//当前时间戳
      for (let i = 0; i < dateList.length; i++) {
        var dateTimestamp = new Date(dateList[i]).getTime();
        var nextdateTimestamp = new Date(dateList[i + 1]).getTime();
        if (now >= dateTimestamp && now < nextdateTimestamp) {
          currentDay = dateList[i];
          if (i > 0) {
            priviousPeriod = [dateList[i - 1], dateList[i]]
          }
          currentPeriod = [dateList[i], dateList[i + 1]];
        }
        if (now >= dateTimestamp && !nextdateTimestamp) {
          currentDay = dateList[i];
          if (i > 0) {
            priviousPeriod = [dateList[i - 1], dateList[i]]
          }
          currentPeriod = [dateList[i], endTime.split('-').join('/')];
        }
      }
      console.log("current period: ", currentPeriod, "priviousPeriod: ", priviousPeriod);
      var resU = await db.collection('jq').doc(jq._id).update({ 
        data: { currentPeriod: currentPeriod, priviousPeriod: priviousPeriod } 
      })
      console.log(resU)
    }
    
  }
}