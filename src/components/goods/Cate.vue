<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <zk-table class="treeTable" v-if="cateList.length != 0" :data="cateList" :columns="columns"
        :selection-type="false" :show-row-hover="false" :expand-type="false" index-text="#" show-inde x border>
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:green;"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </zk-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="活动名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader v-model="selectedKeys" :options="parentCateList" @change="parentCateChange" :props="ascaderProps"
            clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import {
    request
  } from "../../network/request.js";
  export default {
    name: "cate",
    data() {
      return {
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        cateList: [],
        total: 0,
        columns: [{
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            type: 'template',
            template: 'isok',
          },
          {
            label: '排序',
            type: 'template',
            template: 'order'
          },
          {
            label: '操作',
            type: 'template',
            template: 'opt'
          }
        ],
        addCateDialogVisible: false,
        addCateForm: {
          cat_pid: 0,
          cat_name: '',
          cat_level: 0
        },
        addCateFormRules: {
          cat_name: [{
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }, ]
        },
        parentCateList: [],
        selectedKeys: [],
        ascaderProps: {
          label: 'cat_name',
          value: 'cat_id',
          children: 'children',
          checkStrictly: true,
          expandTrigger: 'hover'
        }
      }
    },
    methods: {
      getCateList() {
        request({
          method: 'get',
          url: '/categories',
          params: this.queryInfo
        }).then(res => {
          if (res.data.meta.status !== 200)
            this.$message.error('获取商品分类列表失败')
          this.total = res.data.data.total
          this.cateList = res.data.data.result
        })
      },
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      showAddCateDialog() {
        this.addCateDialogVisible = true
        this.getParentCateList()
      },
      getParentCateList() {
        request({
          method: 'get',
          url: '/categories',
          params: {
            type: 2
          }
        }).then(res => {
          if (res.data.meta.status !== 200)
            return this.$message.error('获取父级分类失败')
          this.parentCateList = res.data.data
        })
      },
      parentCateChange() {
        if (this.selectedKeys.length > 0) {
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          this.addCateForm.cat_level = this.selectedKeys.length
        } else {
          this.addCateForm.cat_pid = 0
          this.addCateForm.cat_level = 0
        }
      },
      addCate() {
        this.$refs.addCateFormRef.validate(valid => {
          if (!valid) return
          request({
            method: 'post',
            url: '/categories',
            data: this.addCateForm
          }).then(res => {
            if (res.data.meta.status !== 201)
              return this.$message.error('添加分类失败')
            this.$message({
              showClose: true,
              message: "添加分类成功",
              type: "success",
            })
            this.getCateList()
            this.addCateDialogVisible = false
          })
        })

      },
      addCateDialogClosed() {
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys = []
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    created() {
      this.getCateList()
    }
  }
</script>

<style scoped>
  .el-card {
    margin-top: 15px;
  }

  .treeTable {
    margin-top: 15px;
  }

  .el-pagination {
    margin-top: 15px;
  }

  .el-cascader {
    width: 100%;
  }
</style>