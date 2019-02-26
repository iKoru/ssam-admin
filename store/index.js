export const state = () => ({
  userId: null
});

export const mutations = {
  SET_USER_ID(state, userId) {
    state.userId = userId
  }
};

export const getters = {
  userId(state){
    return state.userId;
  }
}

export const actions = {
  setUserId({ commit }, userId) {
    commit('SET_USER_ID', userId);
  }
}
