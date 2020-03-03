// 云函数入口文件
const cloud = require('wx-server-sdk')
//这里最好也初始化一下你的云开发环境
cloud.init({
  env: "esa"
})
const db = cloud.database();
//操作excel用的类库
const xlsx = require('node-xlsx');
const intervalTime = 8 * 60 * 60 * 1000; //8个小时
function getFTime() {
  var timeStamp = new Date().getTime();
  var gmtTimeStamp = timeStamp + intervalTime; //gmt比iso多八个小时
  var month = (new Date(gmtTimeStamp).getMonth() + 1) < 10 ? '0' + (new Date(gmtTimeStamp).getMonth() + 1) : (new Date(gmtTimeStamp).getMonth() + 1);
  var date = new Date(gmtTimeStamp).getDate() < 10 ? '0' + new Date(gmtTimeStamp).getDate() : new Date(gmtTimeStamp).getDate()
  return [new Date().getFullYear(), month, date].join('/')
}
function getDate(datestr) {
  var temp = datestr.split("-");
  var date = new Date(temp[0], temp[1] - 1, temp[2]);
  return date;
}
function getFTime() {
  var timeStamp = new Date().getTime();
  var gmtTimeStamp = timeStamp + intervalTime; //gmt比iso多八个小时
  var month = (new Date(gmtTimeStamp).getMonth() + 1) < 10 ? '0' + (new Date(gmtTimeStamp).getMonth() + 1) : (new Date(gmtTimeStamp).getMonth() + 1);
  var date = new Date(gmtTimeStamp).getDate() < 10 ? '0' + new Date(gmtTimeStamp).getDate() : new Date(gmtTimeStamp).getDate()
  return [new Date().getFullYear(), month, date].join('/')
}
function formatEveryDay(start, end) {
  let dateList = [];
  var startTime = getDate(start);
  var endTime = getDate(end);

  while ((endTime.getTime() - startTime.getTime()) >= 0) {
    var year = startTime.getFullYear();
    var month = startTime.getMonth() + 1 < 10 ? '0' + (startTime.getMonth() + 1) : startTime.getMonth() + 1;
    var day = startTime.getDate().toString().length == 1 ? "0" + startTime.getDate() : startTime.getDate();
    dateList.push(year + "/" + month + "/" + day);
    startTime.setDate(startTime.getDate() + 1);
  }
  return dateList;
}


function formatEveryMonthDay(start, end, day) {
  let dateList = [];
  var startTime = getDate(start);
  var endTime = getDate(end);
  var dayCount = 0;
  while ((endTime.getTime() - startTime.getTime()) >= 0) {
    var year = startTime.getFullYear();
    var month = startTime.getMonth() + 1 < 10 ? '0' + (startTime.getMonth() + 1) : startTime.getMonth() + 1;
    dayCount = new Date(year, month, 0).getDate();//本月的天数
    var date = startTime.getDate() < 10 ? "0" + startTime.getDate() : startTime.getDate();
    console.log("day:", day, date, Number(date))
    if (day == Number(date)) {
      var dayf = day < 10 ? '0' + day : day;
      dateList.push(year + "/" + month + "/" + dayf);
    }
    // 如果设定日大于本月的天数，只添加一次
    if (Number(date) == dayCount) {
      if (day > dayCount) {
        dateList.push(year + "/" + month + "/" + dayCount);
      }
    }
    startTime.setDate(startTime.getDate() + 1);
  }
  return dateList;
}

function formatEveryWeekDay(start, end, weekday) {
  let dateList = [];
  var startTime = getDate(start);
  var endTime = getDate(end);
  while ((endTime.getTime() - startTime.getTime()) >= 0) {
    var year = startTime.getFullYear();
    var month = startTime.getMonth() + 1 < 10 ? '0' + (startTime.getMonth() + 1) : startTime.getMonth() + 1;
    var date = startTime.getDate().toString().length == 1 ? "0" + startTime.getDate() : startTime.getDate();
    // 查看周几
    var time = year + "/" + month + "/" + date;
    var day = new Date(time).getDay();
    if (weekday.indexOf(day) != -1) {
      dateList.push(time);
    }
    startTime.setDate(startTime.getDate() + 1);
  }
  return dateList;
}


function timestampToTime(timestamp) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`
}
function formatData(questionsInfo, usersInfo, currentjqInfo, dateList) {
  let questionDict = {};
  let header = [];
  header.push('用户');
  header.push('学号');
  header.push('所在学院');
  header.push('所在班级');
  // console.log("questionsInfo: ", questionsInfo);
  questionsInfo.map(item => {
    questionDict[item._id] = { content: item.content, type: item.type, options: item.options ? item.options : [] };
    header.push(item.content)
  });
  // console.log("questionDict: ", questionDict);
  let pTemOptions = questionDict['032032b3-62d9-48d4-8589-e28ac7b29465'].options;//上午温度是否超过37.3
  let aTemOptions = questionDict['72529d59-22a5-4fcc-8ea6-556ee62f7283'].options;//下午温度是否超过37.3
  let clocationOptions = questionDict['8727263e-fb7e-450e-ab95-44a68f3d1bd4'].options;//目前所在地
  let isOutOptions = questionDict['4908cf0f-5596-497c-94a1-0fd7cde3a44f'].options;//是否外出
  let healthOptions = questionDict['a0a9b783-1201-4410-b358-88807a57c943'].options;//今日健康状况
  let summaryDict = [];
  for (let i = 0; i < dateList.length; i++) {
    let date = dateList[i];
    let allUsersSummary = []
    allUsersSummary.push(header);
    usersInfo.map(userInfo => {
      let userId = userInfo._id;
      let userAnswer = currentjqInfo[userId][date];
      let _array = [];
      if (userAnswer) {
        _array.push(userId);
        _array.push(userInfo.stdID);
        _array.push(userInfo.coll);
        _array.push(userInfo._class);
        let pTemp = pTemOptions[userAnswer['032032b3-62d9-48d4-8589-e28ac7b29465']]; // 是 / 否
        let aTemp = aTemOptions[userAnswer['72529d59-22a5-4fcc-8ea6-556ee62f7283']]; // 是 / 否
        let clocation = clocationOptions[userAnswer['8727263e-fb7e-450e-ab95-44a68f3d1bd4']];// 国内 / 国外
        let isOut = isOutOptions[userAnswer['4908cf0f-5596-497c-94a1-0fd7cde3a44f']]; // 是 / 否
        let health = healthOptions[userAnswer['a0a9b783-1201-4410-b358-88807a57c943']]; // 健康 / 发烧 / 咳嗽/。。。。
        // console.log("health, healthOptions ==============> health, healthOptions: ", health, healthOptions)
        for (let key in questionDict) {
          if (userAnswer[key]) {
            // console.log(`---------------${key}--------------`)
            if (questionDict[key].type == 1) {

              if (key == '22c88c33-ae9f-45ad-99a5-d90d9563f7fa' && pTemp == '否') {
                // console.log("上午温度未超过37.3度")
                userAnswer[key] = ' '
              }
              if (key == 'c2997719-aeab-488f-8d3b-3c83a8f86578' && aTemp == '否') {
                // console.log("下午温度未超过37.3度")
                userAnswer[key] = ' '
              }
              // 如果填写国外
              if (['7aac6806-9200-496a-becc-bb35c028a495', 'b250830e-a5e3-4100-8a27-76ae8ded13ea', '6e6f99df-baeb-4854-8cea-18a617dd1a2d', '33c59194-fc0b-4415-b69b-5c132c49eda7'].indexOf(key) != -1 && clocation == '国外') {
                // console.log("省，市，县，详细地址")
                userAnswer[key] = ' '
              }
              // 如果填写国内
              if (key == "8dd557ee-7a6d-42ee-a0f2-4645b091f1c6" && clocation == '国外') {
                // console.log("国外地址")
                userAnswer[key] = ' '
              }
              // 如果没有外出
              if (['2fbf16e9-0cca-4a6a-8574-edef2c5ef482', 'c8dde463-f35f-45a9-b852-654253994947'].indexOf(key) != -1 && isOut == '否') {
                // console.log("没有外出")
                userAnswer[key] = ' '
              }

              if (key == "63201958-91a3-47c0-bab6-cab9c661b625" && userAnswer[key] == '无') {
                // console.log("当日活动情况与地点");
                userAnswer[key] = ' '
              }
              _array.push(userAnswer[key])
            } else {
              var index = userAnswer[key];

              // 是否接受治疗，是否已康复
              if (['88c4f335-5021-4dc6-80a4-f36a2134e451', 'e682ed67-6585-4c40-8f36-6ceeda28a531'].indexOf(key) != -1 && health == '健康') {
                // console.log("健康")
                _array.push(' ')
              } else {
                _array.push(questionDict[key].options[index])
              }
            }
          } else {
            _array.push("未填写")
          }
        }
        // console.log(_array)
        allUsersSummary.push(_array);
      }
    })
    // console.log("allUsersSummary: ", allUsersSummary);
    summaryDict.push({
      name: date.split('/').join('-'),
      data: allUsersSummary
    })
  }
  return summaryDict;
}
// 云函数入口函数
exports.main = async (event, context) => {
  var id = event.jqid;
  // 格式化数据
  let jqRes = await db.collection("jq").doc(id).get();
  let jqInfo = jqRes.data;
  let jqUser = jqInfo.jqUser || [];
  let tasksUser = [];
  for (let i = 0; i < jqUser.length; i++) {
    tasksUser.push(db.collection("user").doc(jqUser[i]).get())
  }
  let usersRes = await Promise.all(tasksUser);
  // console.log(usersRes)
  let usersInfo = usersRes.map(item => { return item.data });
  // console.log("usersInfo: ", usersInfo);

  let jqQuestions = jqInfo.questions || [];
  if (jqQuestions.length == 0) {
    console.log("该问卷没有问题。")
    return 0;
  }
  let tasks = [];
  for (let i = 0; i < jqQuestions.length; i++) {
    tasks.push(db.collection("question").doc(jqQuestions[i]).get())
  }
  let questionsRes = await Promise.all(tasks);
  // console.log(questionsRes)
  let questionsInfo = questionsRes.map(item => { return item.data });
  // console.log(questionsInfo);
  // 
  var startTime = timestampToTime(jqInfo.creationTime + intervalTime);//开始时间，gmt
  console.log("startTime: ", startTime);
  let nowTime = timestampToTime(new Date().getTime() + intervalTime);//当前时间
  console.log("nowTime: ", nowTime)
  let deadline = jqInfo.deadline.split('-').join('/');//截止日期
  let endTime;
  if (new Date().getTime() < new Date(deadline).getTime()) {
    console.log('还未到截止日期');
    endTime = nowTime;
  } else {
    var deadlineTime = timestampToTime(deadline)
    endTime = deadlineTime
  }
  console.log("endTime: ", endTime)
  let dateList = formatEveryDay(startTime, endTime);
  if (jqInfo.type == 0) {
    console.log("一次性");
    dateList = [deadline];
  }
  if (jqInfo.type == 1) {
    console.log("按月");
    var date = jqInfo.date;
    dateList = formatEveryMonthDay(startTime, endTime, date);
  }
  if (jqInfo.type == 3) {
    console.log("按周");
    var selectedDay = jqInfo.selectedDay;
    dateList = formatEveryWeekDay(startTime, endTime, selectedDay)
  }
  console.log(startTime, endTime, '\n', dateList);
  var summaryDict = formatData(questionsInfo, usersInfo, jqInfo, dateList);
  // return;
  try {
    //1,定义excel表格名
    let dataCVS = `${event.name}.xlsx`
    
    //3，把数据保存到excel里
    var buffer = await xlsx.build(summaryDict);
    //4，把excel文件保存到云存储里
    return await cloud.uploadFile({
      cloudPath: dataCVS,
      fileContent: buffer, //excel二进制文件
    })

  } catch (e) {
    console.error(e)
    return e
  }
}

