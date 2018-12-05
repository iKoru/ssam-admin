<template>
  <div id="appRoot">
    <v-app id="inspire" class="app">
      <app-drawer class="app--drawer" ref="appDrawer"></app-drawer>
      <app-toolbar class="app--toolbar" @APP_DRAWER_TOGGLED="drawerToggled"></app-toolbar>
      <v-content>
        <!-- Page Header -->
        <page-header v-if="$route.meta.breadcrumb"></page-header>
        <div class="page-wrapper">
          <nuxt></nuxt>
        </div>
      </v-content>
      <!-- Go to top -->
      <app-fab></app-fab>
      <!-- theme setting -->
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
import AppDrawer from "~/components/AppDrawer";
import AppToolbar from "~/components/AppToolbar";
import AppFab from "~/components/AppFab";
import PageHeader from "~/components/PageHeader";
import AppEvents from "~/assets/js/event";
export default {
  components: {
    AppDrawer,
    AppToolbar,
    AppFab,
    PageHeader
  },
  data: () => ({
    expanded: true,
    rightDrawer: false,
    snackbar: {
      show: false,
      text: "",
      color: ""
    }
  }),

  computed: {},

  created() {
    AppEvents.forEach(item => {
      this.$on(item.name, item.callback);
    });
    // window.getApp = this;
  },
  methods: {
    drawerToggled(callback) {
      this.$refs.appDrawer.toggleDrawer();
    }
  },
  middleware:'requireAuth'
};
</script>


<style lang="stylus" scoped>
.setting-fab {
  top: 50% !important;
  right: 0;
  border-radius: 0;
}

.page-wrapper {
  min-height: calc(100vh - 64px - 50px);
}
</style>
