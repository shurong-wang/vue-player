<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave">
      <!-- 全屏播放器 -->
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <!-- 标题区 -->
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <!-- 主体区 -->
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd">
          <!-- 播放器封面(左滑隐藏 middle-l) -->
          <div class="middle-l" ref="middleL">
            <!-- big CD 封面 -->
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdPlayCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <!-- 单条歌词字幕 -->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <!-- 歌词滚动列表(左滑显示 middle-r) -->
          <scroll class="middle-r" 
                  ref="lyricList" 
                  :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p class="text"
                   ref="lyricLine"
                   :class="{'current': currentLineNum ===index}"
                   v-for="(line,index) in currentLyric.lines"
                   :key="index">
                   {{line.txt}}
                </p>
              </div>
            </div>
          </scroll>
        </div>
        <!-- 功能区 -->
        <div class="bottom">
          <!-- CD 海报 / 歌词 切换指示器 -->
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <!-- 播放进度 -->
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar 
                :percent="percent" 
                @percentChange="onProgressBarChange"
              />
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <!-- 按钮组 -->
          <div class="operators">
            <!-- 播放模式 -->
            <div class="icon i-left" @click="changeMode"><!-- changeMode from playerMixin-->
              <i :class="iconMode"></i>
            </div>
            <!-- 上一首 -->
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <!-- 暂停/播放 -->
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <!-- 下一首 -->
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <!-- 收藏歌曲 -->
            <div class="icon i-right">
              <i class="icon" 
                :class="getFavoriteIcon(currentSong)"
                @click="toggleFavorite(currentSong)"></i>
                <!-- getFavoriteIcon, toggleFavorite from playerMixin -->
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <!-- 底部 mini 播放器 -->
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <!-- mini CD 封面 -->
        <div class="icon">
          <img :class="cdPlayCls" width="40" height="40" :src="currentSong.image">
        </div>
        <!-- 歌词歌手 -->
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <!-- 播放按钮 -->
        <div class="control">
          <!-- 进度环 -->
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <!-- 点击底部推出播放列表 需要阻止冒泡 -->
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <!-- 底部推出播放列表 -->
    <playlist ref="playlist" />
    <!-- HTML5 音频播放 -->
    <audio ref="audio" 
          :src="currentSong.url" 
          @play="ready" 
          @error="error" 
          @timeupdate="updateTime"
          @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations, mapActions} from 'vuex';
  import animations from 'create-keyframe-animation';
  import {prefixStyle} from 'common/js/dom';
  import ProgressBar from 'base/progress-bar/progress-bar';
  import ProgressCircle from 'base/progress-circle/progress-circle';
  import {playMode} from 'common/js/config';
  import Lyric from 'lyric-parser';
  import Scroll from 'base/scroll/scroll';
  import {playerMixin} from 'common/js/mixin';
  import Playlist from 'components/playlist/playlist';

  const transform = prefixStyle('transform');
  const transitionDuration = prefixStyle('transitionDuration');

  export default {
    mixins: [playerMixin],

    data() {
      return {
        songReady: false, // 歌曲加载状态
        currentTime: 0, // 歌曲当前播放时长
        radius: 32, // mimi 播放器播放进度环形的半径
        currentLyric: null, // 歌词播放对象
        currentLineNum: 0, // 当前播放歌词行号
        currentShow: 'cd', // 当前播放器主体区的显示(CD 封面 / 歌词幕布)
        playingLyric: '' // 正在播放的一条歌词
      };
    },

    computed: {
      cdPlayCls() {
        return this.playing ? 'play' : 'play pause';
      },
      playIcon() {
        return this.playing ? 'icon-pause' : 'icon-play';
      },
      miniIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini';
      },
      disableCls() {
        return this.songReady ? '' : 'disable';
      },
      percent() {
        // 播放进度 = 已播放时长 / 总时长
        return this.currentTime / this.currentSong.duration;
      },
      ...mapGetters([
        'currentIndex',
        'fullScreen',
        'playing'
      ])
    },

    created() {
      this.touch = {};
    },

    methods: {
      back() {
        this.setFullScreen(false);
      },
      open() {
        this.setFullScreen(true);
      },
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale();
        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        };
        // 用 JS 定义 CS3 keyframes animation - by create-keyframe-animation moudule
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        });
        // 执行 keyframes animation
        animations.runAnimation(this.$refs.cdWrapper, 'move', done);
      },
      afterEnter() {
        // 清空 keyframes animation
        animations.unregisterAnimation('move');
        this.$refs.cdWrapper.style.animation = '';
      },
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s';
        const {x, y, scale} = this._getPosAndScale();
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
        this.$refs.cdWrapper.addEventListener('transitionend', done);
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = '';
        this.$refs.cdWrapper.style[transform] = '';
      },
      togglePlaying() {
        if (!this.songReady) {
          return;
        }
        this.setPlayingState(!this.playing); // setPlayingState from playerMixin
        // 设置歌词的播放状态与歌曲的播放状态一致
        if (this.currentLyric) {
          this.currentLyric.togglePlay();
        }
      },
      // 歌曲播放完之后的操作
      end() {
        if (this.mode === playMode.loop) {
          this.loop(); // 循环播放
        } else {
          this.next(); // 播放下一首
        }
      },
      loop() {
        this.$refs.audio.currentTime = 0;
        this.$refs.audio.play();
        this.setPlayingState(true);
        // 循环播放时, 重置歌词
        if (this.currentLyric) {
          this.currentLyric.seek(0);
        }
      },
      next() {
        if (!this.songReady) {
          return; // 防止快速切换歌曲报错
        }
        if (this.playlist.length === 1) {
          // 列表只有一首歌曲时, 下一首即循环播放
          this.loop();
          return;
        } else {
          let index = this.currentIndex + 1;
          if (index === this.playlist.length) {
            index = 0; // 跳回第一首歌
          }
          this.setCurrentIndex(index); // setCurrentIndex from playerMixin
          // 切换歌曲后自动播放
          if (!this.playing) {
            this.togglePlaying();
          }
        }
        this.songReady = false;
      },
      prev() {
        if (!this.songReady) {
          return; // 防止快速切换歌曲报错
        }
        if (this.playlist.length === 1) {
          // 列表只有一首歌曲时, 下一首即循环播放
          this.loop();
          return;
        } else {
          let index = this.currentIndex - 1;
          if (index === -1) {
            index = this.playlist.length - 1; // 跳回最后一首歌
          }
          this.setCurrentIndex(index);
          // 切换歌曲后自动播放
          if (!this.playing) {
            this.togglePlaying();
          }
        }
        this.songReady = false;
      },
      ready() {
        this.songReady = true;
        this.savePlayHistory(this.currentSong);
      },
      error() {
        this.songReady = true;
      },
      updateTime(e) {
        this.currentTime = e.target.currentTime;
      },
      format(interval) {
        interval = interval | 0; // 向下取整
        const minute = interval / 60 | 0; // 分
        // const second = this._pad(interval % 60); // 秒
        const second = (interval % 60).toString().padStart(2, '0'); // ES6
        return `${minute}:${second}`;
      },
      onProgressBarChange(percent) {
        const currentTime = this.currentSong.duration * percent;
        this.$refs.audio.currentTime = currentTime;
        // // 拖动后是否自动触发播放
        // if (!this.playing) {
        //   this.togglePlaying();
        // }
        // 同步歌词进度
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000);
        }
      },
      palyLyric() {
        this.currentSong
          .getLyric()
          .then(lyric => {
            if (this.currentSong.lyric !== lyric) {
              return;
            }
            this.currentLyric = new Lyric(lyric, this.handleLyric);
            if (this.playing) {
              this.currentLyric.play();
            }
          })
          .catch(() => {
            this.currentLyric = null;
            this.playingLyric = '';
            this.currentLineNum = 0;
          });
      },
      // 歌词生改变回调 - 设置当前行高亮, 滚动位置, 当前歌词字幕
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum;
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5];
          this.$refs.lyricList.scrollToElement(lineEl, 1000);
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000);
        }
        this.playingLyric = txt;
      },
      showPlaylist() {
        this.$refs.playlist.show();
      },
      middleTouchStart(e) {
        this.touch.initiated = true;
        // 用来判断是否是一次移动
        this.touch.moved = false;
        const touch = e.touches[0];
        this.touch.startX = touch.pageX;
        this.touch.startY = touch.pageY;
      },
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return;
        }
        const touch = e.touches[0];
        const deltaX = touch.pageX - this.touch.startX;
        const deltaY = touch.pageY - this.touch.startY;
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return; // y 轴滑动距离大于 x 轴滑动距离时, 停止执行
        }
        if (!this.touch.moved) {
          this.touch.moved = true;
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth;
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX));
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
        this.$refs.lyricList.$el.style[transitionDuration] = 0;
        this.$refs.middleL.style.opacity = 1 - this.touch.percent; // 渐隐/渐显
        this.$refs.middleL.style[transitionDuration] = 0;
      },
      middleTouchEnd() {
        if (!this.touch.moved) {
          return;
        }
        let offsetWidth;
        let opacity;
        // 滑动距离达到 10% 即完成切换
        if (this.currentShow === 'cd') { // right to left
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth;
            opacity = 0;
            this.currentShow = 'lyric';
          } else {
            offsetWidth = 0;
            opacity = 1;
          }
        } else { // left to right
          if (this.touch.percent < 0.9) {
            offsetWidth = 0;
            this.currentShow = 'cd';
            opacity = 1;
          } else {
            offsetWidth = -window.innerWidth;
            opacity = 0;
          }
        }
        const time = 300;
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`;
        this.$refs.middleL.style.opacity = opacity;  // 渐隐/渐显
        this.$refs.middleL.style[transitionDuration] = `${time}ms`;
        this.touch.initiated = false;
      },
      _pad(num, n = 2) {
        let len = num.toString().length;
        while (len < n) {
          num = '0' + num;
          len++;
        }
        return num;
      },
      _getPosAndScale() {
        const targetWidth = 40; // for mini CD
        const paddingLeft = 40; // for mini CD
        const paddingBottom = 30; // for mini CD
        const paddingTop = 80; // for big CD
        const width = window.innerWidth * 0.8; // for big CD
        // mini CD relative to big CD
        const scale = targetWidth / width;
        const x = -(window.innerWidth / 2 - paddingLeft);
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;
        return {
          x,
          y,
          scale
        };
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN'
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },

    watch: {
      currentSong(newSong, oldSong) {
        if (!newSong.id) {
          // 列表清空时, 停止执行后续逻辑
          return;
        }
        if (newSong.id === oldSong.id) {
          // 切换播放模式, 不引响当前歌曲播状态
          return;
        }
        // 切换歌曲时, 重置歌词
        if (this.currentLyric) {
          this.currentLyric.stop();
          this.currentTime = 0;
          this.playingLyric = '';
          this.currentLineNum = 0;
        }
        clearTimeout(this.timer);
        // 需要等待音频资源准备就绪
        this.timer = setTimeout(() => {
          // 播放歌曲和歌词
          this.$refs.audio.play();
          this.palyLyric();
        }, 1000);
        // 在微信中播放时, 微信切换到后台时, JS 不再执行, 但 <audio /> 会继续将整首歌曲播放完成
        // 此时, 应该触发的 end() 不会被执行,  就会导致 songReady 不会改变
        // 此时, 当微信再切换回前台时, 歌曲就切换不了
        // 所以, 用 setTimeout 代替 $nextTick, 设置一个较长的延迟
      },
      playing(newPlaying) {
        const audio = this.$refs.audio;
        // 播放 / 暂停 - 需要等待音频资源准备就绪
        this.$nextTick(() => {
          try {
            newPlaying ? audio.play() : audio.pause();
          } catch (error) {
            console.warn(error);
          }
        });
      },
      fullScreen(newVal) {
        if (newVal) {
          setTimeout(() => {
            this.$refs.lyricList.refresh();
          }, 20);
        }
      }
    },
    
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>