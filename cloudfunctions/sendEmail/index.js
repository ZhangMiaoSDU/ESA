// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env: 'esa'})
//引入发送邮件的类库
var nodemailer = require('nodemailer')
// 创建一个SMTP客户端配置
var config = {
  host: 'smtp.163.com', //网易163邮箱 smtp.163.com
  port: 465, //网易邮箱端口 25
  auth: {
    user: 'zhangmiao19225@163.com', //邮箱账号
    pass: '11131013Miao1013' //邮箱的授权码
  }
};
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);
// 云函数入口函数
exports.main = async (event, context) => {
  // 创建一个邮件对象
  var mail = {
    // 发件人
    from: '柠檬 <zhangmiao19225@163.com>',
    // 主题
    subject: '新型冠状病毒肺炎求助',
    // 收件人
    to: 'liangguo349@163.com',
    // 邮件内容，text或者html格式
    text: event.text //可以是链接，也可以是验证码
  };

  let res = await transporter.sendMail(mail);
  return res;
}