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
                <v-btn block color="primary" @click="signin" :loading="loading" :disabled="userId === ''">Sign in</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import config from "~/assets/js/config";

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
}

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export default {
  layout: "public",
  data: () => ({
    loading: false,
    message: null,
    userId: process.browser ? getCookie("userId") || "" : "",
    password: ""
  }),
  created() {
    if (process.browser) {
      const token = this.$store.getters.userId
      if (token) {
        this.loading = true;
        this.$axios({
          method: "POST",
          url: "/refresh"
        })
          .then(response => {
            this.$axios({
              url: "/admin",
              method: "GET"
            })
              .then(profile => {
                this.loading = false;
                this.$store.dispatch("setUserId", response.data.userId);
                this.$router.push(decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent('redirectTo').replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1")) || '/');
              })
              .catch(err => {
                this.loading = false;
                this.$store.dispatch("setUserId", null);
                if(err.response){
                  this.message = err.response.data.message;
                  if (err.response.data.target && this.$refs[err.response.data.target]) {
                    this.$refs[err.response.data.target].focus();
                  }
                }else{
                  this.message = '서버 접속에 실패하였습니다. 서버가 구동중이지 않거나 인터넷 연결이 끊어졌을 수 있습니다.';
                }
              });
          })
          .catch(err => {
            this.loading = false;
            if(err.response){
              this.message = err.response.data.message;
              if (err.response.data.target && this.$refs[err.response.data.target]) {
                this.$refs[err.response.data.target].focus();
              }
            }else{
              this.message = '서버 접속에 실패하였습니다. 서버가 구동중이지 않거나 인터넷 연결이 끊어졌을 수 있습니다.';
            }
            deleteCookie('token');
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
        setCookie("userId", this.userId, 30);
        this.message = null;
        this.loading = true;
        this.$axios
          .post("/signin", {
            userId: this.userId,
            password: this.password
          })
          .then(response => {
            this.$axios({
              url: "/admin",
              method: "GET"
            })
              .then(profile => {
                this.loading = false;
                this.$store.dispatch("setUserId", response.data.userId);
                this.$router.push(decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent('redirectTo').replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1")) || '/');
              })
              .catch(err => {
                this.loading = false;
                this.message = err.response.data.message;
                if(err.response){
                  if (err.response.data.target && this.$refs[err.response.data.target]) {
                    this.$refs[err.response.data.target].focus();
                  }
                }else{
                  this.message = '서버 접속에 실패하였습니다. 서버가 구동중이지 않거나 인터넷 연결이 끊어졌을 수 있습니다.';
                }
              });
          })
          .catch(err => {
            this.loading = false;
            if(err.response){
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
