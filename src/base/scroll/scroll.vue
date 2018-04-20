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
    pullup: {
      type: Boolean,
      default: false
    },
    beforeScroll: {
      type: Boolean,
      default: false
    },
    refreshDelay: {
      type: Number,
      default: 20
    }
  },

  mounted() {
    // 此处可以用 this.$nextTick() setTimeout()
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

      if (this.pullup) {
        this.scroll.on('scrollEnd', () => {
          if (this.scroll.y <= this.scroll.maxScrollY + 50) {
            this.$emit('scrollToEnd');
          }
        });
      }

      if (this.beforeScroll) {
        this.scroll.on('beforeScrollStart', () => {
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
    refresh() { // 计算滚动列表高度
      // call refresh of BScroll
      this.scroll && this.scroll.refresh();
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