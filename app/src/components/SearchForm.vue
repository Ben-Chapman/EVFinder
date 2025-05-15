<template>
  <div>
    <!-- Only show this version of the logo on xs screens -->
    <b-row class="d-flex py-2 d-sm-none" align-h="center">
      <a href="/">
        <b-img src="/theevfinder.png" height="40%" alt="The EV Finder Logo"></b-img>
      </a>
    </b-row>
    <!-- For all other screen sizes, show this logo -->
    <b-row class="d-flex mt-3" align-h="center">
      <b-col cols="1" cols-sm="2" class="d-none d-sm-block d-md-block">
        <a href="/">
          <b-img src="/theevfinder.png" alt="The EV Finder Logo"></b-img>
        </a>
      </b-col>

      <!-- Year -->
      <b-col cols="4" md="2">
        <b-form-group id="form-year">
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
      <b-col cols="6" md="3">
        <b-form-group id="form-model">
          <b-form-select
            id="form-model"
            v-model="localForm.model"
            :options="modelOptions"
            required
            @input="populateVehicleModelDetail"
          >
          </b-form-select>
        </b-form-group>
      </b-col>

      <!-- ZIP Code -->
      <b-col cols="4" md="2">
        <b-form-group
          id="form-zipcode"
          invalid-feedback="Please enter a valid US ZIP Code"
          tooltip
        >
          <b-form-input
            placeholder="ZIP Code"
            autocomplete="off"
            name="searchzip"
            id="form-zipcode"
            v-model="localForm.zipcode"
            :state="isValidZipCode"
            trim
            debounce="750"
            required
            inputmode="numeric"
            pattern="[0-9]*"
          >
          </b-form-input>
        </b-form-group>
      </b-col>

      <!-- Radius -->
      <b-col cols="4" md="2">
        <b-form-group
          id="form-radius"
          invalid-feedback="Please enter a search radius between 1 and 500 miles"
          tooltip
        >
          <!-- name="search" autocomplete="off" was recommended to hint to
            1Password that this field isn't a password  -->
          <b-form-input
            placeholder="Distance"
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
            >Submit</b-button
          >
        </span>
      </div>

      <!-- Disabled Button -->
      <div>
        <span id="disabled-wrapper" class="d-inline-block" tabindex="0">
          <b-button
            v-if="validateSubmitButton == false"
            disabled
            id="invalid-submit-button"
            variant="primary"
            >Submit</b-button
          >
        </span>
        <b-tooltip target="disabled-wrapper" triggers="hover">
          Please enter {{ invalidFormMessage() }}
        </b-tooltip>
      </div>
    </b-row>
  </div>
</template>

<script>
  import { mapActions, mapState } from "vuex";
  import { modelOptions, yearOptions } from "../helpers/formOptions";

  import { getAudiInventory } from "../manufacturers/audi";
  import { getBMWInventory } from "../manufacturers/bmw";
  import { getFordInventory } from "../manufacturers/ford";
  import { getChevroletInventory } from "../manufacturers/chevrolet";
  import { getGenesisInventory } from "../manufacturers/genesis";
  import { getGMCInventory } from "../manufacturers/gmc";
  import { getHyundaiInventory } from "../manufacturers/hyundai";
  import { getKiaInventory } from "../manufacturers/kia";
  import { getVolkswagenInventory } from "../manufacturers/volkswagen";
  import { getGeoFromZipcode, isValidUrlPath, segmentUrlPath } from "../helpers/libs";

  export default {
    mounted() {
      this.$nextTick(() => {
        const uri = this.$route.path;
        const urlPath = segmentUrlPath(uri);

        // Populate form fields if we have a valid URL path
        if (urlPath.length == 4 && isValidUrlPath(uri)) {
          this.localForm.year = urlPath[1];
          this.localForm.model = urlPath[3];
        }

        // Populate localForm items into Vuex
        Object.keys(this.form).forEach((item) => {
          this.localForm[item] = this.form[item];
        });

        // If an invalid URL path is detected App.vue will issue a redirect to / but does
        // not clear the form fields. Detecting that condition and clearing these fields
        if (
          this.$route.path == "/" &&
          (this.localForm.radius || this.localForm.zipcode)
        ) {
          this.resetLocalFormData();
        }

        // There's a race condition wherein this.localForm.manufacturer is not populated
        // before the URL is parsed and getCurrentInventory() is called. This results
        // in getCurrentInventory() failing. Rather than mucking about with retry logic
        // simply deferring this call to after Vue updates the virtual DOM.
        this.$nextTick(() => {
          // If we have a valid URL and query params, proceed to fetch inventory.
          if (this.parseQueryParams(this.$route.query)) {
            if (this.validateSubmitButton) {
              this.updatePageTitleAndDescription();
              this.updateStore({ showTable: true });
              this.getCurrentInventory();
            }
          }
        });
      });
    }, // mounted

    data() {
      return {
        /*
        Storing the form data in Vuex, so this is used to store the form values
        locally, which is then used to call the inventory API. Doing this mostly
        to get around the limitations with Vuex and form fields. In the
        inventory API call, these local values are committed to the Vuex store.
        */
        localForm: {
          zipcode: "",
          year: "2025",
          model: "",
          radius: "",
          manufacturer: "",
          vehicleName: "",
          geo: "",
          apiEndpoint: "",
          // pageTitle: undefined,
        },

        modelOptions,
        yearOptions,
      };
    }, // data

    methods: {
      ...mapActions(["updateStore"]),

      resetLocalFormData() {
        Object.keys(this.localForm).forEach((key) => {
          if (key != "year") {
            this.localForm[key] = "";
          }
        });
      },

      invalidFormMessage() {
        if (this.isValidZipCode != true) {
          if (this.isValidRadius != true) {
            return "a valid US ZIP Code and a search radius between 1 and 500 miles.";
          }
        }
        if (this.isValidZipCode != true) {
          return "a valid US ZIP Code.";
        }
        if (this.isValidRadius != true) {
          return "a search radius between 1 and 500 miles.";
        }
      },

      routePushandGo() {
        /*
         * Push form fields to the Vue router. A watch() is configured which monitors
         * for changes to the routes, and will trigger an API call if they're valid.
         */
        this.$router.push({
          path: `/inventory/${
            this.localForm.year
          }/${this.localForm.manufacturer.toLowerCase()}/${this.localForm.model.toLowerCase()}`,
          query: {
            zipcode: this.localForm.zipcode,
            radius: this.localForm.radius,
          },
        });
      },

      async getCurrentInventory() {
        // Show users that we're fetching data
        this.updateStore({ tableBusy: true });

        // If we had a previous error from the API, clear it from the vuex store
        // before proceeding
        if (this.apiErrorDetail.length > 0) {
          this.updateStore({ apiErrorDetail: [] });
        }
        if (this.apiInfoDetail.length > 0) {
          this.updateStore({ apiInfoDetail: [] });
        }

        const inventories = {
          zipcode: this.localForm.zipcode,
          year: this.localForm.year,
          model: this.localForm.apiEndpoint,
          radius: this.localForm.radius,
          manufacturer: this.localForm.manufacturer,
          geo: this.localForm.geo,

          async bmw() {
            return await getBMWInventory(
              this.zipcode,
              this.year,
              this.model,
              this.radius,
              this.manufacturer,
            );
          },
          async hyundai() {
            return await getHyundaiInventory(
              this.zipcode,
              this.year,
              this.model,
              this.radius,
              this.manufacturer,
            );
          },
          async kia() {
            return await getKiaInventory(
              this.zipcode,
              this.year,
              this.model,
              this.radius,
              this.manufacturer,
            );
          },
          async chevrolet() {
            return await getChevroletInventory(
              this.zipcode,
              this.year,
              this.model,
              this.radius,
              this.manufacturer,
            );
          },
          async genesis() {
            return await getGenesisInventory(
              this.zipcode,
              this.year,
              this.model,
              this.radius,
              this.manufacturer,
            );
          },
          async gmc() {
            return await getGMCInventory(
              this.zipcode,
              this.year,
              this.model,
              this.radius,
              this.manufacturer,
            );
          },
          async volkswagen() {
            return await getVolkswagenInventory(
              this.zipcode,
              this.year,
              this.model,
              this.radius,
              this.manufacturer,
            );
          },
          async ford() {
            return await getFordInventory(
              this.zipcode,
              this.year,
              this.model,
              this.radius,
              this.manufacturer,
            );
          },
          async audi() {
            return await getAudiInventory(
              this.zipcode,
              this.year,
              this.model,
              this.radius,
              this.manufacturer,
              this.geo,
            );
          },
        };

        try {
          const inv = await inventories[this.localForm.manufacturer.toLowerCase()]();

          /**
           * If we have an Info message, catch that and display it first. Also setting
           * the inventory array to empty, so that the table doesn't display anything
           */
          if (inv[0] === "INFO") {
            this.updateStore({
              apiInfoDetail: inv,
              inventory: [],
            });
          } else {
            this.updateStore({ inventory: inv });
          }
        } catch (error) {
          this.updateStore({ apiErrorDetail: error });
        }

        this.updateStore({
          tableBusy: false, // Remove the table busy indicator
          form: this.localForm,
        });
      },

      parseQueryParams(inputParams) {
        if (Object.keys(inputParams).length > 0) {
          // Write query params to local data store
          Object.keys(inputParams).forEach((p) => {
            this.localForm[p] = inputParams[p];
          });
          return true; // Successfully parsed query params
        } else {
          return false;
        }
      },

      populateVehicleModelDetail(vehicleModelName) {
        /**
         * For a given vehicle model selection, populate some additional detail
         * in the localForm, which can then be used  for things like manufacturer
         * specific logic.
         */
        Object.values(this.modelOptions).forEach((model) => {
          const manufacturer = model.label;
          model.options.forEach((option) => {
            if (option.value.includes(vehicleModelName)) {
              this.localForm.manufacturer = manufacturer;
              if (option.value === vehicleModelName) {
                this.localForm.vehicleName = option.text;
                this.localForm.apiEndpoint = option.api;
              }
            }
          });
        });
      },

      async prefetchGeoCoordinatesForAudi(zipCode) {
        if (this.localForm.manufacturer == "Audi") {
          // If we don't already have the geo information
          if (this.localForm.zipcode != this.localForm.geo.zipcode) {
            this.localForm.geo = await getGeoFromZipcode(zipCode);
          }
        }
      },

      updatePageTitleAndDescription() {
        document.title = `${this.localForm.manufacturer} ${this.localForm.vehicleName} \
Inventory | The EV Finder`;
        document.querySelector('meta[name="description"]').setAttribute(
          "content",
          `Easily search hundreds of car dealers in your area to find your perfect new \
${this.localForm.manufacturer} ${this.localForm.vehicleName} with the EV Finder.`,
        );
      },
    }, //methods

    computed: {
      // Vuex
      ...mapState([
        "apiErrorDetail",
        "apiInfoDetail",
        "form",
        "inventory",
        "inventoryCount",
        "showTable",
        "tableBusy",
      ]),

      isValidZipCode() {
        const zipCode = this.localForm.zipcode;
        // Hide the error indicator when this field is blank
        if (zipCode.length == 0) {
          return null;
        }
        // https://facts.usps.com/42000-zip-codes/
        const validZipCodes = [501, 99950]; // Starting ZIP Code is 00501

        // Is the input ZIP Code a 5 digit number between 501 and 99950
        if (
          /^\d{5}$/.test(zipCode) &&
          parseInt(zipCode) >= validZipCodes[0] &&
          parseInt(zipCode) <= validZipCodes[1]
        ) {
          // If we have a valid ZIP Code, call out to this function which will
          // prefetch geo coordinates needed for Audi
          this.prefetchGeoCoordinatesForAudi(zipCode);
          return true;
        } else {
          return false;
        }
      },

      isValidRadius() {
        // Hide the error indicator when this field is blank
        if (this.localForm.radius.length == 0) {
          return null;
        }
        return (
          this.localForm.radius > 0 &&
          this.localForm.radius <= 500 &&
          /^\d{1,3}$/.test(this.localForm.radius)
        );
      },

      validateSubmitButton() {
        if (
          this.localForm.year &&
          this.localForm.model &&
          this.isValidZipCode &&
          this.isValidRadius
        ) {
          return true;
        }
        return false;
      },
    }, // computed
    watch: {
      $route(to) {
        /*
        This watches for route changes, and if valid will call getCurrentInventory()
        If someone directly edits the URL query parameters, this will catch the
        changes and update the components as needed
        */
        if (this.parseQueryParams(to.query)) {
          if (this.validateSubmitButton) {
            // Clear any existing inventory from vuex, before fetching anew
            if (this.inventory.length > 0) {
              this.updateStore({ inventory: [] });
            }
            this.updateStore({ showTable: true });
            this.updatePageTitleAndDescription();
            this.getCurrentInventory();
          }
        }
      },

      inventory() {
        // When the inventory changes, update the $num vehicles found message
        this.updateStore({ inventoryCount: this.inventory.length });
      },

      "localForm.model"() {
        // When a model is selected, populate additional detail
        this.populateVehicleModelDetail(this.localForm.model);
      },
    }, // watch
  }; // export
</script>

<style>
  ::placeholder {
    color: #9b9b9b !important;
  }

  ::-webkit-input-placeholder {
    /* Edge */
    color: #9b9b9b !important;
  }
</style>
