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
    <b-row>
      <b-table striped hover
        :items="this.inventory"
        :fields="this.fields"
        ></b-table>
    </b-row>
  </b-container>
</template>

<script>
export default {
  mounted() {
    // this.getCurrentInventory()
    // this.logMe()
  },
  data() {
    return {
      inventory: [],
      fields: [
        { key: 'dealerNm', label: 'Dealer Name', sortable: true, sortDirection: 'desc' },
        { key: 'city', label: 'City', sortable: true, sortDirection: 'desc'},
        { key: 'state', label: 'State', sortable: true, sortDirection: 'desc'},
        { key: 'vin', label: 'VIN', sortable: true, sortDirection: 'desc'},
        { key: 'colors[0].ExtColorLongDesc', label: 'Exterior Color', sortable: true, sortDirection: 'desc'},
        // { key: 'interiorColor', label: 'Interior Color', sortable: true, sortDirection: 'desc'},
        { key: 'price', label: 'MSRP', sortable: true, sortDirection: 'desc'},
        { key: 'trimDesc', label: 'Trim Level', sortable: true, sortDirection: 'desc'},
        // { key: 'deliveryDate', label: 'Planned Delivery Date', sortable: true, sortDirection: 'desc'},
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

<style lang="">
  
</style>