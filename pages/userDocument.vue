<template>
  <div id="pageUserDocument">
    <v-container grid-list-xl fluid>
      <v-layout row wrap class="elevation-1 mb-5" white>
        <v-tabs color="secondary" dark icons-and-text class="w-100" v-model="selectedTab">
          <v-tabs-slider color="accent"></v-tabs-slider>
          <v-tab href="#userDocument">게시물
            <v-icon>description</v-icon>
          </v-tab>
          <v-tab href="#userComment">댓글
            <v-icon>question_answer</v-icon>
          </v-tab>

          <v-tab-item value="userDocument">
            <v-toolbar flat color="white">
              <v-toolbar-title>회원 게시물 조회</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
            <v-form class="px-3 pt-2 white">
              <v-layout wrap xs12 child-flex pa-2>
                <v-flex xs12 sm10>
                  <v-text-field name="searchQuery" pa-2 v-model="searchQuery" @keydown.enter.stop.prevent="getDataFromApi" label="조회 대상 사용자ID"></v-text-field>
                </v-flex>
                <v-flex xs12 sm2>
                  <v-btn color="primary" pa-2 @click="getDataFromApi">검색</v-btn>
                </v-flex>
              </v-layout>
            </v-form>

            <v-data-table :headers="headers" :items="userDocuments" class="w-100" :rows-per-page-items="[15]" :loading="loading" :total-items="totalUserDocuments" :pagination.sync="pagination" :no-data-text="noresult">
              <template slot="items" slot-scope="props">
                <tr>
                  <td class="text-xs-left">{{ boardItems.find(x=>x.value === props.item.boardId).text }}</td>
                  <td class="text-xs-left">{{ props.item.documentId }}</td>
                  <td class="text-xs-left ellipsis">
                    <a :href="`${mainServerHost}/${props.item.boardId}/${props.item.documentId}`" target="_blank">{{ props.item.title }}</a>
                  </td>
                  <td class="text-xs-left">{{ props.item.isDeleted?'삭제됨':'정상' }}</td>
                  <td class="text-xs-right">{{ $moment(props.item.writeDateTime, 'YYYYMMDDHHmmss').format('Y-MM-DD HH:mm:ss') }}</td>
                  <td class="text-xs-right"><v-btn class="px-0 ma-0" small color="error" @click="deleteDocument(props.item)">삭제</v-btn></td>
                </tr>
              </template>
              <template slot="no-data">
                {{this.noresult}}
                <v-btn color="primary" @click="getDataFromApi">새로고침</v-btn>
              </template>
            </v-data-table>
          </v-tab-item>

          <v-tab-item value="userComment">
            <v-toolbar flat color="white">
              <v-toolbar-title>회원 댓글 조회</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
            <v-form class="px-3 pt-2 white">
              <v-layout wrap xs12 child-flex pa-2>
                <v-flex xs12 sm10>
                  <v-text-field name="searchQuery" pa-2 v-model="searchQuery" @keydown.enter.stop.prevent="getDataFromCommentsApi" label="조회 대상 사용자ID"></v-text-field>
                </v-flex>
                <v-flex xs12 sm2>
                  <v-btn color="primary" pa-2 @click="getDataFromCommentsApi">검색</v-btn>
                </v-flex>
              </v-layout>
            </v-form>

            <v-data-table :headers="commentHeaders" :items="userComments" class="w-100" :rows-per-page-items="[15]" :loading="loading" :total-items="totalUserComments" :pagination.sync="commentsPagination" :no-data-text="noresult">
              <template slot="items" slot-scope="props">
                <tr>
                  <td class="text-xs-left">{{ boardItems.find(x=>x.value === props.item.boardId).text }}</td>
                  <td class="text-xs-left">{{ props.item.commentId }}</td>
                  <td class="text-xs-left ellipsis">
                    <a :href="`${mainServerHost}/${props.item.boardId}/${props.item.documentId}`" target="_blank">{{ props.item.contents }}</a>
                  </td>
                  <td class="text-xs-left">{{ props.item.isDeleted?'삭제됨':'정상' }}</td>
                  <td class="text-xs-right">{{ $moment(props.item.writeDateTime, 'YYYYMMDDHHmmss').format('Y-MM-DD HH:mm:ss') }}</td>
                  <td class="text-xs-right"><v-btn class="px-0 ma-0" small color="error" @click="deleteComment(props.item)">삭제</v-btn></td>
                </tr>
              </template>
              <template slot="no-data">
                {{this.noresult}}
                <v-btn color="primary" @click="getDataFromCommentsApi">새로고침</v-btn>
              </template>
            </v-data-table>
          </v-tab-item>
        </v-tabs>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import config from "~/assets/js/config";
export default {
  data: () => ({
    dialog: false,
    headers: [{text: "게시판 이름", align: "left", sortable: false, value: "boardId"}, {text: "게시물ID", sortable: false, align: "left", value: "documentId"}, {text: "게시물 제목", sortable: false, align: "left", value: "title"}, {text: "상태", sortable: false, align: "left", value: "status"}, {text: "작성일자", sortable: false, align: "right", value: "writeDateTime"}, {text:'', sortable:false, align:'right'}],
    commentHeaders: [{text: "게시판 이름", align: "left", sortable: false, value: "boardId"}, {text: "댓글ID", sortable: false, align: "left", value: "commentId"}, {text: "댓글내용", sortable: false, align: "left", value: "title"}, {text: "상태", sortable: false, align: "left", value: "status"}, {text: "작성일자", sortable: false, align: "right", value: "writeDateTime"}, {text:'', sortable:false, align:'right'}],
    userDocuments: [],
    userComments: [],
    totalUserDocuments: 0,
    totalUserComments: 0,
    loading: false,
    pagination: {},
    commentsPagination: {},
    boardItems: [],
    searchQuery: null,
    noresult: "표시할 결과가 없습니다.",
    selectedTab: "userDocument",
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
    },
    searchQuery() {
      if (this.selectedTab === "userDocument") {
        if (this.totalUserDocuments > 0) {
          this.totalUserDocuments = 0;
          this.userDocuments = [];
        }
      } else if (this.selectedTab === "userComment") {
        if (this.totalUserComments > 0) {
          this.totalUserComments = 0;
          this.userComments = [];
        }
      }
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

  methods: {
    getDataFromApi: async function() {
      if (!this.searchQuery || this.searchQuery === "") {
        this.$router.app.$emit("showSnackbar", "조회할 사용자 ID를 입력해주세요.", "error");
        return;
      }
      this.loading = true;
      let response;
      try {
        response = await this.$axios.get("/user/document", {
          params: {
            page: this.pagination.page,
            userId: this.searchQuery
          }
        });
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
    },
    getDataFromCommentsApi: async function() {
      if (!this.searchQuery || this.searchQuery === "") {
        this.$router.app.$emit("showSnackbar", "조회할 사용자 ID를 입력해주세요.", "error");
        return;
      }
      this.loading = true;
      let response;
      try {
        response = await this.$axios.get("/user/comment", {
          params: {
            page: this.pagination.page,
            userId: this.searchQuery
          }
        });
      } catch (err) {
        if (err.response.status !== 200) {
          this.loading = false;
          this.$router.app.$emit("showSnackbar", `회원댓글 리스트를 불러오지 못했습니다.[${err.response.data ? err.response.data.message : ""}]`, "error");
          return;
        }
      }
      this.userComments = response.data;
      this.totalUserComments = response.data.length > 0 ? response.data[0].totalCount : 0;
      this.loading = false;
    },
    async deleteDocument(docu){
      if(confirm('이 글을 영구적으로 삭제하시겠습니까? 복원이 불가능하므로 신중히 판단하시기 바랍니다.')){
        let response;
        try{
          response = await this.$axios.delete('/document/'+docu.documentId)
        }catch(err){
          console.log(err);
          if(err.response.status!== 200){
            this.$router.app.$emit('showSnackbar', `글을 영구삭제 하지 못했습니다.[${err.response.data? err.response.data.message : ''}]`, 'error');
          }
          return;
        }
        this.$router.app.$emit('showSnackbar', '글을 영구적으로 삭제하였습니다.', 'success')
        this.getDataFromApi();
      }
    },
    async deleteComment(comment){
      if(confirm('이 댓글을 영구적으로 삭제하시겠습니까? 복원이 불가능하므로 신중히 판단하시기 바랍니다.')){
        let response;
        try{
          response = await this.$axios.delete('/comment/'+comment.commentId)
        }catch(err){
          console.log(err);
          if(err.response.status!== 200){
            this.$router.app.$emit('showSnackbar', `댓글을 영구삭제 하지 못했습니다.[${err.response.data? err.response.data.message : ''}]`, 'error');
          }
          return;
        }
        this.$router.app.$emit('showSnackbar', '댓글을 영구적으로 삭제하였습니다.', 'success')
        this.getDataFromCommentsApi();
      }
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
