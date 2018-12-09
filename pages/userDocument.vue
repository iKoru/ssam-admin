<template>
  <div id="pageDashboard">
    <v-container grid-list-xl fluid>
      <v-layout row wrap class="elevation-1" white>
        <v-toolbar flat color="white">
          <v-toolbar-title>회원게시물 관리</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-form class="px-3 pt-2 white">
          <v-layout wrap xs12 child-flex pa-2>
            <v-flex xs12 sm10>
              <v-text-field ref="searchQuery" name="searchQuery" pa-2 v-model="searchQuery" @keydown.enter.stop.prevent="getDataFromApi" label="조회 대상 사용자ID"></v-text-field>
            </v-flex>
            <v-flex xs12 sm2>
              <v-btn color="primary" pa-2 @click="getDataFromApi">검색</v-btn>
            </v-flex>
          </v-layout>
        </v-form>

        <v-data-table :headers="headers" :items="userDocuments" id="userDocumentTable" :rows-per-page-items="[15]" :loading="loading" :total-items="totalUserDocuments" :pagination.sync="pagination" :no-data-text="noresult">
          <template slot="items" slot-scope="props">
            <tr>
              <td class="text-xs-left">{{ props.item.userId }}</td>
              <td class="text-xs-left">{{ boardItems.find(x=>x.value === props.item.boardId).text }}</td>
              <td class="text-xs-left">{{ props.item.documentId }}</td>
              <td class="text-xs-left">
                <a :href="`${mainServerHost}/${props.item.boardId}/${props.item.documentId}`" target="_blank">{{ props.item.title }}</a>
              </td>
              <td class="text-xs-left">{{ props.item.isDeleted?'삭제됨':'정상' }}</td>
              <td class="text-xs-right">{{ $moment(props.item.writeDateTime, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss') }}</td>
            </tr>
          </template>
          <template slot="no-data">
            {{this.noresult}}
            <v-btn color="primary" @click="getDataFromApi">새로고침</v-btn>
          </template>
        </v-data-table>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
// import PlainTable from "~/components/PlainTable";
// import PlainTableOrder from "~/components/PlainTableOrder";
import config from "~/assets/js/config";
export default {
  data: () => ({
    dialog: false,
    headers: [{text: "ID", sortable: false, align: "left", value: "userId"}, {text: "게시판 이름", align: "left", sortable: false, value: "boardId"}, {text: "게시물ID", sortable: false, align: "left", value: "documentId"}, {text: "게시물 제목", sortable: false, align: "left", value: "title"}, {text: "상태", sortable: false, align: "left", value: "status"}, {text: "작성일자", sortable: false, align: "right", value: "writeDateTime"}],
    userDocuments: [],
    totalUserDocuments: 0,
    loading: false,
    pagination: {},
    documentStatusItems: [{text: "정상", value: "NORMAL"}, {text: "삭제처리", value: "DELETED"}],
    boardItems: [],
    searchQuery: null,
    noresult: "표시할 결과가 없습니다.",
    mainServerHost: config.mainServerHost
  }),

  watch: {
    dialog(val) {
      val || this.close();
    },
    pagination: {
      handler() {
        if (typeof this.searchQuery === "string" && this.searchQuery !== "") {
          this.getDataFromApi();
        }
      },
      deep: true
    }
  },

  created: async function() {
    let board = await this.$axios.get("/board/list");
    if (board.status === 200) {
      this.boardItems = board.data.map(x => {
        return {text: x.boardName, value: x.boardId};
      });
    } else {
      this.$router.app.$emit("showSnackbar", `게시판 리스트를 불러오지 못했습니다.[${board.data.message}]`, "error");
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.$refs.searchQuery.focus();
    });
  },

  methods: {
    getDataFromApi: async function() {
      if (!this.searchQuery || this.searchQuery === "") {
        this.$router.app.$emit("showSnackbar", "조회할 사용자 ID를 입력해주세요.", "error");
        return;
      }
      this.loading = true;
      let query = {
          page: this.pagination.page,
          userId: this.searchQuery
        },
        response;
      try {
        response = await this.$axios.get("/user/document", {params: query});
      } catch (err) {
        if (err.response.status !== 200) {
          this.loading = false;
          this.$router.app.$emit("showSnackbar", `회원게시물 리스트를 불러오지 못했습니다.[${err.response.data ? err.response.data.message : ""}]`, "error");
          return;
        }
      }
      this.userDocuments = response.data;
      this.totalUserDocuments = response.data.length > 0 ? response.data[0].totalCount : 0;
      this.loading = false;
    }
  },
  layout: "main",
  head() {
    return {
      title: "회원게시물 관리"
    };
  }
};
</script>

<style lang="stylus">
#userDocumentTable {
  width: 100%;
}
</style>