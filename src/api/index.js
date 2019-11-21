import { post, fetch } from '@/utils/http'

// 查询头像和昵称
export const getUserBaseInfo = data =>
  post('/eval/home/queryUserBaseInfo', data)
// 获取用户基础信息
export const getCurrentUserBaseInfo = data => post('/eval/home/home', data)
// 微信授权
export const oAuth = data => fetch('/eval/weixin/obtainRedirectUri', data)
// 微信签名
export const sign = data => fetch('/eval/weixin/obtainSignature', data)
// 用户点赞
export const agree = data => post('/eval/home/thumbUp', data)
// 增加评论
export const addComment = data => post('/eval/home/addReplierRecord', data)
// 获取评论信息
export const getComments = data => post('/eval/home/queryFriendsRepliers', data)
// 获取评论信息
export const getMyComments = data => post('/eval/label/myRepliers', data)
// 获取评论标签
export const getTags = data => post('/eval/label/queryLabels', data)
// 获取评论标签标签
export const getParentTags = data => post('/eval/label/querySummaryLabel', data)

// 获取评论详情
export const getCommentsDetail = data =>
  post('/eval/label/querySubRepliers', data)

// 评论回复
export const reply = data => post('/eval/discuss/addDiscuss', data)
