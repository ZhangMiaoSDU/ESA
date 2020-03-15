// 云函数入口文件
const cloud = require('wx-server-sdk')
const templateMessage = require('templateMessage.js')
cloud.init({env: 'esa'})
const COLLECTIONNAME = 'jq';
const db = cloud.database();
const requiredQuestionId = [
  "50d28a07-bc53-420a-b715-4a43a68195e2", "a0a9b783-1201-4410-b358-88807a57c943", "e38c5ea9-05f4-41de-b41b-521a3ce2ef67", 
  "032032b3-62d9-48d4-8589-e28ac7b29465", '22c88c33-ae9f-45ad-99a5-d90d9563f7fa', '72529d59-22a5-4fcc-8ea6-556ee62f7283', 
  'c2997719-aeab-488f-8d3b-3c83a8f86578', 
  '13ea9ed0-e029-4644-b98b-9d00177ef0d5',//本人是否有发热情况，是，否
  '4d58186c-48d2-4164-9a17-f27ad8d6f998',//
  '66e28d49-070e-433b-8bcb-64f521fb147e', //目前本人状况
  "96388225-6d99-4d4b-b0b4-04f8251a92e1",
  "79596ff4-dbf9-4651-95e8-779d65e7ec8e",
  'd373a160-02a6-4003-8dcb-5ba014d5a698',
  '5ed3af17-5551-4f35-8fb8-f09e8c058dc3',
  'c135e246-c78e-4d98-8974-796aa6c2b2ef',
  '94e0b507-b302-41a1-8f5b-bac6e833f92f',
  
];

function getFTime() {
  let month = String((new Date().getMonth() + 1)).length == 1 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)
  return [new Date().getFullYear(), month, new Date().getDate()].join('/')
}
const sendEmailToTutor = require('sendtotutor.js')
// 云函数入口函数
exports.main = async (event, context) => {
  sendEmailToTutor.sendEmailToTutor();
  return;
  let isoTime = getFTime();//当前日期
  let tasks = [];
  for (let i = 0; i < requiredQuestionId.length; i++) {
    tasks.push(db.collection("question").doc(requiredQuestionId[i]).get())
  }
  let questionsRes = await Promise.all(tasks);
  // console.log(questionsRes)
  let questionsInfo = questionsRes.map(item => { return item.data });
  // console.log(questionsInfo);

  const execTasks = []; //待执行任务栈
  // 1.查询是否有异常数据。
  let jqRes = await db.collection(COLLECTIONNAME).limit(100).get()
  let jqs = jqRes.data;
  // jqs = jqs.filter(item => { return item._id == "e30d61715e4e20250161479b12d633df"})
  for (let i = 0; i < jqs.length; i++) {
    let jqInfo = jqs[i];
    let todayFilledId = jqInfo[isoTime] || [];
    // console.log(todayFilledId)
    let tasksUser = [];
    for (let i = 0; i < todayFilledId.length; i++) {
      tasksUser.push(db.collection("user").doc(todayFilledId[i]).get())
    }
    let usersRes = await Promise.all(tasksUser);
    // console.log(usersRes)
    let todayFilledInfos = usersRes.map(item => { return item.data });
    // console.log("todayFilledInfo: ", todayFilledInfos);

    todayFilledInfos.map(filledInfo => {
      let filledId = filledInfo._id;//今日填写调查的成员id
      let filledAnswer = jqInfo[filledId][isoTime];//该成员的答卷
      let temperature = false;
      for (let j = 0; j < questionsInfo.length; j++) {
        let questionInfo = questionsInfo[j];
        let answer = filledAnswer[questionInfo._id];
        
        if (answer || answer == 0) {
          if (questionInfo._id == '50d28a07-bc53-420a-b715-4a43a68195e2') {
            let options = questionInfo.options;
            let optionanswer = options[filledAnswer[questionInfo._id]]
            console.log('questionInfo.type == 0 ------------> answer: ', optionanswer)
            if (optionanswer == '是' && filledId != 'ogesF5pzNo3t7xjTxA5o4HtHcmqM') {
              console.log("==============添加在校异常情况==============")
              execTasks.push({
                userName: filledInfo.name,
                userClass: filledInfo._class || '未填写',
                situation: '在校情况异常。',
                jqid: jqInfo._id,
                email: jqInfo.mail,
                secEmail: jqInfo.secEmail,
                _3rdEmail: jqInfo._3rdEmail,
                creator: jqInfo.creator,
                secCreator: jqInfo.secCreator,
                _3rdCreator: jqInfo._3rdCreator,
              })
            }
            
          }
          if (questionInfo._id == 'a0a9b783-1201-4410-b358-88807a57c943') {
            let options = questionInfo.options;
            let optionanswer = options[filledAnswer[questionInfo._id]]
            console.log('questionInfo.type == 0 ------------> answer: ', optionanswer)
            if (optionanswer != '健康') {
              console.log("==============添加健康异常情况==============")

              execTasks.push({
                userName: filledInfo.name,
                userClass: filledInfo._class || '未填写',
                situation: '健康状况异常。',
                jqid: jqInfo._id,
                email: jqInfo.mail,
                secEmail: jqInfo.secEmail,
                _3rdEmail: jqInfo._3rdEmail,
                creator: jqInfo.creator,
                secCreator: jqInfo.secCreator,
                _3rdCreator: jqInfo._3rdCreator,
              })
            }
            
          }
          if (questionInfo._id == 'e38c5ea9-05f4-41de-b41b-521a3ce2ef67' || questionInfo._id == '66e28d49-070e-433b-8bcb-64f521fb147e') {
            let options = questionInfo.options;
            let optionanswer = options[filledAnswer[questionInfo._id]]
            console.log('questionInfo.type == 0 ------------> answer: ', optionanswer)
            if (optionanswer != '正常') {
              console.log("==============添加本人异常情况==============")

              execTasks.push({
                userName: filledInfo.name,
                userClass: filledInfo._class || '未填写',
                situation: '本人状态异常。',
                jqid: jqInfo._id,
                email: jqInfo.mail,
                secEmail: jqInfo.secEmail,
                _3rdEmail: jqInfo._3rdEmail,
                creator: jqInfo.creator,
                secCreator: jqInfo.secCreator,
                _3rdCreator: jqInfo._3rdCreator,
              })
            }
          }
          if (requiredQuestionId.slice(3, 9).indexOf(questionInfo._id) != -1) {
            if (questionInfo._id == '032032b3-62d9-48d4-8589-e28ac7b29465' 
              || questionInfo._id == '72529d59-22a5-4fcc-8ea6-556ee62f7283'
              || questionInfo._id == '13ea9ed0-e029-4644-b98b-9d00177ef0d5'
              || questionInfo._id == '4d58186c-48d2-4164-9a17-f27ad8d6f998') {
              let options = questionInfo.options;
              let optionanswer = options[filledAnswer[questionInfo._id]]
              console.log('questionInfo.type == 0 ------------> answer: ', optionanswer)
              if (optionanswer == '是') {
                temperature = true;
              }
            }
            if (questionInfo._id == '22c88c33-ae9f-45ad-99a5-d90d9563f7fa' || questionInfo._id == 'c2997719-aeab-488f-8d3b-3c83a8f86578') {
              if (answer.indexOf('度') != -1) {
                answer = Number(answer.split('度').join('')) ? Number(answer.split('度').join('')) : Number(answer.slice(0, 4))
              } else {
                answer = Number(answer);
              }
              if (answer >= 37.3) {
                temperature = true;
              }
            }
          } 
          if (questionInfo._id == "96388225-6d99-4d4b-b0b4-04f8251a92e1" || questionInfo._id == "79596ff4-dbf9-4651-95e8-779d65e7ec8e" || questionInfo._id == 'd373a160-02a6-4003-8dcb-5ba014d5a698') {
            let options = questionInfo.options;
            let optionanswer = options[filledAnswer[questionInfo._id]]
            console.log('questionInfo.type == 0 ------------> answer: ', optionanswer)
            if (optionanswer == '是') {
              console.log("==============添加接触异常情况==============")

              execTasks.push({
                userName: filledInfo.name,
                situation: '曾接触聚集性发病的患者.',
                jqid: jqInfo._id,
                userClass: filledInfo._class || '未填写',
                email: jqInfo.mail,
                secEmail: jqInfo.secEmail,
                _3rdEmail: jqInfo._3rdEmail,
                creator: jqInfo.creator,
                secCreator: jqInfo.secCreator,
                _3rdCreator: jqInfo._3rdCreator,
              })
            }
          }

          if (questionInfo._id == '5ed3af17-5551-4f35-8fb8-f09e8c058dc3' || questionInfo._id == 'c135e246-c78e-4d98-8974-796aa6c2b2ef') {
            let options = questionInfo.options;
            let optionanswer = options[filledAnswer[questionInfo._id]]
            console.log('questionInfo.type == 0 ------------> answer: ', optionanswer)
            if (optionanswer == '是') {
              console.log("==============添加湖北异常情况==============")

              execTasks.push({
                userName: filledInfo.name,
                situation: '与湖北有关.',
                jqid: jqInfo._id,
                userClass: filledInfo._class || '未填写',
                email: jqInfo.mail,
                secEmail: jqInfo.secEmail,
                _3rdEmail: jqInfo._3rdEmail,
                creator: jqInfo.creator,
                secCreator: jqInfo.secCreator,
                _3rdCreator: jqInfo._3rdCreator,
              })
            }
          }
          // 94e0b507-b302-41a1-8f5b-bac6e833f92f
          if (questionInfo._id == '94e0b507-b302-41a1-8f5b-bac6e833f92f') {
            let options = questionInfo.options;
            let optionanswer = options[filledAnswer[questionInfo._id]]
            console.log('questionInfo.type == 0 ------------> answer: ', optionanswer)
            if (optionanswer == '是') {
              console.log("==============添加报告病例社区异常情况==============")

              execTasks.push({
                userName: filledInfo.name,
                situation: '与报告病例社区有关.',
                jqid: jqInfo._id,
                userClass: filledInfo._class || '未填写',
                email: jqInfo.mail,
                secEmail: jqInfo.secEmail,
                _3rdEmail: jqInfo._3rdEmail,
                creator: jqInfo.creator,
                secCreator: jqInfo.secCreator,
                _3rdCreator: jqInfo._3rdCreator,
              })
            }
          }
        }
      }
      if (temperature) {
        console.log("==============添加体温异常情况==============")

        execTasks.push({
          userName: filledInfo.name,
          situation: '体温情况异常。',
          jqid: jqInfo._id,
          userClass: filledInfo._class || '未填写',
          email: jqInfo.mail,
          secEmail: jqInfo.secEmail,
          _3rdEmail: jqInfo._3rdEmail,
          creator: jqInfo.creator,
          secCreator: jqInfo.secCreator,
          _3rdCreator: jqInfo._3rdCreator,
        })
      }
    })
  }
  console.log(execTasks.length);
  // 3.处理待执行任务，依次发送通知
  for (let i = 0; i < execTasks.length; i++) {
    let task = execTasks[i];
    const alert = require('alert.js');
    console.log(`-------------------------------${task.userName}--------------------------------------`)
    try {
      console.log(`----creator:----${task.creator}----`)
      await alert.alert(task.jqid, task.creator, task.userName, task.situation, task.userClass);
      console.log(`----secCreator:----${task.secCreator}----`)
      await alert.alert(task.jqid, task.secCreator, task.userName, task.situation, task.userClass);
      console.log(`----_3rdCreator:----${task._3rdCreator}----`)
      await alert.alert(task.jqid, task._3rdCreator, task.userName, task.situation, task.userClass);
    } catch (e) {
      console.error(e)
    }

    const sendEmail = require('sendEmail.js')
    console.log(`----email:----${task.email}----`)
    await sendEmail.sendEmail(task.userName, task.situation, task.userClass, task.email)
    if (task.secEmail && task.secEmail.trim() != '') {
      console.log(`----secEmail:----${task.secEmail}----`)
      await sendEmail.sendEmail(task.userName, task.situation, task.userClass, task.secEmail)
    }
    if (task._3rdEmail && task._3rdEmail.trim() != '') {
      console.log(`----_3rdEmail:----${task._3rdEmail}----`)
      await sendEmail.sendEmail(task.userName, task.situation, task.userClass, task._3rdEmail)
    }
  }

}