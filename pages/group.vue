<template>
  <div id="pageGroup">
    <v-container grid-list-xl fluid>
      <v-layout row wrap class="elevation-1 mb-5" white>
        <v-toolbar flat color="white">
          <v-toolbar-title>그룹 관리</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-form class="px-3 pt-2 white">
          <v-layout wrap xs12 child-flex pa-2>
            <v-flex xs12 sm4 md3>
              <v-select v-model="searchTarget" pa-2 :items="searchTargetItems" label="검색 대상"></v-select>
            </v-flex>
            <v-flex xs12 sm6>
              <v-select v-if="searchTarget === 'groupType'" clearable pa-2 v-model="searchGroupType" :items="groupTypeItems"></v-select>
              <v-text-field v-else name="searchQuery" pa-2 v-model="searchQuery"></v-text-field>
            </v-flex>
          </v-layout>
        </v-form>

        <v-data-table :headers="headers" :items="groups" id="groupTable" :search="search" :loading="loading" :no-data-text="noresult" :pagination.sync="pagination" :custom-filter="customFilter">
          <template slot="items" slot-scope="props">
            <tr @dblclick="editItem(props.item)" v-touch="{start: () => touchStart(props.item), end: () => touchEnd(props.item)}">
              <td>{{ props.item.groupId }}</td>
              <td class="text-xs-left">{{ props.item.groupName }}</td>
              <td class="text-xs-left">{{ groupTypeItems.find(x=>x.value === props.item.groupType)? groupTypeItems.find(x=>x.value === props.item.groupType).text : props.item.groupType }}</td>
              <td class="text-xs-left">{{ props.item.expirePeriod === -1? '영구' : props.item.expirePeriod }}</td>
              <td class="text-xs-left">{{ groupItems.find(x=>x.value === props.item.parentGroupId)? groupItems.find(x=>x.value === props.item.parentGroupId).text : props.item.parentGroupId }}</td>
              <td class="justify-center align-center fill-height">
                <v-checkbox name="isOpenToUsers" v-model="props.item.isOpenToUsers" readonly hide-details primary class="align-center justify-center"></v-checkbox>
              </td>
            </tr>
          </template>
          <template slot="no-data">
            {{this.noresult}}
            <v-btn color="primary" @click="getDataFromApi">새로고침</v-btn>
          </template>
          <template slot="actions-prepend">
            <v-dialog v-model="dialog" max-width="500px" :fullscreen="$vuetify.breakpoint.smAndDown">
              <v-btn slot="activator" color="primary" dark class="mb-2">신규그룹 생성</v-btn>
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
                        <v-text-field name="groupId" v-model="editedItem.groupId" label="그룹ID" readonly placeholder="그룹 생성 시 자동으로 부여됩니다."></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-text-field name="groupName" v-model="editedItem.groupName" maxlength="50" label="그룹이름"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-select name="groupType" v-model="editedItem.groupType" :items="groupTypeItems" label="그룹종류"></v-select>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-text-field name="expirePeriod" type="number" v-model="editedItem.expirePeriod" label="유지기간" hint="설정하면 입력한 일수가 경과하면 자동으로 그룹이 해제됩니다.(영구 등록은 -1로 지정)"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-select clearable name="parentGroupId" v-model="editedItem.parentGroupId" :items="groupItems.filter(x=>x.value !== editedItem.groupId)" label="상위 그룹" hint="그룹이 속해있는 상위 그룹을 지정합니다."></v-select>
                      </v-flex>
                      <v-flex xs12>
                        <v-checkbox name="isOpenToUsers" v-model="editedItem.isOpenToUsers" label="공개 여부" hint="지역,전공,학년인 경우 유저가 토픽 권한 설정 시 / 3월에 정보변경 시 보여집니다."></v-checkbox>
                      </v-flex>
                      <!--<v-flex xs12 sm6>-->
                      <!--  <v-text-field name="groupIconPath" v-model="editedItem.groupIconPath" label="그룹아이콘 경로"></v-text-field>-->
                      <!--</v-flex>-->
                      <v-flex xs12>
                        <v-textarea name="groupDescription" v-model="editedItem.groupDescription" label="그룹 설명" maxlength="500" placeholder="유저에게 공개 시 함께 보여집니다." hint="유저에게 공개 시 함께 보여집니다."></v-textarea>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>

                <v-card-actions class="pa-3">
                  <template v-if="formTitle !== '그룹 생성'">
                    <v-btn color="error" @click="deleteItem(editedItem)">그룹 삭제</v-btn>
                    <v-spacer></v-spacer>
                  </template>
                  <v-spacer v-else></v-spacer>
                  <v-btn color="blue darken-1" flat @click="close">취소</v-btn>
                  <template v-if="formTitle === '그룹 생성'">
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
    headers: [{text: "그룹ID", value: "groupId"}, {text: "그룹 이름", align: "left", value: "groupName"}, {text: "그룹 종류", align: "left", value: "groupType"}, {text: "유지기간", value: "expirePeriod"}, {text: "상위그룹", sortable: false, value: "parentGroupId"}, {text: "공개 여부", value: "isOpenToUsers"}],
    groups: [],
    editedIndex: -1,
    editedItem: {
      groupId: null,
      groupName: "",
      groupDescription: "",
      parentGroupId: null,
      isOpenToUsers: false,
      groupType: "",
      expirePeriod: -1,
      groupIconPath: ""
    },
    defaultItem: {
      groupId: null,
      groupName: "",
      groupDescription: "",
      parentGroupId: null,
      isOpenToUsers: false,
      groupType: "",
      expirePeriod: -1,
      groupIconPath: ""
    },
    loading: true,
    pagination: {rowsPerPage: 10},
    groupTypeItems: [{text: "전공", value: "M"}, {text: "학년", value: "G"}, {text: "지역", value: "R"}, {text: "일반 그룹", value: "N"}, {text:'인증', value:'A'}, {text:'인증만료(전직교사)', value:'E'}, {text:'인증제한(차단)', value:'D'}],
    groupItems: [],
    searchQuery: null,
    searchGroupType: null,
    searchTarget: "groupName",
    searchTargetItems: [{text: "그룹이름", value: "groupName"}, {text: "그룹종류", value: "groupType"}],
    noresult: "표시할 결과가 없습니다.",
    search: null,
    touching: null,
    customFilter: function(items, search, filter) {
      const searchTarget = search && typeof search !== "boolean" ? search.toString().toLowerCase() : search;
      return this.$parent.searchTarget !== "groupType"
        ? items.filter(i =>
            Object.keys(i)
              .filter(k => k !== "groupType")
              .some(j => filter(i[j], searchTarget))
          )
        : items.filter(i => i.groupType === search);
    }
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "그룹 생성" : "그룹 수정";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    searchQuery(val) {
      this.search = val;
    },
    searchGroupType(val) {
      this.search = val;
    }
  },

  created: async function() {
    await this.getDataFromApi();
  },

  /*mounted: function() {
    this.getDataFromApi();
  },*/

  methods: {
    getDataFromApi: async function() {
      this.loading = true;
      let groups;
      try {
        groups = await this.$axios.get("/group");
      } catch (err) {
        this.loading = false;
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
      this.groups = groups.data;
      this.loading = false;
    },
    editItem(item) {
      this.editedIndex = this.groups.map(x => x.groupId).indexOf(item.groupId);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem: async function(item) {
      const index = this.groups.map(x => x.groupId).indexOf(item.groupId);
      if (index < 0) {
        alert("선택된 그룹이 없습니다. 확인 후 다시 시도해주세요.");
        return;
      }
      if (confirm("정말 이 그룹을 삭제하시겠습니까? 이 그룹에 속해있는 회원들은 모두 그룹에서 해제됩니다.")) {
        this.loading = true;
        let response;
        try {
          response = await this.$axios.delete(`/group/${this.groups[index].groupId}`);
        } catch (err) {
          this.loading = false;
          if (err.response) {
            this.$router.app.$emit("showSnackbar", `그룹을 삭제하지 못했습니다.[${err.response.data.message}]`, "error");
          } else {
            this.$router.app.$emit("showSnackbar", "서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.", "error");
          }
          return;
        }
        this.$router.app.$emit("showSnackbar", `${this.groups[index].groupName} 그룹을 삭제하였습니다.`, "success");
        this.groups.splice(index, 1);
        this.groupItems.splice(this.groupItems.findIndex(x => x.value === item.groupId), 1);
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
        let response;
        if (this.editedItem.parentGroupId === undefined) {
          this.editedItem.parentGroupId = null;
        }
        try {
          response = await this.$axios.put("/group", this.editedItem);
        } catch (err) {
          if (err.response) {
            this.$router.app.$emit("showSnackbar", `그룹정보를 수정하지 못했습니다.[${err.response.data.message}]`, "error");
          } else {
            this.$router.app.$emit("showSnackbar", "서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.", "error");
          }
          return;
        }

        Object.assign(this.groups[this.editedIndex], this.editedItem);
        this.groupItems[this.groupItems.findIndex(x => x.value === this.editedItem.groupId)].text = this.editedItem.groupName;
        this.$router.app.$emit("showSnackbar", `${this.groups[this.editedIndex].groupName} 그룹 정보를 수정하였습니다.`, "success");
      } else {
        //create
        let response;
        try {
          response = await this.$axios.post("/group", this.editedItem);
        } catch (err) {
          if (err.response) {
            this.$router.app.$emit("showSnackbar", `그룹을 추가하지 못했습니다.[${err.response.data.message}]`, "error");
          } else {
            this.$router.app.$emit("showSnackbar", "서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.", "error");
          }
          return;
        }
        this.editedItem.groupId = response.data.groupId;
        this.groups.push(this.editedItem);
        this.groupItems.push({text: this.editedItem.groupName, value: this.editedItem.groupId});
        this.$router.app.$emit("showSnackbar", `${this.editedItem.groupName} 그룹을 추가하였습니다.`, "success");
      }
      this.close();
    },
    touchStart(item) {
      this.touching = item.boardId;
    },
    touchEnd(item) {
      if (this.touching === item.boardId) {
        this.editItem(item);
      }
    }
  },
  layout: "main",
  head() {
    return {
      title: "그룹 관리"
    };
  }
};
</script>

<style lang="stylus">
#groupTable {
  width: 100%;

  .v-datatable__actions {
    justify-content: space-between;
  }
}
</style>