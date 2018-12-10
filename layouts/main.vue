<template>
  <div id="appRoot">
    <v-app id="inspire" class="app">
      <app-drawer class="app--drawer" ref="appDrawer"></app-drawer>
      <app-toolbar class="app--toolbar" @APP_DRAWER_TOGGLED="drawerToggled" :nick-name="nickName"></app-toolbar>
      <v-content>
        <!-- Page Header -->
        <div class="page-wrapper">
          <nuxt></nuxt>
        </div>
      </v-content>
      <!-- Go to top -->
      <app-fab></app-fab>
      <!-- theme setting -->
      <v-footer height="auto" class="white pa-3 app--footer" fixed>
        <span class="caption">pedagy &copy; {{ new Date().getFullYear() }}</span>
        <v-spacer></v-spacer>
        <span class="caption mr-1">Make With Love</span>
        <v-icon color="pink" small>favorite</v-icon>
      </v-footer>
      <v-snackbar :timeout="5000" bottom left :color="snackbar.color" v-model="isShowingSnackbar">
        {{ snackbar.text }}
        <v-btn dark flat @click.native="isShowingSnackbar = false" icon>
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
import AppEvents from "~/assets/js/event";
export default {
  components: {
    AppDrawer,
    AppToolbar,
    AppFab
  },
  data: () => ({
    expanded: true,
    rightDrawer: false,
    snackbar: {
      text: "",
      color: ""
    },
    isShowingSnackbar: false,
    waiting: [],
    nickName: null
  }),

  computed: {},
  watch: {
    isShowingSnackbar(val) {
      if (!val && this.waiting.length > 0) {
        const wait = this.waiting.shift();
        if (wait.text) {
          this.$nextTick(() => {
            this.showSnackbar(wait.text, wait.color);
          });
        }
      }
    }
  },
  methods: {
    drawerToggled(callback) {
      this.$refs.appDrawer.toggleDrawer();
    },
    showSnackbar(text, color) {
      if (!this.isShowingSnackbar) {
        this.snackbar.text = text;
        this.snackbar.color = color || "info";
        this.isShowingSnackbar = true;
      } else {
        this.waiting.push({text: text, color: color});
      }
    }
  },
  created: async function() {
    AppEvents.forEach(item => {
      this.$on(item.name, item.callback);
    });
    this.$router.app.$on("showSnackbar", this.showSnackbar);
    let response;
    try{
      response = await this.$axios.get('/user', {params:{userId:this.$store.getters.userId}});
    }catch(err){
      if(err.response){
        this.showSnackbar(`서버로부터 프로필 정보를 가져오지 못했습니다.[${err.response.data.message}]`, 'error')
      }else{
        this.$router.app.$emit('showSnackbar', '서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.', 'error');
      }
      return;
    }
    this.nickName = response.data.loungeNickName;
  },
  middleware: "requireAuth"
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
