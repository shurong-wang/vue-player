import jsonp from 'common/js/jsonp';
import {
    commonParams,
    options
} from './config';
import axios from 'axios';

export function getRecommend() {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg';

  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  });

  return jsonp(url, data, options);
}

export function getDiscList() {
  // 注意：
    // 直接求 https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg 会对方服务器被拒绝
    // 可以在自己的服务器上做一个路由代理：client -> /api/getDiscList -> server -> c.y.qq.com
    // 在 dev-server.js 中, 设置 referer 和 host, 绕过对方服务器验证
  const url = '/api/getDiscList';

  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    format: 'json' // jsonp -> json
  });
  return axios.get(url, {
    params: data
  })
  .then((res) => {
    return Promise.resolve(res.data);
  });
}

export function getSongList(disstid) {
  const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg';

  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0
  });

  return jsonp(url, data, options);
}
