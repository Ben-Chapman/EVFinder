import { ref, computed } from "vue";
import { defineStore } from "pinia";

// export const useCounterStore = defineStore("counter", () => {
//   const count = ref(0);
//   const name = ref("Eduardo");
//   const doubleCount = computed(() => count.value * 2);

//   function increment() {
//     count.value++;
//   }

//   return { count, name, doubleCount, increment };
// });

// export const useFilterStore = defineStore("filterStore", () => {
//   const dealerName = ref([]);
//   const drivetrainDesc = ref([]);
//   const exteriorColor = ref([]);
//   const interiorColor = ref([]);
//   const inventoryStatus = ref([]);
//   const vehicleDesc = ref([]);
//   const price = ref([]);
//   const trimDesc = ref([]);

//   function set(filterType) {
//     filterType.push();
//   }

//   return {
//     dealerName,
//     drivetrainDesc,
//     exteriorColor,
//     interiorColor,
//     inventoryStatus,
//     vehicleDesc,
//     price,
//     trimDesc,
//   };
// });

export const useCounterStore = defineStore("filters", {
  state: () => ({
    dealerName: [],
    drivetrainDesc: [],
    exteriorColor: [],
    interiorColor: [],
    inventoryStatus: [],
    vehicleDesc: [],
    price: [],
    trimDesc: [],
  }),

  getters: {
    doubleCount: (state) => state.count * 2,
    getFilterValues: (state, filterName) => state[filterName],
  },

  actions: {
    increment() {
      this.count++;
    },

    updateFilter(filterName, value) {
      this.filterName.push(value);
    },
  },
});
