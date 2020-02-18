// 云函数入口文件
const cloud = require('wx-server-sdk')
//这里最好也初始化一下你的云开发环境
cloud.init({
  env: "esa"
})
//操作excel用的类库
const xlsx = require('node-xlsx');

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    //1,定义excel表格名
    let dataCVS = `${event.name}.xlsx`
    
    //3，把数据保存到excel里
    var buffer = await xlsx.build(event.summaryDict);
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

