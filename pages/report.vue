<template>
  <div id="pageReport">
    <v-container grid-list-xl fluid>
      <v-layout row wrap class="elevation-1" white>
        <v-tabs color="secondary" dark icons-and-text id="reportTabs" v-model="selectedTab">
          <v-tabs-slider color="accent"></v-tabs-slider>
          <v-tab href="#documentReport">게시물
            <v-icon>description</v-icon>
          </v-tab>
          <v-tab href="#commentReport">댓글
            <v-icon>question_answer</v-icon>
          </v-tab>

          <v-tab-item value="documentReport">
            <v-toolbar flat color="white">
              <v-toolbar-title>게시물 신고 조회</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
            <v-form class="px-3 pt-2 white">
              <v-layout wrap xs12 child-flex pa-2>
                <v-flex xs12 sm4 md3>
                  <v-select v-model="searchTarget" pa-2 :items="searchTargetItems" label="검색 대상"></v-select>
                </v-flex>
                <v-flex xs12 sm7>
                  <v-select clearable v-if="searchTarget === 'status'" pa-2 v-model="searchStatus" :items="reportStatusItems"></v-select>
                  <v-text-field v-else name="searchQuery" pa-2 v-model="searchQuery" @keyup.enter.stop="getDataFromApi"></v-text-field>
                </v-flex>
                <v-flex xs12 sm2>
                  <v-btn color="primary" pa-2 @click="getDataFromApi">검색</v-btn>
                </v-flex>
              </v-layout>
            </v-form>

            <v-data-table :headers="headers" :items="documentReports" id="documentReportTable" :rows-per-page-items="[15]" :loading="loading" :total-items="totalDocumentReports" :pagination.sync="pagination" :no-data-text="noresult">
              <template slot="items" slot-scope="props">
                <tr>
                  <td class="text-xs-left">{{ props.item.documentId }}</td>
                  <td class="text-xs-left ellipsis">
                    <a :href="`${mainServerHost}/${props.item.boardId}/${props.item.documentId}`" target="_blank">{{ props.item.title }}</a>
                  </td>
                  <td class="text-xs-left">{{ props.item.userId }}</td>
                  <td class="text-xs-left">{{ reportTypeItems.find(x=>x.value === props.item.reportTypeId).text }}</td>
                  <td class="text-xs-left">{{ props.item.status === 'NORMAL'?'유효':'무효' }}<v-btn small @click="changeStatus(props.item)">{{ props.item.status === 'NORMAL'?'무효화':'유효화' }}</v-btn></td>
                  <td class="text-xs-right">{{ $moment(props.item.reportDateTime, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss') }}</td>
                </tr>
              </template>
              <template slot="no-data">
                {{this.noresult}}
                <v-btn color="primary" @click="getDataFromApi">새로고침</v-btn>
              </template>
            </v-data-table>
          </v-tab-item>

          <v-tab-item value="commentReport">
            <v-toolbar flat color="white">
              <v-toolbar-title>댓글 신고 조회</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
            <v-form class="px-3 pt-2 white">
              <v-layout wrap xs12 child-flex pa-2>
                <v-flex xs12 sm4 md3>
                  <v-select v-model="searchTarget" pa-2 :items="searchTargetItems" label="검색 대상"></v-select>
                </v-flex>
                <v-flex xs12 sm7>
                  <v-select clearable v-if="searchTarget === 'status'" pa-2 v-model="searchStatus" :items="reportStatusItems"></v-select>
                  <v-text-field v-else name="searchQuery" pa-2 v-model="searchQuery" @keyup.enter.stop="getDataFromApi"></v-text-field>
                </v-flex>
                <v-flex xs12 sm2>
                  <v-btn color="primary" pa-2 @click="getDataFromCommentsApi">검색</v-btn>
                </v-flex>
              </v-layout>
            </v-form>

            <v-data-table :headers="commentHeaders" :items="commentReports" id="commentReportTable" :rows-per-page-items="[15]" :loading="loading" :total-items="totalCommentReports" :pagination.sync="commentsPagination" :no-data-text="noresult">
              <template slot="items" slot-scope="props">
                <tr>
                  <td class="text-xs-left">{{ props.item.commentId }}</td>
                  <td class="text-xs-left ellipsis">
                    <a :href="`${mainServerHost}/${props.item.documentId}`" target="_blank">{{ props.item.contents }}</a>
                  </td>
                  <td class="text-xs-left">{{ props.item.userId }}</td>
                  <td class="text-xs-left">{{ reportTypeItems.find(x=>x.value === props.item.reportTypeId).text }}</td>
                  <td class="text-xs-left">{{ props.item.status === 'NORMAL'?'유효':'무효' }}<v-btn small @click="changeStatus(props.item)">{{ props.item.status === 'NORMAL'?'무효화':'유효화' }}</v-btn></td>
                  <td class="text-xs-right">{{ $moment(props.item.reportDateTime, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss') }}</td>
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
    headers: [{text: "게시물ID", sortable: false, align: "left", value: "documentId"}, {text: "게시물 제목", sortable: false, align: "left", value: "title"}, {text:'신고자ID', sortable:false, align:'left', value:'userId'}, {text:'신고종류', sortable:false, align:'left', value:'reportTypeId'}, {text: "상태", sortable: false, align: "left", value: "status"}, {text: "신고일자", sortable: false, align: "right", value: "reportDateTime"}],
    commentHeaders: [{text: "댓글ID", sortable: false, align: "left", value: "commentId"}, {text: "댓글내용", sortable: false, align: "left", value: "title"}, {text:'신고자ID', sortable:false, align:'left', value:'userId'}, {text:'신고종류', sortable:false, align:'left', value:'reportTypeId'}, {text: "상태", sortable: false, align: "left", value: "status"}, {text: "신고일자", sortable: false, align: "right", value: "reportDateTime"}],
    documentReports: [],
    commentReports: [],
    totalDocumentReports: 0,
    totalCommentReports: 0,
    searchTargetItems:[{text:'신고자ID', value:'userId'}, {text:'게시물ID', value:'documentId'}, {text:'댓글ID', value:'commentId'}, {text:'상태', value:'status'}],
    reportStatusItems:[{text:'유효', value:'NORMAL'}, {text:'무효', value:'INVALID'}],
    loading: false,
    pagination: {},
    commentsPagination: {},
    boardItems: [],
    searchQuery: null,
    searchTarget: 'status',
    searchStatus: 'NORMAL',
    noresult: "표시할 결과가 없습니다.",
    selectedTab: "documentReport",
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
    let reportType = await this.$axios.get("/report/type");
    if (reportType.status === 200) {
      this.reportTypeItems = reportType.data.map(x => {
        return {text: x.reportTypeName, value: x.reportTypeId};
      });
    } else {
      this.$router.app.$emit("showSnackbar", `신고종류 리스트를 불러오지 못했습니다.[${reportType.data.message}]`, "error");
    }
  },

  mounted(){
    this.getDataFromApi();
  },
  
  methods: {
    getDataFromApi: async function() {
      this.loading = true;
      let response;
      try {
        let query =  {page: this.pagination.page};
        if(this.searchTarget !== 'status' && this.searchQuery && this.searchQuery !== ''){
          query[this.searchTarget] = this.searchQuery;
        }else if(this.searchTarget === 'status' && this.searchStatus){
          query.status = this.searchStatus
        }
        response = await this.$axios.get("/report/document/list", {params:query});
      } catch (err) {
        if (err.response.status !== 200) {
          this.loading = false;
          this.$router.app.$emit("showSnackbar", `신고 리스트를 불러오지 못했습니다.[${err.response.data ? err.response.data.message : ""}]`, "error");
          return;
        }
      }
      this.documentReports = response.data;
      this.totalDocumentReports = response.data.length > 0 ? response.data[0].totalCount : 0;
      this.loading = false;
    },
    getDataFromCommentsApi: async function() {
      this.loading = true;
      let response;
      try {
        let query =  {page: this.pagination.page};
        if(this.searchTarget !== 'status' && this.searchQuery && this.searchQuery !== ''){
          query[this.searchTarget] = this.searchQuery;
        }else if(this.searchTarget === 'status' && this.searchStatus){
          query.status = this.searchStatus
        }
        response = await this.$axios.get("/report/comment/list", {params:query});
      } catch (err) {
        this.loading = false;
        if(err.response){
          this.$router.app.$emit("showSnackbar", `댓글 신고 리스트를 불러오지 못했습니다.[${err.response.data ? err.response.data.message : ""}]`, "error");
        }else{
          this.$router.app.$emit('showSnackbar', '서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.', 'error');
        }
        return;
      }
      this.commentReports = response.data;
      this.totalCommentReports = response.data.length > 0 ? response.data[0].totalCount : 0;
      this.loading = false;
    },
    changeStatus(item){
      this.loading = true;
      if(item.commentId){//comment report
        let parameters = {
          commentId:item.commentId,
          userId:item.userId,
          status:item.status==='NORMAL'?'INVALID':'NORMAL'
        }, response;
        try{
          response = this.$axios.put('/report/comment', parameters)
        }catch(err){
          this.loading = false;
          if(err.response){
            this.$router.app.$emit('showSnackbar', `신고상태 변경에 실패하였습니다.[${err.response.data? err.response.data.message : ''}]`, 'error')  
          }else{
            this.$router.app.$emit('showSnackbar', '서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.', 'error');
          }
          return;
        }
        this.loading = false;
        this.$router.app.$emit('showSnackbar', `신고를 ${item.status === 'NORMAL'?'무':'유'}효화하였습니다.`, 'success') 
        this.commentReports.find(x=>x.commentId === item.commentId && x.userId === item.userId).status = item.status === 'NORMAL'?'INVALID':'NORMAL';
      }else{//document report
        let parameters = {
          documentId:item.documentId,
          userId:item.userId,
          status:item.status==='NORMAL'?'INVALID':'NORMAL'
        }, response;
        try{
          response = this.$axios.put('/report/document', parameters)
        }catch(err){
          this.loading = false;
          if(err.response){
            this.$router.app.$emit('showSnackbar', `신고상태 변경에 실패하였습니다.[${err.response.data? err.response.data.message : ''}]`, 'error')  
          }else{
            this.$router.app.$emit('showSnackbar', '서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.', 'error');
          }
          return;
        }
        this.loading = false;
        this.$router.app.$emit('showSnackbar', `신고를 ${item.status === 'NORMAL'?'무':'유'}효화하였습니다.`, 'success') 
        this.documentReports.find(x=>x.documentId === item.documentId && x.userId === item.userId).status = item.status === 'NORMAL'?'INVALID':'NORMAL';
      }
    }
  },
  layout: "main",
  head() {
    return {
      title: "신고 관리"
    };
  }
};
</script>

<style lang="stylus">
#reportTabs, #documentReportTable, #commentReportTable {
  width: 100%;
}

.ellipsis {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>