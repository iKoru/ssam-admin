<template>
  <div id="pageDashboard">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex sm12>pedagy 관리자 페이지에 오신것을 환영합니다.</v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  layout: "main",
  data: () => ({}),
  computed: {},
  head() {
    return {
      title: "메인"
    };
  }
};
</script>
