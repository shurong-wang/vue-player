import {playMode} from 'common/js/config';
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache';

const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playlist: [],
  sequenceList: [],
  mode: playMode.sequence, // 播放模式 [顺序, 循环, 随机]
  currentIndex: -1, // 正在播放歌曲的索引
  disc: {}, // 歌单详情
  topList: {}, // 排行榜详情
  searchHistory: loadSearch(),
  playHistory: loadPlay(),
  favoriteList: loadFavorite()
};

export default state;