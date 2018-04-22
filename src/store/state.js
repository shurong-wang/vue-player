import {playMode} from 'common/js/config';
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache';

const state = {
  singer: {}, // 歌手信息
  playing: false, // 正在播放
  fullScreen: false, // 显示全屏播放器
  sequenceList: [], // 歌曲列表(原始顺序)
  playlist: [], // 播放列表(顺序改变)
  mode: playMode.sequence, // 播放模式 [顺序, 循环, 随机]
  currentIndex: -1, // 正在播放歌曲的索引
  disc: {}, // 歌单详情
  topList: {}, // 排行榜详情
  searchHistory: loadSearch(), // 搜索历史 - 从本地存储读取
  playHistory: loadPlay(), // 播放历史 - 从本地存储读取
  favoriteList: loadFavorite() // 歌曲收藏 - 从本地存储读取
};

export default state;