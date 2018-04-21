<template>
  <div class="singer" ref="singer">
    <!-- 歌手列表 -->
    <list-view 
      @select="selectSinger"
      :data="singers" 
      ref="list" />
    <!-- 歌手详情 子路由 -->
    <router-view></router-view>
  </div>
</template>

<script>
  import ListView from 'base/listview/listview';
  import {getSingerList} from 'api/singer';
  import {ERR_OK} from 'api/config';
  import Singer from 'common/js/singer';
  import {mapMutations} from 'vuex';
  import {playlistMixin} from 'common/js/mixin';

  const HOT_SINGER_LEN = 10;
  const HOT_NAME = '热门';

  export default {
    mixins: [playlistMixin],

    data() {
      return {
        singers: []
      };
    },

    created() {
      this._getSingerList();
    },

    methods: {
      // implement handlePlaylist of playlistMixin
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : '';
        this.$refs.singer.style.bottom = bottom;
        this.$refs.list.refresh();
      },
      selectSinger(singer) {
        this.$router.push({
          path: `/singer/${singer.id}`
        });
        // 配合 mapMutations, 触发 mutation, 更新 state
        this.setSinger(singer);
      },
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list);
          }
        });
      },
      _normalizeSinger(list) {
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        };
        list.forEach((item, index) => {
          if (index < HOT_SINGER_LEN) {
            map.hot.items.push(new Singer({
              name: item.Fsinger_name,
              id: item.Fsinger_mid
            }));
          }
          const key = item.Findex; // 姓氏首字母
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            };
          }
          map[key].items.push(new Singer({
            name: item.Fsinger_name,
            id: item.Fsinger_mid
          }));
        });
        // map 字典是无序的，需要进一步构建有序列表
        let ret = [];
        let hot = [];
        for (let key in map) {
          let val = map[key];
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val);
          } else if (val.title === HOT_NAME) {
            hot.push(val);
          }
        }
        // 按姓氏首字母排序 A-Z
        ret.sort((a, b) => {
          // return a.title.charCodeAt(0) - b.title.charCodeAt(0);
          return a.title.codePointAt(0) - b.title.codePointAt(0); // ES6
        });
        // return hot.concat(ret);
        return [...hot, ...ret]; // ES6
      },
      // 触发 mutation 语法糖
      ...mapMutations({
        setSinger: 'SET_SINGER'
      })
    },
    
    components: {
      ListView
    }
  };

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
