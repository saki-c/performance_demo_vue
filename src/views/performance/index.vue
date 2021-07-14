<template>
  <div>
    <!--Layout布局-->
    <el-row>
      <el-col :span="24">
        <el-row :gutter="20">
          <el-col :span="6">
            <!--搜索区域-->
            <el-input placeholder="请输入内容" v-model="queryInfo.keyword" clearable @clear="getPerformanceList">
              <el-button slot="append" icon="el-icon-search" @click="getPerformanceList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="2.5">
            <el-button type="primary" @click="addDialogVisible = true" v-if="$store.state.user.userStatus == 'user'">
              添加绩效</el-button>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="24">
        <!--表格-->
        <el-table :data="performanceList" border stripe @selection-change="handleSelectionChange">
          <el-table-column type="index" label="序号"></el-table-column>
          <el-table-column prop="userName" label="姓名"></el-table-column>
          <el-table-column prop="performanceTerm" label="考核周期"></el-table-column>
          <el-table-column prop="performanceStatus" label="状态"></el-table-column>
          <el-table-column label="操作">
            <!-- 作用域插槽 -->
            <template slot-scope="scope">
              <!--详情-->
              <el-button type="primary" size="mini" icon="el-icon-search" @click="showEditDialog(scope.row)"
                title="查看详情">
              </el-button>
              <!--下载按钮-->
              <el-button type="primary" size="mini" icon="el-icon-download" @click="showDownloadDialog(scope.row)"
                v-if="scope.row.performanceStatus == '已总结'" title="下载">
              </el-button>
              <el-button size="mini" icon="el-icon-edit" v-if="scope.row.performanceStatus == '部门负责人已评分'"
                @click="showSummaryDialog(scope.row)" title="总结">
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
    <el-dialog title="添加绩效" :visible.sync="addDialogVisible" width="80%" @close="addDialogClosed"
      :close-on-click-modal="false">
      <!--内容主体区域-->
      <el-form :model="performanceForm" label-width="100px" ref="performanceForm">
        <el-row>
          <el-col :span="8">
            <el-form-item label="考核周期" prop="term">
              <el-date-picker type="month" placeholder="选择周期" v-model="performanceForm.term"
                value-format="yyyy-MM-dd HH:mm:ss">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <div v-for="(domain, index) in performanceForm.domains" :key="domain.key">
            <el-col :span="8">
              <el-form-item label="权重" :prop="'domains.' + index + '.weight'">
                <el-input type='number' v-model="domain.weight"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="'考核指标要求'" :prop="'domains.' + index + '.demand'">
                <el-input type='textarea' v-model="domain.demand" maxlength="150" show-word-limit></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="'考核标准'" :prop="'domains.' + index + '.standard'">
                <el-input type='textarea' v-model="domain.standard" maxlength="150" show-word-limit></el-input>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item>
                <el-button @click.prevent="removeDomain(domain)">删除</el-button>
              </el-form-item>
            </el-col>
          </div>
        </el-row>
      </el-form>
      <!--底部按钮区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDomain" v-if="this.performanceForm.domains.length<4">新 增</el-button>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="addPerformance">保 存</el-button>
      </span>
    </el-dialog>
    <!--修改用户的对话框-->
    <el-dialog title="下载" :visible.sync="downloadDialogVisible" width="30%" :close-on-click-modal="false">
      <!--内容主体区域-->
      <el-form :model="downloadForm" label-width="70px">
        <el-form-item label="姓名" prop="userName">
          <el-input v-model="downloadForm.userName" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="周期" prop="performanceTerm">
          <el-input v-model="downloadForm.performanceTerm" :disabled="true"></el-input>
        </el-form-item>
      </el-form>
      <!--底部按钮区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="downloadDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="downloadPerformance">下 载</el-button>
      </span>
    </el-dialog>
    <el-dialog title="总结" :visible.sync="summaryDialogVisible" width="30%" :close-on-click-modal="false">
      <!--内容主体区域-->
      <el-form :model="summaryForm" label-width="90px">
        <el-form-item label="工作总结" prop="performanceConclusion" v-if="$store.state.user.userStatus == 'user'">
          <el-input v-model="summaryForm.performanceConclusion" type='textarea'></el-input>
        </el-form-item>
        <el-form-item label="对员工评价" prop="performanceEvaluation" v-if="$store.state.user.userStatus == 'admin'">
          <el-input v-model="summaryForm.performanceEvaluation" type='textarea'></el-input>
        </el-form-item>
      </el-form>
      <!--底部按钮区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="summaryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addSummary">保 存</el-button>
      </span>
    </el-dialog>
    <el-dialog title="修改绩效" :visible.sync="editDialogVisible" width="80%" :close-on-click-modal="false">
      <el-dialog width="35%" title="详情" :visible.sync="innerVisible" :close-on-click-modal="false" append-to-body
        @close="innerClosed">
        <el-form :model="performanceItemForm" label-width="120px" ref="performanceItemForm">
          <el-form-item label="考核指标要求" prop="performanceItemDemand" v-if="status == '已保存'">
            <el-input type='textarea' v-model="performanceItemForm.performanceItemDemand"></el-input>
          </el-form-item>
          <el-form-item label="考核标准" prop="performanceItemStandard" v-if="status == '已保存'">
            <el-input type='textarea' v-model="performanceItemForm.performanceItemStandard"></el-input>
          </el-form-item>
          <el-form-item label="完成情况" prop="performanceItemSituation" v-if="status == '已保存'">
            <el-input type='textarea' v-model="performanceItemForm.performanceItemSituation"></el-input>
          </el-form-item>
          <el-form-item label="直属主管评分" prop="performanceItemDirectorGrade" v-if="status == '已提交'">
            <el-input type='number' v-model="performanceItemForm.performanceItemDirectorGrade"></el-input>
          </el-form-item>
          <el-form-item label="部门负责人评分" prop="performanceItemDepartmentManagerGrade" v-if="status == '直属主管已评分'">
            <el-input type='number' v-model="performanceItemForm.performanceItemDepartmentManagerGrade"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="editPerformanceItem">确 定</el-button>
        </span>
      </el-dialog>
      <!--内容主体区域-->
      <el-table :data="performanceItemList" border stripe @selection-change="handleSelectionChange">
        <el-table-column prop="performanceItemWeight" label="权重" width="50"></el-table-column>
        <el-table-column prop="performanceItemDemand" label="考核指标要求"></el-table-column>
        <el-table-column prop="performanceItemStandard" label="考核标准"></el-table-column>
        <el-table-column prop="performanceItemSituation" label="完成情况"></el-table-column>
        <el-table-column prop="performanceItemDirectorGrade" label="直属主管评分"></el-table-column>
        <el-table-column prop="performanceItemDepartmentManagerGrade" label="部门负责人评分"></el-table-column>
        <el-table-column label="操作" width="65">
          <!-- 作用域插槽 -->
          <template slot-scope="item">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editItem(item.row)">
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--底部按钮区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="submitPerformanceById" type="primary" v-if="$store.state.user.userStatus == 'user'">提 交
        </el-button>
        <el-button @click="gradePerformanceById" type="primary" v-if="$store.state.user.userStatus == 'admin'">确 定
        </el-button>
        <el-button @click="editDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  var a;
  var b;
  import {
    performanceList,
    performanceAdd,
    performanceDowmload,
    performanceItemList,
    performanceEdit,
    performanceSubmit,
    performanceGrade,
    summaryAdd,
  } from "@/api/performance";
  export default {
    data() {
      return {
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          },
        },
        status: '',
        editDialogVisible: false, // 控制修改绩效信息对话框是否显示
        innerVisible: false, // 控制修改绩效信息子对话框是否显示
        addDialogVisible: false, // 控制添加绩效对话框是否显示
        downloadDialogVisible: false, // 控制下载绩效对话框是否显示
        summaryDialogVisible: false,
        performanceList: [], // 绩效列表
        performanceItemList: [], //单条绩效
        multipleSelection: [],
        ids: [],
        total: 0, // 绩效总数
        // 获取用户列表的参数对象
        queryInfo: {
          keyword: "", // 查询参数
          pageNo: 1, // 当前页码
          pageSize: 5, // 每页显示条数
        },

        //下载表单
        downloadForm: {
          userName: '',
          performanceTerm: ''
        },

        //添加表单
        performanceForm: {
          term: '',
          domains: [{
            weight: '',
            demand: '',
            standard: ''
          }],
        },

        //总结表单
        summaryForm: {
          performanceId: '',
          performanceConclusion: '',
          performanceEvaluation: ''
        },

        //修改评价表单
        performanceItemForm: {
          performanceId: '',
          performanceItemDemand: '',
          performanceItemStandard: '',
          performanceItemSituation: '',
          performanceItemDirectorGrade: '',
          performanceItemDepartmentManagerGrade: '',
        },
      };
    },
    created() {
      // 生命周期函数
      this.getPerformanceList();
    },
    methods: {
      getPerformanceList() {
        performanceList(this.queryInfo)
          .then((res) => {
            if (res.data.resultCode === 200) {
              //用户列表
              this.performanceList = res.data.data.records;
              this.total = res.data.data.total;
              for (var i = 0; i < this.performanceList.length; i++) {
                this.performanceList[i].performanceTerm = this.performanceList[i].performanceTerm.substring(0, 7);
                if (this.performanceList[i].performanceStatus == "saved") {
                  this.performanceList[i].performanceStatus = "已保存"
                }
                if (this.performanceList[i].performanceStatus == "submited") {
                  this.performanceList[i].performanceStatus = "已提交"
                }
                if (this.performanceList[i].performanceStatus == "directorgraded") {
                  this.performanceList[i].performanceStatus = "直属主管已评分"
                }
                if (this.performanceList[i].performanceStatus == "managergraded") {
                  this.performanceList[i].performanceStatus = "部门负责人已评分"
                }
                if (this.performanceList[i].performanceStatus == "summarized") {
                  this.performanceList[i].performanceStatus = "已总结"
                }
              }
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
        this.getPerformanceList();
      },
      // 监听 当前页码值 改变的事件
      handleCurrentChange(newPage) {
        // console.log(newPage)
        this.queryInfo.pageNo = newPage;
        // 重新发起请求用户列表
        this.getPerformanceList();
      },
      getPerformanceItemList() {
        performanceItemList(this.queryInfo.performanceId)
          .then((res) => {
            if (res.data.resultCode === 200) {
              //用户列表
              this.performanceItemList = res.data.data.records;
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

      //详细 修改
      showEditDialog(performanceinfo) {
        this.editDialogVisible = true;
        var performanceId = performanceinfo.performanceId;
        b = performanceinfo;
        this.status = performanceinfo.performanceStatus;
        console.log(status);
        performanceItemList(performanceId)
          .then((res) => {
            if (res.data.resultCode === 200) {
              //用户列表
              this.performanceItemList = res.data.data;
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

      //添加绩效
      addPerformance() {
        performanceAdd(this.performanceForm)
          .then((res) => {
            if (res.data.resultCode === 200) {
              this.addDialogVisible = false;
              this.getPerformanceList();
              this.$message({
                message: "添加绩效成功",
                type: "success",
              });
              this.$refs.performanceForm.resetFields();
            } else if (res.data.resultCode === 401) {
              this.$message.error(res.data.message);
              window.sessionStorage.clear();
              this.$router.push('/login');
            } else {
              this.$message.error(res.data.message);
            }
          })
          .catch((err) => {
            this.$message.error("添加绩效异常");
            console.log(err);
          });
      },

      addSummary() {
        summaryAdd(this.summaryForm)
          .then((res) => {
            if (res.data.resultCode === 200) {
              this.summaryDialogVisible = false;
              this.getPerformanceList();
              this.$message({
                message: res.data.message,
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
            this.$message.error("添加绩效异常");
            console.log(err);
          });
      },

      async editItem(performanceIteminfo) {
        a = performanceIteminfo.performanceItemId;
        this.performanceItemForm = performanceIteminfo;
        this.innerVisible = true;
      },

      editPerformanceItem() {
        this.performanceItemForm.performanceId = a;
        performanceEdit(this.performanceItemForm)
          .then((res) => {
            if (res.data.resultCode === 200) {
              this.innerVisible = false;
              this.showEditDialog(b);
              this.$message({
                message: "修改成功",
                type: "success",
              });
              this.$refs.performanceItemForm.resetFields();
            } else if (res.data.resultCode === 401) {
              this.$message.error(res.data.message);
              window.sessionStorage.clear();
              this.$router.push('/login');
            } else {
              this.$message.error(res.data.message);
            }
          })
          .catch((err) => {
            this.$message.error("修改异常");
            console.log(err);
          });
      },
      // 监听 添加用户对话框的关闭事件
      addDialogClosed() {
        // 表单内容重置为空
        this.$refs.performanceForm.resetFields();
      },

      innerClosed() {
        // 表单内容重置为空
        this.$refs.performanceItemForm.resetFields();
      },

      // 打开 下载dialog
      showDownloadDialog(performanceinfo) {
        this.downloadDialogVisible = true;
        console.log(performanceinfo);
        this.downloadForm = performanceinfo;
      },

      //打开 总结dialog
      showSummaryDialog(performanceinfo) {
        this.summaryDialogVisible = true;
        var performanceId = performanceinfo.performanceId;
        this.summaryForm.performanceId = performanceId;
      },

      //下载绩效
      downloadPerformance() {
        performanceDowmload(this.downloadForm)

          .then((res) => {

            let contentDisposition = res.headers['content-disposition'];
            // 将URL参数数值转成汉字        
            let fileName = decodeURI(contentDisposition.substring(contentDisposition.indexOf('=') + 1));
            // 处理IE以及IE内核的浏览器兼容问题        
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
              navigator.msSaveBlob(res.data, fileName);
            } else {
              // 处理google firefox浏览器兼容问题            
              let url = window.URL.createObjectURL(new Blob([res.data]));
              let a = document.createElement('a');
              a.style.display = 'none';
              a.href = url;
              a.setAttribute('download', fileName);
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            }
          });
      },
      //批量选中事件处理
      handleSelectionChange(val) {
        this.multipleSelection = val;
        console.log(this.multipleSelection);
        //向被删除的ids赋值
        this.multipleSelection.forEach((item) => {
          this.ids.push(item.id);
          console.log(this.ids);
        });
      },
      removeDomain(item) {
        var performance = this.performanceForm.domains.indexOf(item)
        if (performance !== -1) {
          this.performanceForm.domains.splice(performance, 1)
        }
      },
      addDomain() {
        this.performanceForm.domains.push({
          value: ''
        });
        console.log(this.performanceForm.domains.length);
      },
      cancel() {
        this.addDialogVisible = false
        this.$refs.performanceForm.resetFields();
      },
      // 根据ID提交对应的绩效信息
      async submitPerformanceById() {
        var performanceId = b.performanceId
        // 弹框 询问用户是否提交
        const confirmResult = await this.$confirm(
          "此操作将提交该绩效, 是否继续?",
          "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).catch((err) => err);
        // 如果用户确认提交，则返回值为字符串 confirm
        // 如果用户取消提交，则返回值为字符串 cancel
        // console.log(confirmResult)
        if (confirmResult == "confirm") {
          //删除用户
          performanceSubmit(performanceId)
            .then((res) => {
              if (res.data.resultCode === 200) {
                this.showEditDialog(b);
                this.getPerformanceList();
                this.$message({
                  message: "提交绩效成功",
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
              this.$message.error("提交绩效异常");
              console.log(err);
            });
        }
      },
      // 根据ID保存对应的绩效评分
      async gradePerformanceById() {
        var performanceId = b.performanceId
        // 弹框 询问用户是否提交
        const confirmResult = await this.$confirm(
          "此操作将保存该绩效评分, 是否继续?",
          "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).catch((err) => err);
        // 如果用户确认保存，则返回值为字符串 confirm
        // 如果用户取消保存，则返回值为字符串 cancel
        // console.log(confirmResult)
        if (confirmResult == "confirm") {
          //删除用户
          performanceGrade(performanceId)
            .then((res) => {
              if (res.data.resultCode === 200) {
                this.showEditDialog(b);
                this.getPerformanceList();
                this.$message({
                  message: "提交绩效成功",
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
              this.$message.error("提交绩效异常");
              console.log(err);
            });
        }
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

  .el-table .cell {
    white-space: pre-line;
  }

</style>
