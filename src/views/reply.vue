<template lang="pug">
  div.mycomment
    van-nav-bar.nav(
      title="评论"
      left-arrow
      @click-left="onClickLeft")
    .content
      .content-text(@click="showAddCommentBar('content')") # {{commentLabel}}
      .content-opt
        .content-opt-good
          img.content-opt-good-img(:src="require('@/assets/images/icon_good.png')")
          .content-opt-good-text {{agreeCount || 0}}
        .content-opt-comment
          img.content-opt-comment-img(:src="require('@/assets/images/icon_repay.png')")
          .content-opt-comment-text {{replyCount || 0}}
    .comment
      .comment-item(
        v-for="(comment, index) in commentData"
        @click="showAddCommentBar('comment', comment.discussId)"
        :key="index"
        name="1")
        van-divider(:style="{margin: '0'}")
        .comment-item-content
          img.comment-item-content-avatar(:src="require('@/assets/images/avatar.png')")
          span.comment-item-content-text 评论：{{comment.replierAnswer}}
        .comment-item-reply
          .comment-item-reply-item(
            @click="showAddCommentBar('reply', item.discussId)"
            v-for="(item, index) in comment.subList"
            :key="index"
            )
            img.comment-item-reply-item-avatar(:src="require('@/assets/images/avatar.png')")
            span.comment-item-reply-item-text 回复：{{item.replierAnswer}}
      van-popup(v-model="showInputBar" position="bottom" :style="{height: '44px'}" @close="onInputPopopClose")
        van-cell-group
          van-field(v-model="commentValue" :label="inputLabel" :placeholder="inputPlaceholder")
            img(
              slot="button"
              :src="require('@/assets/images/icon_send.png')"
              style="height:16px;width:16px;margin:5px 10px 0 0;"
              @click="submitReply"
            )
</template>

<script>
import Vue from 'vue'
import {
  NavBar,
  Collapse,
  CollapseItem,
  Divider,
  Popup,
  Field,
  CellGroup,
  Toast
} from 'vant'
import { getCommentsDetail, reply } from '@/api/index'
Vue.use(Divider)
  .use(Field)
  .use(CellGroup)
  .use(Popup)
  .use(NavBar)
  .use(Collapse)
  .use(CollapseItem)
  .use(Toast)
export default {
  data() {
    return {
      // 当前用户openid
      curOpenid: '',
      // 是否显示输入框
      showInputBar: false,
      // 当前评论主要标签
      commentLabel: '',
      // 点赞数量
      agreeCount: 0,
      // 回复数量
      replyCount: 0,
      // 输入内容
      commentValue: '',
      // 输入框标签
      inputLabel: '添加评论',
      // 输入框holder
      inputPlaceholder: '输入你的评论',
      // 评论数据
      commentData: [],
      // 回复提交输入表单
      replyForm: {
        curOpenid: '',
        parentId: '',
        replierAnswer: '',
        replierId: ''
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    // 页面参数加载初始化
    init() {
      this.commentLabel = this.$route.params.booItem.replierAnswer
      this.curOpenid = this.$route.params.openid
      this.replyForm.curOpenid = this.$route.params.openid
      this.getDetail()
    },
    // 点击返回触发
    onClickLeft() {
      this.$router.replace({
        name: 'home',
        params: { from: 'comment' },
        query: { shareOpenid: this.$route.params.shareOpenid }
      })
    },
    // 获取详细数据
    async getDetail() {
      const id = this.$route.params.booItem.id
      const res = await getCommentsDetail({
        replierId: id,
        curOpenid: this.curOpenid
      })
      this.agreeCount = res.data.agreeCount
      this.replyCount = res.data.followCount
      this.commentData = res.data.subList
      this.replyForm.replierId = res.data.id
    },
    // 提交回复
    async submitReply() {
      this.replyForm.replierAnswer = this.commentValue
      const res = await reply(this.replyForm)
      if (res.code === '000000') {
        this.commentValue = ''
        Toast.success('回复成功')
        this.showInputBar = false
        this.getDetail()
      } else {
        Toast.fail(res.msg)
        this.commentValue = ''
      }
    },
    // 显示评论内容bar
    showAddCommentBar(type, id) {
      if (type === 'content') {
        this.inputLabel = '添加评论'
        this.inputPlaceholder = '输入你的评论'
        this.replyForm.parentId = ''
      } else {
        this.replyForm.parentId = id
        this.inputLabel = '添加回复'
        this.inputPlaceholder = '输入你的回复'
      }
      this.showInputBar = true
    },
    onInputPopopClose() {
      this.commentValue = ''
    }
  }
}
</script>

<style lang="scss">
.mycomment {
  width: 100%;
  height: 100%;
  .nav {
    background: rgba(92, 80, 204, 1);
    .van-nav-bar__arrow,
    .van-nav-bar__title {
      color: #fff;
    }
  }
  .content {
    padding: 15px;
    &-text {
      font-size: 14px;
    }
    &-opt {
      &-good {
        margin-right: 15px;
        display: inline-block;
        &-img {
          margin-right: 5px;
          display: inline-block;
          width: 15px;
          height: 15px;
          background-size: 15px 15px;
        }
        &-text {
          display: inline-block;
          font-size: 10px;
          color: rgba(51, 51, 51, 1);
        }
      }
      &-comment {
        display: inline-block;
        &-img {
          margin-right: 5px;
          display: inline-block;
          width: 15px;
          height: 15px;
          background-size: 15px 15px;
        }
        &-text {
          display: inline-block;
          font-size: 10px;
          color: rgba(193, 193, 193, 1);
        }
      }
    }
  }
  .comment {
    padding-left: 10px;
    &-item {
      &-content {
        // height: 64px;
        &-avatar {
          display: inline-block;
          vertical-align: middle;
          width: 24px;
          height: 24px;
        }
        &-text {
          font-size: 14px;
          display: inline-block;
          vertical-align: middle;
          margin: 0px 10px;
        }
      }
      &-reply {
        padding-left: 30px;
        &-item {
          height: 44px;
          &-avatar {
            display: inline-block;
            vertical-align: middle;
            width: 24px;
            height: 24px;
          }
          &-text {
            font-size: 14px;
            display: inline-block;
            vertical-align: middle;
            margin: 0px 10px;
          }
        }
      }
    }
  }
}
</style>
