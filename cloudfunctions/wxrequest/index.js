// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')
const dataUrl = "https://lab.ahusmart.com/nCoV/";
cloud.init({ env: 'esa' })

// 云函数入口函数
exports.main = async (event, context) => {
  if (event.initData) {
    var res = await rq({
      url: dataUrl + 'api/area',
      method: "GET",
      fs: {},
      header: {
        'content-type': 'application/json' // 默认值
      }
    }); 
    res = JSON.parse(res);
    // console.log(typeof(res))
    console.log(Object.keys(res), res.success)
    if (res.success) {return res.results;} else {return 0}
  }

  if (event.initCoreData) {
    if (event.province) {
      var res = await rq({
        url: dataUrl + 'api/area',
        method: "GET",
        qs: { latest: 1, province: event.province },
        header: {
          'content-type': 'application/json' // 默认值
        }
      })
      res = JSON.parse(res);
      console.log(Object.keys(res), res.success);
      if (res.success) { return res.results; } else { return 0 }
    } else {
      var res = await rq({
        url: dataUrl + 'api/overall',
        method: "GET",
        qs: { latest: 1 },
        header: {
          'content-type': 'application/json' // 默认值
        }
      })
      res = JSON.parse(res);
      console.log(Object.keys(res), res.success);
      if (res.success) { return res.results; } else { return 0 }
    }
  }

  if (event.initNews) {
    if (event.province) {
      var res = await rq({
        url: dataUrl + 'api/news',
        method: "GET",
        qs: { province: event.province },
        header: {
          'content-type': 'application/json' // 默认值
        }
      })
      res = JSON.parse(res);
      console.log(Object.keys(res), res.success);
      if (res.success) { return res.results; } else { return 0 }

    } else {
      var res = await rq({
        url: dataUrl + 'api/news',
        method: "GET",
        qs: { num: 100 },
        header: {
          'content-type': 'application/json' // 默认值
        }
      })
      res = JSON.parse(res);
      console.log(Object.keys(res), res.success);
      if (res.success) { return res.results; } else { return 0 }
    }
  }

  if (event.initRumors) {
    var res = await rq({
      url: dataUrl + 'api/rumors',
      method: "GET",
      qs: { num: "all" },
      header: {
        'content-type': 'application/json' // 默认值
      }
    });
    res = JSON.parse(res);
    console.log(Object.keys(res), res.success);
    if (res.success) { return res.results; } else { return 0 }
  }

  if (event.initChosen) {
    var res = await rq({
      url: dataUrl + 'api/provinceName',
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      }
    })
    res = JSON.parse(res);
    console.log(Object.keys(res), res.success);
    if (res.success) { return res.results; } else { return 0 }
  }

  if (event.initChart) {
    if (event.province) {
      var res = await rq({
        url: dataUrl + 'api/area',
        method: "GET",
        qs: { latest: 0, province: event.province },
        header: {
          'content-type': 'application/json' // 默认值
        }
      })
      res = JSON.parse(res);
      console.log(Object.keys(res), res.success);
      if (res.success) { return res.results; } else { return 0 }
    } else {
      var res = await rq({
        url: dataUrl + 'api/overall',
        method: "GET",
        qs: { latest: 0 },
        header: {
          'content-type': 'application/json' // 默认值
        }
      });
      res = JSON.parse(res);
      console.log(Object.keys(res), res.success);
      if (res.success) {
        res = res.results;
        res = res.map(item => { return { 
          updateTime: item.updateTime, 
          confirmedCount: item.confirmedCount, confirmed: item.confirmed,
          suspectedCount: item.suspectedCount, curedCount: item.curedCount, deadCount: item.deadCount
          }
        })
        console.log(res)
        return res; 
      } else { return 0 }
    }
  }

}