import {getLyric} from 'api/song';
import {ERR_OK} from 'api/config';
import {Base64} from 'js-base64';

export default class Song {
  constructor({id, mid, singer, name, album, duration, image, url}) {
    this.id = id;
    this.mid = mid;
    this.singer = singer;
    this.name = name;
    this.album = album;
    this.duration = duration;
    this.image = image;
    this.url = url;
  }

  getLyric() {
    if (this.lyric) {
      return Promise.resolve(this.lyric);
    }

    return new Promise((resolve, reject) => {
      getLyric(this.mid)
        .then((res) => {
          if (res.retcode === ERR_OK) {
            this.lyric = Base64.decode(res.lyric);
            resolve(this.lyric);
          } else {
            reject('no lyric');
          }
        });
    });
  }
}

export function createSong(musicData) {
  const joinSinger = singer => singer ? singer.map(({ name }) => name).join('/') : '';
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: joinSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    // url: `http://dl.stream.qqmusic.qq.com/C400${musicData.songmid}/${musicData.songid}.m4a?guid=263427534&fromtag=66`, // 播放源失效, 临时用固定地址代替
    url: `http://ip.h5.nm03.sycdn.kuwo.cn/120bdbd2a7e80b926fd4dcdcd0410b6b/5adb3176/resource/a1/19/50/1418450242.aac#${musicData.songid}`
  });
}
