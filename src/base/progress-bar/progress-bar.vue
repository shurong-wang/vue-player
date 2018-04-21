<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" 
           ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom';

  const progressBtnWidth = 16; // 进度按钮(圆点)的宽度
  const transform = prefixStyle('transform');

  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },

    created() {
      this.touch = {};
    },

    methods: {
      progressTouchStart(e) {
        this.touch.initiated = true;
        this.touch.startX = e.touches[0].pageX;
        this.touch.left = this.$refs.progress.clientWidth; // 已播放宽度
      },
      progressTouchMove(e) {
        if (!this.touch.initiated) {
          return;
        }
        const deltaX = e.touches[0].pageX - this.touch.startX; // 拖动过的距离
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
        const offsetWidth = Math.min(barWidth, Math.max(0, this.touch.left + deltaX));
        this._offset(offsetWidth);
      },
      progressTouchEnd() {
        this.touch.initiated = false;
        this._triggerPercent(); // 设置拖动进度为播放进度
      },
      progressClick(e) {
        // this._offset(e.offsetX); // 当点击 progressBtn 时, e.offsetX 获取有误
        const rect = this.$refs.progressBar.getBoundingClientRect();
        const offsetWidth = e.pageX - rect.left;
        this._offset(offsetWidth); // 用 offsetWidth 代替 e.offsetX
        this._triggerPercent();
      },
      _triggerPercent() {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
        const percent = this.$refs.progress.clientWidth / barWidth;
        this.$emit('percentChange', percent); // 将播放进度派发给父组件
      },
      _offset(offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`;
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
      }
    },
    
    watch: {
      percent(newPercent) {
        if (newPercent >= 0 && !this.touch.initiated) { // 拖动的优先级高于播放
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
          const offsetWidth = newPercent * barWidth; // 已播放的宽度
          this._offset(offsetWidth); // 更新进度
        }
      }
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>