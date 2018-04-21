import {playMode} from 'common/js/config';
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache';

const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playlist: [],
  sequenceList: [],
  mode: playMode.sequence, // 播放模式 [顺序, 循环, 随机]
  currentIndex: -1, // 正在播放歌曲的索引, 应用于[上一首, 下一首]
  disc: {},
  topList: {},
  searchHistory: loadSearch(),
  playHistory: loadPlay(),
  favoriteList: loadFavorite()
};

export default state;