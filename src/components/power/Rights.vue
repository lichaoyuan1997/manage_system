<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-table :data="rightsList" style="width: 100%" border stripe>
        <el-table-column label="#" type="index">
        </el-table-column>
        <el-table-column prop="authName" label="权限名称">
        </el-table-column>
        <el-table-column prop="path" label="路径">
        </el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
  import {
    request
  } from "../../network/request.js";
  export default {
    name: "rights",
    data() {
      return {
        rightsList: []
      }
    },
    methods: {
      getRightsList() {
        request({
          method: 'get',
          url: '/rights/list',
        }).then(res => {
          if (res.data.meta.status !== 200)
            return this.$message.error('获取权限列表失败')
          this.rightsList = res.data.data
          console.log(this.rightsList);
        })
      }
    },
    created() {
      this.getRightsList()
    }
  }
</script>

<style scoped>
  .el-card {
    margin-top: 15px;
  }
</style>