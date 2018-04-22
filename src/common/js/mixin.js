import {mapGetters, mapMutations, mapActions} from 'vuex';
import {playMode} from 'common/js/config';
import {shuffle} from 'common/js/util';

// 播放列表
export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },

  mounted() {
    this.handlePlaylist(this.playlist);
  },

  // keep-alive 组件激活时调用
  activated() {
    this.handlePlaylist(this.playlist);
  },

  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal);
    }
  },

  methods: {
    // 处理 scroll 组件的 bottom 值, 修复歌曲列表尾部被 mini player 遮挡问题
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method');
    }
  }
};

// 播放器
export const playerMixin = {
  computed: {
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random';
    },
    ...mapGetters([
      'sequenceList',
      'playlist',
      'currentSong',
      'mode',
      'favoriteList'
    ])
  },

  methods: {
    changeMode() {
      const mode = (this.mode + 1) % 3;
      this.setPlayMode(mode);
      let list = null;
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList);
      } else {
        list = this.sequenceList;
      }
      this.resetCurrentIndex(list); // 切换播放模式时, 保持当前正在播放的歌曲
      this.setPlaylist(list); // 修改播放列表(排序)
    },
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id;
      });
      this.setCurrentIndex(index);
    },
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song);
      } else {
        this.saveFavoriteList(song);
      }
    },
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite';
      }
      return 'icon-not-favorite';
    },
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id;
      });
      return index > -1;
    },
    ...mapMutations({
      setPlayMode: 'SET_PLAY_MODE',
      setPlaylist: 'SET_PLAYLIST',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayingState: 'SET_PLAYING_STATE'
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
};

// 搜索
export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 120
    };
  },

  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },

  methods: {
    onQueryChange(query) {
      this.query = query;
    },
    blurInput() {
      this.$refs.searchBox.blur();
    },
    backfillQuery(query) {
      this.$refs.searchBox.setQuery(query);
    },
    saveSearch() {
      this.saveSearchHistory(this.query);
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
};
