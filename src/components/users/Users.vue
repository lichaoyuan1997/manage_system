<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table border stripe :data="userList">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" :width="180">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)">
            </el-button>
            <el-tooltip effect="dark" content="分配权限" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form ref="editFormRef" :rules="editFormRules" :model="editForm" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户:{{userInfo.username}}</p>
        <p>当前的角色:{{userInfo.role_name}}</p>
        <p>分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="savaRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import {
    request
  } from "../../network/request.js";

  export default {
    name: "users",
    data() {
      var checkEmail = (rule, value, callback) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-]+)+$/;
        if (regEmail.test(value))
          return callback()
        callback(new Error('请输入合法的邮箱'))
      };
      var checkMobile = (rule, value, callback) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
        if (regMobile.test(value)) {
          return callback()
        }
        callback(new Error('请输入合法的手机号'))
      };
      return {
        queryInfo: {
          query: "",
          pagenum: 1,
          pagesize: 2,
        },
        userList: [],
        total: 0,
        addDialogVisible: false,
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        addFormRules: {
          username: [{
              required: true,
              message: '请输入用户名',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 10,
              message: '长度在 3 到 10 个字符',
              trigger: 'blur'
            }
          ],
          password: [{
              required: true,
              message: '请输入密码',
              trigger: 'blur'
            },
            {
              min: 6,
              max: 15,
              message: '长度在 6 到 15 个字符',
              trigger: 'blur'
            }
          ],
          email: [{
              required: true,
              message: '请输入邮箱',
              trigger: 'blur'
            },
            {
              validator: checkEmail,
              trigger: 'blur'
            }
          ],
          mobile: [{
              required: true,
              message: '请输入手机号',
              trigger: 'blur'
            },
            {
              validator: checkMobile,
              trigger: 'blur'
            }
          ]
        },
        editDialogVisible: false,
        editForm: {},
        editFormRules: {
          email: [{
              required: true,
              message: '请输入邮箱',
              trigger: 'blur'
            },
            {
              validator: checkEmail,
              trigger: 'blur'
            }
          ],
          mobile: [{
              required: true,
              message: '请输入手机号',
              trigger: 'blur'
            },
            {
              validator: checkMobile,
              trigger: 'blur'
            }
          ]
        },
        setRoleDialogVisible: false,
        userInfo: {},
        rolesList: [],
        selectedRoleId: ''
      };
    },
    created() {
      this.getUserList();
    },
    methods: {
      getUserList() {
        request({
          method: "get",
          url: "/users",
          params: this.queryInfo,
        }).then((res) => {
          if (res.data.meta.status !== 200)
            return this.$message.error("获取用户列表失败");
          this.total = res.data.data.total;
          this.userList = res.data.data.users;
        });
      },
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize;
        this.getUserList();
      },
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage;
        this.getUserList();
      },
      userStateChanged(userInfo) {
        console.log(userInfo);
        request({
          method: "put",
          url: `/users/${userInfo.id}/state/${userInfo.mg_state}`,
        }).then((res) => {
          if (res.data.meta.status !== 200) {
            return this.$message.error("状态设置失败");
          }
          this.$message({
            showClose: true,
            message: "状态设置成功",
            type: "success",
          });
        });
      },
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      addUser() {
        this.$refs.addFormRef.validate(valid => {
          if (!valid) return;
          request({
            method: 'post',
            url: 'users',
            data: this.addForm
          }).then(res => {
            if (res.data.meta.status !== 201)
              return this.$message.error('添加用户失败')
            this.$message({
              showClose: true,
              message: "添加用户成功",
              type: "success",
            });
            this.addDialogVisible = false
            this.getUserList()
          })
        })
      },
      showEditDialog(id) {
        request({
          method: 'get',
          url: '/users/' + id,
        }).then(res => {
          this.editForm = res.data.data
          console.log(this.editForm)
          this.editDialogVisible = true;
        })
      },
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      editUserInfo() {
        this.$refs.editFormRef.validate(valid => {
          if (!valid) return;
          request({
            method: 'put',
            url: '/users/' + this.editForm.id,
            data: {
              mobile: this.editForm.mobile,
              email: this.editForm.email
            }
          }).then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error('修改信息错误')
            }
            this.editDialogVisible = false;
            this.$message({
              showClose: true,
              message: "修改信息成功",
              type: "success",
            });
            this.getUserList()
          })
        })
      },
      removeUserById(id) {
        console.log(id)
        this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          request({
            method: 'delete',
            url: '/users/' + id,
          }).then(res => {
            if (res.data.meta.status !== 200)
              return this.$message.error('删除失败')
            this.$message({
              showClose: true,
              message: "删除成功",
              type: "success",
            });
            this.getUserList()
          })
        }).catch(e => {
          this.$message({
            message: '已取消删除',
            center: true
          });
        })
      },
      setRole(role) {
        this.userInfo = role
        request({
          method: 'get',
          url: '/roles'
        }).then(res => {
          if (res.data.meta.status !== 200)
            this.$message.error('获取用户列表角色失败')
          this.rolesList = res.data.data
        })
        this.setRoleDialogVisible = true;
      },
      savaRoleInfo() {
        if (!this.selectedRoleId) {
          return this.$message.error('请选择要分配的角色')
        }
        request({
          method: 'post',
          url: `/users/${this.userInfo.id}/role`,
          data: {
            rid:this.selectedRoleId
          }
        }).then(res => {
          console.log(res)
          if (res.data.meta.status !== 200) {
            return this.$message.error('角色更新失败')
          }
          this.$message({
            showClose: true,
            message: "角色更新成功",
            type: "success",
          });
          this.getUserList()
        })
        this.setRoleDialogVisible = false;
      },
      setRoleDialogClosed() {
        this.userInfo = {}
        this.selectedRoleId = ''
      }
    },
  };
</script>

<style scoped>
  .el-card {
    margin-top: 15px;
  }

  .el-table {
    margin-top: 15px;
    font-size: 12px;
  }

  .el-pagination {
    margin-top: 15px;
  }
</style>