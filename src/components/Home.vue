<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggleButton" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333546"
          text-color="#fff"
          active-text-color="#1397ff"
          :unique-opened="true"
          :collapse-transition="false"
          :collapse="isCollapse"
          :router="true"
          :default-active="activePath"
        >
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="iconList[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item 
              :index="'/'+subItem.path" 
              v-for="subItem in item.children" 
              :key="subItem.id"
              @click="saveNavState('/'+subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { request } from "../network/request.js";

export default {
  name: "home",
  data() {
    return {
      menulist:[],
      iconList:{
        125:'el-icon-user-solid',
        103:'el-icon-box',
        101:'el-icon-shopping-bag-2',
        102:'el-icon-s-order',
        145:'el-icon-s-data'
      },
      isCollapse:false,
      activePath:''
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }
  },
  created() {
    request({
      method:'get',
      url:'/menus'
    }).then(res => {
      if(res.data.meta.status !== 200) {
        this.$message.error('获取失败')
        return;
      }
      this.menulist = res.data.data;
    })
    this.activePath = window.sessionStorage.getItem('activePath')?window.sessionStorage.getItem('activePath'):''
  }
};
</script>

<style scoped>
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  font-size: 20px;
  background-color: #363d41;
  color: #fff;
}
.el-header div {
  display: flex;
  align-items: center;
}
.el-header div span {
  margin-left: 15px;
}
.el-aside {
  background-color: #333645;
}

.toggleButton {
  height: 24px;
  line-height: 24px;
  text-align: center;
  background-color: #4a4f65;
  color: #fff;
  letter-spacing: 0.2em;
  font-size: 10px;
}

.el-main {
  background-color: #eaedf1;
}

.el-menu {
  width: 100%;
}
</style>