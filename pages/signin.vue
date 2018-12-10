<template>
  <v-app id="signin" class="primary">
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4 lg4>
            <v-card class="elevation-1 pa-3">
              <v-card-text>
                <div class="layout column align-center">
                  <img src="~static/img/m.png" alt="Pedagy Admin" width="120" height="120">
                  <h1 class="flex my-4 primary--text">Signin to Pedagy Admin</h1>
                </div>
                <v-alert :value="true" type="error" v-show="message">{{message}}</v-alert>
                <v-form>
                  <v-text-field append-icon="person" ref="userId" name="userId" label="userId" type="text" v-model="userId" @keyup.enter.native="signin"></v-text-field>
                  <v-text-field append-icon="lock" ref="password" name="password" label="password" id="password" type="password" v-model="password" @keyup.enter.native="signin"></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn block color="primary" @click="signin" :loading="loading">Sign in</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
/* global localStorage */
import config from "~/assets/js/config";
export default {
  layout: "public",
  data: () => ({
    loading: false,
    message: null,
    userId: process.browser ? localStorage.getItem("userId") || "" : "",
    password: ""
  }),
  meta: {
    public: true
  },
  created() {
    this.$axios.defaults.baseURL = config.apiServerHost;
    if (process.browser) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        this.loading = true;
        this.$axios({
          method: "POST",
          url: "/refresh",
          headers: {"x-auth": token}
        })
          .then(response => {
            console.log(response);
            this.$axios({
              url: "/check",
              method: "GET",
              headers: {"x-auth": response.data.token}
            })
              .then(profile => {
                this.loading = false;
                localStorage.setItem("accessToken", response.data.token);
                this.$axios.defaults.headers.common["x-auth"] = response.data.token;
                this.$store.dispatch("signin", {
                  accessToken: response.data.token
                });
                this.$router.push("/");
              })
              .catch(err => {
                this.loading = false;
                this.message = err.response.data.message;
                console.log(err.response.data.target);
                if (err.response.data.target && this.$refs[err.response.data.target]) {
                  this.$refs[err.response.data.target].focus();
                }
              });
          })
          .catch(err => {
            this.loading = false;
            if(err.response){
              console.log(err.response);
              this.message = err.response.data.message;
              if (err.response.data.target && this.$refs[err.response.data.target]) {
                this.$refs[err.response.data.target].focus();
              }
            }else{
              console.log(err);
            }
            localStorage.removeItem("accessToken");
          });
      }
    }
  },

  methods: {
    signin() {
      if (process.browser) {
        if (!this.userId || !this.password || this.userId === "" || this.password === "") {
          this.message = "아이디와 비밀번호를 입력해주세요.";
          return false;
        }
        localStorage.setItem("userId", this.userId);
        this.message = null;
        this.loading = true;
        this.$axios
          .post("/signin", {
            userId: this.userId,
            password: this.password
          })
          .then(response => {
            console.log(response);
            this.$axios({
              url: "/check",
              method: "GET",
              headers: {"x-auth": response.data.token}
            })
              .then(profile => {
                this.loading = false;
                localStorage.setItem("accessToken", response.data.token);
                this.$axios.defaults.headers.common["x-auth"] = response.data.token;
                this.$store.dispatch("signin", {
                  accessToken: response.data.token
                });
                this.$router.push("/");
              })
              .catch(err => {
                this.loading = false;
                this.message = err.response.data.message;
                console.log(err.response.data.target);
                if (err.response.data.target && this.$refs[err.response.data.target]) {
                  this.$refs[err.response.data.target].focus();
                }
              });
          })
          .catch(err => {
            this.loading = false;
            if(err.response){
              console.log(err.response);
              this.message = err.response.data.message;
              if (err.response.data.target && this.$refs[err.response.data.target]) {
                this.$refs[err.response.data.target].focus();
              }
            }else{
              this.message = '서버 접속에 실패하였습니다. 서버가 구동중이지 않거나 인터넷 연결이 끊어졌을 수 있습니다.';
            }
          });
      }
    }
  },
  head() {
    return {
      title: "로그인"
    };
  }
};
</script>
<style lang="stylus" scoped>
#signin {
  height: 50%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  content: '';
  z-index: 0;
}
</style>
