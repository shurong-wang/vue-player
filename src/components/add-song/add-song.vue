<template>
  <transition name="slide">
    <!-- 阻止冒泡 -->
    <div class="add-song" v-show="showFlag" @click.stop>
      <!-- 关闭页面 -->
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <!-- 歌曲搜索框 -->
      <div class="search-box-wrapper">
        <search-box 
          ref="searchBox" 
          @queryChange="onQueryChange" 
          placeholder="搜索歌曲" 
        />
      </div>
      <div class="shortcut" v-show="!query">
        <!-- [最近播放 | 搜索历史] -->
        <switches 
          :switches="switches" 
          :activeIndex="activeIndex" 
          @switch="switchItem" 
        />
        <div class="list-wrapper">
          <!-- 最近播放 列表 -->
          <scroll ref="songList" 
                  v-if="activeIndex===0" 
                  class="list-scroll" 
                  :data="playHistory">
            <div class="list-inner">
              <song-list 
                :songs="playHistory" 
                @select="selectSong" 
              />
            </div>
          </scroll>
          <!-- 搜索历史 列表 -->
          <scroll ref="searchList" 
                  class="list-scroll" 
                  v-if="activeIndex===1" 
                  :data="searchHistory" 
                  :refreshDelay="refreshDelay">
                  <!-- searchHistory, refreshDelay from searchMixin -->
            <div class="list-inner">
              <search-list 
                @delete="deleteSearchHistory" 
                @select=" backfillQuery" 
                :searches="searchHistory"
              />
              <!-- deleteSearchHistory, backfillQuery from searchMixin -->
            </div>
          </scroll>
        </div>
      </div>
      <!-- 搜索结果列表 -->
      <div class="search-result" v-show="query">
        <suggest 
          :query="query" 
          :showSinger="showSinger" 
          @select="selectSuggest" 
          @listScroll="blurInput" 
        />
        <!-- query, blurInput from searchMixin -->
      </div>
      <!-- 成功提示 -->
      <top-tip ref="topTip">
        <!-- for slot -->
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1 首歌曲已经添加到播放列表</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import SearchBox from 'base/search-box/search-box';
  import SongList from 'base/song-list/song-list';
  import SearchList from 'base/search-list/search-list';
  import Scroll from 'base/scroll/scroll';
  import Switches from 'base/switches/switches';
  import TopTip from 'base/top-tip/top-tip';
  import Suggest from 'components/suggest/suggest';
  import {searchMixin} from 'common/js/mixin';
  import {mapGetters, mapActions} from 'vuex';
  import Song from 'common/js/song';

  export default {
    mixins: [searchMixin],

    data() {
      return {
        showFlag: false,
        showSinger: false,
        activeIndex: 0,
        songs: [],
        switches: [
          {name: '最近播放'},
          {name: '搜索历史'}
        ]
      };
    },

    computed: {
      ...mapGetters([
        'playHistory'
      ])
    },

    methods: {
      show() {
        this.showFlag = true;
        setTimeout(() => {
          // fix unable to scroll bug
          this.$refs[this.activeIndex === 0 ? 'songList' : 'searchList'].refresh();
        }, 20);
      },
      hide() {
        this.showFlag = false;
      },
      selectSong(song, index) {
        if (index !== 0) {
          // 第一首歌曲是正在播放的歌曲, 忽略添加
          this.insertSong(new Song(song));
          // song 从本地存储中读取, 需要转化成 Song 的实例
        }
        this.$refs.topTip.show();
      },
      selectSuggest() {
        this.$refs.topTip.show();
        this.saveSearch();
      },
      switchItem(index) {
        this.activeIndex = index;
      },
      ...mapActions([
        'insertSong'
      ])
    },

    components: {
      SearchBox,
      SongList,
      SearchList,
      Scroll,
      Switches,
      TopTip,
      Suggest
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>