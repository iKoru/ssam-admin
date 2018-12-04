<template>
  <div id="appRoot">
    <v-app id="inspire" class="app">
      <v-content>
        <div class="page-wrapper">
          <nuxt></nuxt>
        </div>
        <!-- App Footer -->
      </v-content>
      <v-footer height="auto" class="white pa-3 app--footer">
        <span class="caption">pedagy &copy; {{ new Date().getFullYear() }}</span>
        <v-spacer></v-spacer>
        <span class="caption mr-1">Make With Love</span>
        <v-icon color="pink" small>favorite</v-icon>
      </v-footer>
      <v-snackbar :timeout="3000" bottom right :color="snackbar.color" v-model="snackbar.show">
        {{ snackbar.text }}
        <v-btn dark flat @click.native="snackbar.show = false" icon>
          <v-icon>close</v-icon>
        </v-btn>
      </v-snackbar>
    </v-app>
  </div>
</template>
<script>
export default {
  data: () => ({
    expanded: true,
    rightDrawer: false,
    snackbar: {
      show: false,
      text: "",
      color: ""
    },
    drawer: true
  }),

  computed: {}
};
</script>


<style lang="stylus" scoped>
</style>
