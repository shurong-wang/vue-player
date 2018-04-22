<template>
  <scroll ref="suggest"
          class="suggest"
          :data="result"
          :isPullup="isPullup"
          :isBlur="isBlur"
          @scrollToEnd="fetchMore"
          @beforeScroll="listScroll">
    <ul class="suggest-list">
      <li class="suggest-item"
          v-for="(item,index) in result"
          :key="index"
          @click="selectItem(item)">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="isPullup && hasMore" title=""/>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果" />
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll';
  import Loading from 'base/loading/loading';
  import NoResult from 'base/no-result/no-result';
  import {search} from 'api/search';
  import {ERR_OK} from 'api/config';
  import {createSong} from 'common/js/song';
  import {mapMutations, mapActions} from 'vuex';
  import Singer from 'common/js/singer';

  const TYPE_SINGER = 'singer';
  const perpage = 20; // 每页数据条数

  export default {
    props: {
      showSinger: {
        type: Boolean,
        default: true
      },
      query: {
        type: String,
        default: ''
      }
    },

    data() {
      return {
        page: 1,
        isPullup: true, // 是否监听列表滚动到底部 -> 触发加载更多
        isBlur: true, // 是否监听列表开始滚动 -> 触发输入框 blur 事件, 收起移动端键盘
        hasMore: true,
        result: [] // 搜索结果列表
      };
    },

    methods: {
      refresh() { // 代理 Sroll 组件的 refresh 方法
        this.$refs.suggest.refresh(); // 刷新列表, 重新计算高度
      },
      fetchSearch() {
        this.hasMore = true;
        this.page = 1; // 重置页码
        this.$refs.suggest.scrollTo(0, 0); // 重置滚动
        search(this.query, this.page, this.showSinger, perpage)
          .then((res) => {
            if (res.code === ERR_OK) {
              this.result = this._genResult(res.data);
              this._checkMore(res.data);
            }
          });
      },
      fetchMore() {
        if (!this.hasMore) {
          return;
        }
        this.page += 1;
        search(this.query, this.page, this.showSinger, perpage)
          .then((res) => {
            if (res.code === ERR_OK) {
              // this.result = this.result.concat(this._genResult(res.data));
              this.result = [...this.result, ...this._genResult(res.data)]; // ES6
              this._checkMore(res.data);
            }
          });
      },
      listScroll() {
        this.$emit('listScroll');
      },
      selectItem(item) {
        if (item.type === TYPE_SINGER) { // 进去歌手详情页
          const singer = new Singer({
            id: item.singermid,
            name: item.singername
          });
          this.$router.push({
            path: `/search/${singer.id}`
          });
          this.setSinger(singer); // setSinger from mapMutations
        } else { // 添加歌曲到播放列表和顺序列表
          this.insertSong(item); // insertSong from mapActions
        }
        // 向父组件派发 select 事件
        this.$emit('select', item);
      },
      getDisplayName({type, singername, name, singer}) {
        return (type === TYPE_SINGER) ? singername : `${name}-${singer}`;
      },
      getIconCls({type}) {
        return (type === TYPE_SINGER) ? 'icon-mine' : 'icon-music';
      },
      _genResult(data) {
        let ret = [];
        if (data.zhida && data.zhida.singerid) {
          ret.push({...data.zhida, ...{type: TYPE_SINGER}});
        }
        if (data.song) {
          ret = ret.concat(this._normalizeSongs(data.song.list));
        }
        return ret;
      },
      _normalizeSongs(list) {
        return list.reduce((ret, musicData) => {
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData));
          }
          return ret;
        }, []);
      },
      _checkMore(data) {
        const song = data.song;
        const offset = song.curnum + song.curpage * perpage;
        if (!song.list.length || offset > song.totalnum) {
          this.hasMore = false;
        }
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ])
    },

    watch: {
      // 观察[搜索关键字]变化
      query(newQuery) {
        this.fetchSearch(newQuery);
      }
    },

    components: {
      Scroll,
      Loading,
      NoResult
    }
  };
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>