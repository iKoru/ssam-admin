<template>
  <v-toolbar color="primary" :fixed="false" dark app>
    <v-toolbar-side-icon @click.stop="handleDrawerToggle"></v-toolbar-side-icon>
    <v-toolbar-title class="ml-0 pl-3" v-if="$vuetify.breakpoint.smAndUp">pedagy admin</v-toolbar-title>
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
  props: ["nickName"],
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
      deleteCookie("token");
      deleteCookie("CSRF-TOKEN");
      deleteCookie("_csrf");
      this.$axios
        .post("signout")
        .then(() => {
          this.$router.push("/signin");
        })
        .catch(error => {
          this.$router.app.$emit("showSnackbar", `로그아웃 하지 못했습니다.[${error.data.message}]`, "error");
        });
    }
  }
};
</script>
