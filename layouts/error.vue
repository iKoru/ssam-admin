<template>
  <v-app id="404">
    <v-container fluid fill-height>
      <v-layout align-center justify-center row>
        <div class="mr-3 hidden-sm-and-down">
          <img :src="getImageSrc(error.statusCode)" alt>
        </div>
        <div class="text-md-center">
          <h1>{{error.statusCode}}</h1>
          <h2 class="my-3 headline" v-if="error.statusCode === 400">올바르지 않은 요청입니다.</h2>
          <h2 class="my-3 headline" v-else-if="error.statusCode === 403">올바르지 않은 요청입니다.</h2>
          <h2 class="my-3 headline" v-else-if="error.statusCode === 404">올바르지 않은 요청입니다.</h2>
          <h2 class="my-3 headline" v-else>요청을 처리하던 도중 에러가 발생하였습니다.</h2>
          <div>
            <v-btn color="primary" @click="goHome">메인 페이지로 가기</v-btn>
          </div>
        </div>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
export default {
  layout:'public',
  props: ['error'],
  methods: {
    goHome() {
      this.$router.push({path: "/"});
    },
    getImageSrc(errorCode){
      return `/img/error/${errorCode}.svg`;
    }
  },
  computed:{
  }
};
</script>
<style scoped lang="css">
h1 {
  font-size: 150px;
  line-height: 150px;
  font-weight: 700;
  color: #252932;
  text-shadow: rgba(61, 61, 61, 0.3) 1px 1px, rgba(61, 61, 61, 0.2) 2px 2px, rgba(61, 61, 61, 0.3) 3px 3px;
}
</style>
