<template>
  <div id="pageSanction">
    <v-container grid-list-xl fluid>
      <v-layout row wrap class="elevation-1 mb-5" white>
        <v-toolbar flat color="white">
          <v-toolbar-title>회원 제재 관리</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-form class="px-3 pt-2 white">
          <v-layout wrap xs12 child-flex pa-2>
            <v-flex xs12 sm5>
              <v-text-field name="searchQuery" pa-2 v-model="searchQuery" placeholder="사용자 ID" @keyup.enter.stop="getDataFromApi" clearable></v-text-field>
            </v-flex>
            <v-flex xs12 sm5>
              <v-select name="searchBoard" v-model="searchBoard" :items="boardItems" label="대상 게시판" clearable></v-select>
            </v-flex>
            <v-flex xs12 sm2>
              <v-btn color="primary" pa-2 @click="getDataFromApi">검색</v-btn>
            </v-flex>
          </v-layout>
        </v-form>

        <v-data-table :headers="headers" :items="sanctions" id="sanctionTable" :rows-per-page-items="[15]" :loading="loading" :total-items="totalSanctions" :pagination.sync="pagination" :no-data-text="noresult">
          <template slot="items" slot-scope="props">
            <tr>
              <td class="text-xs-left">{{ props.item.userId }}</td>
              <td class="text-xs-right">{{ props.item.sanctionDate?$moment(props.item.sanctionDate, 'YYYYMMDD').format('Y-MM-DD'):'' }}</td>
              <td class="text-xs-left">{{ props.item.sanctionContents }}</td>
              <td class="text-xs-left">{{ props.item.adminId }}</td>
            </tr>
          </template>
          <template slot="no-data">
            {{this.noresult}}
            <v-btn color="primary" @click="getDataFromApi">새로고침</v-btn>
          </template>
          <template slot="actions-prepend">
            <v-dialog v-model="dialog" max-width="500px" :fullscreen="$vuetify.breakpoint.smAndDown">
              <v-btn slot="activator" color="primary" dark class="mb-2">신규 제재 등록</v-btn>
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
                        <v-text-field name="userId" v-model="editedItem.userId" maxlength="50" label="제재 대상 사용자ID"></v-text-field>
                      </v-flex>
                      <v-flex xs12>
                        <v-checkbox name="isBan" v-model="editedItem.isBan" label="인증취소 여부"></v-checkbox>
                      </v-flex>
                      <v-flex xs12>
                        <v-select name="boardId" v-model="editedItem.boardId" :items="boardItems" label="제재 대상 게시판" :readonly="editedItem.isBan"></v-select>
                      </v-flex>
                      <v-flex xs12 sm5>
                        <v-text-field name="writeRestrictDays" v-model="editedItem.writeRestrictDays" label="글쓰기제한(일)" :readonly="editedItem.isBan" placeholder="일 단위 입력 혹은 버튼 선택" clearable></v-text-field>
                      </v-flex>
                      <v-flex x12 sm7>
                        <v-btn-toggle v-model="editedItem.writeRestrictDays">
                          <v-btn flat value="7" :disabled="editedItem.isBan">1주</v-btn>
                          <v-btn flat value="30" :disabled="editedItem.isBan">1개월</v-btn>
                          <v-btn flat value="93" :disabled="editedItem.isBan">3개월</v-btn>
                          <v-btn flat value="186" :disabled="editedItem.isBan">6개월</v-btn>
                          <v-btn flat value="365" :disabled="editedItem.isBan">1년</v-btn>
                        </v-btn-toggle>
                      </v-flex>
                      <v-flex xs12 sm5>
                        <v-text-field name="readRestrictDays" v-model="editedItem.readRestrictDays" label="글읽기제한(일)" :readonly="editedItem.isBan" placeholder="일 단위 입력 혹은 버튼 선택" clearable></v-text-field>
                      </v-flex>
                      <v-flex x12 sm7>
                        <v-btn-toggle v-model="editedItem.readRestrictDays">
                          <v-btn flat value="7" :disabled="editedItem.isBan">1주</v-btn>
                          <v-btn flat value="30" :disabled="editedItem.isBan">1개월</v-btn>
                          <v-btn flat value="93" :disabled="editedItem.isBan">3개월</v-btn>
                          <v-btn flat value="186" :disabled="editedItem.isBan">6개월</v-btn>
                          <v-btn flat value="365" :disabled="editedItem.isBan">1년</v-btn>
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
            <v-spacer></v-spacer>
          </template>
        </v-data-table>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
    headers: [{text: "ID", sortable: false, align: "left", value: "userId"}, {text: "제재 일자", sortable: false, align: "right", value: "sanctionDate"}, {text: "제재 내용", sortable: false, align: "left", value: "sanctionContents"}, {text: "제재 등록자 ID", sortable: false, value: "adminId"}],
    sanctions: [],
    totalSanctions: 0,
    editedIndex: -1,
    editedItem: {
      userId: "",
      boardId: "",
      writeRestrictDays: null,
      readRestrictDays: null,
      isBan: false
    },
    defaultItem: {
      userId: "",
      boardId: "",
      writeRestrictDays: null,
      readRestrictDays: null,
      isBan: false
    },
    loading: false,
    pagination: {},
    boardItems: [],
    searchQuery: null,
    searchBoard: null,
    noresult: "표시할 결과가 없습니다."
  }),

  watch: {
    dialog(val) {
      val || this.close();
    },
    pagination: {
      handler() {
        if (this.searchQuery) {
          this.getDataFromApi();
        }
      },
      deep: true
    },
    searchQuery() {
      if (this.totalSanctions > 0) {
        this.sanctions = [];
        this.totalSanctions = 0;
      }
    }
  },

  created: async function() {
    /*let board;
    try{
      board = await this.$axios.get("/board/list");
    }catch(err){
      this.$router.app.$emit("showSnackbar", `게시판 리스트를 불러오지 못했습니다.[${err.response.data.message}]`, "error");
      return;
    }
    this.boardItems = board.data.map(x => {
      return {text: x.boardName, value: x.boardId};
    });*/
  },

  mounted: async function() {
    if (this.boardItems.length === 0) {
      let board;
      try {
        board = await this.$axios.get("/board/list");
      } catch (err) {
        this.$router.app.$emit("showSnackbar", `게시판 리스트를 불러오지 못했습니다.[${err.response.data.message}]`, "error");
        return;
      }
      this.boardItems = board.data.map(x => {
        return {text: x.boardName, value: x.boardId};
      });
    }
  },

  methods: {
    getDataFromApi: async function() {
      if (!this.searchQuery) {
        this.$router.app.$emit("showSnackbar", "검색할 사용자ID는 필수입니다.", "error");
        return;
      }
      this.loading = true;
      const {sortBy, descending, page, rowsPerPage} = this.pagination;
      let query = {
        page: page
      };
      if (this.searchQuery) {
        query.userId = this.searchQuery;
      }
      if (this.searchBoard) {
        query.boardId = this.searchBoard;
      }
      let response;
      try {
        response = await this.$axios.get("/sanction", {params: query});
      } catch (err) {
        this.loading = false;
        if (err.response) {
          this.$router.app.$emit("showSnackbar", `회원 제재 리스트를 불러오지 못했습니다.[${err.response.data ? err.response.data.message : ""}]`, "error");
        } else {
          this.$router.app.$emit("showSnackbar", "서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.", "error");
        }
        return;
      }

      this.sanctions = response.data;
      this.totalSanctions = response.data.length;
      this.loading = false;
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    save: async function() {
      if (!this.editedItem.userId) {
        this.$router.app.$emit("showSnackbar", "제재할 사용자 ID를 입력해주세요.", "error");
        return;
      } else if (!this.editedItem.isBan && !(this.editedItem.boardId && (this.editedItem.writeRestrictDays || this.editedItem.readRestrictDays))) {
        this.$router.app.$emit("showSnackbar", "제재할 게시판ID와 내용을 모두 입력해주세요.", "error");
        return;
      }
      let response;
      try {
        response = await this.$axios.post("/sanction", this.editedItem);
      } catch (err) {
        if (err.response) {
          this.$router.app.$emit("showSnackbar", `회원을 제재하지 못했습니다.[${err.response.data.message}]`, "error");
        } else {
          this.$router.app.$emit("showSnackbar", "서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.", "error");
        }
        return;
      }
      this.$router.app.$emit("showSnackbar", `${this.editedItem.userId} 회원을 제재하였습니다.`, "success");
      this.close();
    }
  },
  layout: "main",
  head() {
    return {
      title: "회원 제재 관리"
    };
  }
};
</script>

<style lang="stylus">
#sanctionTable {
  width: 100%;

  .v-datatable__actions {
    justify-content: space-between;
  }
}
</style>