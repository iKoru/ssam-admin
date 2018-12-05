<template>
  <div id="pageDashboard">
    <v-container grid-list-xl fluid>
      <v-layout row wrap class="elevation-1">
        <v-toolbar flat color="white">
          <v-toolbar-title>회원관리</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-form>
          <v-select v-model="searchTarget" :items="searchTargetItems" label="검색 대상"></v-select>
          <v-input-field name="searchQuery" v-model="searchQuery"></v-input-field>
          <v-btn primary @click="getDataFromApi">검색</v-btn>
        </v-form>
        <v-data-table :headers="headers" :items="users" id="userTable" :rows-per-page-items="[10]" :loading="loading" :total-items="totalUsers" :pagination.sync="pagination">
          <template slot="items" slot-scope="props">
            <td>{{ props.item.userId }}</td>
            <td class="text-xs-right">{{ props.item.loungeNickName }}</td>
            <td class="text-xs-right">{{ props.item.topicNickName }}</td>
            <td class="text-xs-right">{{ userStatusItems.find(x=>x.value === props.item.status).text }}</td>
            <td class="justify-center layout px-0">
              <v-icon small class="mr-2" @click="editItem(props.item)">edit</v-icon>
              <v-icon small @click="deleteItem(props.item)">delete</v-icon>
            </td>
          </template>
          <template slot="no-data">
            <v-btn color="primary" @click="getDataFromApi">Reset</v-btn>
          </template>
          <template slot="actions-prepend">
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="500px">
              <v-btn slot="activator" color="primary" dark class="mb-2">신규회원 생성</v-btn>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container grid-list-md>
                    <v-layout wrap>
                      <v-flex xs12 sm6 md4>
                        <v-text-field name="userId" v-model="editedItem.userId" label="ID"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md4>
                        <v-text-field name="loungeNickName" v-model="editedItem.loungeNickName" label="라운지 닉네임"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md4>
                        <v-text-field name="topicNickName" v-model="editedItem.topicNickName" label="토픽 필명"></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md4>
                        <v-select name="status" v-model="editedItem.status" :items="userStatusItems" label="상태"></v-select>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
                  <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
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
// import PlainTable from "~/components/PlainTable";
// import PlainTableOrder from "~/components/PlainTableOrder";
import config from "~/assets/js/config";
export default {
  data: () => ({
    dialog: false,
    headers: [{text: "ID", align: "left", value: "userId"}, {text: "라운지닉네임", value: "loungeNickName"}, {text: "토픽필명", value: "topicNickName"}, {text: "상태", sortable: false, value: "status"}, {text: "수정/삭제", value: "actions", sortable: false}],
    users: [],
    totalUsers: 0,
    editedIndex: -1,
    editedItem: {
      name: "",
      calories: 0,
      fat: 0,
      carbs: 0,
      protein: 0
    },
    defaultItem: {
      name: "",
      calories: 0,
      fat: 0,
      carbs: 0,
      protein: 0
    },
    loading: true,
    pagination: {},
    searchTargetItems: [{text: "이메일", value: "email"}, {text: "ID", value: "userId"}, {text: "닉네임", value: "nickName"}, {text: "상태", value: "status"}],
    userStatusItems: [{text: "인증전", value: "NORMAL"}, {text: "인증완료", value: "AUTHORIZED"}, {text: "잠김", value: "BLOCKED"}, {text: "삭제처리", value: "DELETED"}],
    searchQuery: null,
    searchTarget: "userId"
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "회원 생성" : "회원 수정";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
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
        sortTarget: sortBy,
        isAscending: !descending,
        page: page
      };
      if (this.searchQuery) {
        query[this.searchTarget] = this.searchQuery;
      }
      let response = await this.$axios.get(`${config.apiServerHost}/user/list`, query);
      console.log(response);
      if (response.status !== 200) {
        this.loading = false;
        return;
      }
      let items = response.data;
      const total = items.length;
      // if (this.pagination.sortBy) {
      //   items = items.sort((a, b) => {
      //     const sortA = a[sortBy];
      //     const sortB = b[sortBy];

      //     if (descending) {
      //       if (sortA < sortB) return 1;
      //       if (sortA > sortB) return -1;
      //       return 0;
      //     } else {
      //       if (sortA < sortB) return -1;
      //       if (sortA > sortB) return 1;
      //       return 0;
      //     }
      //   });
      // }

      if (rowsPerPage > 0) {
        items = items.slice((page - 1) * rowsPerPage, page * rowsPerPage);
      }
      this.users = items;
      this.totalUsers = total;
      this.loading = false;
    },
    /*getDesserts () {
      return [
        {
          value: false,
          name: 'Frozen Yogurt',
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          iron: '1%'
        },
        {
          value: false,
          name: 'Ice cream sandwich',
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3,
          iron: '1%'
        },
        {
          value: false,
          name: 'Eclair',
          calories: 262,
          fat: 16.0,
          carbs: 23,
          protein: 6.0,
          iron: '7%'
        },
        {
          value: false,
          name: 'Cupcake',
          calories: 305,
          fat: 3.7,
          carbs: 67,
          protein: 4.3,
          iron: '8%'
        },
        {
          value: false,
          name: 'Gingerbread',
          calories: 356,
          fat: 16.0,
          carbs: 49,
          protein: 3.9,
          iron: '16%'
        },
        {
          value: false,
          name: 'Jelly bean',
          calories: 375,
          fat: 0.0,
          carbs: 94,
          protein: 0.0,
          iron: '0%'
        },
        {
          value: false,
          name: 'Lollipop',
          calories: 392,
          fat: 0.2,
          carbs: 98,
          protein: 0,
          iron: '2%'
        },
        {
          value: false,
          name: 'Honeycomb',
          calories: 408,
          fat: 3.2,
          carbs: 87,
          protein: 6.5,
          iron: '45%'
        },
        {
          value: false,
          name: 'Donut',
          calories: 452,
          fat: 25.0,
          carbs: 51,
          protein: 4.9,
          iron: '22%'
        },
        {
          value: false,
          name: 'KitKat',
          calories: 518,
          fat: 26.0,
          carbs: 65,
          protein: 7,
          iron: '6%'
        }
      ]
    },*/

    editItem(item) {
      this.editedIndex = this.users.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.users.indexOf(item);
      confirm("정말 이 회원을 삭제하시겠습니까? 해당 회원이 작성한 글 등은 유지되고, 소유한 토픽이 있을 경우 삭제가 불가능합니다.") && this.desserts.splice(index, 1);
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.users[this.editedIndex], this.editedItem);
      } else {
        this.users.push(this.editedItem);
      }
      this.close();
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

<style lang="styl">
#userTable {
  width: 100%;
}
</style>