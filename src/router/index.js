import Vue from 'vue'
import Router from 'vue-router'

const Home = () => import('../components/Home')
const Login = () => import('../components/Login')

Vue.use(Router)

const routes = [
  {
    path:'/',
    redirect:'/login'
  },
  {
    path:'/login',
    component:Login
  },
  {
    path:'/home',
    component:Home
  }
]

const router = new Router({
  routes,
  mode:"history"
})

router.beforeEach((to,from,next) => {
  if(to.path === '/login')
    return next()
  let tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr)
    return next('/login')
  next()
})

export default router