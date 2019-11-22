<template lang="pug">
  .home
    img.share-arrow(v-show="isShowShareMast" :src="require('@/assets/images/icon_share_arrow.png')")
    .share-text(v-show="isShowShareMast") 分享给你的好友，了解他们对你的评价
    van-overlay(:show="isShowShareMast" @click="isShowShareMast = false")
    .header
      .title {{isShare ? '你对'+ userInfo.nickname +'同学有什么要评价的吗' : '我收到到匿名评价'}}
    .user-info
      .avatar-wrapper
        .avatar
          img.avatar-img(:src="userInfo.headimgurl || require('@/assets/images/avatar.png')")
          div.avatar-text {{userInfo.nickname}}
        img.share-btn(:src="require('@/assets/images/share.png')" @click="handleShowShareBar")
        //- img.switch-btn(:src="require('@/assets/images/refresh.png')" @click="refreshBoos")
    .content(:style="{'backgroundImage': `url(${require('@/assets/images/home_bg.png')})`, height: isShare ? 'calc(100% - 360px)' : 'calc(100% - 210px)'}")
      wordcloud(
        :style="{height: isShare ? 'calc(100% - 20px)' : 'calc(100% - 20px)'}"
        :data="defaultWords"
        :wordRotate="wordRotate"
        :fontSize="wordFont"
        nameKey="name"
        valueKey="value"
        :color="myColors"
        :showTooltip="false")
      #boos.boo.fix
        .boo-item(v-if="!boos.length && !isShare"
          v-for="(item, index) in boosShare"
          :key="index"
          @click="handleShowShareBar"
          :style="{'backgroundImage': `url(${require('@/assets/images/boo.png')})`, left: Math.random() * 8 - 4 + 3 + 'rem', bottom: getBoosTop(index)}"
          )
            .boo-item-text {{item.label}}
      #boos.boo.fix
        .boo-item(v-if="!boos.length && isShare"
          v-for="(item, index) in boosShare"
          :key="index"
          @click="handleShowShareBar"
          :style="{'backgroundImage': `url(${require('@/assets/images/boo.png')})`, left: Math.random() * 8 - 4 + 3 + 'rem', bottom: getBoosTop(index)}"
          )
            .boo-item-text {{item.label}}
      #boos.boo.fix
        .boo-item(
          v-for="(item, index) in boos"
          :key="index"
          :style="{'backgroundImage': `url(${require('@/assets/images/boo.png')})`, left: item.left, bottom: getBoosTop(index), transform: `translateY(${item.translateY})`}"
          )
          .boo-item-text {{item.replierAnswer}}
          .boo-item-opt.fix
            .boo-item-opt-good
              img.boo-item-opt-good-img(:src="require(item.selfIfThumbs ? '@/assets/images/icon_good.png' : '@/assets/images/icon_good_not.png')" @click="handleAgree(item.id)")
              span.boo-item-opt-good-text {{item.agreeCount || 0}}
            .boo-item-opt-comment(@click="$router.push({name: 'reply', params: {booItem: item, openid: userInfo.openid, shareOpenid: shareOpenid}})")
              img.boo-item-opt-comment-img(:src="require('@/assets/images/icon_repay.png')")
              span.boo-item-opt-comment-text {{item.followCount || 0}}
    .bottom-share.bottom(v-if="isShare")
      .input
        Field.input-content(v-model="commentItem.commentValue" placeholder="#快来评价我")
        Button.input-submit(@click="handleSubmitComment") 确定
      .tags-comment.fix
        .tags-comment-item(v-for="(item, index) in tags" :key="index" @click="handleSelectTags(item)") {{item.label || '你是一个大傻瓜'}}
        Button.switch(@click="getTagsData") 换一换
      Button.view-comment(@click="$router.replace({name: 'mycomment', params: {shareOpenid: shareOpenid}})") 查看他收到的评价
      Button.view-comment(@click="handleShowShareBar") 我也要玩
    .bottom-mine.bottom(v-else)
      Button.view-comment(@click="$router.replace({name: 'mycomment', params: {shareOpenid: shareOpenid}})") 查看我收到的评价
      Button.view-comment(@click="handleShowShareBar") 分享给好友
    Popup.share-bar(v-model="showShareBar" position="bottom" :style="{height: '179px'}")
      .share
        .share-item
          img.share-item-icon.share-item-wechat(
            :src="require('@/assets/images/icon_wechat.png')"
            @click="handleShareWechat()"
            )
          .share-item-text 微信
        .share-item
          img.share-item-icon.share-item-wechat(
            :src="require('@/assets/images/icon_friend.png')"
            @click="handleShareTimeline()"
            )
          .share-item-text 朋友圈
        .share-item
          img.share-item-icon.share-item-link(:src="require('@/assets/images/icon_link.png')")
          .share-item-text 链接
</template>

<script>
import Vue from 'vue'
import { Field, Button, Popup, Toast, Overlay } from 'vant'
import wordcloud from 'vue-wordcloud'
import VueAnime from 'vue-animejs'
import wxApi from '@/sdk/weixin'
import wx from 'weixin-js-sdk'
import {
  getComments,
  oAuth,
  getUserBaseInfo,
  getCurrentUserBaseInfo,
  getTags,
  getParentTags,
  addComment,
  agree
} from '@/api/index'

Vue.use(Overlay)
  .use(Toast)
  .use(VueAnime)

export default {
  data() {
    return {
      // 是否显示分享bar
      showShareBar: false,
      // 是否显示分享遮罩和提示
      isShowShareMast: false,
      // 分享者的openid
      shareOpenid: '',
      // 用户信息
      userInfo: {
        nickname: '',
        headimgurl: '',
        openid: ''
      },
      // 小球数据列表
      boos: [],
      // 标签列表
      tags: [],
      // 评论项目
      commentItem: {
        commentValue: '',
        commentId: ''
      },
      wordRotate: {
        from: 0,
        to: 30,
        numOfOrientation: 15
      },
      wordFont: [10, 20],
      // 加载骨架屏
      skeletonLoading: true,
      // 评论分享文案
      boosShare: [
        {
          label: '还没有人给你评价'
        },
        {
          label: '分享一下'
        },
        {
          label: '点击气泡开始匿名游戏'
        },
        {
          label: '开始游戏'
        },
        {
          label: '你是谁'
        },
        {
          label: '我在他们心中印象怎样'
        },
        {
          label: '我很靠谱吗'
        },
        {
          label: '快分享给他们吧'
        }
      ],
      boosOtherShare: [
        {
          label: '还没有人给他评价'
        },
        {
          label: '分享一下'
        },
        {
          label: '点击气泡开始匿名游戏'
        },
        {
          label: '开始游戏'
        },
        {
          label: '他是谁'
        },
        {
          label: '他在你心中印象怎样'
        },
        {
          label: '他很靠谱吗'
        },
        {
          label: '快分享给朋友吧'
        }
      ],
      // 评论表单
      commentsFrom: {
        page: '',
        size: ''
      },
      // 标签分页
      tagsPager: {
        currentPage: 1,
        totalPage: 1
      },
      // 评论分页
      commentPager: {
        currentPage: 1,
        totalPage: 1
      },
      animation: null,
      myColors: ['#FF8148', '#FF8AAA', '#8ADDFF', '#D48AFF'],
      defaultWords: [],
    }
  },
  computed: {
    isShare() {
      return (
        location.href.indexOf('shareOpenid') !== -1 &&
        this.getUrlParam('shareOpenid') &&
        this.getUrlParam('shareOpenid') !== this.userInfo.openid
      )
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    // 初始化
    init() {
      // this.runingBoos()
      this.authorize()
      this.getTagsData()
    },
    // 获取授权信息
    async authorize() {
      const openid = localStorage.getItem('openid')
      const headimgurl = localStorage.getItem('headimgurl')
      const nickname = localStorage.getItem('nickname')
      this.userInfo = {
        openid: openid,
        headimgurl: headimgurl,
        nickname: nickname
      }
      if (this.$route.params.from) {
        this.getShareUserInfo()
        return
      }
      let state = this.$route.query.state
      let code = this.$route.query.code
      let data = { state: state }
      if (!openid) {
        data = Object.assign(data, {
          code: code
        })
      } else {
        data = Object.assign(data, {
          openid: openid
        })
      }
      if ((code && state) || openid) {
        const userInfo = await getCurrentUserBaseInfo(data)
        this.userInfo = userInfo.data
        localStorage.setItem('openid', userInfo.data.openid)
        localStorage.setItem('headimgurl', userInfo.data.headimgurl)
        localStorage.setItem('nickname', userInfo.data.nickname)
        this.getShareUserInfo()
      } else {
        const authInfo = await oAuth({ url: window.location.href })
        window.location.href = authInfo.data
      }
      this.handleShareWechat()
    },
    // 获取url中的某个参数（兼容微信）
    getUrlParam(par) {
      const url = location.search.replace('?', '')
      const reg = new RegExp('(^|&)' + par + '=([^&]*)(&|$)')
      if (
        !decodeURIComponent(url).match(reg) ||
        !decodeURIComponent(url).match(reg)[0]
      ) {
        return ''
      }
      return decodeURIComponent(url)
        .match(reg)[0]
        .replace(/&/g, '')
        .replace('shareOpenid=', '')
    },
    // 获取分享者的用户信息
    async getShareUserInfo() {
      const shareOpenid = this.getUrlParam('shareOpenid')
      if (shareOpenid) {
        this.shareOpenid = shareOpenid
        const shareUserInfo = await getUserBaseInfo({
          shareOpenid: shareOpenid
        })
        this.userInfo.headimgurl = shareUserInfo.data.headimgurl
        this.userInfo.nickname = shareUserInfo.data.nickname
        localStorage.setItem('headimgurl', shareUserInfo.data.headimgurl)
        localStorage.setItem('nickname', shareUserInfo.data.nickname)
      }
      this.getCommentsData(true)
      this.getParentTagsData()
    },
    // 获取评论数据
    async getCommentsData(reset) {
      const comments = await getComments({
        shareOpenid: this.shareOpenid ? this.shareOpenid : this.userInfo.openid,
        curOpenid: this.userInfo.openid,
        currentPage: this.commentPager.currentPage,
        pageSize: 8
      })
      if (!comments.data.dataList || !comments.data.dataList.length) return
      this.boos = comments.data.dataList
      this.commentPager.totalPage = comments.data.totalPage
      this.setBoosX()
      this.$nextTick((reset) => {
        this.skeletonLoading = false
        this.runingBoos()
      })
    },
    // 获取标签数据
    async getTagsData() {
      if (!this.isShare) return
      this.tagsPager.currentPage = this.tagsPager.currentPage + 1
      if (this.tagsPager.currentPage > this.tagsPager.totalPage) {
        this.tagsPager.currentPage = 1
      }
      const tagsData = await getTags({
        currentPage: this.tagsPager.currentPage,
        pageSize: 6
      })
      this.tags = tagsData.data.dataList
      this.tagsPager.totalPage = tagsData.data.totalPage
    },
    // 获取父标签数据
    async getParentTagsData() {
      const parentTagsData = await getParentTags({
        shareOpenid: this.shareOpenid ? this.shareOpenid : this.userInfo.openid,
        curOpenid: this.userInfo.openid
      })
      if (parentTagsData.code === '000000') {
        this.defaultWords = parentTagsData.data.map((item, index) => {
          return {
            name: item,
            value: index
          }
        })
        console.log(this.defaultWords)
      }
    },
    // 点赞
    async handleAgree(id) {
      const res = await agree({
        curOpenid: this.userInfo.openid,
        replierId: id
      })
      if (res.code === '000000') {
        this.boos.forEach((item, index) => {
          if (item.id === id) {
            this.boos[index].selfIfThumbs = true
            this.boos[index].agreeCount = this.boos[index].agreeCount + 1
          }
        })
        Toast.success('点赞成功')
      } else {
        Toast.fail(res.msg)
      }
    },
    // 计算小球距离左边边距
    // getBoosLeft(index) {
    // const col = Math.floor(index % 3)
    // return col * 3 + 0.5 + col * 0.2 - 0.6 + 'rem'
    // return Math.random() * 10 - 5 + 3 + 'rem'
    // },
    // 计算小球距离右边边距
    getBoosTop(index) {
      // const col = Math.floor(index % 2)
      // const row = Math.floor(index / 3)
      return '-1.8rem'
      // return this.isShare ? row * 3 - col * 0.2 + 8 + 'rem' : row * 3 - col * 0.2 + 12 + 'rem'
    },
    // 随机刷新小球x轴
    setBoosX() {
      // const boos = document.querySelectorAll('div.boo-item')
      // boos.style.trasform = "translateY(0)"
      this.boos.forEach((item, index) => {
        this.boos[index].left = Math.random() * 8 - 4 + 3 + 'rem'
        this.boos[index].translateY = 0
        if (this.animation) {
          this.animation.restart()
        }
        // console.log(this.booyfs[index].transform)
      })
    },
    // 刷新小球
    refreshBoos() {
      this.commentPager.currentPage = this.commentPager.currentPage + 1
      if (this.commentPager.currentPage > this.commentPager.totalPage) {
        this.commentPager.currentPage = 1
      }
      this.getCommentsData(true)
    },
    // 打开分享栏
    handleShowShareBar() {
      this.isShowShareMast = true
    },
    // 选择标签
    async handleSelectTags(item) {
      const res = await addComment({
        shareOpenid: this.shareOpenid ? this.shareOpenid : this.userInfo.openid,
        curOpenid: this.userInfo.openid,
        labelId: item.id,
        replierAnswer: item.label
      })
      if (res.code !== '000000') {
        res.msg && Toast.fail(res.msg)
      } else {
        Toast.success('评论成功')
        this.getCommentsData(false)
      }
    },
    // 提交评论
    async handleSubmitComment() {
      if (!this.commentItem.commentValue) {
        Toast('输入内容为空!')
      }
      const res = await addComment({
        shareOpenid: this.shareOpenid ? this.shareOpenid : this.userInfo.openid,
        curOpenid: this.userInfo.openid,
        labelId: this.commentItem.commentId,
        replierAnswer: this.commentItem.commentValue
      })
      if (res.code !== '000000') {
        res.msg && Toast.fail(res.msg)
      } else {
        Toast.success('评论成功')
        this.getCommentsData()
      }
      this.commentItem.commentValue = ''
    },
    // 分享到朋友
    handleShareWechat() {
      wxApi.wxRegister(() => {
        wx.onMenuShareAppMessage({
          title: '【测试】快来评价我吧',
          desc: '分享给朋友，就可以知道朋友对你印象，快去告诉你朋友',
          link:
            window.location.href + '?id=1&shareOpenid=' + this.userInfo.openid,
          imgUrl:
            'https://p1.meituan.net/dpmerchantpic/5397ab35c2997efb4121ab08f0dcb982936404.jpg%40watermark%3D1%26%26r%3D1%26p%3D9%26x%3D2%26y%3D2%26relative%3D1%26o%3D20',
          success: function() {
            this.isShowShareMast = false
          }
        })
      })
    },
    // 小球运动
    runingBoos() {
      const boos = document.querySelectorAll('div.boo-item')
      const bodyHeight = document.body.clientHeight
      this.animation = this.$anime({
        targets: boos,
        translateY: this.isShare
          ? -(bodyHeight - 210) * 1.5
          : -(bodyHeight - 300) * 1.5,
        translateX: Math.random() * 10 - 5 + 3 * 15,
        scale: [0.3, 2],
        delay: function(el, i) {
          return 3000 * (i - 1)
        },
        loop: true,
        duration: 120000,
        easing: function(el, i, total) {
          return function(t) {
            return Math.pow(Math.sin(t * 8), 4)
          }
        }
      })
      setInterval(() => {
        this.animation.restart()
        this.setBoosX()
      }, 120000)
    }
  },
  components: { Field, Button, Popup, wordcloud }
}
</script>
<style lang="scss">
$boos-size: 110px;
.fix:after {
  display: table;
  content: '';
  clear: both;
}
.home {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(
    180deg,
    rgba(93, 81, 208, 1) 0%,
    rgba(8, 0, 23, 1) 100%
  );
  .share-arrow {
    position: absolute;
    top: 0;
    right: 10px;
    z-index: 100000;
  }
  .share-text {
    color: #fff;
    position: absolute;
    font-size: 14px;
    top: 120px;
    // width: 180px;
    right: 10px;
    z-index: 100000;
  }
  .header {
    width: 100%;
    height: 30px;
    padding-top: 10px;
    text-align: center;
    .title {
      font-size: 19px;
      color: rgba(255, 255, 255, 1);
      line-height: 23px;
    }
  }
  .user-info {
    .avatar-wrapper {
      height: 40px;
      .avatar {
        float: left;
        height: 40px;
        margin-left: 12px;
        &-img {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
        &-text {
          display: inline-block;
          vertical-align: top;
          margin-top: 15px;
          margin-left: 5px;
          font-size: 12px;
          color: #fff;
        }
      }
      .share-btn,
      .switch-btn {
        float: right;
        margin-right: 10px;
        margin-top: 8px;
        width: 24px;
        height: 24px;
      }
    }
  }
  .content {
    position: relative;
    overflow: hidden;
    background-size: 10rem;
    .wordCloud {
      position: absolute;
      animation: 7.5s ease-in 1s both running fade;
      // z-index: -1;
      @keyframes fade {
        from {
          opacity: 1;
          filter: alpha(opacity=100);
        }
        to {
          opacity: 0;
          filter: alpha(opacity=0);
        }
      }
    }
    .tooltip {
      display: none;
    }
    .boo {
      width: 100%;
      height: 100%;
      &-item {
        position: absolute;
        transform: scale(0.1);
        width: $boos-size;
        height: $boos-size;
        box-sizing: border-box;
        padding: 40px 10px 0;
        text-align: center;
        background-size: $boos-size $boos-size;
        border-radius: 50%;
        &-text {
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: rgba(243, 243, 243, 1);
        }
        &-opt {
          height: 10px;
          &-good {
            float: left;
            margin: 0 5px 0 12px;
            &-img {
              line-height: 10px;
              height: 16px;
              width: 16px;
            }
            &-text {
              display: inline-block;
              margin: 0px 0 0 3px;
              font-size: 12px;
              color: #fff;
            }
          }
          &-comment {
            float: left;
            &-img {
              height: 16px;
              width: 16px;
            }
            &-text {
              display: inline-block;
              margin: 0 0 0 3px;
              font-size: 12px;
              color: #fff;
            }
          }
        }
      }
    }
  }
  .bottom-mine {
    position: fixed;
    height: 100px;
    padding: 10px 20px 0 20px;
    bottom: 10px;
    .view-comment {
      margin: 5px;
      margin-top: 3px;
      width: 325px;
      height: 36px;
      line-height: 36px;
      border-radius: 8px;
      background-color: transparent;
      border: 1px solid rgba(100, 92, 204, 1);
      color: rgba(100, 92, 204, 1);
    }
  }
  .bottom-share {
    position: fixed;
    height: 250px;
    padding: 10px 20px 0 20px;
    bottom: 10px;
    .input {
      height: 50px;
      &-content {
        float: left;
        width: 245px;
        color: #fff !important;
        font-size: 16px;
        padding-bottom: 10px;
        margin-right: 0px;
        border-right: 0px;
        border-top: 0px;
        border-left: 0px;
        background-color: transparent;
        .van-field__control {
          color: #fff !important;
        }
      }
      &-submit {
        float: left;
        margin-left: 10px;
        width: 70px;
        height: 40px;
        border: 0px;
        font-size: 16px;
        font-weight: 400;
        color: rgba(255, 255, 255, 1);
        background: rgba(83, 70, 247, 1);
        border-radius: 8px;
      }
      input::-webkit-input-placeholder {
        color: #fff;
      }
      input:-moz-placeholder {
        color: #fff;
      }
      input::-moz-placeholder {
        color: #fff;
      }
      input:-ms-input-placeholder {
        color: #fff;
      }
    }
    .tags-comment {
      position: relative;
      height: 86px;
      padding: 10px 0;
      &-item {
        float: left;
        margin: 6px 5px;
        padding: 0 5px;
        height: 36px;
        border-radius: 6px;
        line-height: 36px;
        background: rgba(83, 70, 247, 0.3);
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(227, 227, 227, 1);
      }
      .switch {
        position: absolute;
        width: 71px;
        height: 36px;
        padding: 0;
        top: 66px;
        right: 10px;
        color: rgba(100, 92, 204, 1);
        line-height: 36px;
        border-radius: 8px;
        font-size: 14px;
        border: 1px solid rgba(100, 92, 204, 1);
        background-color: transparent;
      }
    }
    .view-comment {
      margin: 5px;
      width: 325px;
      height: 36px;
      line-height: 36px;
      border-radius: 8px;
      background-color: transparent;
      border: 1px solid rgba(100, 92, 204, 1);
      color: rgba(100, 92, 204, 1);
    }
  }
  .share-bar {
    .share {
      width: 100%;
      margin: 30px auto;
      text-align: center;
      &-item {
        display: inline-block;
        margin: 21px;
        &-icon {
          width: 41px;
          height: 41px;
        }
        &-text {
          font-size: 12px;
          color: rgba(85, 85, 85, 1);
        }
      }
    }
  }
}
</style>
