/* global localStorage */
import Vuex from 'vuex';

const store = () =>
  new Vuex.Store({
    state: {
      accessToken: null
    },
    getters: {
      accessToken(state) {
        return state.accessToken;
      }
    },
    mutations: {
      SIGNIN(state, { accessToken }) {
        state.accessToken = accessToken
      },
      SIGNOUT(state) {
        state.accessToken = null
      }
    },
    actions: {
      signin({ commit }, { accessToken }) {
        commit('SIGNIN', { accessToken });
      },
      signout({ commit }) {
        localStorage.removeItem('accessToken');
        this.$axios.defaults.headers.common['x-auth'] = null;
        commit('SIGNOUT');
      },
    }
  })

export default store