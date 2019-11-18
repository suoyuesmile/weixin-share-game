import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入通用scss文件初始化样式
import '@/assets/styles/index.scss'
import 'animate'
// 适应屏幕宽度
import '@/utils/adapt.js'
import VueAnime from 'vue-animejs'
import { Toast } from 'vant'

Vue.use(Toast)
Vue.use(VueAnime)

Vue.prototype.toast = Toast
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
