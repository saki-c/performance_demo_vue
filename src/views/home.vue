<template>
  <el-container class="home-container">
    <!-- 侧边栏 -->
    <el-aside width="auto">
      <el-menu :default-active="this.$route.path" router class="el-menu-vertical-demo" background-color="#545c64"
        text-color="#fff" active-text-color="#ffd04b" :collapse="isCollapse">
        <el-menu-item @click="isSpread">
          <i :class="a"></i>
          <span slot="title">{{ spread }}</span>
        </el-menu-item>
        <el-menu-item v-for="(item,i) in navList" :key="i" :index="item.name">
          <i :class="item.icon"></i>
          <span slot="title">{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <!-- 主体 -->
    <el-container>
      <el-header>
        <span class="head-title">绩效管理系统</span>
        <el-dropdown trigger="click" style="color: #222; float: right">
          <el-avatar icon="el-icon-user-solid"></el-avatar>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-position" @click.native="logout">登出</el-dropdown-item>
            <!-- <el-dropdown-item >修改密码</el-dropdown-item> -->
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>
      <el-main>
        <!--路由占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: "Home",
    data() {
      return {
        navList: [{
            name: "/home",
            title: "首页",
            icon: "el-icon-s-home"
          }, {
            name: "/user",
            title: "用户列表",
            icon: "el-icon-s-custom"
          },
          {
            name: "/performance",
            title: "绩效管理",
            icon: "el-icon-tickets"
          },
          {
            name: "/department",
            title: "部门管理",
            icon: "el-icon-s-cooperation"
          },
        ],
        isCollapse: true,
        spread: "展开",
        a: "el-icon-right"
      };
    },
    methods: {
      isSpread() {
        this.isCollapse = !this.isCollapse
        if (this.isCollapse == true) {
          this.spread = "展开"
          this.a = "el-icon-right"
        } else {
          this.spread = "收起"
          this.a = "el-icon-back"
        }
      },
      logout() {
        window.sessionStorage.clear();
        this.$router.push('/login');
      }
    }
  };

</script>

<style>
  .home-container {
    height: 100%;
  }

  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    height: 100%;
  }

  .el-menu {
    height: 100%;
  }

  .el-header {
    width: 100%;
  }

  .head-title {
    position: absolute;
    padding-top: 20px;
    font-size: 20px;
  }

  body {
    margin: 0px;
  }

</style>
