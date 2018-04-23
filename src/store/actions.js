import * as types from './mutation-types';
import {playMode} from 'common/js/config';
import {shuffle} from 'common/js/util';
import {
  saveSearch,
  clearSearch,
  deleteSearch,
  savePlay,
  saveFavorite,
  deleteFavorite
} from 'common/js/cache';

const findIndex = (list, song) => {
  return list.findIndex(({ id: findId }) => findId === song.id);
};

// 播放指定歌曲
export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list);
  if (state.mode === playMode.random) {
    const randomList = shuffle(list);
    commit(types.SET_PLAYLIST, randomList);
    // 随机播放模式下, 选择一首歌曲时, 需要矫正歌曲索引
    index = findIndex(randomList, list[index]);
  } else {
    commit(types.SET_PLAYLIST, list);
  }
  commit(types.SET_CURRENT_INDEX, index);
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
};

// 随机播放歌曲
export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random);
  commit(types.SET_SEQUENCE_LIST, list);
  const randomList = shuffle(list);
  commit(types.SET_PLAYLIST, randomList);
  commit(types.SET_CURRENT_INDEX, 0);
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
};

// 添加歌曲到播放列表和顺序列表
export const insertSong = function ({commit, state}, song) {
  let playlist = [...state.playlist]; // 播放列表
  let sequenceList = [...state.sequenceList]; // 顺序列表
  let currentIndex = state.currentIndex; // 当前歌曲索引

  // 记录当前歌曲
  let currentSong = playlist[currentIndex];

  // 1. 插入歌曲到[播放列表]
  let playIndex = findIndex(playlist, song);
  let isInPlaylist = playIndex > -1;
  // 插入歌曲到当前歌曲的下一首
  let insertPlayIndex = currentIndex + 1; // 插入位置
  playlist.splice(insertPlayIndex, 0, song); // 添加歌曲
  // 如果之前[播放列表]已包含了这首歌, 则删除之前这首歌曲
  if (isInPlaylist) {
    let removeIndex = insertPlayIndex > playIndex ? playIndex : playIndex + 1;
    playlist.splice(removeIndex, 1); // 删除歌曲(去重)
    insertPlayIndex = insertPlayIndex > playIndex ? insertPlayIndex - 1 : insertPlayIndex;
  }
  // 更新当前正在播放歌曲索引
  currentIndex = insertPlayIndex;

  // 2.插入歌曲到[顺序列表]
  let sequenceIndex = findIndex(sequenceList, song);
  let isInSequenceList = sequenceIndex > -1;
  let insertSeqIndex = findIndex(sequenceList, currentSong) + 1; // 插入位置
  sequenceList.splice(insertSeqIndex, 0, song); // 添加歌曲
  if (isInSequenceList) {
    let removeIndex = insertSeqIndex > sequenceIndex ? sequenceIndex : sequenceIndex + 1;
    sequenceList.splice(removeIndex, 1); // 删除歌曲(去重)
  }

  // 3. commit to mutations
  commit(types.SET_PLAYLIST, playlist);
  commit(types.SET_SEQUENCE_LIST, sequenceList);
  commit(types.SET_CURRENT_INDEX, currentIndex);
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
};

// 保存搜索历史
export const saveSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query));
};

// 删除搜索历史
export const deleteSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query));
};

// 清空搜索历史
export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch());
};

// 从列表中删除歌曲
export const deleteSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice();
  let sequenceList = state.sequenceList.slice();
  let currentIndex = state.currentIndex;
  let pIndex = findIndex(playlist, song);
  playlist.splice(pIndex, 1); // delete song from playlist
  let sIndex = findIndex(sequenceList, song);
  sequenceList.splice(sIndex, 1); // // delete song from sequenceList
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex -= 1; // fix index
  }

  commit(types.SET_PLAYLIST, playlist);
  commit(types.SET_SEQUENCE_LIST, sequenceList);
  commit(types.SET_CURRENT_INDEX, currentIndex);
  commit(types.SET_PLAYING_STATE, playlist.length > 0);
};

// 清空歌曲列表
export const cleanPlaylist = function ({commit}) {
  commit(types.SET_CURRENT_INDEX, -1);
  commit(types.SET_PLAYLIST, []);
  commit(types.SET_SEQUENCE_LIST, []);
  commit(types.SET_PLAYING_STATE, false);
};

// 保存播放历史
export const savePlayHistory = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song));
};

// 保存收藏
export const saveFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song));
};

// 删除收藏
export const deleteFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song));
};
