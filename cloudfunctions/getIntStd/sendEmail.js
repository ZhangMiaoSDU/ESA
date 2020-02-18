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

const sendEmail = async (name, email) => {
  await transporter.sendMail({
    // 发件人
    from: '柠檬 <zhangmiao19225@163.com>',
    // 主题
    subject: '注册领奖学金通知',
    // 收件人
    to: email,
    // 邮件内容，text或者html格式
    text: `
    ${name}:
      您已经注册成功，感谢您对网课感兴趣。由于目前报名人数众多，为了保证上课质量，我们将尽快调整上课安排。近期会再给您邮件，请多关注邮箱。
    ` 
  }).then(res => {
    console.log(res)
  }).catch(err => {
    console.error(err)
  })
}

module.exports = {
  sendEmail: sendEmail,
}
