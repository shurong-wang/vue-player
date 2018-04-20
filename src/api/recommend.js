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

/**
 * 注意：
 *  直接求 https://c.y.qq.com/xxx api 会对方服务器被拒绝
 *  可以通过 dev-server.js 代理请求：client -> dev-server -> c.y.qq.com
 *  使用 express.Router() + axios, 伪造 headers 绕过 referer 验证
 */

export function getDiscList() {
  const proxyUrl = '/api/getDiscList';
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
  return axios
    .get(proxyUrl, { params: data })
    .then(res => Promise.resolve(res.data));
}

export function getSongList(disstid) {
  const proxyUrl = '/api/getSongList';
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
  return axios
    .get(proxyUrl, { params: data })
    .then(res => Promise.resolve(res.data));
}
