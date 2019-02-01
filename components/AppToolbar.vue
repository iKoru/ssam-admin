<template>
  <v-toolbar color="primary" :fixed="false" dark app>
    <v-toolbar-side-icon @click.stop="handleDrawerToggle"></v-toolbar-side-icon>
    <v-toolbar-title class="ml-0 pl-3">pedagy admin</v-toolbar-title>
    <v-spacer></v-spacer>
    <span>{{nickName || ''}}님 로그인</span>
    <v-btn @click="signout">로그아웃</v-btn>
  </v-toolbar>
</template>
<script>

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

export default {
  name: "app-toolbar",
  components: {},
  props:['nickName'],
  data: () => ({
  }),
  computed: {
    toolbarColor() {
      return this.$vuetify.options.extra.mainNav;
    }
  },
  methods: {
    handleDrawerToggle() {
      this.$emit("APP_DRAWER_TOGGLED");
    },
    signout() {
      deleteCookie('token');
      deleteCookie('CSRF-TOKEN');
      deleteCookie('_csrf');
      this.$router.push('/signin');
    }
  }
};
</script>
