<template>
  <div id="pageReport">
    <v-container grid-list-xl fluid>
      <v-layout row wrap class="elevation-1 mb-5" white>
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
                  <td class="text-xs-left">{{ reportTypeItems.some(x=>x.value === props.item.reportTypeId)?reportTypeItems.find(x=>x.value === props.item.reportTypeId).text:'' }}</td>
                  <td class="text-xs-left">
                    <template v-if="props.item.status === 'NORMAL'">
                      유효<v-btn small @click="changeStatus(props.item, 'INVALID')">무효화</v-btn><v-btn small @click="changeStatus(props.item, 'DONE')">완료처리</v-btn>
                    </template>
                    <template v-else-if="props.item.status === 'INVALID'">
                      무효<v-btn small @click="changeStatus(props.item, 'NORMAL')">유효화</v-btn><v-btn small @click="changeStatus(props.item, 'DONE')">완료처리</v-btn>
                    </template>
                    <template v-else>
                      완료<v-btn small @click="changeStatus(props.item, 'NORMAL')">유효화</v-btn><v-btn small @click="changeStatus(props.item, 'INVALID')">무효화</v-btn>
                    </template>
                  </td>
                  <td class="text-xs-right">{{ $moment(props.item.reportDateTime, 'YYYYMMDDHHmmss').format('Y-MM-DD HH:mm:ss') }}</td>
                  <td><v-btn small @click="sanction(props.item)">제재</v-btn></td>
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
                  <td class="text-xs-left">{{ reportTypeItems.some(x=>x.value === props.item.reportTypeId)?reportTypeItems.find(x=>x.value === props.item.reportTypeId).text:'' }}</td>
                  <td class="text-xs-left">
                    <template v-if="props.item.status === 'NORMAL'">
                      유효<v-btn small @click="changeStatus(props.item, 'INVALID')">무효화</v-btn><v-btn small @click="changeStatus(props.item, 'DONE')">완료처리</v-btn>
                    </template>
                    <template v-else-if="props.item.status === 'INVALID'">
                      무효<v-btn small @click="changeStatus(props.item, 'NORMAL')">유효화</v-btn><v-btn small @click="changeStatus(props.item, 'DONE')">완료처리</v-btn>
                    </template>
                    <template v-else>
                      완료<v-btn small @click="changeStatus(props.item, 'NORMAL')">유효화</v-btn><v-btn small @click="changeStatus(props.item, 'INVALID')">무효화</v-btn>
                    </template>
                  <td class="text-xs-right">{{ $moment(props.item.reportDateTime, 'YYYYMMDDHHmmss').format('Y-MM-DD HH:mm:ss') }}</td>
                  <td><v-btn small @click="sanction(props.item)">제재</v-btn></td>
                </tr>
              </template>
              <template slot="no-data">
                {{this.noresult}}
                <v-btn color="primary" @click="getDataFromCommentsApi">새로고침</v-btn>
              </template>
            </v-data-table>
          </v-tab-item>
        </v-tabs>
        <v-dialog v-model="dialog" max-width="500px" :fullscreen="$vuetify.breakpoint.smAndDown">
          <v-card>
            <v-card-title>
              <span class="headline">회원 제재</span>
              <v-spacer></v-spacer>
              <v-icon @click="close">close</v-icon>
            </v-card-title>

            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12>
                    <v-text-field v-if="editedItem.commentId" name="commentId" v-model="editedItem.commentId" label="댓글ID" readonly></v-text-field>
                    <v-text-field v-else name="documentId" v-model="editedItem.documentId" label="게시물ID" readonly></v-text-field>
                  </v-flex>
                  <v-flex xs12>
                    <v-text-field name="reportTypeName" v-model="reportTypeName" readonly label="신고종류"></v-text-field>
                  </v-flex>
                  <v-flex xs12>
                    <v-checkbox name="isBan" v-model="editedItem.isBan" label="인증취소 여부"></v-checkbox>
                  </v-flex>
                  <v-flex xs12 sm5>
                    <v-text-field name="writeRestrictDays" v-model="editedItem.writeRestrictDays" label="글쓰기제한(일)" :readonly="editedItem.isBan" placeholder="일 단위 입력 혹은 버튼 선택" clearable></v-text-field>
                  </v-flex>
                  <v-flex x12 sm7>
                    <v-btn-toggle v-model="editedItem.writeRestrictDays">
                      <v-btn flat value="7" :disabled="editedItem.isBan">
                        1주
                      </v-btn>
                      <v-btn flat value="30" :disabled="editedItem.isBan">
                        1개월
                      </v-btn>
                      <v-btn flat value="93" :disabled="editedItem.isBan">
                        3개월
                      </v-btn>
                      <v-btn flat value="186" :disabled="editedItem.isBan">
                        6개월
                      </v-btn>
                      <v-btn flat value="365" :disabled="editedItem.isBan">
                        1년
                      </v-btn>
                    </v-btn-toggle>
                  </v-flex>
                  <v-flex xs12 sm5>
                    <v-text-field name="readRestrictDays" v-model="editedItem.readRestrictDays" label="글읽기제한(일)" :readonly="editedItem.isBan" placeholder="일 단위 입력 혹은 버튼 선택" clearable></v-text-field>
                  </v-flex>
                  <v-flex x12 sm7>
                    <v-btn-toggle v-model="editedItem.readRestrictDays">
                      <v-btn flat value="7" :disabled="editedItem.isBan">
                        1주
                      </v-btn>
                      <v-btn flat value="30" :disabled="editedItem.isBan">
                        1개월
                      </v-btn>
                      <v-btn flat value="93" :disabled="editedItem.isBan">
                        3개월
                      </v-btn>
                      <v-btn flat value="186" :disabled="editedItem.isBan">
                        6개월
                      </v-btn>
                      <v-btn flat value="365" :disabled="editedItem.isBan">
                        1년
                      </v-btn>
                    </v-btn-toggle>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>

            <v-card-actions class="pa-3">
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="close">취소</v-btn>
              <v-btn color="primary" dark @click="save">제재 등록</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import config from "~/assets/js/config";
export default {
  data: () => ({
    dialog: false,
    headers: [{text: "게시물ID", sortable: false, align: "left", value: "documentId"}, {text: "게시물 제목", sortable: false, align: "left", value: "title"}, {text:'신고자ID', sortable:false, align:'left', value:'userId'}, {text:'신고종류', sortable:false, align:'left', value:'reportTypeId'}, {text: "상태", sortable: false, align: "left", value: "status"}, {text: "신고일자", sortable: false, align: "right", value: "reportDateTime"}, {text:'제재', align:'left', sortable:false}],
    commentHeaders: [{text: "댓글ID", sortable: false, align: "left", value: "commentId"}, {text: "댓글내용", sortable: false, align: "left", value: "title"}, {text:'신고자ID', sortable:false, align:'left', value:'userId'}, {text:'신고종류', sortable:false, align:'left', value:'reportTypeId'}, {text: "상태", sortable: false, align: "left", value: "status"}, {text: "신고일자", sortable: false, align: "right", value: "reportDateTime"}, {text:'제재', align:'left', sortable:false}],
    documentReports: [],
    commentReports: [],
    totalDocumentReports: 0,
    totalCommentReports: 0,
    searchTargetItems:[{text:'신고자ID', value:'userId'}, {text:'게시물ID', value:'documentId'}, {text:'댓글ID', value:'commentId'}, {text:'상태', value:'status'}],
    reportStatusItems:[{text:'유효', value:'NORMAL'}, {text:'무효', value:'INVALID'}, {text:'완료', value:'DONE'}],
    reportTypeItems:[],
    loading: false,
    pagination: {},
    commentsPagination: {},
    boardItems: [],
    searchQuery: null,
    searchTarget: 'status',
    searchStatus: 'NORMAL',
    noresult: "표시할 결과가 없습니다.",
    selectedTab: "documentReport",
    mainServerHost: config.mainServerHost,
    editedItem: {
      documentId: "",
      commentId: "",
      boardId: "",
      reportTypeId: "",
      writeRestrictDays:null,
      readRestrictDays:null,
      isBan:false
    },
    defaultItem: {
      documentId: "",
      commentId: "",
      boardId: "",
      reportTypeId: "",
      writeRestrictDays:null,
      readRestrictDays:null,
      isBan:false
    },
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

  computed:{
    reportTypeName(){
      return this.reportTypeItems.some(x=>x.value === this.editedItem.reportTypeId)?this.reportTypeItems.find(x=>x.value === this.editedItem.reportTypeId).text : null;
    }  
  },
  
  created: async function() {
    /*let reportType;
    try{
      reportType = await this.$axios.get("/report/type");
    }catch(err){
      this.$router.app.$emit("showSnackbar", `신고종류 리스트를 불러오지 못했습니다.[${err.response.data.message}]`, "error");
      return;
    }
    this.reportTypeItems = reportType.data.map(x => {
      return {text: x.reportTypeName, value: x.reportTypeId};
    });*/
  },

  mounted : async function(){
    if(this.reportTypeItems.length === 0){
      let reportType;
      try{
        reportType = await this.$axios.get("/report/type");
      }catch(err){
        this.$router.app.$emit("showSnackbar", `신고종류 리스트를 불러오지 못했습니다.[${err.response.data.message}]`, "error");
        return;
      }
      this.reportTypeItems = reportType.data.map(x => {
        return {text: x.reportTypeName, value: x.reportTypeId};
      });
    }
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
    changeStatus(item, tobe){
      this.loading = true;
      if(item.commentId){//comment report
        let parameters = {
          commentId:item.commentId,
          userId:item.userId,
          status:tobe
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
        this.$router.app.$emit('showSnackbar', `신고를 ${tobe === 'NORMAL'?'유효화':(tobe === 'INVALID'?'무효화':'완료처리')}하였습니다.`, 'success') 
        this.commentReports.find(x=>x.commentId === item.commentId && x.userId === item.userId).status = tobe;
      }else{//document report
        let parameters = {
          documentId:item.documentId,
          userId:item.userId,
          status:tobe
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
        this.$router.app.$emit('showSnackbar', `신고를 ${tobe === 'NORMAL'?'유효화':(tobe === 'INVALID'?'무효화':'완료처리')}하였습니다.`, 'success') 
        this.documentReports.find(x=>x.documentId === item.documentId && x.userId === item.userId).status = tobe;
      }
    },
    sanction(item){
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
      });
    },

    save: async function() {
      if(this.editedItem.status === 'DONE' && !confirm('이미 완료처리된 신고입니다. 다시 제재하시겠습니까?')){
        return;
      }else if(!this.editedItem.isBan && !this.editedItem.writeRestrictDays && !this.editedItem.readRestrictDays){
        this.$router.app.$emit("showSnackbar", '제재할 내용을 입력해주세요.', "error");
        return;
      }
      let response;
      try {
        response = {
          writeRestrictDays:this.editedItem.writeRestrictDays,
          readRestrictDays:this.editedItem.readRestrictDays,
          isBan:this.editedItem.isBan
        }
        if(this.editedItem.commentId){
          response.commentId = this.editedItem.commentId;
        }else{
          response.documentId = this.editedItem.documentId;
        }
        response = await this.$axios.post('/sanction', response);
      } catch (err) {
        if(err.response){
          this.$router.app.$emit("showSnackbar", `회원을 제재하지 못했습니다.[${err.response.data.message}]`, "error");
        }else{
          this.$router.app.$emit('showSnackbar', '서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.', 'error');
        }
        return;
      }
      this.$router.app.$emit("showSnackbar", `${this.editedItem.commentId? this.editedItem.commentId + ' 댓글' : this.editedItem.documentId + ' 게시물'}을 작성한 회원을 제재하였습니다.`, "success");
      if(this.editedItem.status !== 'DONE'){
        this.changeStatus(this.editedItem, 'DONE')
      }
      this.close();
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