import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
import ZkTable from 'vue-table-with-tree-grid'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ZkTable)
Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
