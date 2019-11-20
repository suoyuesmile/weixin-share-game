<template lang="pug">
  div.mycomment
    van-nav-bar.nav(
      title="全部评论"
      left-arrow
      @click-left="onClickLeft")
    van-list.comment(
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="getMyComment")
      van-cell.comment-item(v-for="(item, index) in list"
        :key="index")
        template(slot="title")
          img.comment-item-icon(:src="require('@/assets/images/moon.png')")
          .comment-item-text # {{item.replierAnswer}} #
        p x{{item.replierCount}}
</template>

<script>
import Vue from 'vue'
import { NavBar, List, Cell } from 'vant'
import { getMyComments } from '@/api/index'
Vue.use(List)
  .use(NavBar)
  .use(Cell)
export default {
  data() {
    return {
      // 评论列表
      list: [],
      // 加载状态
      loading: false,
      // 列表完成状态
      finished: false
    }
  },
  mounted() {
    this.getMyComment()
  },
  methods: {
    onClickLeft() {
      this.$router.replace({
        name: 'home',
        params: { from: 'comment' },
        query: { shareOpenid: this.$route.params.shareOpenid }
      })
    },
    async getMyComment() {
      const openid = localStorage.getItem('openid')
      const comments = await getMyComments({
        shareOpenid: this.$route.params.shareOpenid
          ? this.$route.params.shareOpenid
          : openid
      })
      this.finished = true
      this.loading = false
      if (!comments.data || !comments.data.length) return
      this.list = comments.data
    }
  }
}
</script>

<style lang="scss" scoped>
.mycomment {
  .nav {
    background: rgba(92, 80, 204, 1);
    .van-nav-bar__arrow,
    .van-nav-bar__title {
      color: #fff;
    }
  }
  .comment {
    &-item {
      &-icon {
        display: inline-block;
        vertical-align: middle;
        line-height: 30px;
        width: 20px;
        height: 20px;
      }
      &-text {
        display: inline-block;
        vertical-align: middle;
        margin-left: 10px;
      }
    }
  }
}
</style>
