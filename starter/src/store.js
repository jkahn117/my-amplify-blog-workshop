import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    }
  },
  actions: {
    setUser({ commit }, user) {
      commit('setUser', user)
    }
  },
  getters: {
    getUser: (state) => {
      return state.user
    },
    getUsername: (state) => {
      return state.user ? state.user.getUsername() : ''
    },
    isLoggedIn: (state) => {
      return !!state.user
    }
  }
})
