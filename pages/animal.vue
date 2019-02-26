<template>
  <div id="pageAnimal">
    <v-container grid-list-xl fluid>
      <v-layout row wrap class="elevation-1 mb-5" white>
        <v-toolbar flat color="white">
          <v-toolbar-title>동물명 관리</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-form class="px-3 pt-2 white">
          <v-layout wrap xs12 pa-2>
            <v-text-field name="search" pa-2 v-model="search" label="검색" append-icon="search"></v-text-field>
          </v-layout>
        </v-form>

        <v-data-table v-model="selected" select-all :headers="headers" item-key="animalName" :items="animals" class="w-100 custom-action" :search="search" :loading="loading" :no-data-text="noresult" :pagination.sync="pagination">
          <template slot="headers" slot-scope="props">
            <tr>
              <th>
                <v-checkbox :input-value="props.all" :indeterminate="props.indeterminate" primary hide-details @click.native="toggleAll"></v-checkbox>
              </th>
              <th v-for="header in props.headers" :key="header.text" :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '', header.align?'text-xs-'+header.align:'']" @click="changeSort(header.value)">
                {{ header.text }}
                <v-icon small>arrow_upward</v-icon>
              </th>
            </tr>
          </template>
          <template slot="items" slot-scope="props">
            <tr :active="props.selected" @click="props.selected = !props.selected">
              <td>
                <v-checkbox :input-value="props.selected" primary hide-details></v-checkbox>
              </td>
              <td class="text-xs-left">{{ props.item.animalName }}</td>
            </tr>
          </template>
          <template slot="no-data">
            {{this.noresult}}
            <v-btn color="primary" @click="getDataFromApi">새로고침</v-btn>
          </template>
          <template slot="actions-prepend">
            <v-btn color="error" @click="deleteItem" :disabled="selected.length === 0">삭제</v-btn>
            <v-dialog v-model="dialog" max-width="500px" :fullscreen="$vuetify.breakpoint.smAndDown">
              <v-btn slot="activator" color="primary" dark class="mb-2">생성</v-btn>
              <v-card>
                <v-card-title>
                  <span class="headline">동물명 생성</span>
                  <v-spacer></v-spacer>
                  <v-icon @click="close">close</v-icon>
                </v-card-title>

                <v-card-text>
                  <v-container grid-list-md>
                    <v-layout wrap>
                      <v-flex xs12>
                        <v-text-field ref="candidate" name="animalName" label="추가할 동물명 입력" placeholder="여러개 동시 입력은 컴마로 구분합니다." hint="입력 후 엔터를 입력하면 연속으로 입력할 수 있습니다." v-model="candidate" @keyup.enter="addChips(candidate)" clearable></v-text-field>
                      </v-flex>
                      <v-flex xs12>
                        <span>입력된 동물명</span>
                        <br>
                        <template v-if="editedItem.animalNames.length > 0">
                          <v-chip close v-for="animalName in editedItem.animalNames" :key="animalName" @input="removeChip(animalName)">{{animalName}}</v-chip>
                        </template>
                        <p v-else class="text-xs-center">아직 입력된 동물명이 없습니다.</p>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>

                <v-card-actions class="pa-3">
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" flat @click="close">취소</v-btn>
                  <v-btn color="primary" dark @click="save">생성</v-btn>
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
    headers: [{text: "동물명", align: "left", value: "animalName"}],
    animals: [],
    editedItem: {
      animalNames: [],
      animalNamesSet: new Set()
    },
    selected: [],
    loading: true,
    pagination: {sortBy: "animalName", rowsPerPage: 10, descending: false},
    noresult: "표시할 결과가 없습니다.",
    search: null,
    candidate: null
  }),

  watch: {
    dialog(val) {
      val || this.close();
      if (val) {
        this.$nextTick(this.$refs.candidate.focus);
      }
    }
  },

  created: async function() {
    await this.getDataFromApi();
  },

  methods: {
    getDataFromApi: async function() {
      this.loading = true;
      let animals;
      try{
        animals = await this.$axios.get("/comment/animal");
      }catch(err){
        if(err.response){
          this.$router.app.$emit("showSnackbar", `동물명 리스트를 불러오지 못했습니다.[${err.response.data.message}]`, "error");
        }else{
          this.$router.app.$emit('showSnackbar', '서버가 구동중이지 않거나 인터넷 연결이 끊어졌습니다.', 'error');
        }
        this.loading = false;
        return;
      }
      this.animals = animals.data.map(x => {
        return {
          animalName: x
        };
      });
      
      this.loading = false;
    },

    deleteItem: async function(item) {
      if (this.selected.length === 0) {
        this.$router.app.$emit('showSnackbar', '선택된 동물명이 없습니다. 확인 후 다시 시도해주세요.', 'error');
        return;
      }
      if (confirm(`정말 동물명 ${this.selected.length}개를 삭제하시겠습니까? 삭제된 동물명을 사용하고 있는 사람들의 동물명은 유지됩니다.`)) {
        this.loading = true;
        let response,
          i = 0,
          success = [];
        while (i < this.selected.length) {
          try {
            response = await this.$axios.delete("/comment/animal/" + this.selected[i].animalName);
          } catch (err) {
            this.$router.app.$emit("showSnackbar", `${this.selected[i].animalName} 동물명을 삭제하지 못했습니다.[${err.response.data.message}]`, "error");
            i++;
            continue;
          }
          if (response.status === 200) {
            success.push(this.selected[i].animalName);
          }
          i++;
        }
        if (success.length > 0) {
          this.$router.app.$emit("showSnackbar", `${success.length === 1 ? success[0] : success.length + "개의"} 동물명을 삭제하였습니다.`, "success");
          this.selected = this.selected.filter(x => !success.includes(x.animalName));
          this.animals = this.animals.filter(x => !success.includes(x.animalName));
        }
        this.loading = false;
      }
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem.animalNamesSet.clear();
        this.editedItem.animalNames = [];
      }, 300);
    },

    save: async function() {
      let response;
      if (this.candidate && this.candidate !== "") {
        this.addChips(this.candidate);
      }
      try {
        response = await this.$axios.post("/comment/animal", {animalNames: this.editedItem.animalNames});
      } catch (err) {
        this.$router.app.$emit("showSnackbar", `동물명을 추가하지 못했습니다.[${err.response.data.message}]`, "error");
        return;
      }
      if (response.status === 200) {
        this.animals = this.animals.concat(
          this.editedItem.animalNames.map(x => {
            return {animalName: x};
          })
        );
        this.$router.app.$emit("showSnackbar", `${this.editedItem.animalNames.length === 1 ? this.editedItem.animalNames[0] : this.editedItem.animalNames.length + "개의"} 동물명을 추가하였습니다.`, "success");
      }
      this.close();
    },
    toggleAll() {
      if (this.selected.length) this.selected = [];
      else this.selected = this.animals.slice();
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    },
    addChips(candidate) {
      if (typeof candidate === "string") {
        candidate.split(",").forEach(x => {
          x = x.trim();
          if (x !== "") {
            if (this.editedItem.animalNamesSet.has(x) || this.animals.some(y => y.animalName === x)) {
              this.$router.app.$emit("showSnackbar", `${x} : 이미 (임시로) 입력된 동물명입니다.`, "error");
              return;
            }else if(x.length > 20){
              this.$router.app.$emit("showSnackbar", `${x} : 동물명은 최대 20자입니다.`, "error");
              return;
            }
            this.editedItem.animalNamesSet.add(x);
            this.editedItem.animalNames.push(x);
          }
        });
        this.candidate = null;
      }
    },
    removeChip(item) {
      if (this.editedItem.animalNamesSet.delete(item)) {
        this.editedItem.animalNames.splice(this.editedItem.animalNames.indexOf(item), 1);
      }
    }
  },
  layout: "main",
  head() {
    return {
      title: "동물명 관리"
    };
  }
};
</script>
