<template>
  <b-container>
    <!-- Let's filter -->
    <Filters/>

    <!-- Table here -->
    <b-row class="d-flex justify-content-center">
      <div v-if="showInventoryAlert" class="mt-5">
        <b-alert show variant="success" class="no-inventory px-5">
          No Vehicles Were Found. Adjust your search parameters and try again.
        </b-alert>
      </div>
      <div v-else>
        <b-table
          hover
          sticky-header="78vh"
          stacked="md"
          :busy="tableBusy"
          :items="this.inventory"
          :fields="this.fields"
          :sort-compare="customSort"
          :filter="this.filterSelections"
          @row-clicked="toggleDetails"
          @filtered="onFiltered"
          :filter-function="filterFunction"
          >

          <!-- Exterior Color -->
          <template #cell(exterior-color)="data">
            {{ titleCase(data.item.ExtColorLongDesc) }}
          </template>
          
          <!-- Dealer Information -->
          <template #cell(dealer-name-address)="data">
            <b-link
              :href="`https://${data.item.dealerUrl}`"
              target="_blank"
              >
                {{ data.item.dealerNm }}
              </b-link>
              - {{ data.item.city }}, {{ data.item.state }}
          </template>

          <!-- Interior Color -->
          <template #cell(interior-color)="data">
            {{ data.item.interiorColorCd }}
          </template>

          <!-- VIN Column -->
          <template #cell(vin-with-more-details)="row">
            <!-- If we've already made the API call and stored the VIN data, just show it -->
            <div v-if="row.item.vin in vinDetail">
              <b-button size="sm" variant="light" @click="row.toggleDetails" class="mr-2 align-middle vin">
                {{ row.item.vin }} <b-icon-chevron-down aria-hidden="true"></b-icon-chevron-down>
              </b-button>
            </div>
            <!-- Otherwise, make the VIN data API call -->
            <div v-else>
              <b-button size="sm" variant="light" @click="toggleDetails(row.item)" class="mr-2 align-middle vin">
                {{ row.item.vin }} <b-icon-chevron-down aria-hidden="true"></b-icon-chevron-down>
              </b-button>
            </div>
          </template>

          <!-- Vin Details Section -->
          <template #row-details="row">
          <b-card>
            <b-row class="justify-content-md-center">
              <div v-if="vinTableBusy" class="text-center my-2">
                <b-spinner class="align-middle mr-2" variant="success"></b-spinner>
                <strong>Fetching Details for This Vehicle...</strong>
              </div>
            </b-row>

              <!-- Vin Details List Group -->
              <!-- Dealer Website Button -->
              <div v-if="form.model != 'N'">
                <div v-if="hasHyundaiVinDetail(vinDetail[row.item.vin])">
                  <b-row class="py-2" align-h="center">
                    <b-button
                      size="md"
                      variant="light"
                      @click="openUrlInNewWindow(vinDetail[row.item.vin]['DI']['DealerVDPURL'])"
                      class="mr-2 align-middle"
                      >
                      Dealer's Website for This Vehicle
                      <b-icon icon="box-arrow-up-right" aria-hidden="true" class="ml-2" font-scale="1"></b-icon>
                    </b-button>
                  </b-row>
                </div>
              </div>
              <!-- Window sticker for Kias -->
              <div v-if="form.model == 'N'">
                  <b-row class="py-2" align-h="center">
                    <b-button
                      size="md"
                      variant="light"
                      @click="openUrlInNewWindow('https://www.kia.com/us/services/us/windowsticker/load/' + row.item.vin)"
                      class="mr-2 align-middle"
                      >
                      Window Sticker for This Vehicle
                      <b-icon icon="box-arrow-up-right" aria-hidden="true" class="ml-2" shift-v="5" font-scale=".8"></b-icon>
                    </b-button>
                  </b-row>
              </div>
              
                <b-list-group
                  horizontal
                  v-for="(item, key) in vinDetail[row.item.vin]" :key=key
                >
                <!-- We're displaying the Dealer URL above, don't display it here -->
                  <b-col cols=4 v-if="key != 'DI'">
                    <b-list-group-item class="border-0 py-1"><b>{{ key }}</b></b-list-group-item>
                  </b-col>
                  <div v-if="key != 'DI'">
                    <b-list-group-item class="border-0 py-1">{{ item }}</b-list-group-item>
                  </div>
                
              </b-list-group>
              
          
            <b-button size="sm" @click="row.toggleDetails">Hide Details</b-button>
          </b-card>
        </template>
              <!-- Table Busy Indicator -->
              <template #table-busy>
                <div class="text-center my-2">
                  <b-spinner class="align-middle mr-2" variant="success"></b-spinner>
                  <strong>Fetching Vehicle Inventory...</strong>
                </div>
            </template>
          </b-table>
      </div>
    </b-row>
  </b-container>
</template>

<script>
  import Filters from './Filters.vue'

  import {mapActions, mapState} from 'vuex'
  import {has} from 'lodash'

  import {convertToCurrency, titleCase} from '../libs'
  import {kiaVinMapping} from '../manufacturers/kia'
  import {getVinDetail} from '../manufacturers/hyundai'
  
  export default {
    components: {
      Filters
      },

      created() {
        window.addEventListener('beforeunload', this.beforeWindowUnload)
      },

      mounted() {
      },

      beforeDestroy() {
        window.removeEventListener('beforeunload', this.beforeWindowUnload)
      },

    data() {
      return {
        vinDetail: {},
        vinTableBusy: false,
        vinDetailClickedCount: 0,

        // TODO: Normalize these keys, so they're not manufacturer specific
        
        fields: [
          { key: 'ExtColorLongDesc', label: 'Ext. Color', sortable: true, sortDirection: 'desc', formatter: titleCase},
          { key: 'interiorColorCd', label: 'Int. Color', sortable: true, sortDirection: 'desc'},
          { key: 'trimDesc', label: 'Trim', sortable: true, sortDirection: 'desc'},
          { key: 'drivetrainDesc', label: 'Drivetrain', sortable: true, sortDirection: 'desc', formatter: titleCase},
          { key: 'price', label: 'MSRP', sortable: true, sortDirection: 'desc', formatter: convertToCurrency},
          { key: 'PlannedDeliveryDate', label: 'Delivery Date', formatter: "formatDate", sortable: true, sortByFormatted: true, filterByFormatted: true },
          // Virtual Column
          { key: 'dealer-name-address', label: 'Dealer Information', sortable: true, sortByFormatted: true, filterByFormatted: true },
          { key: 'distance', label: 'Distance', sortable: true, sortDirection: 'desc' },
          { key: 'vin-with-more-details', label: "VIN", sortable: false }
        ],
      } // End of return
    },
    methods: {
      ...mapActions([
        'updateStore'
        ]),

      async toggleDetails(item) {
        // Inject _showDetails into the row items. Vue expects this to be present
        // to know this row has additional detail to display upon click
        if (item["_showDetails"]) item["_showDetails"] = false;
        else this.$set(item, "_showDetails", true);
        
        // Increment the counter
        this.vinDetailClickedCount += 1

        /* The KIA API response contains all publically available information
        about the vehicle, so there's no additional VIN API call needed. Thus
        storing the /inventory API data directly in the vinDetail local store.
        */
        if (this.form.model === "N") {
          // Before writing the data, format the key names for humans
          const k = {}
          Object.keys(item).forEach(key => {
            if (Object.keys(kiaVinMapping).includes(key)) {
              k[kiaVinMapping[key]] = item[key]
            }
            // The Kia API returns individual elements for each feature, so
            // concatinating into a single string for display
            if (key.indexOf("features0Options") >= 0) {  // Does the key contain features0Options
              if (k['Top Features']) {
                k['Top Features'] = `${k['Top Features']}, ${item[key]}`
              } else {
                k['Top Features'] = item[key]
              }
            }
          })

          this.$set(
            this.vinDetail,  // Where to store
            item.vin,        // What's the key
            k,            // Data to store
            )
        }
        else {  // Make a vin API call for Hyundai
          // Show users that we're fetching data
          this.vinTableBusy = true
          
          const hyundaiVinData = await getVinDetail(item.vin, this.form.model, this.form.year)

          // Store a new record for each VIN we fetch.
          // this.$set is needed to enable reactive properties on an existing object
          // without this.$set, the nested table will not auto-refresh with this info
          this.$set(
            this.vinDetail,
            item.vin,
            hyundaiVinData
            )
        }

        // Remove the table busy indicator
        this.vinTableBusy = false
      },
      
      priceStringToNumber(priceString) {
        return Number(parseFloat(priceString.replace('$', '').replace(',', '')))
      },

      formatDate(isoDate) {
        if (isoDate) {  // Checking for null values
          const d = new Date(isoDate.split('T')[0]).toDateString()  // Removing the time
          if (d != 'Invalid Date') {
            return d
          } else {return isoDate}
        }
        return ''
      },

      customSort(a, b, key) {
        /*
         Only apply this custom sort to date columns
         Return either
         -1 for a[key] < b[key]
          0 for a[key] === b[key]
          1  for a[key] > b[key].
        */
        if (key == 'PlannedDeliveryDate') {
          const _a = new Date(a[key])  // New Date object
          const _b = new Date(b[key])
          const aDate = Date.parse(_a)  // Convert Date object to epoch
          const bDate = Date.parse(_b)
          
          // Some manufacturers don't include a delivery date in their API response
          // If that's true, fall back to the buit-in sort-compare routine
          if ((_a || _b) == 'Invalid Date') {
            return false
          }

          if (aDate < bDate ){
            return -1
          } 
          else if (aDate === bDate) {
            return 0
          }
          else {
            return 1
          }
        }
        // Fall back to the built-in sort-compare routine for all other keys
        return false
      },

      onFiltered(filteredItems) {
        // Updating the "$num Vehicles Found" text due to filtering
        this.updateStore({'inventoryCount': filteredItems.length})
      },

      openUrlInNewWindow(url) {
        // Fire event to Plausible
        this.$plausible.trackEvent(
          'Outbound Link: Click', {props: {url: url}}
          )

        window.open(url, '_blank')
      },

      filterFunction(rowRecord, filterSelections) {
        // selectedCategories looks like ['trimDesc', ['LIMITED', 'SEL']]
        var selectedCategories = Object.entries(filterSelections).filter(f => f[1].length > 0)
        var selectedCategoriesCount = selectedCategories.length
        var isMatch = []
        
        if (selectedCategoriesCount == 0) {
          // No filters are selected
          return true
        }

        else if (selectedCategoriesCount == 1) {
          // Multiple selections in a single category
          if (selectedCategories[0][0] == 'price') {
            let selectedPrice = selectedCategories[0][1]
            return this.filterByPrice(rowRecord, selectedPrice)
          }
          else {
            return (selectedCategories[0][1].some(val => Object.values(rowRecord).includes(val)))
          }
        }

        else if (selectedCategoriesCount > 1) {
          // One or more selections across multiple categories
         for (var item of selectedCategories) {
           var category = item[0]
           var selectedItems = item[1]

          if (category == 'price') {
            isMatch.push(this.filterByPrice(rowRecord, selectedItems[0]))
          }
          else {
            // Each loop is a category. Do we have an OR match for the selected filter items?
            // e.g. Blue OR Black OR White
            isMatch.push(selectedItems.some(s => Object.values(rowRecord).includes(s)))
            }
          }
         
         if (isMatch.includes(false)) {
           return false
         } else {
           return true
         } 
        }
      },

      filterByPrice(rowRecord, selectedPrice) {
        return this.priceStringToNumber(rowRecord.price) < selectedPrice
      },
      
      // Before the browser quits, or the browser tab is closed, fire our Plausible call
      beforeWindowUnload() {
        this.$plausible.trackEvent(
          'VIN Detail', {props: {count: this.vinDetailClickedCount}}
          )
      },

      hasHyundaiVinDetail(item) {
        return (has(item, 'DI') && has(item['DI'], 'DealerVDPURL'))
      },

      
    }, // methods
    
    computed: {
      ...mapState([
        'tableBusy',
        'inventory',
        'filterSelections',
        'form'
      ]),

      showInventoryAlert() {
        if (
          !this.tableBusy
          && Object.values(this.inventory).length == 0
          && Object.values(this.form).filter(f => f.length > 0).length == 4){
          return true
        }
        else {
          return false
        }
      },
    },  // computed
    watch: {},
  }  // End of default
</script>

<style lang="scss">
  @import '../assets/app_style.scss';

  table.b-table[aria-busy='true'] {
    opacity: 0.6;
  }

  .table-striped tbody tr:nth-of-type(odd) {
    background-color: #F5FFEB !important;
  }

  .table-hover tbody tr:hover {
    background-color: $highlight-bluegreen !important;
}

  .no-inventory {
    color: #6c757d !important;
    font-size: 1.2rem;
  }  
</style>