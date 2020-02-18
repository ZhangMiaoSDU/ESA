// 云函数入口文件
const cloud = require('wx-server-sdk')
//这里最好也初始化一下你的云开发环境
cloud.init({ env: 'esa' })
const db = cloud.database();
const COLLECTIONNAME = 'jq'
//操作excel用的类库
const xlsx = require('node-xlsx');

function getFTime() {
  let month = String((new Date().getMonth() + 1)).length == 1 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)
  return [new Date().getFullYear(), month, new Date().getDate()].join('/')
}

function formatData(questionsInfo, jqUser, jqInfo) {
  let isoTime = getFTime();
  // console.log("isoTime: ", isoTime)
  let count = jqInfo.count;
  let questionDict = {};
  let header = [];
  header.push('用户')
  questionsInfo.map(item => {
    questionDict[item._id] = { content: item.content, type: item.type, options: item.options ? item.options : [] };
    header.push(item.content)
  })
  // console.log("questionDict: ", questionDict);
  let allUsersSummary = []
  allUsersSummary.push(header)
  jqUser.map(userId => {
    let userAnswer = jqInfo[userId];
    let _array = [];
    _array.push(userId);
    // console.log(userAnswer);
    var leastAnswer = userAnswer[isoTime];
    // console.log("leastAnswer: ", leastAnswer)
    for (let key in questionDict) {
      // 用户对于某一问题的答案 
      if (leastAnswer[key]) {
        if (questionDict[key].type == 1) {
          _array.push(leastAnswer[key])
        } else {
          var index = leastAnswer[key];
          _array.push(questionDict[key].options[index])
        }
      } else {
        _array.push("未填写")
      }
    }
    // console.log(_array)
    allUsersSummary.push(_array);
  })
  console.log("allUsersSummary: ", allUsersSummary);
  return allUsersSummary
}

// 云函数入口函数
const getExcel = async id => {
  // 格式化数据
  let jqRes = await db.collection(COLLECTIONNAME).doc(id).get();
  let jqInfo = jqRes.data;
  let jqUser = jqInfo.jqUser || [];
  // console.log(jqInfo);
  let jqQuestions = jqInfo.questions || [];
  let tasks = [];
  for (let i = 0; i < jqQuestions.length; i++) {
    tasks.push(db.collection("question").doc(jqQuestions[i]).get())
  }
  let questionsRes = await Promise.all(tasks);
  console.log(questionsRes)
  let questionsInfo = questionsRes.map(item => { return item.data });
  // console.log(questionsInfo)
  let allUsersSummary = formatData(questionsInfo, jqUser, jqInfo);
  try {
    //1,定义excel表格名
    let timestamp = new Date(getFTime()).getTime();
    // console.log(timestamp);
    let dataCVS = `${jqInfo._id}/${jqInfo.name}${timestamp}.xlsx`
    //3，把数据保存到excel里
    var buffer = await xlsx.build([{
      name: "Sheet1",
      data: allUsersSummary
    }]);
    //4，把excel文件保存到云存储里
    var uploadRes = await cloud.uploadFile({
      cloudPath: dataCVS,
      fileContent: buffer, //excel二进制文件
    });
    console.log(uploadRes);
    var result = await cloud.getTempFileURL({
      fileList: [uploadRes.fileID],
    })
    return result.fileList[0].tempFileURL

  } catch (e) {
    console.error(e)
    return e
  }
}

module.exports = {
  getExcel: getExcel,
}





