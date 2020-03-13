function getDate(datestr) {
  var temp = datestr.split("-");
  var date = new Date(temp[0], temp[1] - 1, temp[2]);
  return date;
}

function formatEveryDay(start, end) {
  let dateList = [];
  var startTime = getDate(start);
  var endTime = getDate(end);
  while ((endTime.getTime() - startTime.getTime()) >= 0) {
    var year = startTime.getFullYear();
    var month = startTime.getMonth() + 1 < 10 ? '0' + (startTime.getMonth() + 1) : startTime.getMonth() + 1;
    var day = startTime.getDate().toString().length == 1 ? "0" + startTime.getDate() : startTime.getDate();
    dateList.push(year + "/" + month + "/" + day);
    startTime.setDate(startTime.getDate() + 1);
  }
  return dateList;
}

function formatEveryMonthDay(start, end, day) {
  console.log("========formatEveryMonthDay========")
  let dateList = [];
  var startTime = getDate(start);
  if (day != startTime.getDate()) {
    dateList.push(start.split('-').join('/'))
  }

  var endTime = getDate(end);
  var dayCount = 0;
  console.log((endTime.getTime() - startTime.getTime()))
  while ((endTime.getTime() - startTime.getTime()) >= 0) {
    var year = startTime.getFullYear();
    var month = startTime.getMonth() + 1 < 10 ? '0' + (startTime.getMonth() + 1) : startTime.getMonth() + 1;
    dayCount = new Date(year, month, 0).getDate();//本月的天数
    var date = startTime.getDate().toString().length == 1 ? "0" + startTime.getDate() : startTime.getDate();
    // console.log(year, month, date, Number(date), day)
    if (day == Number(date)) {
      var dayf = day < 10 ? '0' + day : day;
      dateList.push(year + "/" + month + "/" + dayf);
    }
    // 如果设定日大于本月的天数，只添加一次
    if (Number(date) == dayCount) {
      if (day > dayCount) {
        dateList.push(year + "/" + month + "/" + dayCount);
      }
    }
    startTime.setDate(startTime.getDate() + 1);
  }
  return dateList;
}

function formatEveryWeekDay(start, end, weekday) {
  let dateList = [];
  var startTime = getDate(start);
  if (weekday.indexOf(startTime.getDay()) == -1) {
    dateList.push(start.split('-').join('/'))
  }

  var endTime = getDate(end);
  while ((endTime.getTime() - startTime.getTime()) >= 0) {
    var year = startTime.getFullYear();
    var month = startTime.getMonth() + 1 < 10 ? '0' + (startTime.getMonth() + 1) : startTime.getMonth() + 1;
    var date = startTime.getDate().toString().length == 1 ? "0" + startTime.getDate() : startTime.getDate();
    // 查看周几
    var time = year + "/" + month + "/" + date;
    var day = new Date(time).getDay();
    if (weekday.indexOf(day) != -1) {
      dateList.push(time);
    }
    startTime.setDate(startTime.getDate() + 1);
  }
  return dateList;
}

module.exports = {
  formatEveryDay: formatEveryDay,
  formatEveryMonthDay: formatEveryMonthDay,
  formatEveryWeekDay: formatEveryWeekDay
}
