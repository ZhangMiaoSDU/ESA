var nodemailer = require('nodemailer')
const cloud = require('wx-server-sdk')
const COLLECTIONNAME = 'jq'
cloud.init({ env: 'esa' })
const db = cloud.database();
const JQID = "1583552739980_0.9923255171463157_33588743-1583552741702_1_92004"
const qid = 'dbd5894b-bd6a-43a2-8233-5efacf9aafc1'
const Hour = 14;
// 创建一个SMTP客户端配置
var config = {
  host: 'smtp.163.com', //网易163邮箱 smtp.163.com
  port: 465, //网易邮箱端口 25
  auth: {
    user: 'zhangmiao19225@163.com', //邮箱账号
    pass: '11131013Miao1013' //邮箱的授权码
  }
};
// 创建一个SMTP客户端对象 task.userName, task.situation, task.userClass, task.secEmail
var transporter = nodemailer.createTransport(config);

function format(questionsInfo, dateList, users, jqInfo) {
  let questionDict = {};
  questionsInfo.map(item => {
    if (item._id != qid) {
      questionDict[item._id] = { content: item.content, type: item.type, options: item.options ? item.options : [] };
    }
  })
  console.log(questionDict)

  let _dict = {};
  for (let it = 0; it < dateList.length; it++) {
    var time = dateList[it];
    for (let iu = 0; iu < users.length; iu++) {
      let uid = users[iu];
      console.log(uid, time)
      let answer = jqInfo[uid][time];
      if (answer) {
        let mail = answer[qid];
        if (!_dict[mail]) {
          _dict[mail] = ""
        }
        for (let key in questionDict) {
          let qcontent = questionDict[key].content;
          _dict[mail] += `${qcontent}: `;
          let qvalue = answer[key];
          if (questionDict[key].type == 0) {
            qindex = answer[key];
            qoptions = questionDict[key].options;
            qvalue = qoptions[qindex];
          }
          _dict[mail] += `${qvalue};\t`;
        }
        _dict[mail] += `\n`;
      }
    }
  }
  return _dict
}

const sendEmailToTutor = async () => {
  var execTasks = [];
  var jqRes = await db.collection(COLLECTIONNAME).doc(JQID).get();
  var jqInfo = jqRes.data;

  let tasks = [];
  for (let i = 0; i < jqInfo.questions.length; i++) {
    tasks.push(db.collection("question").doc(jqInfo.questions[i]).get())
  }
  let questionsRes = await Promise.all(tasks);
  // console.log(questionsRes)
  let questionsInfo = questionsRes.map(item => { return item.data });

  var currentPeriodStr = JSON.stringify(jqInfo.currentPeriod);
  var periods = jqInfo.periods;
  var periodsStr = periods.map(item => { return JSON.stringify(item) });
  var index = periodsStr.indexOf(currentPeriodStr);
  let dateList = periods.slice(index - 3, index).map(item => { return item[0] });
  var users = jqInfo.jqUser || [];
  _dict = format(questionsInfo, dateList, users, jqInfo);
  console.log(_dict)

  const text = `
    您好，
    ${_dict['1815276437@QQ.com']}。
  `;
  console.log(text)
  await transporter.sendMail({
    // 发件人
    from: '柠檬 <zhangmiao19225@163.com>',
    // 主题
    subject: '学生情况',
    // 收件人
    to: "2549360836@qq.com",
    // 邮件内容，text或者html格式
    text: text
  }).then(res => {
    console.log(res)
  }).catch(err => {
    console.error(err)
  })
}


module.exports = {
  sendEmailToTutor: sendEmailToTutor,
}


