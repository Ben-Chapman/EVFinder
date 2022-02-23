<template>
    <div>
      <!-- Only show this version of the logo on xs screens -->
      <b-row class="d-flex py-2 d-md-none d-sm-block" align-h="center">
        <b-img src="theevfinder.png" height="40%" alt="The EV Finder Logo"></b-img>
      </b-row>
      <!-- For all other screen sizes, show this logo -->
      <b-row class="d-flex mt-3" align-h="center">
        <b-col cols="1" cols-sm="2" class="pl-0 d-none d-sm-block">
          <b-img src="theevfinder.png" alt="The EV Finder Logo"></b-img>
        </b-col>
        
        <!-- Year -->
        <b-col cols=4 md=2>
          <b-form-group
            id="form-year"
            description="Select a Model Year"
          >
            <b-form-select
              id="form-year"
              v-model="localForm.year"
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
              v-model="localForm.model"
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
              v-model="localForm.zipcode"
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
            1Password that this field isn't a password  -->
            <b-form-input
              autocomplete="off"
              name="search"
              id="form-radius"
              v-model="localForm.radius"
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
                >Submit</b-button>
              </span>
            <b-tooltip target="disabled-wrapper" triggers="hover">
                Please enter {{ invalidFormMessage() }}
              </b-tooltip>
          </div>
      </b-row>
    </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex'

  export default {
    mounted() {
      if (this.parseQueryParams(this.$route.query)) {
          if (this.validateSubmitButton) {
            this.getCurrentInventory()
          }
        }
    },

    data() {
      return {
        /*
        Storing the form data in Vuex, so this is used to store the form values locally, which is then used to call the inventory API. Doing this mostly to get around the limitations with Vuex and form fields. In the inventory API call, these local values are committed to the Vuex store.
        */
        localForm: {
          zipcode: '',
          year: '2022',
          model: 'Ioniq%205',
          radius: '',
        },

        modelOptions: [
          { value: 'Ioniq%205', text: 'Ioniq 5'},
          { value: 'Ioniq%20Phev', text: 'Ioniq Plug-in Hybrid'},
          { value: 'Kona%20Ev', text: 'Kona Electric'},
          { value: 'Santa%20Fe%20Phev', text: 'Santa Fe Plug-in Hybrid'},
          { value: 'Sonata%20Hev', text: 'Sonata Hybrid'},  // User request
          { value: 'Tucson%20Phev', text: 'Tucson Plug-in Hybrid'},
        ],

        yearOptions: [
          { value: '2022', text: '2022' },
        ],
      }
    }, // data

    methods: {
      ...mapActions([
        'updateStore'
        ]),

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

      async getCurrentInventory() {
        // Show users that we're fetching data
        this.updateStore({'tableBusy': true})

        const response = await fetch('https://api-rylxnyu4dq-uc.a.run.app/api/inventory?' + new URLSearchParams({
            zip: this.localForm.zipcode,
            year: this.localForm.year,
            model: this.localForm.model,
            radius: this.localForm.radius,
          }),
          {
          method: 'GET',
          mode: 'cors', 
          })
        
        this.updateStore({'inventory': await response.json()})
        // inventoryCount is used to display the $num Vehicles Found message
        // Populating that prop with the number of vehicles returned from the API
        this.updateStore({
          'inventoryCount': this.inventory.length,
          'tableBusy': false,  // Remove the table busy indicator
          'form': this.localForm,
          })
        
        // Push form fields to the Vue router as query params
        this.$router.push({
          query: {
            y: this.localForm.year,
            m: this.localForm.model,
            z: this.localForm.zipcode,
            r: this.localForm.radius,
          }
          }).catch(error => {
            if (
              error.name !== 'NavigationDuplicated' &&
              !error.message.includes('Avoided redundant navigation to current location')
            ) {
              console.log(error)
              }
            })
      },

      // TODO: Convert this to a mixin
      parseQueryParams(inputParams) {
        if (Object.keys(inputParams).length > 0) {
          const paramMapping = {
            'z': 'zipcode',
            'y': 'year',
            'm': 'model',
            'r': 'radius',
          }

          const queryParams = inputParams  // z, y, m, r

          // Write query params to local data store
          Object.keys(queryParams).forEach(k => {
            const key = k
            const longName = paramMapping[k]
            const value = queryParams[k]

            if (Object.keys(paramMapping).includes(key)) {
              this.localForm[longName] = value
            }
          })
          return true  // Successfully parsed query params
        }
        else {
          return false
        }
    },
    },  //methods

    computed: {
      // Vuex
      ...mapState([
        'form',
        'inventory',
        'inventoryCount',
        'tableBusy',
      ]),

      isValidZipCode() {
        // Hide the error indicator when this field is blank
        if(this.localForm.zipcode.length == 0) {
            return null
        }
        return /^\d{5}(-\d{4})?$/.test(this.localForm.zipcode)
      },

      isValidRadius() {
        // Hide the error indicator when this field is blank
        if(this.localForm.radius.length == 0) {
            return null
        }
        return /^\d{1,3}$/.test(this.localForm.radius)
      },

      validateSubmitButton() {
        if (this.localForm.zipcode && this.localForm.year && this.localForm.model && this.localForm.radius != '') {
          if (this.isValidZipCode && this.isValidRadius) {
            return true
          }
        }
        return false
      },
    },  // computed 
    watch: {
      $route(to) {
        // If someone directly edits the URL query parameters, this will catch
        // the changes and update the components as needed
        if (this.parseQueryParams(to.query)) {
          if (this.validateSubmitButton) {
            this.getCurrentInventory()
          }
        }
      }
    },
  } // export
</script>

<style scoped>

</style>