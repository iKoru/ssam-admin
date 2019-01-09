<template>
  <div id="pageBoard">
    <v-container grid-list-xl fluid>
      <v-layout row wrap class="elevation-1 mb-5" white>
        <v-toolbar flat color="white">
          <v-toolbar-title>게시판 관리</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-form class="px-3 pt-2 white">
          <v-layout wrap xs12 child-flex pa-2>
            <v-flex xs12 sm4 md3>
              <v-select v-model="searchTarget" pa-2 :items="searchTargetItems" label="검색 대상"></v-select>
            </v-flex>
            <v-flex xs12 sm6>
              <v-select clearable v-if="searchTarget === 'boardType'" pa-2 v-model="searchType" :items="boardTypeItems"></v-select>
              <v-text-field v-else name="searchQuery" pa-2 v-model="searchQuery" @keyup.enter.stop="getDataFromApi"></v-text-field>
            </v-flex>
            <v-flex xs12 sm2>
              <v-btn color="primary" pa-2 @click="getDataFromApi">검색</v-btn>
            </v-flex>
          </v-layout>
        </v-form>

        <v-data-table :headers="headers" :items="boards" id="boardTable" :loading="loading" :no-data-text="noresult">
          <template slot="items" slot-scope="props">
            <tr @dblclick="editItem(props.item)" v-touch="{start: () => touchStart(props.item), end: () => touchEnd(props.item)}">
              <td>{{ props.item.boardId }}</td>
              <td class="text-xs-left">{{ props.item.boardName }}</td>
              <td class="text-xs-left">{{ boards.some(x=>x.boardId === props.item.parentBoardId)?boards.find(x=>x.boardId === props.item.parentBoardId).boardName : (props.item.parentBoardId?'(삭제된 게시판)':'') }}</td>
              <td class="text-xs-left">{{ props.item.ownerId }}</td>
              <td class="text-xs-left">{{ boardTypeItems.find(x=>x.value === props.item.boardType).text }}</td>
              <td class="text-xs-left">{{ boardStatusItems.find(x=>x.value === props.item.status).text }}</td>
              <td class="text-xs-left">{{ allGroupAuthItems.find(x=>props.item.allGroupAuth === x.value) ? allGroupAuthItems.find(x=>props.item.allGroupAuth === x.value).text : ''}}</td>
              <td class="justify-center align-center fill-height">
                <v-checkbox name="allowAnonymous" v-model="props.item.allowAnonymous" readonly hide-details primary class="align-center justify-center"></v-checkbox>
              </td>
              <td class="text-xs-left">{{ props.item.reservedDate?$moment(props.item.reservedDate, 'YYYYMMDD').format('YYYY-MM-DD'):'' }}</td>
            </tr>
          </template>
          <template slot="no-data">
            {{this.noresult}}
            <v-btn color="primary" @click="getDataFromApi">새로고침</v-btn>
          </template>
          <template slot="actions-prepend">
            <v-dialog v-model="dialog" max-width="700px" lazy :fullscreen="$vuetify.breakpoint.smAndDown">
              <v-btn slot="activator" color="primary" dark class="mb-2">신규게시판 생성</v-btn>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                  <v-spacer></v-spacer>
                  <v-icon @click="close">close</v-icon>
                </v-card-title>

                <v-card-text>
                  <v-container grid-list-md>
                    <v-layout wrap>
                      <v-flex xs12>
                        <v-text-field name="boardId" v-model="editedItem.boardId" label="게시판ID" maxlength="15" :readonly="formTitle !== '게시판 생성'" :required="formTitle === '게시판 생성'" placeholder="주소창에 입력되는 경로가 됩니다."></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-text-field name="boardName" v-model="editedItem.boardName" label="게시판 이름" maxlength="200"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-select name="parentBoardId" v-model="editedItem.parentBoardId" :items="boards.filter(x=>x.boardId !== editedItem.boardId && !x.parentBoardId)" item-value="boardId" item-text="boardName" label="상위 게시판"></v-select>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-text-field name="ownerId" v-model="editedItem.ownerId" label="소유자ID" maxlength="50" :required="formTitle === '게시판 생성'" placeholder="미입력 생성시 현재 ID로 지정"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-select name="status" v-model="editedItem.status" :items="boardStatusItems" label="상태"></v-select>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-select name="boardType" v-model="editedItem.boardType" :items="boardTypeItems" :readonly="formTitle !== '게시판 생성'" label="게시판 종류"></v-select>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-checkbox name="allowAnonymous" v-model="editedItem.allowAnonymous" label="익명글 허용"></v-checkbox>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-select name="allGroupAuth" v-model="editedItem.allGroupAuth" :items="allGroupAuthItems" label="전체공개 구분" hint="라운지는 전체읽기허용으로 선택해야합니다."></v-select>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-text-field name="recentOrder" v-model="editedItem.recentOrder" label="메인 최근글 노출순서" type="number" placeholder="미입력시 노출 안함"></v-text-field>
                      </v-flex>
                      <v-flex xs12>
                        <v-autocomplete name="allowedGroups" chips multiple item-text="text" item-value="value" v-model="editedItem.allowedGroups" :items="groupItems" label="구독허용 그룹">
                          <template slot="selection" slot-scope="props">
                            <v-chip close :key="props.item.value" :selected="props.selected" @input="removeChip(props, props.item, editedItem.allowedGroups)">{{props.item.text}}</v-chip>
                          </template>
                        </v-autocomplete>
                      </v-flex>
                      <v-flex xs12>
                        <v-textarea name="boardDescription" v-model="editedItem.boardDescription" maxlength="1000" label="게시판 설명" placeholder="게시판 설명" hint="게시판 페이지 제목에 표시되는 문구"></v-textarea>
                      </v-flex>
                      <v-flex xs12>
                        <v-text-field name="category" label="추가할 카테고리 입력" placeholder="여러개 동시 입력은 컴마로 구분합니다." hint="입력 후 엔터를 입력하면 연속으로 입력할 수 있습니다. 카테고리 변경은 항상 즉시반영됩니다." v-model="candidate" @keyup.enter="addCategoryChips(candidate)" clearable></v-text-field>
                      </v-flex>
                      <v-flex xs12>
                        <span>입력된 카테고리</span>
                        <br>
                        <template v-if="editedItem.categories.length > 0">
                          <v-chip close v-for="category in editedItem.categories.filter(x=>!!x)" :key="category" @input="removeCategoryChip(category)">{{category}}</v-chip>
                        </template>
                        <p v-else class="text-xs-center">아직 입력된 카테고리가 없습니다.</p>
                      </v-flex>
                      <template v-if="formTitle !== '게시판 생성'">
                        <v-flex xs12 sm6>
                          <v-menu :close-on-content-click="true" v-model="showCalendar" :nudge-right="40" lazy transition="scale-transition" offset-y full-width min-width="290px">
                            <v-text-field slot="activator" v-model="editedItem.reservedDate" label="변경 예약일" readonly clearable></v-text-field>
                            <v-date-picker v-model="editedItem.reservedDate" @input="showCalendar = false"></v-date-picker>
                          </v-menu>
                        </v-flex>
                        <v-flex xs12 sm6>
                          <v-textarea name="reservedContents" :value="editedItem.reservedContents ? JSON.stringify(editedItem.reservedContents) : ''" label="변경 예약 내용" placeholder="변경 예약 내용" readonly></v-textarea>
                        </v-flex>
                        <v-flex xs12 sm6>
                          <v-checkbox name="overwrite" v-model="editedItem.overwrite" label="예약내용 덮어쓰기"></v-checkbox>
                        </v-flex>
                        <v-flex xs12 sm6>
                          <v-tooltip bottom>
                            <v-checkbox slot="activator" name="immediate" v-model="editedItem.immediate" label="즉시반영"></v-checkbox>
                            <span>선택하지 않으면 예약내용에 반영됩니다
                              <br>선택하면 예약내용은 유지되고 즉시 반영됩니다.
                            </span>
                          </v-tooltip>
                        </v-flex>
                      </template>
                    </v-layout>
                  </v-container>
                </v-card-text>

                <v-card-actions class="pa-3">
                  <template v-if="formTitle !== '게시판 생성'">
                    <v-btn color="error" @click="deleteItem(editedItem)">게시판 삭제</v-btn>
                    <v-spacer></v-spacer>
                  </template>
                  <v-spacer v-else></v-spacer>
                  <v-btn color="blue darken-1" flat @click="close">취소</v-btn>
                  <template v-if="formTitle === '게시판 생성'">
                    <v-btn color="primary" dark @click="save">생성</v-btn>
                  </template>
                  <template v-else>
                    <v-btn color="primary" dark @click="save">변경</v-btn>
                  </template>
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
    showCalendar: false,
    headers: [{text: "게시판ID", align: "left", value: "boardId"}, {text: "게시판 이름", align: "left", value: "boardName"}, {text:'상위 게시판', align:'left', value:'parentBoardId'}, {text: "소유자ID", align: "left", value: "ownerId"}, {text: "게시판 종류", align: "left", value: "boardType"}, {text: "상태", align: "left", value: "status"}, {text: "전체 접근허용 구분", sortable: false, value: "allGroupAuth"}, {text: "익명글 허용 여부", align: "center", value: "allowAnonymous", sortable: false}, {text: "변경예약일", align: "left", value: "reservedDate"}],
    boards: [],
    totalBoards: 0,
    editedIndex: -1,
    editedItem: {
      boardId: "",
      boardName: "",
      ownerId: "",
      status: "NORMAL",
      allowAnonymous: false,
      allowedGroups: [],
      boardType: null,
      allGroupAuth: "NORMAL",
      boardDescription: "",
      categories: [],
      reservedDate: null,
      reservedContents: null,
      parentBoardId:null,
      recentOrder: null,
      updatedCategory: false,
      overwrite: false,
      immediate: false
    },
    defaultItem: {
      boardId: "",
      boardName: "",
      ownerId: "",
      status: "NORMAL",
      allowAnonymous: false,
      allowedGroups: [],
      boardType: null,
      allGroupAuth: "NORMAL",
      boardDescription: "",
      categories: [],
      reservedDate: null,
      reservedContents: null,
      parentBoardId:null,
      recentOrder: null,
      updatedCategory: false,
      overwrite: false,
      immediate: false
    },
    loading: true,
    searchTargetItems: [{text: "게시판ID", value: "boardId"}, {text: "게시판 이름", value: "boardName"}, {text: "게시판 종류", value: "boardType"}],
    boardStatusItems: [{text: "정상", value: "NORMAL"}, {text: "삭제처리", value: "DELETED"}],
    allGroupAuthItems: [{text: "비공개(구독필수)", value: "NONE"}, {text: "전체읽기허용", value: "READONLY"}, {text: "전체구독허용", value: "READWRITE"}],
    boardTypeItems: [{text: "라운지", value: "L"}, {text: "토픽", value: "T"}, {text: "아카이브", value: "D"}, {text: "기타", value: "E"}],
    groupItems: [],
    searchQuery: null,
    searchTarget: "boardId",
    searchStatus: null,
    searchType: null,
    touching: null,
    candidate: null,
    noresult: "표시할 결과가 없습니다."
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "게시판 생성" : "게시판 수정";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    editedItem: {
      handler(val) {
        if (val.boardType === "L") {
          this.$nextTick(() => {
            this.editedItem.allGroupAuth = "READONLY";
          });
        } else if (val.boardType === "T" && this.editedIndex === -1 && !val.updatedCategory) {
          //creating topic
          this.$nextTick(() => this.addCategoryChips("일반,질문,정보"));
        }
      },
      deep: true
    }
  },

  created: async function() {
    let groups;
    try {
      groups = await this.$axios.get("/group");
    } catch (err) {
      if (err.response) {
        this.$router.app.$emit("showSnackbar", `그룹 리스트를 불러오지 못했습니다.[${groups.data.message}]`, "error");
      } else {
        this.$router.app.$emit("showSnackbar", "서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.", "error");
      }
      return;
    }
    this.groupItems = groups.data.map(x => {
      return {text: x.groupName, value: x.groupId};
    });
  },

  mounted: function() {
    this.getDataFromApi();
  },

  methods: {
    getDataFromApi: async function() {
      this.loading = true;
      let query={}
      if (this.searchTarget !== "boardType" && this.searchQuery) {
        query.searchTarget = this.searchTarget;
        query.searchQuery = this.searchQuery;
      } else if (this.searchTarget === "boardType") {
        query[this.searchTarget] = this.searchType;
      }
      let response;
      try {
        response = await this.$axios.get("/board/list", {params: query});
      } catch (err) {
        this.loading = false;
        if (err.response) {
          this.$router.app.$emit("showSnackbar", `게시판 리스트를 불러오지 못했습니다.[${err.response.data ? err.response.data.message : ""}]`, "error");
        } else {
          this.$router.app.$emit("showSnackbar", "서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.", "error");
        }
        return;
      }

      this.boards = response.data;
      this.boards.forEach(x => {
        x.categories = x.categories.filter(y => y !== null);
      });
      this.loading = false;
    },
    editItem(item) {
      this.editedIndex = this.boards.map(x => x.boardId).indexOf(item.boardId);
      this.editedItem = Object.assign({}, item);
      if (this.editedItem.reservedDate) {
        this.editedItem.reservedDate = this.$moment(this.editedItem.reservedDate, "YYYYMMDD").format("YYYY-MM-DD");
      }
      this.dialog = true;
    },

    deleteItem: async function(item) {
      const index = this.boards.map(x => x.boardId).indexOf(item.boardId);
      if (index < 0) {
        alert("선택된 게시판이 없습니다. 확인 후 다시 시도해주세요.");
        return;
      }
      if (confirm("정말 이 게시판을 삭제하시겠습니까? 해당 게시판에 작성된 글 등은 유지됩니다.")) {
        this.loading = true;
        let response;
        try {
          response = await this.$axios.delete(`/board/${this.boards[index].boardId}`);
        } catch (err) {
          if (err.response) {
            this.$router.app.$emit("showSnackbar", `게시판을 삭제하지 못했습니다.[${err.response.data.message}]`, "error");
          } else {
            this.$router.app.$emit("showSnackbar", "서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.", "error");
          }
          this.loading = false;
          return;
        }
        this.$router.app.$emit("showSnackbar", `${this.boards[index].boardName} 게시판을 삭제하였습니다.`, "success");
        this.boards.splice(index, 1);
        this.close();
        this.loading = false;
      }
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    save: async function() {
      if (this.editedIndex > -1) {
        //update
        if (this.editedItem.overwrite && this.editedItem.immediate) {
          alert("덮어쓰기와 즉시 반영 옵션을 동시에 선택할 수 없습니다.");
          return;
        } else if (!this.editedItem.overwrite && !this.editedItem.immediate && this.editedItem.reservedContents) {
          alert("이미 예약된 변경내용이 존재합니다. 덮어쓰기 혹은 즉시반영 옵션을 선택해주세요.");
          return;
        } else {
          if (!confirm(`게시판 정보 변경내용을 ${this.editedItem.overwrite && this.editedItem.reservedContents ? "현재의 예약내용으로 덮어씁니다." : this.editedItem.immediate ? "즉시 반영합니다." : (this.editedItem.reservedDate ? this.editedItem.reservedDate : "1개월 뒤") + "에 반영되도록 예약합니다."} 계속하시겠습니까?`)) {
            return;
          }
        }

        this.addCategoryChips(this.candidate);
        let response;
        try {
          response = await this.$axios.put("/board", this.editedItem);
        } catch (err) {
          if (err.response) {
            this.$router.app.$emit("showSnackbar", `게시판정보를 변경(예약)하지 못했습니다.[${err.response.data.message}]`, "error");
          } else {
            this.$router.app.$emit("showSnackbar", "서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.", "error");
          }
          return;
        }

        this.$router.app.$emit("showSnackbar", `${this.boards[this.editedIndex].boardName} 게시판 정보를 수정하였습니다.`, "success");
        this.getDataFromApi();
      } else {
        //create
        let response;
        try {
          response = await this.$axios.post("/board", this.editedItem);
        } catch (err) {
          if (err.response) {
            this.$router.app.$emit("showSnackbar", `게시판을 추가하지 못했습니다.[${err.response.data.message}]`, "error");
          } else {
            this.$router.app.$emit("showSnackbar", "서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.", "error");
          }
          return;
        }
        this.editedItem.loungeNickName = response.data.nickName;
        this.editedItem.topicNickName = response.data.nickName;
        this.boards.push(this.editedItem);
        this.$router.app.$emit("showSnackbar", `${this.editedItem.boardName} 게시판을 추가하였습니다.`, "success");
      }
      this.close();
    },
    removeChip(props, item, list) {
      props.parent.selectedItems.splice(props.parent.selectedItems.indexOf(item.value), 1);
      list.splice(list.indexOf(item.value), 1);
    },
    touchStart(item) {
      this.touching = item.boardId;
    },
    touchEnd(item) {
      if (this.touching === item.boardId) {
        this.editItem(item);
      }
    },
    addCategoryChips(candidate) {
      if (typeof candidate === "string") {
        this.editedItem.updatedCategory = true;
        candidate.split(",").forEach(x => {
          if (x !== "") {
            if (this.editedItem.categories.indexOf(x) >= 0) {
              this.$router.app.$emit("showSnackbar", `${x} : 이미 (임시로) 입력된 카테고리입니다.`, "error");
              return;
            }
            this.editedItem.categories.push(x);
          }
        });
        this.candidate = null;
      }
    },
    removeCategoryChip(item) {
      this.editedItem.updatedCategory = true;
      this.editedItem.categories.splice(this.editedItem.categories.indexOf(item), 1);
    }
  },
  layout: "main",
  head() {
    return {
      title: "게시판 관리"
    };
  }
};
</script>

<style lang="stylus">
#boardTable {
  width: 100%;

  .v-datatable__actions {
    justify-content: space-between;
  }
}
</style>