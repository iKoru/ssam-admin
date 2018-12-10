/* global localStorage */
import Vuex from 'vuex';

const store = () =>
  new Vuex.Store({
    state: {
      accessToken: null,
      userId: null
    },
    getters: {
      accessToken(state) {
        return state.accessToken;
      },
      userId(state){
        return state.userId;
      }
    },
    mutations: {
      SIGNIN(state, { accessToken, userId }) {
        state.accessToken = accessToken;
        state.userId = userId
      },
      SIGNOUT(state) {
        state.accessToken = null
      }
    },
    actions: {
      signin({ commit }, { accessToken, userId }) {
        commit('SIGNIN', { accessToken, userId });
      },
      signout({ commit }) {
        localStorage.removeItem('accessToken');
        this.$axios.defaults.headers.common['x-auth'] = null;
        commit('SIGNOUT');
      },
    }
  })

export default store