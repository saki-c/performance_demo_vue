<template>
    <div id="app" style="width:1200px" text-align="center">
      <el-form ref="form" :model="form" label-width="100px">

        <el-row>
          <el-col :span="10">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" style="width: 220px"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="考核周期" prop="term">
              <el-date-picker type="month" placeholder="选择周期" v-model="form.term" value-format="yyyy-MM-dd HH:mm:ss">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <div v-for="(domain, index) in form.domains" :key="domain.key">
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
        <el-form-item style="text-align:center">
          <el-button @click="addDomain">新增</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm('form')">取消</el-button>
        </el-form-item>
      </el-form>
    </div>

</template>
<script>

  export default {
    data() {
      return {
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          },
        },
        form: {
          name: '',
          term: '',
          domains: [{
            weight: '',
            demand: '',
            standard: ''
          }],
        },
      }
    },

    methods: {
      submitForm() {
        this.$axios
        .post('/performance',this.form)
         .then(successResponse => {
            if (successResponse.data.code === 200) {
              this.$router.replace({path: '/'})
            }
          })
          .catch(failResponse => {
          })
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
      removeDomain(item) {
        var performance = this.form.domains.indexOf(item)
        if (performance !== -1) {
          this.form.domains.splice(performance, 1)
        }
      },
      addDomain() {
        this.form.domains.push({
          value: ''
        });
      }
    }
  }

</script>