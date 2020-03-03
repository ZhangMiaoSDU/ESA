const cloud = require('wx-server-sdk')

const getExcel = require('getExcel.js') 
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
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);
const sendEmail = async (id, name, email) => {
  console.log(`--------------------------------${name}---------------------------------------`)
  // 生成excel表格
  const fileUrl = await getExcel.getExcel(id);
  console.log(fileUrl)
  if (!fileUrl) {
    return;
  }
  const text = `
  您好，问卷--${name}--的下载链接为
    ${fileUrl}
  该链接的有效期为一天，请及时下载查看。谢谢。
  `;
  // return;
  await transporter.sendMail({
    // 发件人
    from: '柠檬 <zhangmiao19225@163.com>',
    // 主题
    subject: '问卷数据下载链接',
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
