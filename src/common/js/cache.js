import storage from 'good-storage';

const SEARCH_KEY = '__search__';
const SEARCH_MAX_LEN = 15; // 最大存储搜索历史数

const PLAY_KEY = '__play__';
const PLAY_MAX_LEN = 200; // 最大存储列表歌曲数

const FAVORITE_KEY = '__favorite__';
const FAVORITE_MAX_LEN = 200; // 最大存储歌曲收藏数

const insertArray = (arr, val, compare, maxLen) => {
  const index = arr.findIndex(compare);
  if (index === 0) {
    return;
  }
  // 不在头部, 则删除后重新插入
  if (index > 0) {
    arr.splice(index, 1);
  }
  arr.unshift(val); // 头部插入
  if (maxLen && arr.length > maxLen) {
    arr.pop(); // 尾部删除
  }
};

const deleteFromArray = (arr, compare) => {
  const index = arr.findIndex(compare);
  if (index > -1) {
    arr.splice(index, 1);
  }
};

export function saveSearch(query) {
  // 读取数据 - 未读取到时, 返回空数组
  let searches = storage.get(SEARCH_KEY, []);
  // 扩充数据
  insertArray(searches, query, item => item === query, SEARCH_MAX_LEN);
  // 保存数据
  storage.set(SEARCH_KEY, searches);
  return searches;
}

export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, []);
  deleteFromArray(searches, item => item === query);
  storage.set(SEARCH_KEY, searches);
  return searches;
}

export function clearSearch() {
  storage.remove(SEARCH_KEY);
  return [];
}

export function loadSearch() {
  return storage.get(SEARCH_KEY, []);
}

export function savePlay(song) {
  let songs = storage.get(PLAY_KEY, []);
  insertArray(songs, song, item => song.id === item.id, PLAY_MAX_LEN);
  storage.set(PLAY_KEY, songs);
  return songs;
}

export function loadPlay() {
  return storage.get(PLAY_KEY, []);
}

export function saveFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, []);
  insertArray(songs, song, item => song.id === item.id, FAVORITE_MAX_LEN);
  storage.set(FAVORITE_KEY, songs);
  return songs;
}

export function deleteFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, []);
  deleteFromArray(songs, item => item.id === song.id);
  storage.set(FAVORITE_KEY, songs);
  return songs;
}

export function loadFavorite() {
  return storage.get(FAVORITE_KEY, []);
}

