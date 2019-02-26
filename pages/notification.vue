<template>
  <div id="pageNotification">
    <v-container grid-list-xl fluid>
      <v-layout row wrap class white>
        <v-card id="notificationCard" class="mb-5 w-100">
          <v-card-title>
            <span class="headline">회원 알림 관리(전체 알림 생성)</span>
            <v-spacer></v-spacer>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field name="userId" v-model="editedItem.userId" label="ID" maxlength="50" placeholder="입력하면 해당 회원에게만, 미입력하면 전체 회원에게 알림"></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-select name="type" v-model="editedItem.type" :items="typeItems" label="알림 종류"></v-select>
                </v-flex>
                <v-flex xs12>
                  <v-text-field name="template" v-model="editedItem.template" label="알림 템플릿" maxlength="2000" paceholder="알림 내용을 입력합니다." hint="$1, $2, $3, $4로 아래 변수들을 넣을 수 있습니다."></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field name="variable1" v-model="editedItem.variable1" label="변수1" maxlength="100" hint="템플릿의 $1과 대체됩니다."></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field name="variable2" v-model="editedItem.variable2" label="변수2" maxlength="100" hint="템플릿의 $2와 대체됩니다."></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field name="variable3" v-model="editedItem.variable3" label="변수3" maxlength="100" hint="템플릿의 $3과 대체됩니다."></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field name="variable4" v-model="editedItem.variable4" label="변수4" maxlength="100" hint="템플릿의 $4와 대체됩니다."></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field name="href" v-model="editedItem.href" label="링크" maxlength="100" hint="클릭 시 이동할 주소"></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field name="target" v-model="editedItem.target" label="타겟" maxlength="15" hint="알림 변경 시 식별할 수 있는 값"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions class="pa-3">
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="reset">초기화</v-btn>
            <v-btn color="primary" dark @click="save" :loading="loading">생성</v-btn>
          </v-card-actions>
        </v-card>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  data: () => ({
    loading: false,
    editedItem: {
      userId: "",
      type: "AN",
      template: "",
      variable1: null,
      variable2: null,
      variable3: null,
      variable4: null,
      href: null,
      target: null
    },
    defaultItem: {
      userId: "",
      type: "AN",
      template: "",
      variable1: null,
      variable2: null,
      variable3: null,
      variable4: null,
      href: null,
      target: null
    },
    typeItems: [{text: "공지사항", value: "AN"}, {text: "이벤트", value: "EV"}, {text: "대댓글 알림", value: "CC"}, {text: "게시물 댓글알림", value: "DC"}]
  }),

  methods: {
    reset() {
      this.editedItem = Object.assign({}, this.defaultItem);
    },

    save: async function() {
      //create
      let response;
      try {
        response = await this.$axios.post("/notification", this.editedItem);
      } catch (err) {
        if (err.response) {
          this.$router.app.$emit("showSnackbar", `회원 알림을 추가하지 못했습니다.[${err.response.data.message}]`, "error");
        } else {
          this.$router.app.$emit("showSnackbar", "서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.", "error");
        }
        return;
      }
      this.$router.app.$emit("showSnackbar", `${this.editedItem.userId || "전체"} 회원 알림을 전송 요청하였습니다.`, "success");

      this.reset();
    }
  },
  layout: "main",
  head() {
    return {
      title: "회원 알림 관리"
    };
  }
};
</script>
