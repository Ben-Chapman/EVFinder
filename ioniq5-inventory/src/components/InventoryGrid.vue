<template>
  <b-container>
    <div>
      <b-row class="d-flex justify-content-center">
        <!-- Year -->
        <b-col cols=2>
          <b-form-group
            id="form-year"
            description="Select a Model Year"
          >
            <b-form-select
              id="form-year"
              v-model="form.year"
              :options="yearOptions"
              required
            >
            </b-form-select>
          </b-form-group>
        </b-col>

        <!-- Model -->
        <b-col cols=3>
          <b-form-group
            id="form-model"
            description="Select a Model"
          >
            <b-form-select
              id="form-model"
              v-model="form.model"
              :options="modelOptions"
              required
            >
            </b-form-select>
          </b-form-group>
        </b-col>

        <!-- Zip Code -->
        <b-col cols=2>
          <b-form-group
            id="form-zipcode"
            description="Enter a 5-digit US zip code"
          >
            <b-form-input
              id="form-zipcode"
              v-model="form.zipcode"
              :state="isValidZipCode"
              trim
              debounce="250"
              required
            >
            </b-form-input>
          </b-form-group>
        </b-col>

        <!-- Radius -->
        <b-col cols=2>
          <b-form-group
            id="form-radius"
            description="Search Radius in Miles"
          >
            <b-form-input
              id="form-radius"
              v-model="form.radius"
              :state="isValidRadius"
              trim
              debounce="250"
              required
            >
            </b-form-input>
          </b-form-group>
        </b-col>
        
        <!-- Enabled Button -->
        <div>
            <span id="enabled-wrapper" class="d-inline-block" tabindex="0">
              <b-button
                v-if="validateSubmitButton"
                id="submit-button"
                variant="primary"
                @click="getCurrentInventory()"
                >Submit</b-button>
            </span>
        </div>

          <!-- Disabled Button -->
          <div>
            <span id="disabled-wrapper" class="d-inline-block" tabindex="0">
              <b-button
                v-if="validateSubmitButton == false"
                disabled
                id="invalid-submit-button"
                variant="outline-primary"
                @click="getCurrentInventory()"
                >Submit</b-button>
              </span>
            <b-tooltip target="disabled-wrapper" triggers="hover">
                Please enter {{ invalidFormMessage() }}
              </b-tooltip>
          </div>
      </b-row>
    </div>

    <!-- Let's filter -->
    <div v-if="this.inventory.length > 0">
      <b-row class="d-flex justify-content-center">
        <b-col cols="6" xs="12" md="4" align-self="center">
          <p class="text-center mb-0 attention"><b>{{ this.inventoryCount }}</b> Vehicles Found</p>
          <b-form-input
            id="filter-input"
            v-model="filter"
            type="search"
            placeholder="Filter Vehicles"
            size="sm"
            
          ></b-form-input>
        </b-col>
      </b-row>
    </div>

    <!-- Table here -->
    <b-row class="d-flex justify-content-center mt-3">
      <b-table
        striped
        hover
        sticky-header="78vh"
        stacked="md"
        :busy="tableBusy"
        :items="this.inventory"
        :fields="this.fields"
        :sort-compare="customSort"
        :filter="filter"
        @row-clicked="toggleDetails"
        @filtered="onFiltered"
        >

        <!-- Exterior Color -->
        <template #cell(exterior-color)="data">
          {{ titleCase(data.item.colors[0].ExtColorLongDesc) }}
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

        <!-- More Details Section -->
        <template #cell(vin-with-more-details)="row">
          <b-button size="sm" @click="toggleDetails(row.item)" class="mr-2 align-middle vin">
            {{ row.item.vin }} <b-icon-chevron-down aria-hidden="true"></b-icon-chevron-down>
          </b-button>
        </template>

        <!-- Vin Details Section -->
        <template #row-details="row">
        <b-card>
          <b-row class="justify-content-md-center">
            <div v-if="vinTableBusy">
              <b-spinner variant="secondary" label="Loading..."></b-spinner>
              Loading...
            </div>
          </b-row>

            <!-- Vin Details List Group -->
            <div v-if="vinDetail[row.item.vin]['DI']['DealerVDPURL']">
              <b-row class="justify-content-md-center py-2">
                <b-button
                  size="sm"
                  target="_blank"
                  :href="`${vinDetail[row.item.vin]['DI']['DealerVDPURL']}`"
                  class="mr-2 align-middle">
                Dealer's Website for This Vehicle
                <b-icon icon="box-arrow-up-right" aria-hidden="true" class="ml-2" font-scale="1"></b-icon>
          </b-button>
              </b-row>
            </div>
            
              <b-list-group
                horizontal
                v-for="(item, key) in vinDetail[row.item.vin]" :key=key
              >
              
                <b-col cols=4 v-if="key != 'DI'">
                  <b-list-group-item class="border-0"><b>{{ key }}</b></b-list-group-item>
                </b-col>
                <div v-if="key != 'DI'">
                  <b-list-group-item class="border-0">{{ item }}</b-list-group-item>
                </div>
              
            </b-list-group>
            
          

          <b-button size="sm" @click="row.toggleDetails">Hide Details</b-button>
        </b-card>
      </template>
            <!-- Table Busy Indicator -->
            <template #table-busy>
              <div class="text-center text-danger my-2">
                <b-spinner class="align-middle"></b-spinner>
                <strong>Loading...</strong>
              </div>
          </template>
        </b-table>
    </b-row>
  </b-container>
</template>

<script>
  import {startCase, camelCase} from 'lodash';

  export default {
    mounted() {
    },
    data() {
      return {
        tableBusy: false,
        vinTableBusy: false,
        inventory: [],
        vinDetail: {},
        filter: null,
        inventoryCount: 0,

        fields: [
          
          { key: 'colors[0].ExtColorLongDesc', label: 'Exterior Color', sortable: true, sortDirection: 'desc', formatter: "titleCase"},

          { key: 'trimDesc', label: 'Trim', sortable: true, sortDirection: 'desc'},
          { key: 'drivetrainDesc', label: 'Drive Train', sortable: true, sortDirection: 'desc', formatter: "titleCase"},
          { key: 'price', label: 'MSRP', sortable: true, sortDirection: 'desc'},
          { key: 'PlannedDeliveryDate', label: 'Delivery Date', formatter: "formatDate", sortable: true, sortByFormatted: true, filterByFormatted: true },

          // Virtual Column
          { key: 'dealer-name-address', label: 'Dealer Information', sortable: true, sortByFormatted: true, filterByFormatted: true },

          { key: 'vin-with-more-details', label: "VIN", sortable: false }
        ],

        modelOptions: [
          { value: 'IONIQ5', text: 'Ioniq5' },
          //  { value: 'KONA', text: 'Kona'}
        ],

        yearOptions: [
          { value: '2022', text: '2022' },
        ],

        form: {
          zipcode: '',
          year: '2022',
          model: 'IONIQ5',
          radius: '',
        }
        
      } // End of return
    },
    methods: {
      logMe(input) {
        console.log(`Log me here: ${input}`)
      },

      titleCase(item) {
        return startCase(camelCase(item))
      },

      toggleDetails(item) {
        // Inject _showDetails into the row items
        if (item["_showDetails"]) item["_showDetails"] = false;
        else this.$set(item, "_showDetails", true);

        // Now get VIN details
        this.getVinDetail(item.vin)
      },

      async getCurrentInventory() {
        // Show users that we're fetching data
        this.tableBusy = true

        const response = await fetch('https://api-rylxnyu4dq-uc.a.run.app/api/inventory?' + new URLSearchParams({
            zip: this.form.zipcode,
            year: this.form.year,
            model: this.form.model,
            radius: this.form.radius,
          }),
          {
          method: 'GET',
          mode: 'cors', 
          })
        
        this.inventory = await response.json();

        // inventoryCount is used to display the $num Vehicles Found message
        // Populating that prop with the number of vehicles returned from the API
        this.inventoryCount = this.inventory.length

        // Remove the table busy indicator
        this.tableBusy = false
      }, 

      async getVinDetail(vin) {
        // Show users that we're fetching data
        this.vinTableBusy = true
        const response = await fetch('https://api-rylxnyu4dq-uc.a.run.app/api/vin?' + new URLSearchParams({
            model: this.form.model,
            year: this.form.year,
            vin: vin,
          }),
          {
          method: 'GET',
          mode: 'cors', 
          })
        
        const vinData = await response.json();
        
        // Store a new record for each VIN we fetch
        // this.$set is needed to enable reactive properties on an existing object
        // without this.$set, the nested table will not auto-refresh with this info
        this.$set(
          this.vinDetail,
          vin,
          this.formatVinDetails(vinData['data'][0]['vehicle'][0]),
          )
    
        // Remove the table busy indicator
        this.vinTableBusy = false
      }, 

      invalidFormMessage() {
        if (this.isValidZipCode != true) {
          if (this.isValidRadius != true) {
            return 'a valid zip code and a search radius.'
          }
        }
        if (this.isValidZipCode != true) {
          return 'a valid zip code.'
        }
        if (this.isValidRadius != true) {
          return 'a search radius.'
        }      
      },

      formatDate(isoDate) {
        // console.log(isoDate)
        if (isoDate) {  // Checking for null values
          return new Date(isoDate.split('T')[0]).toDateString()  // Removing the time
        }

        return ''
      },

      customSort(a, b, key) {
        // Only apply this custom sort to date columns
        // Return either
        // -1 for a[key] < b[key]
        //  0 for a[key] === b[key]
        //  1  for a[key] > b[key].

        if (key == 'PlannedDeliveryDate') {
          const _a = new Date(a[key])  // New Date object
          const _b = new Date(b[key])
          const aDate = Date.parse(_a)  // Convert Date object to epoch
          const bDate = Date.parse(_b)

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
        // Trigger pagination to update the number of buttons/pages due to filtering
        this.inventoryCount = filteredItems.length
      },

      formatVinDetails(input) {
        var tmp = {}
        var deleteKeys = [
          'colors',
        ]

        for (let i in input) {
          const key = i
          const value = input[i]
          
          // if (key == 'DI') {
          //   tmp['Vehicle Link'] = value["DealerVDPURL"]
          // }
          // else 
          if (value === null || value == '') {
            tmp[key] = 'N/A'
          }
          else tmp[key] = value
        }

        // Delete elements no longer needed
        for (let j = 0; j < deleteKeys.length; j++) {
          const element = deleteKeys[j]
          delete tmp[element]
        }

      return tmp
      },
    }, // methods

    computed: {
      isValidZipCode() {
        // Hide the error indicator when this field is blank
        if(this.form.zipcode.length == 0) {
            return null
        }
        return /^\d{5}(-\d{4})?$/.test(this.form.zipcode)
      },

      isValidRadius() {
        // Hide the error indicator when this field is blank
        if(this.form.radius.length == 0) {
            return null
        }
        return /^\d{1,3}$/.test(this.form.radius)
      },

      validateSubmitButton() {
        if (this.form.zipcode && this.form.year && this.form.model && this.form.radius != '') {
          if (this.isValidZipCode && this.isValidRadius) {
            return true
          }
        }
        return false
      },
    },  // End of computed
    watch: {
    }, // End of watch
  }  // End of default
</script>

<style lang="scss">
  @import '../assets/app_style.scss';

  table.b-table[aria-busy='true'] {
    opacity: 0.6;
  }
  
</style>