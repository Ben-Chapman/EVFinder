<template>
  <b-container>
    <div>
      <b-row class="d-flex" align-h="center">
        <!-- Year -->
        <b-col cols=4 md=2>
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
        <b-col cols=5 md=3>
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
        <b-col cols=5 md=2>
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
        <b-col cols=3 md=2>
          <b-form-group
            id="form-radius"
            description="Search Radius in Miles"
          >
            <!-- name="search" autocomplete="off" was recommended to hint to
            1Password that this field isn't a password, or something similar  -->
            <b-form-input
              autocomplete="off"
              name="search"
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
<!-- v-if="this.inventory.length > 0" -->
    <!-- Let's filter -->
    <div >
      <b-row class="d-flex justify-content-center">
        <b-icon icon="filter" aria-hidden="true" class="mr-2"></b-icon>
        
          <!-- Filter Options -->
          <!-- Trim Filter -->
          <b-col>
            <b-dd id="trim-dd" size="sm" variant="outline-primary">
              <template #button-content>
                Trim
                <span v-if="filterSelection.trimDesc.length > 0">
                  <b-badge variant="light">
                    {{ filterSelection.trimDesc.length }}
                  </b-badge>
                </span>
              </template>

              <b-dropdown-form>
                <b-form-checkbox
                  v-for="item in this.filterOptions.trimDesc" :key=item
                  :value="item"
                  v-model="filterSelection.trimDesc"
                  name="name-here"
                  class="mb-3"
                  >
                  {{ item }}
                </b-form-checkbox>
              </b-dropdown-form>
            </b-dd>
          </b-col>

          <!-- Color Filter -->
          <b-col>
            <b-dd id="trim-dd" size="sm" variant="outline-primary">
              <template #button-content>
                Color
                <span v-if="filterSelection.colors.length > 0">
                  <b-badge variant="light">
                    {{ filterSelection.colors.length }}
                  </b-badge>
                </span>
              </template>

              <b-dropdown-form>
                <b-form-checkbox
                  v-for="item in this.filterOptions.colors" :key=item
                  :value="item"
                  v-model="filterSelection.colors"
                  name="name-here"
                  class="mb-3"
                  >
                  {{ titleCase(item) }}
                </b-form-checkbox>
              </b-dropdown-form>
            </b-dd>
          </b-col>

          <!-- Drivetrain Filter -->
          <b-col>
            <b-dd id="trim-dd" size="sm" variant="outline-primary">
              <template #button-content>
                Drivetrain
                <span v-if="filterSelection.drivetrainDesc.length > 0">
                  <b-badge variant="light">
                    {{ filterSelection.drivetrainDesc.length }}
                  </b-badge>
                </span>
              </template>

              <b-dropdown-form>
                <b-form-checkbox
                  v-for="item in this.filterOptions.drivetrainDesc" :key=item
                  :value="item"
                  v-model="filterSelection.drivetrainDesc"
                  name="name-here"
                  class="mb-3"
                  >
                  {{ titleCase(item) }}
                </b-form-checkbox>
              </b-dropdown-form>
            </b-dd>
          </b-col>
      </b-row>
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
        :filter="filterSelection"
        @row-clicked="toggleDetails"
        @filtered="onFiltered"
        :filter-function="filterFunction"
        debounce="250"
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
            <!-- Dealer Website Button -->
            <div v-if="vinDetail[row.item.vin]['DI']['DealerVDPURL']">
              <b-row class="py-2" align-h="center">
                <b-button
                  size="md"
                  @click="openUrlInNewWindow(vinDetail[row.item.vin]['DI']['DealerVDPURL'])"
                  class="mr-2 align-middle"
                  >
                  Dealer's Website for This Vehicle
                  <b-icon icon="box-arrow-up-right" aria-hidden="true" class="ml-2" font-scale="1"></b-icon>
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
        filterOptions: {},
        // Keys in filterSelection need to match the source JSON data keys
        filterSelection: {
          'trimDesc': [],
          'drivetrainDesc': [],
          'colors': [],
          'price': [],
        },
        filterMatches: [],

        fields: [
          { key: 'colors[0].ExtColorLongDesc', label: 'Exterior Color', sortable: true, sortDirection: 'desc', formatter: "titleCase"},
          { key: 'trimDesc', label: 'Trim', sortable: true, sortDirection: 'desc'},
          { key: 'drivetrainDesc', label: 'Drive Train', sortable: true, sortDirection: 'desc', formatter: "titleCase"},
          { key: 'price', label: 'MSRP', sortable: true, sortDirection: 'desc'},
          { key: 'PlannedDeliveryDate', label: 'Delivery Date', formatter: "formatDate", sortable: true, sortByFormatted: true, filterByFormatted: true },
          // Virtual Column
          { key: 'dealer-name-address', label: 'Dealer Information', sortable: true, sortByFormatted: true, filterByFormatted: true },
          { key: 'distance', label: 'Distance', sortable: true, sortDirection: 'desc' },
          { key: 'vin-with-more-details', label: "VIN", sortable: false }
        ],

        modelOptions: [
          { value: 'IONIQ5', text: 'Ioniq5' },
          { value: 'Sonata-Hev', text: 'Sonata Hybrid'},
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

        this.populateFilterOptions()
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

      convertToCurrency(item) {
        var formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
          })
        return formatter.format(item)
      },

      openUrlInNewWindow(url) {
        window.open(url, '_blank')
      },

      formatVinDetails(input) {
        var tmp = {}
        var keysToDelete = [
          'colors',
        ]
        var needsCurrencyConversion = [
          'MAPPrice',
          'freight',
          'msrp',
          'rbcSavings',
          'totalAccessoryPrice',
          'totalExtColorPrice',
          'totalIntColotPrice',
          'totalOptions',
          'totalPackageOptionPrice',
          'totalPackagePrice',
        ]
        var nameMapping = {
          'DI': 'DI',
          'colors': 'colors',
          'MAPPrice': 'MAP Price',
          'accessories': 'Accessories',
          'cityMpg': 'City MPG',
          'classDesc': 'Class Description',
          'colorDesc': 'Color Description',
          'cylinders': 'Cylinders',
          'dealerCd': 'Dealer Code',
          'doorCd': 'Door Code',
          'drivetrain': 'Drivetrain',
          'drivetrainDesc': 'Drivetrain Description',
          'engineDesc': 'Engine Description',
          'engineDisplacement': 'Engine Displacement',
          'epaClassDesc': 'EPA Class Description',
          'epaEstAvgMpg': 'EPA Estimated Average MPG',
          'extColorDesc': 'External Color Description',
          'freight': 'Freight Charge',
          'fuelDesc': 'Fuel Description',
          'highwayMpg': 'Highway MPG',
          'horsepower': 'Horsepower',
          'intColorDesc': 'Interior Color Description',
          'inventoryStatus': 'Inventory Status',
          'mileage': 'Mileage',
          'modelCd': 'Model Code',
          'modelGroupCd': 'Model Group Code',
          'modelNm': 'Model Number',
          'modelYear': 'Model Year',
          'msrp': 'MSRP',
          'packages': 'Packages',
          'plannedDeliveryDate': 'Planned Delivery Date',
          'rbcSavings': 'RBC Savings',
          'sortableMileage': 'Vehicle Mileage',
          'totalAccessoryPrice': 'Total Accessory Price',
          'totalExtColorPrice': 'Total Exterior Color Price',
          'totalIntColorPrice': 'Total Interior Color Price',
          'totalOptions': 'Total Options Price',
          'totalPackageOptionPrice': 'Total Package Options Price',
          'totalPackagePrice': 'Total Package Price',
          'totalPackages': 'Total Packages',
          'transmissionDesc': 'Transmission Description',
          'trimDesc': 'Trim Description',
          'vin': 'VIN'}

        // console.log(nameMapping['mileage'])
        for (let i in input) {
          const key = i
          const value = input[i]
          
          if (value === null || value == '') {
            tmp[nameMapping[key]] = 'N/A'
          }
          else if (key == 'accessories') {
            var aTmp = []
            for (var a=0; a<input[key].length; a++) {
              aTmp.push(
                `${this.titleCase(input[key][a]['accessoryNm'])}: ${this.convertToCurrency(input[key][a]['accessoryPrice'])}`)
            }
            tmp['Accessories'] = aTmp.join(',  ')
          }
          else if (needsCurrencyConversion.includes(key)) {
            tmp[nameMapping[key]] = this.convertToCurrency(value)
          }
          else tmp[nameMapping[key]] = value
        }

        // Delete elements no longer needed
        for (let j = 0; j < keysToDelete.length; j++) {
          const element = keysToDelete[j]
          delete tmp[element]
        }

      return tmp
      },

      populateFilterOptions() {
        // TODO: Fix this nonsense
        this.filterOptions['colors'] = []

        this.inventory.forEach(foo => {
          Object.entries(foo).forEach(([key, value]) => {
            if (key == 'colors') {
              value.forEach(color => {
                var colorName = color['ExtColorLongDesc']
                if (!(this.filterOptions[key].includes(colorName))) {
                  this.filterOptions[key].push(colorName)
                }
              })
            }
            if (key in this.filterOptions) {
              if (!(this.filterOptions[key].includes(value))) {
                if (typeof(value) != 'object') {
                this.filterOptions[key].push(value)
                }
              }
            }
            else {
              this.filterOptions[key] = [value]
            }
          })
          })
      },

      filterFunction(rowRecord, filterSelections) {
        /*
          If we have a single filter category, match.some filter value(s) against the rowRecord, and if a match, return true

          If we have multiple categories
            For each category
              If there is a category filter
              match.some against the row record (OR match)
              push onto the matchedRow stack
          
          Now build an array for all filter values ['LIMITED', 'LUCID Blue']
          match.every against the matchedRow array
          return true / false for that row
          */
        // console.log(rowRecord)
        // console.log(filterSelections)

        // isMatch = false

        // filterArray looks like ['trimDesc', ['LIMITED', 'SEL]]
        var filterArray = Object.entries(filterSelections).filter(f => f[1].length > 0)
        var filterArrayCount = filterArray.length

        console.log(`${filterArrayCount} Filter Type`)

        if (filterArrayCount == 0) {
          console.log("No filter")
          // No filters are selected
          return true
        }
        else if (filterArrayCount == 1) {
          // 1 or more filters in a single category were selected
            if (filterArray[0][1].some(val => Object.values(rowRecord).includes(val))) {
              return true
            }
            else {
              return false
              }
        }
        else if (filterArrayCount > 1) {
          // 1 or more filters in multiple categories were selected
          let  filterValues = []
          var isMatch = false
          // var categoryMatch = false
          
          filterArray.forEach(foo => filterValues.push(foo[1]))
          console.log(filterValues)
          
          var perms = this.allPossibleCases(filterValues)

          perms.forEach(foo => {
            isMatch = foo.every(val => Object.values(rowRecord).includes(val))
          })

          return isMatch

            
          }
          

          // while (isMatch == false) {
            // Loop through all filter categories and see if there's a match within a single category
            
        // }

        //   // Merge the selected filter values
        //   console.log(`FilterArray: ${filterArray}`)
        //   console.log(`Object values: ${Object.values(filterArray).filter(f => f.length > 0)}`)
        //   // var mergedFilters = [].concat.apply([], Object.values(filterArray).filter(f => f.length > 0))
          

        //   var m = []
        //   filterArray.forEach(f => {
        //     m.push(f[1][0])
        //   })
        //   console.log(`Merged filter: ${m}`)
        //   return m.every(val => Object.values(rowRecord).includes(val))
          
          // filterArray.forEach(value => {
          //   if (value[1].some(val => Object.values(rowRecord).includes(val))) {
          //     console.log(`Matched something: ${Object.values(rowRecord)}`)
          //     this.matchedRows.push(rowRecord)
          //   }
          // })

          

          // }

        // Object.entries(filterSelections).forEach(selection => {
          


        //   // const key = selection[0]
        //   const values = selection[1]
        //   console.log(`Filtering on: ${values}`)
          
        //   if (values.length == 0) {
        //     console.log('values length 0')
        //     return
        //   }
        //   else if (values.length == 1) {
        //     console.log("values length 1")
        //     return values.some(val => Object.values(rowRecord).includes(val))
        //   }
        //   else if (values.length > 1) {
        //     console.log('values > 2')
        //     matchedRow.push(values.some(val => Object.values(rowRecord).includes(val)))
        //   }


        // })

   

        // These are filter selections
        // Object.entries(filterSelections).forEach(([key, value]) => {
        //       if ([rowRecord].some( foo => foo[key] == value )) {
        //         console.log(`FOUND SOMETHING!!!  ${rowRecord['vin']}`)
        //       }
        //   })
        // const filterText = Object.keys(filterSelections)
        //   .every(key => filterText[key])

        //   console.log(filterText)


        // This works:
        // console.log(filterSelections)
        // const filtered = [rowRecord].filter(item => {
        //   return Object.keys(filterSelections)  // trimDesc, color
        //   .every(key => String(item[key]) // for every value
        //   .includes(filterSelections[key])  // does rowRecord include it
        //   )})
          
        // return filtered.length > 0 ? filtered : false

        // For a rowRecord, if any of the filter values match, return true
        // const allFilters = [].concat(...Object.values(filterSelections)) // filter objects to array

        // for (f in allFilters) {

        // }
        // const isFound = conditions.some(arrVal => Object.values(rowRecord).includes(arrVal))

        // if (isFound) {
        //   return true
        // }
        // else {
        //   return false
        // }
      },

      allPossibleCases(arr) {
        if (arr.length == 1) {
          return arr[0];
        } else {
          var result = [];
          var allCasesOfRest = this.allPossibleCases(arr.slice(1)); // recur with the rest of array
          for (var i = 0; i < allCasesOfRest.length; i++) {
            for (var j = 0; j < arr[0].length; j++) {
              result.push([].concat(arr[0][j], allCasesOfRest[i]));
            }
          }
          return result;
        }

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