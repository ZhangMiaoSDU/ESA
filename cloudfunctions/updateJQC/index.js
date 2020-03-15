// 云函数入口文件
const cloud = require('wx-server-sdk')
const COLLECTIONNAME = 'timedtask'
cloud.init({ env: 'esa' })
const db = cloud.database();
const query = require('query.js');
const intervalTime = 8 * 60 * 60 * 1000; //8个小时
function timestampToTime(timestamp) {
  var gmtTimestamp = new Date(timestamp).getTime();
  const date = new Date(gmtTimestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`
}
// 云函数入口函数
exports.main = async (event, context) => {
  var res = await query.query('jq');
  // console.log(res);
  var jqs = res.data;
  var now = new Date().getTime();
  for (let i = 0; i<jqs.length; i++) {
    console.log("===========================" + jqs[i]._id + "==============================")
    var jq = jqs[i];
    if (jq.type != 0) {
      var currentPeriod = jq.currentPeriod;
      var previousPeriod = jq.previousPeriod || [];
      var saveRecordDay = jq.saveRecordDay;
      var periods = jq.periods;
      for (let i = 0; i < periods.length; i++) {
        console.log("periods: ", i)
        var _previous = new Date(periods[i][0]).getTime();
        var _next = new Date(periods[i][1]).getTime();
        if (_previous == _next) {_next = new Date(periods[i][1] + ' 23:00').getTime()}
        console.log("timestamp: ", now, _previous, _next, periods[i])
        if (now >= _previous && now <= _next) {
          currentPeriod = periods[i];
          if (i > 0) { previousPeriod = periods[i - 1]}
          saveRecordDay = currentPeriod[0];
          break;
        }
      }
      var currentRecord;
      if (saveRecordDay != jq.saveRecordDay) {
        currentRecord = 0
      }
      console.log("currentPeriod: ", currentPeriod, previousPeriod, saveRecordDay);
      var resU = await db.collection('jq').doc(jq._id).update({ 
        data: { currentPeriod: currentPeriod, previousPeriod: previousPeriod, saveRecordDay: saveRecordDay, currentRecord: currentRecord } 
      })
      return resU;
    }
    
  }
}