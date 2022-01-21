<template>
  <b-container fluid>
    <div>
      <b-row>
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
        <b-col cols=3>
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

    <!-- Table here -->
    <b-row>
      <b-table
        striped
        hover
        sticky-header="100vh"
        :busy="tableBusy"
        :items="this.inventory"
        :fields="this.fields"
        :sort-compare="customSort"
        >
        <!-- Virtual Columns -->
        <template #cell(delivery-date)="data">
          {{ formatDate(data.item.PlannedDeliveryDate) }}
        </template>

        <template #cell(dealer-name-address)="data">
           <b-link
            :href="'https://' + data.item.dealerUrl"
            target="_blank"
            >
              {{ data.item.dealerNm }}
            </b-link> - {{ data.item.address1 }} {{ data.item.city }}, {{ data.item.state }}
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
export default {
  mounted() {
    this.getCurrentInventory()
    // this.logMe()
  },
  data() {
    return {
      tableBusy: false,
      inventory: [],
      fields: [
        { key: 'colors[0].ExtColorLongDesc', label: 'Exterior Color', sortable: true, sortDirection: 'desc'},
        { key: 'trimDesc', label: 'Trim Level', sortable: true, sortDirection: 'desc'},
        { key: 'price', label: 'MSRP', sortable: true, sortDirection: 'desc'},
        { key: 'PlannedDeliveryDate', label: 'Delivery Date', formatter: "formatDate", sortable: true, sortByFormatted: true, filterByFormatted: true },
        // Virtual Column
        { key: 'dealer-name-address', label: 'Dealer Information', sortable: true, sortByFormatted: true, filterByFormatted: true },
    
        // Virtual Column
  
      // Combine dealer name and address, with a link to full informatio / their website
      // VIN URL: https://www.globalhyundainj.com/api/legacy/pse/windowsticker/hyundai?vin=KMHRB8A3XNU155272


        
      ],

      modelOptions: [
         { value: 'IONIQ5', text: 'Ioniq5' },
         { value: 'KONA', text: 'Kona'}
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
    async getCurrentInventory() {
      // console.log(this.form.zipcode + ' ' + this.form.radius)
      // Show users that we're fetching data
      this.tableBusy = true

      const response = await fetch('http://127.0.0.1:5000/inventory?' + new URLSearchParams({
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

      // Remove the table busy indicator
      this.tableBusy = false
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

<style>
  table.b-table[aria-busy='true'] {
    opacity: 0.6;
  }
  
</style>