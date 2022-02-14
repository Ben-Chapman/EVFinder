<template>
   <!-- Form Fields -->
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
                @click="submitToVuex()"
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
    mounted() {},

    data() {
      return {
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
        'updateState'
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

      submitToVuex() {
        this.updateState({'form': this.localForm})
      }
    },  //methods

    computed: {
      // Vuex
      ...mapState([
        'form'
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
  } // export
</script>