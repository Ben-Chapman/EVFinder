<template>
    <div>
      <!-- Only show this version of the logo on xs screens -->
      <b-row class="d-flex py-2 d-md-none d-sm-block" align-h="center">
        <a href="/#/">
          <b-img src="theevfinder.png" height="40%" alt="The EV Finder Logo"></b-img>
        </a>
      </b-row>
      <!-- For all other screen sizes, show this logo -->
      <b-row class="d-flex mt-3" align-h="center">
        <b-col cols="1" cols-sm="2" class="pl-0 d-none d-sm-block">
          <a href="/#/">
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
  import normalizeJson from '../libs'
  import {kiaJsonMapping} from '../manufacturers/kia'

  import {hyundaiInteriorColors, hyundaiTransitStatus} from '../constants'  //eslint-disable-line

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
        this.$plausible.trackEvent(
          'Search Params', {
            props:
              {
                Year: this.localForm.year,
                Model: this.localForm.model,
                Radius: this.localForm.radius,
                ZipCode: this.localForm.zipcode,
              }
            }
          )
      },

      async getCurrentInventory() {
        // Show users that we're fetching data
        this.updateStore({'tableBusy': true})
        
        if (this.localForm.model == 'N') {
          await this.getKiaInventory()
        }
        else {
          await this.getHyundaiInventory()
        }

        // inventoryCount is used to display the $num Vehicles Found message
        // Populating that prop with the number of vehicles returned from the API
        this.updateStore({
          // 'inventoryCount': this.inventory.length,
          'tableBusy': false,  // Remove the table busy indicator
          'form': this.localForm,
          })
      },
    
      async getKiaInventory() {
        const response = await fetch(apiBase + '/api/inventory/kia?' + new URLSearchParams({
          zip: this.localForm.zipcode,
          year: this.localForm.year,
          model: this.localForm.model,
          radius: this.localForm.radius,
        }),
        {method: 'GET', mode: 'cors',})

        var r = await response.json()  // Raw results
        var n = normalizeJson(r['vehicles'], kiaJsonMapping)  // Normalized results

        n.forEach(vehicle => {
          // Lookup the dealer name/address from the dealer code
          const dCode = vehicle['dealerCode']
          const dealerDetail = r['filterSet']['dealers'].find(dealer => dealer['code'] === dCode);

          // Some results have a fqdn for a dealerUrl, some not. Stripping the
          // scheme, which will be re-inserted by the template
          vehicle['dealerUrl'] = dealerDetail['url'].replace(/http(s)?:\/\//i, '')
          vehicle['dealerNm'] = dealerDetail['name']
          vehicle['city'] = dealerDetail['location']['city']
          vehicle['state'] = dealerDetail['location']['state']

          // Distance to 2 decimal places
          vehicle['distance'] = parseFloat(vehicle['distance']).toFixed(2).toString()
          
          // Delivery Date
          if (vehicle['status'] == 'DS') {
            vehicle['PlannedDeliveryDate'] = "In Stock"
            vehicle['inventoryStatus'] = "In Stock"
          }
          else if (vehicle['status'] == 'IT') {
            vehicle['PlannedDeliveryDate'] = "Coming Soon"
            vehicle['inventoryStatus'] = "Coming Soon"
          }
          
          /* The Kia API data is inconsistent and some vehicles don't have a
           drivetrainDesc field (AWD/RWD), but do include this information in
           a longer string description. For these vehicles, extracting the desc
           from the string
          */
          vehicle['drivetrainDesc'] = vehicle['edwTrim'].match(/RWD|AWD/)[0]
        })
        this.updateStore({'inventory': n})
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
        const inv = await response.json()
        
        inv.forEach(vehicle => {
          // Replace the $xx,xxx.xx string with a value which can be cast to float
          vehicle['price'] = vehicle['price'].replace('$', '').replace(',', '')
          
          // Translate inventory status codes to something meaningful
          vehicle['inventoryStatus'] = hyundaiTransitStatus[vehicle['inventoryStatus']]

          // Translate interior color codes to something meaningful
          vehicle['interiorColorCd'] = hyundaiInteriorColors[vehicle['interiorColorCd']]


        })

        this.updateStore({'inventory': inv})
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