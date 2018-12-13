<template>
  <div id="pageReportType">
    <v-container grid-list-xl fluid>
      <v-layout row wrap class="elevation-1 mb-5" white>
        <v-toolbar flat color="white">
          <v-toolbar-title>신고종류 관리</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-form class="px-3 pt-2 white">
          <v-layout wrap xs12 pa-2>
            <v-text-field name="search" pa-2 v-model="search" label="검색" append-icon="search"></v-text-field>
          </v-layout>
        </v-form>

        <v-data-table :headers="headers" :items="reportTypes" id="reportTypeTable" :search="search" :loading="loading" :no-data-text="noresult" :pagination.sync="pagination">
          <template slot="items" slot-scope="props">
            <tr @dblclick="editItem(props.item)" v-touch="{start: () => touchStart(props.item), end: () => touchEnd(props.item)}">
              <td>{{ props.item.reportTypeId }}</td>
              <td class="text-xs-left">{{ props.item.reportTypeName }}</td>
              <td class="text-xs-left">{{ props.item.reportTypeDescription }}</td>
            </tr>
          </template>
          <template slot="no-data">
            {{this.noresult}}
            <v-btn color="primary" @click="getDataFromApi">새로고침</v-btn>
          </template>
          <template slot="actions-prepend">
            <v-dialog v-model="dialog" max-width="500px" :fullscreen="$vuetify.breakpoint.smAndDown">
              <v-btn slot="activator" color="primary" dark class="mb-2">신고종류 생성</v-btn>
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
                        <v-text-field name="reportTypeId" v-model="editedItem.reportTypeId" label="신고종류ID" readonly placeholder="신고종류 생성 시 자동으로 부여됩니다."></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-text-field name="reportTypeName" v-model="editedItem.reportTypeName" label="신고종류이름"></v-text-field>
                      </v-flex>
                      <v-flex xs12>
                        <v-textarea name="reportTypeDescription" v-model="editedItem.reportTypeDescription" label="신고종류 설명" placeholder="신고종류의 설명입니다."></v-textarea>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>

                <v-card-actions class="pa-3">
                  <template v-if="formTitle !== '신고종류 생성'">
                    <v-btn color="error" @click="deleteItem(editedItem)">신고종류 삭제</v-btn>
                    <v-spacer></v-spacer>
                  </template>
                  <v-spacer v-else></v-spacer>
                  <v-btn color="blue darken-1" flat @click="close">취소</v-btn>
                  <template v-if="formTitle === '신고종류 생성'">
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
    headers: [{text: "신고종류ID", value: "reportTypeId"}, {text: "신고종류 이름", align: "left", value: "reportTypeName"}, {text: "신고종류 설명", align: "left", value: "reportTypeDescription"}],
    reportTypes: [],
    editedIndex: -1,
    editedItem: {
      reportTypeId: null,
      reportTypeName: "",
      reportTypeDescription: ""
    },
    defaultItem: {
      reportTypeId: null,
      reportTypeName: "",
      reportTypeDescription: ""
    },
    loading: true,
    pagination: {rowsPerPage: 10},
    noresult: "표시할 결과가 없습니다.",
    search: null,
    touching: null
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "신고종류 생성" : "신고종류 수정";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    }
  },

  created: async function() {
    await this.getDataFromApi();
  },

  methods: {
    getDataFromApi: async function() {
      this.loading = true;
      let reportTypes;
      try{
        reportTypes = await this.$axios.get("/report/type");
      }catch(err){
        this.loading = false;
        if(err.response){
          this.$router.app.$emit("showSnackbar", `신고종류 리스트를 불러오지 못했습니다.[${reportTypes.data.message}]`, "error");
        }else{
          this.$router.app.$emit('showSnackbar', '서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.', 'error');
        }
        return;
      }
      this.reportTypes = reportTypes.data;
      this.loading = false;
    },
    editItem(item) {
      this.editedIndex = this.reportTypes.map(x => x.reportTypeId).indexOf(item.reportTypeId);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem: async function(item) {
      const index = this.reportTypes.map(x => x.reportTypeId).indexOf(item.reportTypeId);
      if (index < 0) {
        alert("선택된 신고종류이 없습니다. 확인 후 다시 시도해주세요.");
        return;
      }
      if (confirm("정말 이 신고종류을 삭제하시겠습니까? 이 신고종류에 속해있는 신고들은 모두 보이지 않게됩니다.")) {
        this.loading = true;
        let response;
        try {
          response = await this.$axios.delete(`/report/type/${this.reportTypes[index].reportTypeId}`);
        } catch (err) {
          this.loading = false;
          if(err.response){
            this.$router.app.$emit("showSnackbar", `신고종류을 삭제하지 못했습니다.[${err.response.data.message}]`, "error");
          }else{
            this.$router.app.$emit('showSnackbar', '서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.', 'error');
          }
          return;
        }
        this.$router.app.$emit("showSnackbar", `${this.reportTypes[index].reportTypeName} 신고종류을 삭제하였습니다.`, "success");
        this.reportTypes.splice(index, 1);
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
          response = await this.$axios.put("/report/type", this.editedItem);
        } catch (err) {
          if(err.response){
            this.$router.app.$emit("showSnackbar", `신고종류정보를 수정하지 못했습니다.[${err.response.data.message}]`, "error");
          }else{
            this.$router.app.$emit('showSnackbar', '서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.', 'error');
          }
          return;
        }

        Object.assign(this.reportTypes[this.editedIndex], this.editedItem);
        this.$router.app.$emit("showSnackbar", `${this.reportTypes[this.editedIndex].reportTypeName} 신고종류 정보를 수정하였습니다.`, "success");
      } else {
        //create
        let response;
        try {
          response = await this.$axios.post("/report/type", this.editedItem);
        } catch (err) {
          if(err.response){
            this.$router.app.$emit("showSnackbar", `신고종류을 추가하지 못했습니다.[${err.response.data.message}]`, "error");
          }else{
            this.$router.app.$emit('showSnackbar', '서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.', 'error');
          }
          return;
        }
        this.editedItem.reportTypeId = response.data.reportTypeId;
        this.reportTypes.push(this.editedItem);
        this.$router.app.$emit("showSnackbar", `${this.editedItem.reportTypeName} 신고종류을 추가하였습니다.`, "success");
      }
      this.close();
    },
    touchStart(item){
      this.touching = item.boardId;
    },
    touchEnd(item){
      if(this.touching === item.boardId){
        this.editItem(item);
      }
    }
  },
  layout: "main",
  head() {
    return {
      title: "신고종류 관리"
    };
  }
};
</script>

<style lang="stylus">
#reportTypeTable {
  width: 100%;

  .v-datatable__actions {
    justify-content: space-between;
  }
}
</style>