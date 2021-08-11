<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1,i1) in scope.row.children" :key="i1"
              :class="['bdbottom','vcenter',i1===0?'':'bdtop']">
              <el-col :span="5">
                <el-tag @close="removeRightById(scope.row,item1.id)" closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row v-for="(item2,i2) in item1.children" :key="i2" :class="['vcenter',i2 !== 0?'bdtop':'']">
                  <el-col :span="6">
                    <el-tag type="success" @close="removeRightById(scope.row,item2.id)" closable>{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="(item3,i3) in item2.children" :key="i3" type="warning"
                      @close="removeRightById(scope.row,item3.id)" closable>{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column label="角色名称" prop="roleName">
        </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc">
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <el-tree ref="treeRef" :data="rightList" :props="treeProps" default-expand-all node-key="id" show-checkbox :default-checked-keys="defKeys"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allocateRights">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="40%" @close="addDialogClose">
      <el-form ref="addRoleRef" :model="addRoleForm" :rules="addFormRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
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
        rolesList: [],
        addRoleForm: {
          roleName: '',
          roleDesc: ''
        },
        addFormRules: {
          roleName: [{
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }],
          roleDesc: [{
            required: true,
            message: '请输入角色描述',
            trigger: 'blur'
          }, ]
        },
        addDialogVisible: false,
        setRightDialogVisible: false,
        rightList:[],
        treeProps:{
          children:'children',
          label:'authName'
        },
        defKeys:[],
        roleId:''
      }
    },
    methods: {
      addDialogClose() {
        this.$refs.addRoleRef.resetFields()
      },
      addRole() {
        request({
          method: 'post',
          url: '/roles',
          data: this.addRoleForm
        }).then(res => {
          if (res.data.meta.status !== 201)
            return this.$message.error('添加角色失败');
          this.$message({
            showClose: true,
            message: "添加角色成功",
            type: "success",
          });
          this.getRoleList()
          this.addDialogVisible = false
        })
      },
      getRoleList() {
        request({
          method: 'get',
          url: '/roles'
        }).then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error('获取角色列表失败')
          }
          this.rolesList = res.data.data
        })
      },
      deleteRole(id) {
        request({
          method: 'delete',
          url: '/roles/' + id
        }).then(res => {
          if (res.data.meta.status !== 200)
            return this.$message.error('删除角色失败')
          this.$message({
            showClose: true,
            message: "删除角色成功",
            type: "success",
          });
          this.getRoleList()
        })

      },
      removeRightById(role, rightId) {
        this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          request({
            method: 'delete',
            url: `/roles/${role.id}/rights/${rightId}`
          }).then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error('删除权限失败')
            }
            this.$message({
              showClose: true,
              message: "删除权限成功",
              type: "success",
            });
            role.children = res.data.data
          })
        }).catch(e => {
          this.this.$message('取消了删除！');
        })
      },
      showSetRightDialog(role) {
        request({
          method:'get',
          url:'/rights/tree'
        }).then(res => {
          if(res.data.meta.status !== 200){
            return this.$message.error('获取权限列表失败')
          }
          this.rightList = res.data.data
        })
        this.roleId = role.id
        this.getLeafKeys(role,this.defKeys)
        this.setRightDialogVisible = true
      },
      getLeafKeys(role,defKeys){
        if(!role.children) {
          return defKeys.push(role.id)
        }
        role.children.forEach(item => {
          this.getLeafKeys(item,defKeys)
        })
      },
      setRightDialogClosed() {
        this.defKeys = []
      },
      allocateRights() {
        const keys = [...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()]
        request({
          method:'post',
          url:`/roles/${this.roleId}/rights`,
          data:{
            rids:keys.join(',')
          }
        }).then(res => {
          this.setRightDialogVisible = false;
          if(res.data.meta.status !== 200) 
            return this.$message.error('分配权限失败')
          this.$message({
            showClose: true,
            message: "分配权限成功成功",
            type: "success",
          });
          this.getRoleList()
        })
      }
    },
    created() {
      this.getRoleList()
    }
  }
</script>
<style scoped>
  .el-card {
    margin-top: 15px;
  }

  .el-table {
    margin-top: 15px;
  }

  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>