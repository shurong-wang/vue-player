<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll';

export default {
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: true
    },
    listenScroll: {
      type: Boolean,
      default: false
    },
    data: {
      type: Array,
      default: null
    },
    isPullup: {
      type: Boolean,
      default: false
    },
    // 滚动列表时, 触发输入框 blur, 收起移动端键盘
    isBlur: {
      type: Boolean,
      default: false
    },
    // 解决动画延迟造成列表高度计算错误
    refreshDelay: {
      type: Number,
      default: 20
    }
  },

  mounted() {
    // this.$nextTick()
    setTimeout(() => {
      this._initScroll();
    }, 20);
  },

  methods: {
    _initScroll() {
      if (!this.$refs.wrapper) {
        return;
      }
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      });

      if (this.listenScroll) {
        let me = this;
        this.scroll.on('scroll', pos => {
          // 派发 pos 到父组件的 scroll 事件
          me.$emit('scroll', pos);
        });
      }

      if (this.isPullup) {
        this.scroll.on('scrollEnd', () => {
          if (this.scroll.y <= this.scroll.maxScrollY + 50) {
            // 向父组件派发 scrollToEnd 事件
            this.$emit('scrollToEnd');
          }
        });
      }

      if (this.isBlur) {
        this.scroll.on('beforeScrollStart', () => {
          // 向父组件派发 beforeScroll 事件
          this.$emit('beforeScroll');
        });
      }
    },
    disable() {
      // call disable of BScroll
      this.scroll && this.scroll.disable();
    },
    enable() {
      // call enable of BScroll
      this.scroll && this.scroll.enable();
    },
    refresh() { // 代理 BScroll 组件的 refresh 方法
      // call refresh of BScroll
      this.scroll && this.scroll.refresh(); // 重新计算列表高度
    },
    scrollTo() {
      // call scrollTo of BScroll
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
    },
    scrollToElement() {
      // call scrollToElement of BScroll
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
    }
  },

  watch: {
    data() {
      setTimeout(() => {
        this.refresh();
      }, this.refreshDelay);
    }
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
</style>
