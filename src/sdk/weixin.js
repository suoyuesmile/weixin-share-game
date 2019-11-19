// wxapi.js
import wx from 'weixin-js-sdk'
import { sign } from '@/api/index'
const wxApi = {
  /**
   * [isweixin 判断是否微信浏览器]
   */
  isWeixin() {
    const ua = window.navigator.userAgent.toLowerCase()
    if (ua.match(/Micromessenger/i)[0] === 'micromessenger') {
      return true
    } else {
      return false
    }
  },
  wxRegister(callback) {
    let data = { url: window.location.href }
    sign(data)
      .then(res => {
        wx.config({
          debug: false, // 开启调试模式
          appId: res.data.appId, // 必填，公众号的唯一标识
          timestamp: res.data.timestamp, // 必填，生成签名的时间戳
          nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
          signature: res.data.signature, // 必填，签名，见附录1
          jsApiList: [
            'updateAppMessageShareData',
            'updateTimelineShareData',
            'onMenuShareAppMessage',
            'hideMenuItems'
          ]
        })
        wx.ready(res => {
          console.log(res)
          wx.hideMenuItems({
            menuList: [
              'menuItem:share:qq',
              'menuItem:share:weiboApp',
              'menuItem:share:facebook',
              'menuItem:share:QZone',
              'menuItem:openWithQQBrowser',
              'menuItem:openWithSafari',
              'menuItem:originPage',
              'menuItem:share:email'
            ]
          })
          if (callback) {
            callback()
          }
        })
      })
      .catch(error => {
        console.log(error)
      })
  },
  shareTimeline(option) {
    wx.onMenuShareTimeline({
      title: option.title, // 分享标题
      link: option.link, // 分享链接
      imgUrl: option.imgUrl, // 分享图标
      success() {
        option.success()
      },
      cancel() {
        option.error()
      }
    })
  }
  // share
}
export default wxApi
