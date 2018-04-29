# [Vue player](https://github.com/k-water/vue-music)

--------

#### 视图层

* 推荐页
* 歌手页
	* 歌手详情
* 歌曲排行榜
	* 排行榜详情
* 搜索页
* 用户中心

#### 数据来源
所有数据都来自于QQ音乐，抓取自QQ的接口，大部分接口都是JSONP，抓取比较容易，其中一些接口限制了`host`，不能直接抓取，采用的方法是用`axios`代理，设置`header`，以此绕过`host`的限制。
PS：具体代码请看`prod.server.js`文件

#### 技术栈

* [x] Vue
* [x] Vuex
* [x] Vue-Router
* [x] Vue-cli
* [x] Stylus
* [x] Axios
* [x] ESlint

#### src目录结构
![](https://oc1gyfe6q.qnssl.com/17-7-27/71529472.jpg)

### 难点 - player组件

播放器组件是整个项目的核心，是全局组件。放在`App.vue`下面，通过`Vuex`传递数据，触发`action`提交`mutation`，从而使播放器开始工作。当然，其中的数据交互说复杂也不是很复杂，就是要花多点时间理解，`player`组件由多个基础组件构成，具体请看项目代码，下面上图
![](https://oc1gyfe6q.qnssl.com/17-7-28/75828095.jpg)

为了防止切换歌曲时点击速度过快导致歌曲播放错误，使用了`audio`的`onplay`API，结合`Vuex`获取到数据，判断当前歌曲数据请求到才可以切换下一首歌曲，判断函数如下
``` javascript
 ready() {
   this.songReady = true
 }
```
#### 数据处理
通过调用QQ音乐的JSONP接口，获取的数据并不能直接拿来用，需要做进一步的规格化，达到我们使用的要求，所以在这方面单独封装了一个`class`来处理这方面的数据，具体请看`src/common/js/song.js`

在请求JSONP的时候，用到了一个JSONP库，这个库代码十分简短，只有几十行，有兴趣的同学可以[学习](https://github.com/webmodules/jsonp)下。

使用时，就是将请求的参数拼接在请求url上，然后调用这个库的`jsonp`方法。所以，在此封装了两个函数，一个是将参数拼接在url上，另一个是将库里面的`jsonp`方法Promise化，方便我们使用，具体请查看`src/common/js/jsonp.js`。

将请求的数据格式化后再通过`Vuex`传递，组件间共享，实现歌曲的播放切换等。

#### 交互体验
该项目的很多地方都涉及到滚动，包括下拉滚动，下拉滚动刷新等。这里面用到了一个库(`better-scroll`)，来实现所有涉及到的滚动，建议学习下它的[API](https://github.com/ustbhuangyi/better-scroll)。

其他动画包括了`Vue`的`transition`动画，路由之间切换时的简单动画，播放器打开时的动画，这个地方比较难，也比较好玩。

打开页面时的加载Loading效果，其实就是一个Loading组件，也比较简单。

为了减少流量，图片加载使用了懒加载的方式，滚动时再加载真实的图片。
具体效果请自身体验：）

### 构建
#### 开发环境

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# run eslint fix
npm run lint-fix

# run all tests
npm test
```
#### 生产环境

``` bash
# build for production with minification
npm run build
# run
node prod.server.js
```
