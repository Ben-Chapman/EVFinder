<template>
    <div>
      <!-- Only show this version of the logo on xs screens -->
      <b-row class="d-flex py-2 d-sm-none" align-h="center">
        <a href="/">
          <b-img src="theevfinder.png" height="40%" alt="The EV Finder Logo"></b-img>
        </a>
      </b-row>
      <!-- For all other screen sizes, show this logo -->
      <b-row class="d-flex mt-3" align-h="center">
        <b-col cols="1" cols-sm="2" class="d-none d-sm-block d-md-block">
          <a href="/">
            <b-img src="theevfinder.png" alt="The EV Finder Logo"></b-img>
          </a>
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
        <b-col cols=6 md=3>
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
        <b-col cols=4 md=2>
          <b-form-group
            id="form-zipcode"
            description="Enter a 5-digit US zip code"
          >
            <b-form-input
              autocomplete="off"
              name="search"
              id="form-zipcode"
              v-model="localForm.zipcode"
              :state="isValidZipCode"
              trim
              debounce="250"
              required
              inputmode="numeric"
              pattern="[0-9]*"
            >
            </b-form-input>
          </b-form-group>
        </b-col>

        <!-- Radius -->
        <b-col cols=4 md=2>
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
              inputmode="numeric"
              pattern="[0-9]*"
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
                @click="routePushandGo()"
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
  import { hyundaiInteriorColors, hyundaiTransitStatus } from '../manufacturers/hyundaiMappings'
  import { getKiaInventory } from '../manufacturers/kia'

  const apiBase = 'https://api.theevfinder.com'

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
        Storing the form data in Vuex, so this is used to store the form values
        locally, which is then used to call the inventory API. Doing this mostly
        to get around the limitations with Vuex and form fields. In the
        inventory API call, these local values are committed to the Vuex store.
        */
        localForm: {
          zipcode: '',
          year: '2022',
          model: 'Ioniq%205',
          radius: '',
          manufacturer: '',
          vehicleName: '',
        },

        modelOptions: [
          {
            label: 'Hyundai',
            options: [
              { value: 'Ioniq%205', text: 'Ioniq 5'},
              { value: 'Ioniq%20Phev', text: 'Ioniq Plug-in Hybrid'},
              { value: 'Kona%20Ev', text: 'Kona Electric'},
              { value: 'Santa%20Fe%20Phev', text: 'Santa Fe Plug-in Hybrid'},
              { value: 'Sonata%20Hev', text: 'Sonata Hybrid'},  // User request
              { value: 'Tucson%20Phev', text: 'Tucson Plug-in Hybrid'},
            ],
          },
          {
            label: 'Kia',
            options: [
              { value: 'N', text: 'EV6'},
              { value: 'F', text: 'Niro Plug-In Hybrid' },
              { value: 'V', text: 'Niro EV' },
            ],
          }
          
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
            return 'a valid zip code and a search radius between 1 and 999.'
          }
        }
        if (this.isValidZipCode != true) {
          return 'a valid zip code.'
        }
        if (this.isValidRadius != true) {
          return 'a search radius between 1 and 999.'
        }      
      },
      
      routePushandGo() {
        /*
        Push form fields to the Vue router as query params. We have a watch()
        configured which monitors for changes to the routes, and will triger an
        API call if they're valid.
        */
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
        
        // Send event data to Plausible
        // this.$plausible.trackEvent(
        //   'Search Params', {
        //     props:
        //       {
        //         Year: this.localForm.year,
        //         Model: this.localForm.model,
        //         Radius: this.localForm.radius,
        //         ZipCode: this.localForm.zipcode,
        //       }
        //     }
        //   )
      },

      async getCurrentInventory() {
        // Show users that we're fetching data
        this.updateStore({'tableBusy': true})
        
        // If we had a previous error from the API, clear it from the vuex store
        // before proceeding
        if (this.apiErrorDetail.length > 0) {
          this.updateStore({'apiErrorDetail': []})
        }

        if (this.localForm.manufacturer.toLowerCase() == 'kia') {
          const kiaInventory = await getKiaInventory(
            this.localForm.zipcode,
            this.localForm.year,
            this.localForm.model,
            this.localForm.vehicleName,
            this.localForm.radius,
          )
          if (kiaInventory[0] === 'ERROR') {
            this.updateStore({'apiErrorDetail': kiaInventory})
          } else {
            this.updateStore({'inventory': kiaInventory})
          }
        }
        else if (this.localForm.manufacturer.toLowerCase() === 'hyundai') {
          await this.getHyundaiInventory()
        }

        this.updateStore({
          'tableBusy': false,  // Remove the table busy indicator
          'form': this.localForm,
          })
      },
    
      async getHyundaiInventory() {
        const response = await fetch(apiBase + '/api/inventory?' + new URLSearchParams({
          zip: this.localForm.zipcode,
          year: this.localForm.year,
          model: this.localForm.model,
          radius: this.localForm.radius,
        }),
        {
        method: 'GET',
        mode: 'cors', 
        })
        
        if (!response.ok) {
          const errorDetail = ['ERROR', response.status, await response.text()]
          this.updateStore({'apiErrorDetail': errorDetail})
        } else {
          var inv = await response.json()
        }

        if (inv.length > 0) {
        inv.forEach(vehicle => {
          // Replace the $xx,xxx.xx string with a value which can be cast to float
          vehicle['price'] = vehicle['price'].replace('$', '').replace(',', '')
          
          // Translate inventory status codes to something meaningful
          vehicle['inventoryStatus'] = hyundaiTransitStatus[vehicle['inventoryStatus']]

          // Translate interior color codes to something meaningful
          vehicle['interiorColorCd'] = hyundaiInteriorColors[vehicle['interiorColorCd']]
        })

        this.updateStore({'inventory': inv})
        }
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

          // Now store some additional detail for the selected vehicle
          this.populateVehicleModelDetail(this.localForm.model)

          return true  // Successfully parsed query params
        }
        else {
          return false
        }
      },

      populateVehicleModelDetail(vehicleModelName) {
        /**
         * For a given vehicle model selection, populate some additional detail
         * in the localForm, which can then be used  for things like manufacturer
         * specific logic.
         */
        Object.values(this.modelOptions).forEach(model => {
          var manu = model.label
          model.options.forEach(v => {
            if (v.value.includes(vehicleModelName)) {
              this.localForm.manufacturer = manu
              this.localForm.vehicleName = v.text  // The Kia API needs this
            }
          })
        })
      }
    },  //methods

    computed: {
      // Vuex
      ...mapState([
        'form',
        'inventory',
        'inventoryCount',
        'tableBusy',
        'apiErrorDetail'
      ]),

      isValidZipCode() {
        const zip = this.localForm.zipcode
        // Hide the error indicator when this field is blank
        if(zip.length == 0) {
            return null
        }
        // https://facts.usps.com/42000-zip-codes/
        const validZipCodes = [501, 99950]  // Starting zip code is 00501

        // Is the input zip code a 5 digit number between 501 and 99950
        return /^\d{5}$/.test(zip) && (parseInt(zip) >= validZipCodes[0] && parseInt(zip) <= validZipCodes[1])
      },

      isValidRadius() {
        // Hide the error indicator when this field is blank
        if(this.localForm.radius.length == 0) {
            return null
        }
        return (this.localForm.radius > 0 && /^\d{1,3}$/.test(this.localForm.radius))
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
        /*
        This watches for route changes, and if valid will call getCurrentInventory()
        If someone directly edits the URL query parameters, this will catch the
        changes and update the components as needed
        */
        if (this.parseQueryParams(to.query)) {
          if (this.validateSubmitButton) {
            this.getCurrentInventory()
          }
        }
      },
      inventory() {
        // When the inventory changes, update the $num vehicles found message
        this.updateStore({'inventoryCount': this.inventory.length})
      },
    },
  } // export
</script>

<style scoped>
</style>