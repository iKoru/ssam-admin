import Vuex from 'vuex';

const store = () =>
  new Vuex.Store({
    state: {
      userId: null
    },
    getters: {
      userId(state){
        return state.userId;
      }
    },
    mutations: {
      SET_USER_ID(state, userId) {
        state.userId = userId
      }
    },
    actions: {
      setUserId({ commit }, userId) {
        commit('SET_USER_ID', userId);
      }
    }
  })

export default store