<template>
   <div><p>welcome,{{ this.$store.state.user.userName }} </p>
   <p>昵称:{{ this.$store.state.user.nickname }} </p>
   <p>用户组:{{ this.$store.state.user.userStatus }}</p></div>
</template>

