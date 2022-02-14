import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  tableBusy: false,
  vinTableBusy: false,
  inventory: [],
  vinDetail: {},
  filter: null,
  inventoryCount: 0,
  filterOptions: {},
}

// mutations are operations that actually mutate the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  updateState(state, payload) {
    Object.getOwnPropertyNames(payload).forEach(val => {
      console.log(val)
      if (payload[val] !== undefined) {
        console.log(payload[val])
        state[val] = payload[val]
      }
    })
  },
}

// actions are functions that cause side effects and can involve
// asynchronous operations
const actions = {
  updateState({ commit }, payload) {
    commit('updateState', payload)
  }
}

// getters are functions
const getters = {}

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  strict: process.env.NODE_ENV !== 'production'
})