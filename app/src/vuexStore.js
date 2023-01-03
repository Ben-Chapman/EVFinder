import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const state = {
  showTable: false,
  tableBusy: false,
  inventory: [],
  filter: null,
  inventoryCount: 0,
  filterOptions: {},
  apiErrorDetail: [],

  filterSelections: {
    dealerName: [],
    interiorColor: [],
    inventoryStatus: [],
    trimDesc: [],
    drivetrainDesc: [],
    exteriorColor: [],
    price: [],
    modelDesc: [],
  },

  form: {
    zipcode: "",
    year: "",
    model: "",
    radius: "",
    manufacturer: "",
    vehicleName: "",
  },
};

// mutations are operations that actually mutate the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  mutateState(state, payload) {
    Object.getOwnPropertyNames(payload).forEach((val) => {
      if (payload[val] !== undefined) {
        state[val] = payload[val];
      }
    });
  },

  // Filter Selections Here
  mutateFilterSelections(state, payload) {
    state["filterSelections"] = payload;
  },
};

// actions are functions that cause side effects and can involve
// asynchronous operations
const actions = {
  updateStore({ commit }, payload) {
    commit("mutateState", payload);
  },

  updateFilterSelections({ commit }, payload) {
    commit("mutateFilterSelections", payload);
  },
};

/*
Getters are computed properties for stores. Like computed properties, a getter's
result is cached based on its dependencies, and will only re-evaluate when some
of its dependencies have changed.
*/
const getters = {};

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  strict: process.env.NODE_ENV !== "production",
});
