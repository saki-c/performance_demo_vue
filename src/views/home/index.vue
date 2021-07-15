<template>
  <div class="login-container" label-position="left" label-width="0px">
    <p>welcome,{{ user.userName }} </p>
    <p>昵称:{{ user.userNickname }} </p>
    <p>岗位:{{ user.positionName }}</p>
    <p>部门:{{ user.departmentName }}</p>
    <p>用户组:{{ user.userStatus }}</p>
    <el-row :gutter="150">
      <el-col :span="2.5">
        <el-button type="danger" @click="editDialogVisible = true">修改密码</el-button>
      </el-col>
      <el-col :span="2.5">
        <el-button type="primary" @click="reviseDialogVisible = true">修改信息</el-button>
      </el-col>
    </el-row>
    <!--修改密码的对话框-->
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
    <!--修改用户的对话框-->
    <el-dialog title="修改信息" :visible.sync="reviseDialogVisible" width="30%" @close="reviseDialogClosed"
      :close-on-click-modal="false">
      <!--内容主体区域-->
      <el-form :model="userForm" label-width="100px" ref="userForm">
        <el-form-item label="登陆昵称" prop="nickname">
          <el-input v-model="userForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="岗位" prop="positionId" v-if="$store.state.user.userStatus == 'user'">
          <el-select v-model="userForm.positionId" placeholder="请选择岗位" style="width: 100%" @focus="positionFocus"
            @change="(userForm.positionData.positionName)" value-key="value">
            <el-option v-for="item in userForm.positionData" :key="item.positionId" :value="item.positionId"
              :label="item.positionName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="直接主管" prop="director" v-if="$store.state.user.userStatus == 'user'">
          <el-select v-model="userForm.directorId" placeholder="请选择主管" style="width: 100%" @focus="roleFocus"
            @change="(userForm.roleData.directorId)" value-key="value">
            <el-option v-for="item in userForm.roleData" :key="item.userId" :value="item.userId" :label="item.userName">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!--底部按钮区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="reviseUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>
<script>
  import {
    userUpdate,
    userSelect,
    positionList,
    adminList,
    userRevise,
  } from "@/api/user";

  export default {
    data() {
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else if (value === this.editForm.oldPassword) {
          callback(new Error('与原密码一致'));
        } else {
          if (this.editForm.againPassword !== '') {
            this.$refs.editForm.validateField('againPassword');
          }
          callback();
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.editForm.newPassword) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
      var validatePass3 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入原密码'));
        } else {
          callback();
        }
      }
      return {
        user: '',
        editDialogVisible: false, // 控制修改用户信息对话框是否显示
        editForm: {
          oldPassword: '',
          newPassword: '',
          againPassword: '',
        },
        reviseDialogVisible: false, // 控制添加用户对话框是否显示
        userForm: {
          //用户
          nickname: '',
          positionId: '',
          directorId: '',
        },
        rules: {
          newPassword: [{
            validator: validatePass,
            trigger: 'blur'
          }],
          againPassword: [{
            validator: validatePass2,
            trigger: 'blur'
          }],
          oldPassword: [{
            validator: validatePass3,
            trigger: 'blur'
          }]
        },
      }
    },
    created() {
      // 生命周期函数
      this.getUser();
      this.positionFocus();
      this.roleFocus();
    },
    methods: {
      // 监听 修改用户状态
      editDialogClosed() {
        this.$refs.editForm.resetFields();
      },
      cancel() {
        this.reviseDialogVisible = false;
        this.$refs.userForm.resetFields();
        this.editDialogVisible = false;
        this.$refs.editForm.resetFields();
      },
      //修改密码
      editUser() {
        userUpdate(this.editForm)
          .then((res) => {
            if (res.data.resultCode === 200) {
              this.editDialogVisible = false;
              this.$message({
                message: "修改密码成功",
                type: "success",
              });
              this.$refs.editForm.resetFields();
            } else if (res.data.resultCode === 401) {
              this.$message.error(res.data.message);
              window.sessionStorage.clear();
              this.$router.push('/login');
            } else {
              this.$message.error(res.data.message);
            }
          })
          .catch((err) => {
            this.$message.error("修改密码异常");
            console.loge(err);
          });
      },
      //修改信息
      reviseUser() {
        userRevise(this.userForm)
          .then((res) => {
            if (res.data.resultCode === 200) {
              this.reviseDialogVisible = false;
              this.getUser();
              this.$message({
                message: "修改信息成功",
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
            this.$message.error("修改信息异常");
            console.log(err);
          });
      },

      // 监听 修改信息对话框的关闭事件
      reviseDialogClosed() {
        // 表单内容重置为空
        this.$refs.userForm.resetFields();
      },

      getUser() {
        userSelect()
          .then((res) => {
            if (res.data.resultCode === 200) {
              this.user = res.data.data;
            } else {
              this.$message.error(res.data.message);
            }
          })
          .catch((err) => {
            console.log(err);
          });

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
    }
  }

</script>
<style>
  .login-container {
    border-radius: 15px;
    background-clip: padding-box;
    margin: 90px auto;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
  }

</style>
