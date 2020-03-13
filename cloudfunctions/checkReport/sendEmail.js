const cloud = require('wx-server-sdk')
//引入发送邮件的类库
var nodemailer = require('nodemailer')
const COLLECTIONNAME = 'jq'
cloud.init({ env: 'esa' })
const db = cloud.database();

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
const sendEmail = async (userName, situation, userClass, email) => {
  // console.log(`----${emailemail}-----`)
  const text = `
    您好，${userClass}的同学${userName}: ${situation}。
  `
  await transporter.sendMail({
    // 发件人
    from: '柠檬 <zhangmiao19225@163.com>',
    // 主题
    subject: '异常情况',
    // 收件人
    to: email,
    // 邮件内容，text或者html格式
    text: text
  }).then(res => {
    console.log(res)
  }).catch(err => {
    console.error(err)
  })
}

module.exports = {
  sendEmail: sendEmail,
}
