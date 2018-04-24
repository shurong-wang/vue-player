var express = require('express');
var config = require('./config/index');
var axios = require('axios');

var port = process.env.PORT || config.build.port;

var app = express();

/* ---------------------------- Router Proxy start ------------------------- */

// Proxy: client -> apiRoutes -> c.y.qq.com
var apiRoutes = express.Router();

// 代理 - 获取推荐专辑
apiRoutes.get('/getDiscList', function (req, res) {
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg';

  axios
    .get(url, {
      // 设置 headers 绕过 referer 验证
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: req.query
    })
    .then((response) => {
      res.json(response.data);
    })
    .catch((e) => {
      console.log(e);
    });
});

// 代理 - 获取歌单
apiRoutes.get('/getSongList', (req, res) => {
  const targetUrl = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg';

  axios
    .get(targetUrl, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: req.query
    })
    .then(({ data }) => {
      if (typeof data === 'string') {
        const matches = data.match(/^\w+\(({.+})\)$/);
        if (matches) {
          data = JSON.parse(matches[1]);
        }
      }
      res.json(data);
    })
    .catch(err => console.error(err));
});

// 代理 - 获取歌词
apiRoutes.get('/lyric', function (req, res) {
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg';

  axios
    .get(url, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: req.query
    })
    .then((response) => {
      var ret = response.data;
      if (typeof ret === 'string') {
        // 正则匹配 'MusicJsonCallback({"retcode": 0, "lyric": "yoyoyo"})' 中 JSON 部分
        var reg = /^\w+\(({[^()]+})\)$/;
        var matches = ret.match(reg); // ['MusicJsonCallback({"retcode": 0, "lyric": "yoyoyo"})', '{"retcode": 0, "lyric": "yoyoyo"}']
        if (matches) {
          ret = JSON.parse(matches[1]); // {"retcode": 0, "lyric": "yoyoyo"}
        }
      }
      res.json(ret);
    })
    .catch((e) => {
      console.log(e);
    });
});

// 代理客户端请求
app.use('/api', apiRoutes);

/* ---------------------------- Router Proxy end ------------------------- */

app.use(express.static('./dist'));

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Listening at http://localhost:' + port + '\n');
});