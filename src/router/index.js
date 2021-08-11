import Vue from 'vue'
import Router from 'vue-router'

const Home = () => import('../components/Home')
const Login = () => import('../components/Login')
const Welcome = () => import('../components/Welcome')
const Users = () => import('../components/users/Users')
const Rights = () => import('../components/power/Rights')
const Roles = () => import('../components/power/Roles')

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
    component:Home,
    redirect:'/welcome',
    children:[
      {
        path:'/welcome',
        component:Welcome
      },
      {
        path:'/users',
        component: Users
      },
      {
        path:'/rights',
        component: Rights
      },
      {
        path:'/roles',
        component: Roles
      }
    ]
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