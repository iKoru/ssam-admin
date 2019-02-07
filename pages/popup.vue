<template>
  <div id="pagePopup">
    <v-container grid-list-xl fluid>
      <v-layout row wrap class="elevation-1 mb-5" white>
        <v-toolbar flat color="white">
          <v-toolbar-title>팝업 관리</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>

        <v-data-table :headers="headers" :items="popups" id="popupTable" :loading="loading" :no-data-text="noresult">
          <template slot="items" slot-scope="props">
            <tr @dblclick="editItem(props.item)" v-touch="{start: () => touchStart(props.item), end: () => touchEnd(props.item)}">
              <td>{{ props.item.popupId }}</td>
              <td class="text-xs-left">{{ popupTypeItems.some(x=>x.value === props.item.popupType)?popupTypeItems.find(x=>x.value === props.item.popupType).text : props.item.popupType }}</td>
              <td class="text-xs-left">{{ props.item.popupContents }}</td>
              <td class="text-xs-left">{{ $moment(props.item.popupStart, 'YYYYMMDD').format('Y-M-D') }}</td>
              <td class="text-xs-left">{{ $moment(props.item.popupEnd, 'YYYYMMDD').format('Y-M-D') }}</td>
              <td class="justify-center align-center fill-height">
                <v-checkbox name="popupActivated" v-model="props.item.popupActivated" readonly hide-details primary class="align-center justify-center"></v-checkbox>
              </td>
              <td class="text-xs-left">{{ props.item.popupHref }}</td>
            </tr>
          </template>
          <template slot="no-data">
            {{this.noresult}}
            <v-btn color="primary" @click="getDataFromApi">새로고침</v-btn>
          </template>
          <template slot="actions-prepend">
            <v-dialog v-model="dialog" max-width="500px" :fullscreen="$vuetify.breakpoint.smAndDown">
              <v-btn slot="activator" color="primary" dark class="mb-2">팝업 생성</v-btn>
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
                        <v-text-field name="popupId" v-model="editedItem.popupId" label="팝업ID" readonly placeholder="자동생성됩니다."></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-menu v-model="popupStart" :close-on-content-click="false" :nudge-right="40" lazy offset-y full-width min-width="290px">
                          <v-text-field slot="activator" v-model="editedItem.popupStart" label="팝업 게시 시작일" prepend-icon="event" readonly></v-text-field>
                          <v-date-picker v-model="editedItem.popupStart" :max="editedItem.popupEnd" @input="popupStart = false"></v-date-picker>
                        </v-menu>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-menu v-model="popupEnd" :close-on-content-click="false" :nudge-right="40" lazy offset-y full-width min-width="290px">
                          <v-text-field slot="activator" v-model="editedItem.popupEnd" label="팝업 게시 종료일" prepend-icon="event" readonly></v-text-field>
                          <v-date-picker v-model="editedItem.popupEnd" :min="editedItem.popupStart" @input="popupEnd = false"></v-date-picker>
                        </v-menu>
                      </v-flex>
                      <v-flex xs12>
                        <v-textarea name="popupContents" v-model="editedItem.popupContents" label="팝업 내용" placeholder="팝업의 내용. 이미지 타입일 경우 이미지 URL, HTML 타입일 경우 HTML, 텍스트 타입일 경우 텍스트"></v-textarea>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-select name="popupType" v-model="editedItem.popupType" :items="popupTypeItems" label="팝업 종류"></v-select>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-text-field name="popupHref" v-model="editedItem.popupHref" label="팝업 링크" placeholder="이미지를 눌렀을 때 이동할 URL. 이미지 타입일 경우에만 활용됨"></v-text-field>
                      </v-flex>
                      <v-flex xs12>
                        <v-checkbox name="popupActivated" v-model="editedItem.popupActivated" label="팝업 활성화 여부"></v-checkbox>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>

                <v-card-actions class="pa-3">
                  <template v-if="formTitle !== '팝업 생성'">
                    <v-btn color="error" @click="deleteItem(editedItem)">팝업 삭제</v-btn>
                    <v-spacer></v-spacer>
                  </template>
                  <v-spacer v-else></v-spacer>
                  <v-btn color="blue darken-1" flat @click="close">취소</v-btn>
                  <template v-if="formTitle === '팝업 생성'">
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
    headers: [{text: "팝업ID", value: "popupId"}, {text: "팝업 종류", align: "left", value: "popupType"}, {text: "팝업 내용", align: "left", value: "popupContents"}, {text: "게시 시작일", align: "right", value: "popupStart"}, {text: "게시 종료일", align: "right", value: "popupEnd"}, {text: "게시여부", align: "left", value: "popupActivated"}, {text: "팝업 링크", align: "left", value: "popupHref"}],
    popups: [],
    popupTypeItems: [{text: "텍스트", value: "text"}, {text: "이미지", value: "image"}, {text: "HTML", value: "html"}],
    editedIndex: -1,
    editedItem: {
      popupId: null,
      popupType: "text",
      popupStart: null,
      popupEnd: null,
      popupActivated: true,
      popupHref: null,
      popupContents: ""
    },
    defaultItem: {
      popupId: null,
      popupType: "text",
      popupStart:null,
      popupEnd:null,
      popupActivated: true,
      popupHref: null,
      popupContents: ""
    },
    popupStart:false,
    popupEnd:false,
    loading: true,
    noresult: "표시할 결과가 없습니다.",
    touching: null
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "팝업 생성" : "팝업 수정";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    }
  },

  created: async function() {
    await this.getDataFromApi();
    this.editedItem.popupStart = this.$moment().format("Y-MM-DD")
    this.editedItem.popupEnd = this.$moment().add(1, "months").format("Y-MM-DD")
    this.defaultItem.popupStart = this.$moment().format("Y-MM-DD")
    this.defaultItem.popupEnd = this.$moment().add(1, "months").format("Y-MM-DD")
  },

  methods: {
    getDataFromApi: async function() {
      this.loading = true;
      let popups;
      try {
        popups = await this.$axios.get("/notification/popup");
      } catch (err) {
        this.loading = false;
        if (err.response) {
          this.$router.app.$emit("showSnackbar", `팝업 리스트를 불러오지 못했습니다.[${popups.data.message}]`, "error");
        } else {
          this.$router.app.$emit("showSnackbar", "서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.", "error");
        }
        return;
      }
      this.popups = popups.data;
      this.loading = false;
    },
    editItem(item) {
      this.editedIndex = this.popups.map(x => x.popupId).indexOf(item.popupId);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem: async function(item) {
      const index = this.popups.map(x => x.popupId).indexOf(item.popupId);
      if (index < 0) {
        alert("선택된 팝업이 없습니다. 확인 후 다시 시도해주세요.");
        return;
      }
      if (confirm("정말 이 팝업을 삭제하시겠습니까?")) {
        this.loading = true;
        let response;
        try {
          response = await this.$axios.delete(`/notification/popup/${this.popups[index].popupId}`);
        } catch (err) {
          this.loading = false;
          if (err.response) {
            this.$router.app.$emit("showSnackbar", `팝업을 삭제하지 못했습니다.[${err.response.data.message}]`, "error");
          } else {
            this.$router.app.$emit("showSnackbar", "서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.", "error");
          }
          return;
        }
        this.$router.app.$emit("showSnackbar", "팝업을 삭제하였습니다.", "success");
        this.popups.splice(index, 1);
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
          response = await this.$axios.put("/notification/popup", {...this.editedItem, popupStart:this.$moment(this.editedItem.popupStart, 'YYYY-MM-DD').format('YMMDD'), popupEnd:this.$moment(this.editedItem.popupEnd, 'YYYY-MM-DD').format('YMMDD')});
        } catch (err) {
          if (err.response) {
            this.$router.app.$emit("showSnackbar", `팝업정보를 수정하지 못했습니다.[${err.response.data.message}]`, "error");
          } else {
            this.$router.app.$emit("showSnackbar", "서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.", "error");
          }
          return;
        }

        Object.assign(this.popups[this.editedIndex], this.editedItem);
        this.$router.app.$emit("showSnackbar", "팝업 정보를 수정하였습니다.", "success");
      } else {
        //create
        let response;
        try {
          response = await this.$axios.post("/notification/popup", {...this.editedItem, popupStart:this.$moment(this.editedItem.popupStart, 'YYYY-MM-DD').format('YMMDD'), popupEnd:this.$moment(this.editedItem.popupEnd, 'YYYY-MM-DD').format('YMMDD')});
        } catch (err) {
          if (err.response) {
            this.$router.app.$emit("showSnackbar", `팝업을 추가하지 못했습니다.[${err.response.data.message}]`, "error");
          } else {
            this.$router.app.$emit("showSnackbar", "서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.", "error");
          }
          return;
        }
        this.editedItem.popupId = response.data.popupId;
        this.getDataFromApi();
        this.$router.app.$emit("showSnackbar", "팝업을 추가하였습니다.", "success");
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
      title: "팝업 관리"
    };
  }
};
</script>

<style lang="stylus">
#popupTable {
  width: 100%;

  .v-datatable__actions {
    justify-content: space-between;
  }
}
</style>