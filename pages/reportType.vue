<template>
  <div id="pageDashboard">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex sm12>pedagy 관리자 페이지에 오신것을 환영합니다.</v-flex>
        <v-flex lg7 sm12 xs12>
          report type management
          <!--<plain-table></plain-table>-->
        </v-flex>
        <v-flex lg5 sm12 xs12>
          aaa
          <!--<plain-table-order></plain-table-order>-->
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
// import PlainTable from "~/components/PlainTable";
// import PlainTableOrder from "~/components/PlainTableOrder";
export default {
  // components: {
  //   PlainTable,
  //   PlainTableOrder
  // },
  layout:'main',
  data: () => ({}),
  computed: {},
  head(){
    return {
      title: '신고종류 관리'
    }
  }
};
</script>
