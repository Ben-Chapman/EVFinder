<template>
  <div v-if="this.inventory.length > 0">
    <b-row align-h="center" class="d-flex justify-content-center border-top pt-3" align-v="center">
      <b-icon-sliders aria-hidden="true" class="mr-2" font-scale="1.3"></b-icon-sliders>
      
      <!-- Trim Filter -->
        <b-dd id="trim-dd" size="sm" variant="outline-primary" class="px-1">
          <template #button-content>
            Trim
            <span v-if="localFilterSelections.trimDesc.length > 0">
              <b-badge variant="success">
                {{ localFilterSelections.trimDesc.length }}
              </b-badge>
            </span>
          </template>

          <b-dropdown-form>
            <b-form-checkbox
              v-for="item in this.filterOptions.trimDesc" :key=item
              :value="item"
              v-model="localFilterSelections.trimDesc"
              name="trim-description"
              class="mb-1"
              >
              {{ item }}
            </b-form-checkbox>
          </b-dropdown-form>
        </b-dd>
      
      <!-- Exterior Color Filter -->
        <b-dd id="trim-dd" size="sm" variant="outline-primary" class="px-1">
          <template #button-content>
            Ext. Color
            <span v-if="localFilterSelections.exteriorColor.length > 0">
              <b-badge variant="success">
                {{ localFilterSelections.exteriorColor.length }}
              </b-badge>
            </span>
          </template>

          <b-dropdown-form>
            <b-form-checkbox
              v-for="item in this.filterOptions.exteriorColor" :key=item
              :value="item"
              v-model="localFilterSelections.exteriorColor"
              name="name-here"
              class="mb-1"
              >
              {{ item | titleCase }}
            </b-form-checkbox>
          </b-dropdown-form>
        </b-dd>

      <!-- Interior Color Filter -->
        <b-dd id="interior-color" size="sm" variant="outline-primary" class="px-1">
          <template #button-content>
            Int. Color
            <span v-if="localFilterSelections.interiorColor.length > 0">
              <b-badge variant="success">
                {{ localFilterSelections.interiorColor.length }}
              </b-badge>
            </span>
          </template>

          <b-dropdown-form>
            <b-form-checkbox
              v-for="item in this.filterOptions.interiorColor" :key=item
              :value="item"
              v-model="localFilterSelections.interiorColor"
              name="interior-color"
              class="mb-1"
              >
              {{ item | titleCase }}
            </b-form-checkbox>
          </b-dropdown-form>
        </b-dd>
      
      <!-- Drivetrain Filter -->
        <b-dd id="trim-dd" size="sm" variant="outline-primary" class="px-1" boundary="viewport">
          <template #button-content>
            Drivetrain
            <span v-if="localFilterSelections.drivetrainDesc.length > 0">
              <b-badge variant="success">
                {{ localFilterSelections.drivetrainDesc.length }}
              </b-badge>
            </span>
          </template>

          <b-dropdown-form>
            <b-form-checkbox
              v-for="item in this.filterOptions.drivetrainDesc" :key=item
              :value="item"
              v-model="localFilterSelections.drivetrainDesc"
              name="name-here"
              class="mb-1"
              >
              {{ item | titleCase }}
            </b-form-checkbox>
          </b-dropdown-form>
        </b-dd>
  
      <!-- Only show these filters on screens larger than xs -->
      <div class="d-none d-sm-block">
      <!-- Dealer Filter -->
        <b-dd id="trim-dd" size="sm" variant="outline-primary" class="px-1">
          <template #button-content>
            Dealer
            <span v-if="localFilterSelections.dealerName.length > 0">
              <b-badge variant="success">
                {{ localFilterSelections.dealerName.length }}
              </b-badge>
            </span>
          </template>

          <b-dropdown-form>
            <b-form-checkbox
              v-for="item in this.filterOptions.dealerName" :key=item
              :value="item"
              v-model="localFilterSelections.dealerName"
              name="Dealer-Name"
              class="mb-1"
              >
              {{ item }}
            </b-form-checkbox>
          </b-dropdown-form>
        </b-dd>

        <!-- Inventory Status Filter -->
        <b-dd id="trim-dd" size="sm" variant="outline-primary" class="px-1">
          <template #button-content>
            Availability
            <span v-if="localFilterSelections.inventoryStatus.length > 0">
              <b-badge variant="success">
                {{ localFilterSelections.inventoryStatus.length }}
              </b-badge>
            </span>
          </template>

          <b-dropdown-form>
            <b-form-checkbox
              v-for="item in this.filterOptions.inventoryStatus" :key=item
              :value="item"
              v-model="localFilterSelections.inventoryStatus"
              name="Inventory-Status"
              class="mb-1"
              >
              {{ item }}
            </b-form-checkbox>
          </b-dropdown-form>
        </b-dd>

        <!-- Price Filter -->
        <b-dd right id="distance-dd" size="sm" variant="outline-primary" class="px-1">
          <template #button-content>
            MSRP
            <span v-if="localFilterSelections.price.length > 0">
              <b-badge variant="success">
                {{ 1 }}
              </b-badge>
            </span>
          </template>

          <!-- We have to cast localFilterSelections.price to an Array to match
          the other filter options, hence the .price[0] -->
          <b-dropdown-form>
            <b-form-input
              id="price"
              v-model="localFilterSelections.price[0]"
              type="range"
              :min="calculateMinPrice"
              :max="calculateMaxPrice"
              >
              </b-form-input>
              <div
                class="mt-2"
                v-if="localFilterSelections.price.length == 0"
                >
                Slide to Filter by MSRP
              </div>
              <div
                class="mt-2"
                v-else
                >
                MSRP Is Less-Than <b>{{ localFilterSelections.price[0] | convertToCurrency() }}</b>
                <b-icon-x-circle
                  class="ml-2"
                  @click="resetPriceFilter()"
                  font-scale="1"
                  v-b-tooltip="{ title: 'Reset MSRP Filter', placement: 'bottom', variant: 'info' }"
                  >
                </b-icon-x-circle>
              </div>
          </b-dropdown-form>
        </b-dd>
      </div>

      <!-- If filters are selected, show the clear filter icon -->
      <div v-if="Object.values(filterSelections).filter(f => f.length > 0).length">
        <b-icon-x
          class="ml-1"
          font-scale="1.5"
          @click="resetFilterSelections()"
          v-b-tooltip="{ title: 'Clear Filters', placement: 'bottom', variant: 'info' }"
          >
        </b-icon-x>
      </div>
    </b-row>
    
    <b-row class="d-flex justify-content-center mt-3" align-v="center">
      <b-col cols="12" xs="12" md="4" align-self="center">
        <div v-if="this.inventoryCount == 1">
          <p class="text-center vehicles-available">
            Just <b>{{ this.inventoryCount }}</b> Vehicle Available!
          </p>
        </div>
        <div v-else>
          <p class="text-center vehicles-available">
            <b>{{ this.inventoryCount }}</b> Vehicles Available
          </p>
        </div>

        <!-- Show a rotate message for xs screens -->
        <b-row class="d-flex justify-content-center d-block d-sm-none mt-0 py-1 rotate-message" align-v="center">
            <b-icon-phone-landscape variant="action-blue" class="pr-4"></b-icon-phone-landscape>
            Rotate Your Phone For More Options
        </b-row>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex'
  import { generateUrlQueryParams } from '../libs'

  // What length should the query param key length be. A value of 3 would
  // truncate from ?queryParamHere=yes to ?que=yes
  var queryParamKeyLength = 3

  export default {
    mounted() {
      /** 
       * On mount, determine if we have any filter-related query params. If so,
       * parse them and populate into localFilterSelections
       */
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      Object.keys(params).forEach(param => {
        Object.keys(this.localFilterSelections).forEach(filter => {
          if (filter.startsWith(param)) {
            this.localFilterSelections[filter] = params[param].split(',')
          }
        })

      })
    },

    data() {
      return {
        /*
        There doesn't seem to be a reasonable way to store form checkbox data in
        a Vuex store. So using a store and forward pattern to address this.
        The form data is initially stored in this local data object, which is
        being watched. When this data object changes, the watcher will commit
        this entire object into the Vuex store and push the data into Vue router.
        */
        localFilterSelections: {
          'dealerName': [],
          'interiorColor': [],
          'inventoryStatus': [],
          'trimDesc': [],
          'drivetrainDesc': [],
          'exteriorColor': [],
          'price': [],
        },
      }
    },

    methods: {
      ...mapActions([
        'updateFilterSelections',
        'updateQueryParams',
        'updateStore',
          ]),
      
      buildFilterOptions() {
        if (Object.entries(this.filterOptions).length > 0) {
          this.updateStore({'filterOptions': {}})
        }

        // Build the filterOptions
        var tmp = {}
        this.inventory.forEach(vehicle => {
          Object.entries(vehicle).forEach(([key, value]) => {
            if (key in tmp) {
              if (!(tmp[key].includes(value))) {
                if (typeof(value) != 'object') {
                  tmp[key].push(value)
                }
              }
            } else {
              tmp[key] = [value]
            }
          })
        })

        // Sort the values for each filterOption
        Object.entries(tmp).forEach(([key, value]) => {
          tmp[key] = value.sort()
        })

        // Write the filterOptions into the Vuex store
        this.updateStore({'filterOptions': tmp})
      },

      resetFilterSelections() {
        this.localFilterSelections = {
          'dealerName': [],
          'interiorColor': [],
          'inventoryStatus': [],
          'trimDesc': [],
          'drivetrainDesc': [],
          'exteriorColor': [],
          'price': [],
        }
      },

      resetPriceFilter() {
        // This nulls out the localFilterSelections.price prop, thereby 'removing'
        // any filtering the user has selected.
        this.localFilterSelections.price = []
      },

      priceStringToNumber(priceString) {
        return Number(parseFloat(priceString.replace('$', '').replace(',', '')))
      },
    },  // methods

    computed: {
      // Vuex
      ...mapState([
        'inventory',
        'filterSelections',
        'filterOptions',
        'inventoryCount',
        'urlQueryParameters',
      ]),

      calculateMinPrice() {
        var inputData = this.inventory
        var numberData = []
        Object.values(inputData).forEach(input => {
          var price = this.priceStringToNumber(input.price)
          if (price > 0) {
            numberData.push(price)
          }
        })
        return Math.min(...numberData)
        },

        calculateMaxPrice() {
        var inputData = this.inventory
        var numberData = []
        Object.values(inputData).forEach(input => {
          numberData.push(
            this.priceStringToNumber(input.price)
          )
        })
        return Math.max(...numberData)
        },
    },  // computed

    watch: {
      // When the inventory Vuex store is updated, build the filter options
      inventory: function () {
        this.buildFilterOptions()
      },

      // Watching this local data and when it updates, writing the data into the
      // Vuex store
      localFilterSelections: {
        handler: function (val) {
          this.updateFilterSelections(val)

          // When the filters are modified, update the URL query params
          generateUrlQueryParams(val, queryParamKeyLength)
        },
        // The callback will be called whenever any of the watched object properties
        // change regardless of their nested depth
        deep: true
      },

      // When the route changes, a different vehicle was selected, so remove any
      // previous filters the user may have selected
      $route() {
        this.resetFilterSelections()
      },
    },  // watch
  } // default
</script>

<style lang="scss">
  @import '../assets/app_style.scss';
  
  .vehicles-available {
    font-size: 1.1rem;
    margin-bottom: .75rem;
  }

  .rotate-message {
    background: rgb(109,185,237);
    background: linear-gradient(90deg, rgba(109,185,237,1) 0%, rgba(69,171,240,1) 77%, rgba(109,185,237,1) 100%);
    font-size: .85rem;
    margin-bottom: .75rem;
    color: #fff;
  }

  // Resize the text in the filter dropdowns
  .b-dropdown-form {
    font-size: .9rem !important;
}

</style>