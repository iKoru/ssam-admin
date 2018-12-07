<template>
  <div id="pageDashboard">
    <v-container grid-list-xl fluid>
      <v-layout row wrap class="elevation-1" white>
        <!--<v-content class="elevation-1 pt-0">-->
        <v-toolbar flat color="white">
          <v-toolbar-title>회원 관리</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-form class="px-3 pt-2 white">
          <v-layout wrap xs12 child-flex pa-2>
            <v-flex xs12 sm4 md3>
              <v-select v-model="searchTarget" pa-2 :items="searchTargetItems" label="검색 대상"></v-select>
            </v-flex>
            <v-flex xs12 sm6>
              <v-select v-if="searchTarget === 'groupId'" pa-2 v-model="searchGroup" :items="groupItems"></v-select>
              <v-select v-else-if="searchTarget === 'status'" pa-2 v-model="searchStatus" :items="userStatusItems"></v-select>
              <v-text-field v-else name="searchQuery" pa-2 v-model="searchQuery" @keyup.enter.stop="getDataFromApi"></v-text-field>
            </v-flex>
            <v-flex xs12 sm2>
              <v-btn color="primary" pa-2 @click="getDataFromApi">검색</v-btn>
            </v-flex>
          </v-layout>
        </v-form>

        <v-data-table :headers="headers" :items="users" id="userTable" :rows-per-page-items="[15]" :loading="loading" :total-items="totalUsers" :pagination.sync="pagination" :no-data-text="noresult">
          <template slot="items" slot-scope="props">
            <tr @dblclick="editItem(props.item)">
              <td>{{ props.item.userId }}</td>
              <td class="text-xs-left">{{ props.item.loungeNickName }}</td>
              <td class="text-xs-left">{{ props.item.topicNickName }}</td>
              <td class="text-xs-left">{{ userStatusItems.find(x=>x.value === props.item.status).text }}</td>
              <td class="text-xs-left">{{ regionItems.find(x=>props.item.region === x.value) ? regionItems.find(x=>props.item.region === x.value).text : ''}}</td>
              <td class="text-xs-left">{{ majorItems.find(x=>props.item.major === x.value) ? majorItems.find(x=>props.item.major === x.value).text : '' }}</td>
              <td class="text-xs-left">{{ gradeItems.find(x=>props.item.grade === x.value) ? gradeItems.find(x=>props.item.grade === x.value).text : '' }}</td>
              <td class="text-xs-left">{{ groupItems.filter(x=>props.item.groups.includes(x.value)).map(x=>x.text).join(', ') }}</td>
              <td class="justify-center align-center fill-height">
                <v-checkbox name="isAdmin" v-model="props.item.isAdmin" readonly hide-details primary class="align-center justify-center"></v-checkbox>
              </td>
            </tr>
          </template>
          <template slot="no-data">
            {{this.noresult}}
            <v-btn color="primary" @click="getDataFromApi">새로고침</v-btn>
          </template>
          <template slot="actions-prepend">
            <v-dialog v-model="dialog" max-width="500px">
              <v-btn slot="activator" color="primary" dark class="mb-2">신규회원 생성</v-btn>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container grid-list-md>
                    <v-layout wrap>
                      <v-flex xs12>
                        <v-text-field name="userId" v-model="editedItem.userId" label="ID" :readonly="formTitle !== '회원 생성'" :required="formTitle === '회원 생성'"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-text-field name="email" v-model="editedItem.email" label="이메일"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-text-field name="password" type="password" v-model="editedItem.password" label="비밀번호" :required="formTitle === '회원 생성'" :placeholder="formTitle !== '회원 생성'?'입력하면 변경, 비우면 변경안함':null"></v-text-field>
                      </v-flex>
                      <template v-if="formTitle !== '회원 생성'">
                        <v-flex xs12 sm6>
                          <v-text-field name="loungeNickName" v-model="editedItem.loungeNickName" label="라운지 필명"></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6>
                          <v-text-field name="topicNickName" v-model="editedItem.topicNickName" label="토픽 닉네임"></v-text-field>
                        </v-flex>
                      </template>                      
                      <v-flex xs12 sm6>
                        <v-select name="status" v-model="editedItem.status" :items="userStatusItems" label="상태"></v-select>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-checkbox name="isAdmin" v-model="editedItem.isAdmin" label="관리자 여부"></v-checkbox>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-autocomplete name="region" chips item-text="text" item-value="value" v-model="editedItem.region" :items="regionItems" label="지역">
                          <template slot="selection" slot-scope="props">
                            <v-chip :key="props.item.value" :selected="props.selected" @input="removeChip(props, props.item)">{{props.item.text}}</v-chip>
                          </template>
                        </v-autocomplete>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-autocomplete name="major" chips item-text="text" item-value="value" v-model="editedItem.major" :items="majorItems" label="전공">
                          <template slot="selection" slot-scope="props">
                            <v-chip :key="props.item.value" :selected="props.selected" @input="removeChip(props, props.item)">{{props.item.text}}</v-chip>
                          </template>
                        </v-autocomplete>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-autocomplete name="grade" chips item-text="text" item-value="value" v-model="editedItem.grade" :items="gradeItems" label="학년">
                          <template slot="selection" slot-scope="props">
                            <v-chip :key="props.item.value" :selected="props.selected" @input="removeChip(props, props.item)">{{props.item.text}}</v-chip>
                          </template>
                        </v-autocomplete>
                      </v-flex>
                      <v-flex xs12>
                        <v-autocomplete name="groups" chips multiple item-text="text" item-value="value" v-model="editedItem.groups" :items="groupItems" label="그룹">
                          <template slot="selection" slot-scope="props">
                            <v-chip close :key="props.item.value" :selected="props.selected" @input="removeChip(props, props.item)">{{props.item.text}}</v-chip>
                          </template>
                        </v-autocomplete>
                      </v-flex>
                      <v-flex xs12>
                        <v-textarea name="memo" v-model="editedItem.memo" label="회원 메모" placeholder="관리자만 볼 수 있는 회원의 메모입니다." hint="관리자만 볼 수 있는 회원의 메모입니다."></v-textarea>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>

                <v-card-actions class="pa-3">
                  <template v-if="formTitle !== '회원 생성'">
                    <v-btn color="error" @click="deleteItem(editedItem)">회원 삭제</v-btn>
                    <v-spacer></v-spacer>
                  </template>
                  <v-spacer v-else></v-spacer>
                  <v-btn color="blue darken-1" flat @click="close">취소</v-btn>
                  <template v-if="formTitle === '회원 생성'">
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
        <!--</v-content>-->
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
    headers: [{text: "ID", align: "left", value: "userId"}, {text: "라운지 필명", value: "loungeNickName"}, {text: "토픽 닉네임", value: "topicNickName"}, {text: "상태", sortable: false, value: "status"}, {text: "지역", sortable: false, value: "region"}, {text: "전공", sortable: false, value: "major"}, {text: "학년", sortable: false, value: "grade"}, {text: "그룹", sortable: false, value: "groups"}, {text: "관리자 여부", align: "center", value: "isAdmin", sortable: false}],
    users: [],
    totalUsers: 0,
    editedIndex: -1,
    editedItem: {
      userId: "",
      loungeNickName: "",
      topicNickName: "",
      status: "NORMAL",
      isAdmin: false,
      groups: [],
      major: null,
      grade: null,
      region: null,
      memo: "",
      email: "",
      password: undefined,
    },
    defaultItem: {
      userId: "",
      loungeNickName: "",
      topicNickName: "",
      status: "NORMAL",
      isAdmin: false,
      groups: [],
      major: null,
      grade: null,
      region: null,
      memo: "",
      email: "",
      password: undefined
    },
    loading: true,
    pagination: {},
    searchTargetItems: [{text: "이메일", value: "email"}, {text: "ID", value: "userId"}, {text: "닉네임", value: "nickName"}, {text: "상태", value: "status"}, {text: "그룹", value: "groupId"}],
    userStatusItems: [{text: "인증전", value: "NORMAL"}, {text: "인증완료", value: "AUTHORIZED"}, {text: "잠김", value: "BLOCKED"}, {text: "삭제처리", value: "DELETED"}],
    majorItems: [],
    gradeItems: [],
    regionItems: [],
    groupItems: [],
    searchQuery: null,
    searchGroup: null,
    searchTarget: "userId",
    searchStatus: null,
    noresult: "표시할 결과가 없습니다."
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "회원 생성" : "회원 수정";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    pagination: {
      handler() {
        this.getDataFromApi();
      },
      deep: true
    }
  },

  created: async function() {
    let groups = await this.$axios.get(`${config.apiServerHost}/group`);
    if (groups.status === 200) {
      this.majorItems = groups.data
        .filter(x => x.groupType === "M")
        .map(x => {
          return {text: x.groupName, value: x.groupId};
        });
      this.gradeItems = groups.data
        .filter(x => x.groupType === "G")
        .map(x => {
          return {text: x.groupName, value: x.groupId};
        });
      this.regionItems = groups.data
        .filter(x => x.groupType === "R")
        .map(x => {
          return {text: x.groupName, value: x.groupId};
        });
      this.groupItems = groups.data
        .filter(x => x.groupType === "N")
        .map(x => {
          return {text: x.groupName, value: x.groupId};
        });
    } else {
      this.$router.app.$emit("showSnackbar", `그룹 리스트를 불러오지 못했습니다.[${groups.data.message}]`, "error");
    }
  },

  mounted: function() {
    this.getDataFromApi();
  },

  methods: {
    getDataFromApi: async function() {
      this.loading = true;
      const {sortBy, descending, page, rowsPerPage} = this.pagination;
      let query = {
        page: page
      };
      if (sortBy) {
        query.sortTarget = sortBy;
        query.isAscending = !descending;
      }
      if (this.searchTarget !== "groupId" && this.searchTarget !== "status" && this.searchQuery) {
        query[this.searchTarget] = this.searchQuery;
      } else if (this.searchTarget === "groupId") {
        query[this.searchTarget] = this.searchGroup;
      } else if (this.searchTarget === "status") {
        query[this.searchTarget] = this.searchStatus;
      }
      let response;
      try {
        response = await this.$axios.get(`${config.apiServerHost}/user/list`, {params: query});
      } catch (err) {
        if (err.response.status !== 200) {
          this.loading = false;
          this.$router.app.$emit("showSnackbar", `회원 리스트를 불러오지 못했습니다.[${err.response.data ? err.response.data.message : ""}]`, "error");
          return;
        }
      }
      console.log(response);
      const majors = this.majorItems.map(z => z.value),
        regions = this.regionItems.map(z => z.value),
        grades = this.gradeItems.map(z => z.value),
        groups = this.groupItems.map(z => z.value);
      this.users = response.data.map(x => {
        let result = {...x};
        result.major = x.groups.find(y => majors.includes(y));
        result.region = x.groups.find(y => regions.includes(y));
        result.grade = x.groups.find(y => grades.includes(y));
        result.groups = x.groups.filter(y => groups.includes(y));
        return result;
      });
      this.totalUsers = response.data.length;
      this.loading = false;
    },
    editItem(item) {
      this.editedIndex = this.users.map(x=>x.userId).indexOf(item.userId);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem: async function(item) {
      const index = this.users.map(x=>x.userId).indexOf(item.userId);
      if(index < 0){
        alert('선택된 회원이 없습니다. 확인 후 다시 시도해주세요.');
        return;
      }
      if (confirm("정말 이 회원을 삭제하시겠습니까? 해당 회원이 작성한 글 등은 유지되고, 소유한 토픽이 있을 경우 삭제가 불가능합니다.")) {
        this.loading = true;
        let response;
        try {
          response = await this.$axios.delete(`${config.apiServerHost}/user/${this.users[index].userId}`);
        } catch (err) {
          this.$router.app.$emit("showSnackbar", `회원을 삭제하지 못했습니다.[${err.response.data.message}]`, "error");
          this.loading = false;
          return;
        }
        if (response.status === 200) {
          this.$router.app.$emit("showSnackbar", `${this.users[index].userId} 회원을 삭제하였습니다.`, "success");
          this.users.splice(index, 1);
        }
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
        try {
          response = await this.$axios.put(`${config.apiServerHost}/user`, this.editedItem);
        } catch (err) {
          if(!(err.response.status === 400 && err.response.data.message === '변경된 내용이 없습니다.')){
            this.$router.app.$emit("showSnackbar", `회원정보를 수정하지 못했습니다.[${err.response.data.message}]`, "error");
            return;
          }
        }

        try{
          response = await this.$axios.put(`${config.apiServerHost}/user/group`, {userId:this.editedItem.userId, groups:this.editedItem.groups.concat(this.editedItem.major, this.editedItem.grade, this.editedItem.region)})
        } catch (err){
          this.$router.app.$emit("showSnackbar", `회원 공통정보 수정완료 후 전공/지역/학년/그룹 정보를 수정하는 도중 오류가 발생했습니다.[${err.response.data.message}]`, 'error')
        }
        Object.assign(this.users[this.editedIndex], this.editedItem);
        this.$router.app.$emit("showSnackbar", `${this.users[this.editedIndex].userId} 회원 정보를 수정하였습니다.`, "success");
      } else {
        //create
        let response;
        try {
          response = await this.$axios.post(`${config.apiServerHost}/user`, this.editedItem);
        } catch (err) {
          this.$router.app.$emit("showSnackbar", `회원을 추가하지 못했습니다.[${err.response.data.message}]`, "error");
          return;
        }
        if (response.status === 200) {
          this.editedItem.loungeNickName = response.data.nickName;
          this.editedItem.topicNickName = response.data.nickName;
          this.users.push(this.editedItem);
          this.$router.app.$emit("showSnackbar", `${this.editedItem.userId} 회원을 추가하였습니다.`, "success");
        }
      }
      this.close();
    },
    removeChip(props, item) {
      props.parent.selectedItems.splice(props.parent.selectedItems.indexOf(item.value), 1);
    }
  },
  layout: "main",
  head() {
    return {
      title: "회원 관리"
    };
  }
};
</script>

<style lang="stylus">
#userTable {
  width: 100%;

  .v-datatable__actions {
    justify-content: space-between;
  }
}
</style>