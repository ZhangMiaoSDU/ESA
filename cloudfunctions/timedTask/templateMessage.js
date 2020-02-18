const rp = require('request-promise');
const sendTemplateMsg = async (token, msgid, msgData, openid, page) => {
  await rp({
    json: true,
    method: 'POST',
    uri: 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=' + token,
    body: {
      touser: openid,
      template_id: msgid,
      page: page,
      data: msgData
    }
  }).then(res => {
    console.log(res)
  }).catch(err => {
    console.error(err)
  })
}

module.exports = {
  sendTemplateMsg: sendTemplateMsg,
}

