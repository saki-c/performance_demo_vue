<template>
  <div>
    <!--Layout布局-->
    <el-row>
      <el-col :span="24">
        <el-row :gutter="20">
          <el-col :span="6">
            <!--搜索区域-->
            <el-input placeholder="请输入内容" v-model="queryInfo.keyword" clearable @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="2.5" v-if="$store.state.user.userStatus != 'user'">
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="24">
        <!--表格-->
        <el-table :data="userList" border stripe>
          <el-table-column type="index" label="序号"></el-table-column>
          <el-table-column prop="userName" label="姓名"></el-table-column>
          <el-table-column prop="userNickname" label="昵称"></el-table-column>
          <el-table-column prop="departmentName" label="部门"></el-table-column>
          <el-table-column prop="positionName" label="岗位"></el-table-column>
          <el-table-column prop="userStatus" label="用户组"></el-table-column>
          <el-table-column label="操作" v-if="$store.state.user.userStatus != 'user'">
            <!-- 作用域插槽 -->
            <template slot-scope="scope">
              <!--修改按钮-->
              <el-button type="primary" size="mini" icon="el-icon-refresh-right"
                @click="resetPasswordById(scope.row.userId)" title="重置密码">
              </el-button>
              <!--删除按钮-->
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeUserById(scope.row.userId)" title="删除" v-if="scope.row.userStatus == 'user'">
              </el-button>
              <el-button type="primary" size="mini" icon="el-icon-top" v-if="$store.state.user.userStatus != 'user' && scope.row.userStatus == 'user'"
                @click="promoteUserById(scope.row.userId)" title="提升用户组">
              </el-button>
              <el-button type="primary" size="mini" icon="el-icon-bottom" v-if="$store.state.user.userStatus != 'user' && scope.row.userStatus == 'admin'"
                @click="degradeUserById(scope.row.userId)" title="降低用户组">
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
    <!--添加用户的对话框-->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed"
      :close-on-click-modal="false">
      <!--内容主体区域-->
      <el-form :model="userForm" label-width="100px" ref="userForm">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name"></el-input>
        </el-form-item>
        <el-form-item label="登陆昵称" prop="nickname">
          <el-input v-model="userForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="userForm.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="岗位" prop="positionId">
          <el-select v-model="userForm.positionId" placeholder="请选择岗位" style="width: 100%" @focus="positionFocus"
            @change="(userForm.positionData.positionName)" value-key="value">
            <el-option v-for="item in userForm.positionData" :key="item.positionId" :value="item.positionId"
              :label="item.positionName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="直接主管" prop="director">
          <el-select v-model="userForm.directorId" placeholder="请选择主管" style="width: 100%" @focus="roleFocus"
            @change="(userForm.roleData.directorId)" value-key="value">
            <el-option v-for="item in userForm.roleData" :key="item.userId" :value="item.userId" :label="item.userName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="入职时间" prop="joinDate">
          <el-date-picker type="date" placeholder="选择日期" v-model="userForm.joinDate" value-format="yyyy-MM-dd HH:mm:ss"
            :picker-options="pickerOptions" style="width: 100%">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <!--底部按钮区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改用户的对话框-->
    <el-dialog title="修改密码" :visible.sync="editDialogVisible" width="30%" @close="editDialogClosed"
      :close-on-click-modal="false">
      <!--内容主体区域-->
      <el-form :model="editForm" ref="editForm" label-width="70px" status-icon :rules="rules">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="editForm.oldPassword"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input type="password" v-model="editForm.newPassword" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="重复密码" prop="againPassword">
          <el-input type="password" v-model="editForm.againPassword" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <!--底部按钮区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import {
    userList,
    userAdd,
    userDelete,
    passwordReset,
    userPromote,
    userDegrade,
    positionList,
    adminList,
  } from "@/api/user";

  export default {
    data() {
      return {
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          },
        },
        userList: [], // 用户列表
        total: 0, // 用户总数
        // 获取用户列表的参数对象
        queryInfo: {
          keyword: "", // 查询参数
          pageNo: 1, // 当前页码
          pageSize: 5, // 每页显示条数
        },
        addDialogVisible: false, // 控制添加用户对话框是否显示
        userForm: {
          //用户
          name: '',
          nickname: '',
          password: '',
          positionId: '',
          directorId: '',
          joinDate: ''
        },
        editDialogVisible: false, // 控制修改用户信息对话框是否显示
        editForm: {
          oldPassword: '',
          newPassword: '',
          againPassword: '',
        },
      };
    },
    created() {
      // 生命周期函数
      this.getUserList();
      this.positionFocus();
      this.roleFocus();
    },
    methods: {
      getUserList() {
        userList(this.queryInfo)
          .then((res) => {
            if (res.data.resultCode === 200) {
              //用户列表
              this.userList = res.data.data.records;
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
        this.getUserList();
      },
      // 监听 当前页码值 改变的事件
      handleCurrentChange(newPage) {
        // console.log(newPage)
        this.queryInfo.pageNo = newPage;
        // 重新发起请求用户列表
        this.getUserList();
      },
      //添加用户
      addUser() {
        userAdd(this.userForm)
          .then((res) => {
            if (res.data.resultCode === 200) {
              this.addDialogVisible = false;
              this.getUserList();
              this.$message({
                message: "添加用户成功",
                type: "success",
              });
              this.$refs.userForm.resetFields();
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

      // 监听 添加用户对话框的关闭事件
      addDialogClosed() {
        // 表单内容重置为空
        this.$refs.userForm.resetFields();
      },

      // 根据ID删除对应的用户信息
      async removeUserById(userId) {
        // 弹框 询问用户是否删除
        const confirmResult = await this.$confirm(
          "此操作将永久删除该用户, 是否继续?",
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
          //删除用户
          userDelete(userId)
            .then((res) => {
              if (res.data.resultCode === 200) {
                this.getUserList();
                this.$message({
                  message: "删除用户成功",
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
              this.$message.error("删除用户异常");
              console.log(err);
            });
        }
      },
      // 根据ID重置对应的用户密码
      async resetPasswordById(userId) {
        // 弹框 询问用户是否重置密码
        const confirmResult = await this.$confirm(
          "此操作将重置该用户密码, 是否继续?",
          "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).catch((err) => err);
        // 如果用户确认重置，则返回值为字符串 confirm
        // 如果用户取消重置，则返回值为字符串 cancel
        // console.log(confirmResult)
        if (confirmResult == "confirm") {
          //重置用户
          passwordReset(userId)
            .then((res) => {
              if (res.data.resultCode === 200) {
                this.getUserList();
                this.$message({
                  message: "重置密码成功",
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
              this.$message.error("重置异常");
              console.log(err);
            });
        }
      },
      async promoteUserById(userId) {
        // 弹框 询问用户是否升级
        const confirmResult = await this.$confirm(
          "此操作将升级该用户为管理员, 是否继续?",
          "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).catch((err) => err);
        // 如果用户确认升级，则返回值为字符串 confirm
        // 如果用户取消升级，则返回值为字符串 cancel
        if (confirmResult == "confirm") {
          //升级用户
          userPromote(userId)
            .then((res) => {
              if (res.data.resultCode === 200) {
                this.getUserList();
                this.$message({
                  message: "提升成功",
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
              this.$message.error("提升异常");
              console.log(err);
            });
        }
      },
      async degradeUserById(userId) {
        // 弹框 询问用户是否降低
        const confirmResult = await this.$confirm(
          "此操作将降低该管理员为用户, 是否继续?",
          "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).catch((err) => err);
        // 如果用户确认降低，则返回值为字符串 confirm
        // 如果用户取消降低，则返回值为字符串 cancel
        if (confirmResult == "confirm") {
          //降低管理员
          userDegrade(userId)
            .then((res) => {
              if (res.data.resultCode === 200) {
                this.getUserList();
                this.$message({
                  message: "降低成功",
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
              this.$message.error("降低异常");
              console.log(err);
            });
        }
      },
      cancel() {
        this.addDialogVisible = false;
        this.$refs.userForm.resetFields();
      },
      positionFocus() {
        const _this = this
        positionList()
          .then(function (resp) {
            _this.userForm.positionData = resp.data.data
          })
      },
      roleFocus() {
        const _this = this
        adminList()
          .then(function (resp) {
            _this.userForm.roleData = resp.data.data
          })
      },
    },
  };

</script>

<style>
  .el-row {
    margin-bottom: 20px;
  }

  .el-col {
    border-radius: 4px;
  }

  .el-card {
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1) !important;
    height: 60pt;
  }

</style>
