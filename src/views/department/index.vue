<template>
  <div>
    <el-row>
      <el-col :span="24">
        <el-row :gutter="20">
          <el-col :span="6">
            <!--搜索区域-->
            <el-input placeholder="请输入内容" v-model="queryInfo.keyword" clearable @clear="getDepartmentList">
              <el-button slot="append" icon="el-icon-search" @click="getDepartmentList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="2.5">
            <el-button type="primary" @click="addDialogVisible = true" v-if="$store.state.user.userStatus == 'superadmin'">添加部门</el-button>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="24">
        <!--表格-->
        <el-table :data="departmentList" border stripe>
          <el-table-column type="index" label="序号"></el-table-column>
          <el-table-column prop="departmentName" label="部门"></el-table-column>
          <el-table-column prop="userName" label="部门主管"></el-table-column>
          <el-table-column label="操作" v-if="$store.state.user.userStatus != 'user'">
            <!-- 作用域插槽 -->
            <template slot-scope="scope">
              <el-button type="primary" size="mini" icon="el-icon-search" @click="showEditDialog(scope.row.departmentId)" title="查看详情"
              v-if="$store.state.user.userName == scope.row.userName">
              </el-button>
              <el-button type="danger" size="mini" icon="el-icon-delete"  v-if="$store.state.user.userStatus == 'superadmin'"
                @click="removeDepartmentById(scope.row.departmentId)" title="删除部门">
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <el-row>
      <!--分页区域-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNo" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-row>
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed"
      :close-on-click-modal="false">
      <!--内容主体区域-->
      <el-form :model="departmentForm" label-width="100px" ref="departmentForm">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="departmentForm.name"></el-input>
        </el-form-item>
        <el-form-item label="部门主管" prop="managerId">
          <el-select v-model="departmentForm.managerId" placeholder="请选择主管" style="width: 100%" @focus="roleFocus"
            @change="(departmentForm.roleData.userName)" value-key="value">
            <el-option v-for="item in departmentForm.roleData" :key="item.userId" :value="item.userId"
              :label="item.userName"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!--底部按钮区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="addDepartment">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="岗位" :visible.sync="editDialogVisible" width="30%" :close-on-click-modal="false">
      <el-dialog width="30%" title="详情" :visible.sync="innerVisible" :close-on-click-modal="false" append-to-body
        @close="innerClosed">
        <el-form :model="positionForm" label-width="100px" ref="positionForm">
          <el-form-item label="岗位名称" prop="name">
            <el-input v-model="positionForm.name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="addPosition">确 定</el-button>
        </span>
      </el-dialog>
      <!--内容主体区域-->
      <el-table :data="positionList" border stripe>
        <el-table-column prop="positionName" label="岗位名称"></el-table-column>
        <el-table-column label="操作" width="65">
          <!-- 作用域插槽 -->
          <template slot-scope="position">
            <el-button type="danger" size="mini" icon="el-icon-delete"
              @click="removePositionById(position.row.positionId)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--底部按钮区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="innerOpen" type="primary">添加岗位</el-button>
        <el-button @click="editDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
var a = 0;
  import {
    departmentList,
    departmentAdd,
    positionList,
    departmentDelete,
    positionDelete,
    positionAdd,
  } from "@/api/department";
  import {
    allAdminList,
  } from "@/api/user";
  export default {
    data() {
      return {
        departmentList: [], // 部门列表
        positionList: [], // 岗位列表
        total: 0, // 部门总数
        // 获取部门列表的参数对象
        queryInfo: {
          keyword: "", // 查询参数
          pageNo: 1, // 当前页码
          pageSize: 5, // 每页显示条数
        },
        addDialogVisible: false,
        editDialogVisible: false,
        innerVisible: false,
        departmentForm: {
          //部门
          name: '',
          managerId: '',
        },
        positionForm: {
          name: '',
          departmentId: '',
        },
      }
    },
    created() {
      // 生命周期函数
      this.getDepartmentList();
      this.roleFocus();
    },

    methods: {
      getDepartmentList() {
        departmentList(this.queryInfo)
          .then((res) => {
            if (res.data.resultCode === 200) {
              //部门列表
              this.departmentList = res.data.data.records;
              this.total = res.data.data.total;
            } else if (res.data.resultCode === 401) {
              this.$message.error(res.data.message);
              window.sessionStorage.clear();
              this.$router.push('/login');
            } else {
              this.$message.error(res.data.message);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      },
      // 监听 pageSize 改变的事件
      handleSizeChange(newSize) {
        // console.log(newSize)
        this.queryInfo.pageSize = newSize;
        // 重新发起请求用户列表
        this.getDepartmentList();
      },
      // 监听 当前页码值 改变的事件
      handleCurrentChange(newPage) {
        // console.log(newPage)
        this.queryInfo.pageNo = newPage;
        // 重新发起请求用户列表
        this.getDepartmentList();
      },
      cancel() {
        this.addDialogVisible = false
        this.$refs.departmentForm.resetFields();
      },
      addDialogClosed() {
        // 表单内容重置为空
        this.$refs.departmentForm.resetFields();
      },
      innerClosed() {
        // 表单内容重置为空
        this.$refs.positionForm.resetFields();
      },
      innerOpen(){
        this.innerVisible = true;
        this.positionForm.departmentId = a;
      },
      roleFocus() {
        const _this = this
        allAdminList()
          .then(function (resp) {
            _this.departmentForm.roleData = resp.data.data
          })
      },
      addDepartment() {
        departmentAdd(this.departmentForm)
          .then((res) => {
            if (res.data.resultCode === 200) {
              this.addDialogVisible = false;
              this.getDepartmentList();
              this.$message({
                message: "添加部门成功",
                type: "success",
              });
              this.$refs.departmentForm.resetFields();
            } else if (res.data.resultCode === 401) {
              this.$message.error(res.data.message);
              window.sessionStorage.clear();
              this.$router.push('/login');
            } else {
              this.$message.error(res.data.message);
            }
          })
          .catch((err) => {
            this.$message.error("添加部门异常");
            console.log(err);
          });
      },
      addPosition() {
        positionAdd(this.positionForm)
          .then((res) => {
            if (res.data.resultCode === 200) {
              this.innerVisible = false;
              this.showEditDialog(a);
              this.$message({
                message: "添加用户成功",
                type: "success",
              });
              this.$refs.positionForm.resetFields();
            } else if (res.data.resultCode === 401) {
              this.$message.error(res.data.message);
              window.sessionStorage.clear();
              this.$router.push('/login');
            } else {
              this.$message.error(res.data.message);
            }
          })
          .catch((err) => {
            this.$message.error("添加用户异常");
            console.log(err);
          });
      },
      showEditDialog(departmentId) {
        this.editDialogVisible = true;
        a = departmentId;
        positionList(departmentId)
          .then((res) => {
            if (res.data.resultCode === 200) {
              //岗位列表
              this.positionList = res.data.data;
            } else if (res.data.resultCode === 401) {
              this.$message.error(res.data.message);
              window.sessionStorage.clear();
              this.$router.push('/login');
            } else {
              this.$message.error(res.data.message);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      },
      // 根据ID删除对应的部门信息
      async removeDepartmentById(departmentId) {
        // 弹框 询问用户是否删除
        const confirmResult = await this.$confirm(
          "此操作将永久删除该部门, 是否继续?",
          "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).catch((err) => err);
        // 如果用户确认删除，则返回值为字符串 confirm
        // 如果用户取消删除，则返回值为字符串 cancel
        // console.log(confirmResult)
        if (confirmResult == "confirm") {
          //删除部门
          departmentDelete(departmentId)
            .then((res) => {
              if (res.data.resultCode === 200) {
                this.getDepartmentList();
                this.$message({
                  message: "删除部门成功",
                  type: "success",
                });
              } else if (res.data.resultCode === 401) {
                this.$message.error(res.data.message);
                window.sessionStorage.clear();
                this.$router.push('/login');
              } else {
                this.$message.error(res.data.message);
              }
            })
            .catch((err) => {
              this.$message.error("删除部门异常");
              console.log(err);
            });
        }
      },
      // 根据ID删除对应的岗位信息
      async removePositionById(positionId) {
        // 弹框 询问用户是否删除
        const confirmResult = await this.$confirm(
          "此操作将永久删除该岗位, 是否继续?",
          "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).catch((err) => err);
        // 如果用户确认删除，则返回值为字符串 confirm
        // 如果用户取消删除，则返回值为字符串 cancel
        // console.log(confirmResult)
        if (confirmResult == "confirm") {
          //删除岗位
          positionDelete(positionId)
            .then((res) => {
              if (res.data.resultCode === 200) {
                this.showEditDialog(a);
                this.$message({
                  message: "删除岗位成功",
                  type: "success",
                });
              } else if (res.data.resultCode === 401) {
                this.$message.error(res.data.message);
                window.sessionStorage.clear();
                this.$router.push('/login');
              } else {
                this.showEditDialog(a);
                this.$message.error(res.data.message);
              }
            })
            .catch((err) => {
              this.$message.error("删除岗位异常");
              this.showEditDialog(a);
              console.log(err);
            });
        }
      },

    }
  }

</script>
