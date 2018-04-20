<template>
  <scroll 
    @scroll="scroll"
    :listen-scroll="listenScroll"
    :probe-type="probeType"
    :data="data"
    class="listview"
    ref="listview"
  >
    <!-- 歌手列表 -->
    <ul>
      <li 
        v-for="(group, index) in data"
        :key="index" 
        class="list-group" 
        ref="listGroup"
      >
        <!-- title -->
        <h2 class="list-group-title">{{group.title}}</h2>
        <uL>
          <li 
            v-for="(item, index) in group.items"
            :key="index"
            class="list-group-item"
            @click="selectItem(item)" 
          >
            <!-- 头像 -->
            <img class="avatar" v-lazy="item.avatar">
            <!-- 姓名 -->
            <span class="name">{{item.name}}</span>
          </li>
        </uL>
      </li>
    </ul>
    <!-- 姓氏导航 -->
    <div 
      class="list-shortcut" 
      @touchstart.stop.prevent="onShortcutTouchStart" 
      @touchmove.stop.prevent="onShortcutTouchMove"
      @touchend.stop
    >
      <ul>
        <li 
          v-for="(item, index) in shortcutList"
          :key="index"
          :data-index="index" 
          class="item"
          :class="{'current': currentIndex === index}"
        >
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}} </div>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import {getData} from 'common/js/dom';

  const TITLE_HEIGHT = 30;
  const ANCHOR_HEIGHT = 18;

  export default {
    props: {
      data: {
        type: Array,
        default: []
      }
    },

    computed: {
      shortcutList() {
        // return this.data.map((group) => group.title.substr(0, 1));
        return this.data.map((group) => group.title.at(0)); // ES6
        // -> [热, A, B, C, D ...]
      },
      fixedTitle() {
        if (this.scrollY > 0) {
          // 处理重复 titile
          return '';
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : '';
      }
    },

    data() {
      return {
        scrollY: -1, // 实时滚动的位置
        currentIndex: 0, // 当前姓氏导航索引
        diff: -1 // 滚动 title 与 头部固定 title 的差
      };
    },

    created() {
      this.probeType = 3; // 不节流实时监听
      this.listenScroll = true; // 监听列表滚动
      this.touch = {}; // 记录触碰位置
      this.listHeight = []; // 各个分组的高度
    },

    methods: {
      // 切换进入歌手子路由
      selectItem(item) {
        // 作为基础组件, 绑定事件不处理具体业务, 仅仅将事件和数据派发出去
        this.$emit('select', item);
      },
      onShortcutTouchStart(e) {
        let anchorIndex = getData(e.target, 'index');
        let firstTouch = e.touches[0]; // 触碰位置对象
        this.touch.y1 = firstTouch.pageY;
        this.touch.anchorIndex = anchorIndex;
        
        this._scrollTo(anchorIndex);
      },
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0];
        this.touch.y2 = firstTouch.pageY;
        // 滚动 y 轴的偏移值. 向下取整
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0;
        // 滚动后的姓氏导航. 比如, 从 C 滚动到 G
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta;

        this._scrollTo(anchorIndex);
      },
      refresh() {
        this.$refs.listview.refresh();
      },
      scroll(pos) {
        this.scrollY = pos.y;
      },
      _calculateHeight() {
        this.listHeight = [];
        const list = this.$refs.listGroup;
        let height = 0;
        this.listHeight.push(height);
        for (let i = 0; i < list.length; i++) {
          let item = list[i];
          height += item.clientHeight;
          this.listHeight.push(height);
        }
      },
      _scrollTo(index) {
        // console.log(index);
        // 矫正 touchstart 时的 index 值
        if (!index && index !== 0) {
          return;
        }
        if (index < 0) {
          index = 0;
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2;
        }
        // 需要手动设置 scrollY, 确保点击姓氏导航高亮正确
        this.scrollY = -this.listHeight[index];
        // scrollToElement 第二个参数 0 表示缓动效果动画时间
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0);
      }
    },

    watch: {
      data() {
        setTimeout(() => {
          this._calculateHeight();
        }, 20); // 考虑兼容, 用 setTimeout 代替 $nextTick
      },
      // 监听滚动落在列表的哪个分组区间
      scrollY(newY) {
        const listHeight = this.listHeight;
        // 当滚动到顶部, newY > 0
        if (newY > 0) {
          this.currentIndex = 0;
          return;
        }
        // 滚动在中间部分
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i];
          let height2 = listHeight[i + 1];
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i;
            this.diff = height2 + newY;
            return;
          }
        }
        // 当滚动到底部, 且 -newY 大于最后一个元素的上限
        this.currentIndex = listHeight.length - 2;
      },
      // 向上滚动, 将头部固定 titile 顶出屏幕
      diff(newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0;
        if (this.fixedTop === fixedTop) {
          return;
        }
        this.fixedTop = fixedTop;
        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`;
      }
    },

    components: {
      Scroll,
      Loading
    }
  };

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
