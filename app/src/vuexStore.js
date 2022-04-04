import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  tableBusy: false,
  inventory: [],
  filter: null,
  inventoryCount: 0,
  filterOptions: {},
  // TODO: These need to be normalized, and not tied to a specific JSON key name
  filterSelections: {
    'dealerNm': [],
    'interiorColorCd': [],
    'inventoryStatus': [],
    'trimDesc': [],
    'drivetrainDesc': [],
    'ExtColorLongDesc': [],
    'price': [],
  },
  
  form: {
    zipcode: '',
    year: '2022',
    model: 'Ioniq%205',
    radius: '',
  }
  
}

// mutations are operations that actually mutate the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  mutateState(state, payload) {
    Object.getOwnPropertyNames(payload).forEach(val => {
      // console.log(val)
      if (payload[val] !== undefined) {
        // console.log(payload[val])
        state[val] = payload[val]
      }
    })
  },

  // Filter Selections Here
  mutateFilterSelections(state, payload) {
    state['filterSelections'] = payload
    },
}

// actions are functions that cause side effects and can involve
// asynchronous operations
const actions = {
  updateStore({ commit }, payload) {
    commit('mutateState', payload)
  },

  updateFilterSelections({ commit }, payload) {
    // console.log(payload)
    commit('mutateFilterSelections', payload)
  }
}

/*
Getters are computed properties for stores. Like computed properties, a getter's
result is cached based on its dependencies, and will only re-evaluate when some
of its dependencies have changed.
*/
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