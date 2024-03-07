<template>
  <b-container fluid>
    <!-- Let's filter -->
    <Filters />

    <!-- Table here -->
    <!-- Flex column for small displays (phone portrait orientation)
         which expands the stacked table to full width of the display
         flex row for all other media sizes, which is the default and
         is needed to properly format the table -->
    <div class="d-flex justify-content-center flex-column flex-lg-row ios-landscape">
      <!-- The API returned an error, so display an error message -->
      <div v-if="this.apiErrorDetail.length > 0">
        <ErrorMessage />
      </div>

      <div v-else-if="showInventoryAlert" class="mt-5">
        <InfoMessage
          infoTitle="No Inventory Available  😢"
          :infoText="`No ${this.form.year} ${this.form.vehicleName}'s were found within
          ${this.form.radius} miles of ${this.form.zipcode}.<br><br>
          Adjust your search and try again (you can enter a search radius of up
          to 999 miles).`"
        />
      </div>

      <div v-else>
        <b-table
          hover
          stacked="sm"
          responsive
          class="rounded inventory-table"
          :busy="tableBusy"
          :items="this.inventory"
          :fields="manufacturerSpecificTableFields"
          :sort-by="this.fields.distance"
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

          <!-- Interior Color -->
          <template #cell(interior-color)="data">
            {{ data.item.interiorColorCd }}
          </template>

          <!-- Dealer Information for Mobile Devices. Displays dealer name only-->
          <template #cell(dealer-name-only)="data">
            <div v-if="data.item.dealerUrl">
              <b-link :href="`https://${data.item.dealerUrl}`" target="_blank">
                {{ data.item.dealerName }}
              </b-link>
            </div>
            <div v-else>
              {{ data.item.dealerName }}
            </div>
          </template>

          <!-- Dealer Information for Large Screen Devices.
          Displays Dealer Name - City, State -->
          <template #cell(dealer-name-address)="data">
            <div v-if="data.item.dealerUrl">
              <b-link :href="`https://${data.item.dealerUrl}`" target="_blank">
                {{ data.item.dealerName }}
              </b-link>
            </div>
            <div v-else>
              {{ data.item.dealerName }}
            </div>
          </template>

          <!-- Distance -->
          <template #cell(distance)="data"> {{ data.item.distance }} mi. </template>

          <!-- VIN Column -->
          <template #cell(vin-with-more-details)="row">
            <!-- If we've already made the API call and stored the VIN data, just show it -->
            <div v-if="row.item.vin in vinDetail">
              <b-button
                size="sm"
                variant="light"
                @click="row.toggleDetails"
                class="mr-2 align-middle vin"
              >
                {{ row.item.vin }}
                <b-icon-chevron-down aria-hidden="true"></b-icon-chevron-down>
              </b-button>
            </div>
            <!-- Otherwise, make the VIN data API call -->
            <div v-else>
              <b-button
                size="sm"
                variant="light"
                @click="toggleDetails(row.item)"
                class="mr-2 align-middle vin"
              >
                {{ row.item.vin }}
                <b-icon-chevron-down aria-hidden="true"></b-icon-chevron-down>
              </b-button>
            </div>
          </template>

          <!-- Vin Details Section -->
          <template #row-details="row">
            <b-card>
              <b-row>
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
                      @click="
                        openUrlInNewWindow(
                          vinDetail[row.item.vin]['DI']['DealerVDPURL'],
                        )
                      "
                      class="mr-2 align-middle"
                    >
                      Dealer's Website for This Vehicle
                      <b-icon-box-arrow-up-right
                        aria-hidden="true"
                        class="ml-2"
                        font-scale="1"
                      ></b-icon-box-arrow-up-right>
                    </b-button>
                  </b-row>
                </div>
              </div>
              <!-- Window sticker for Genesis -->
              <div v-if="form.manufacturer == 'Genesis'">
                <b-row class="py-2" align-h="center">
                  <b-button
                    size="md"
                    variant="light"
                    @click="
                      openUrlInNewWindow(
                        generateGenesisWindowStickerUrl(row.item.vin, form.model),
                      )
                    "
                    class="mr-2 align-middle"
                  >
                    Window Sticker for This Vehicle
                    <b-icon-box-arrow-up-right
                      aria-hidden="true"
                      class="ml-2"
                      shift-v="5"
                      font-scale=".8"
                    ></b-icon-box-arrow-up-right>
                  </b-button>
                </b-row>
              </div>
              <!-- Direct Dealer URL for Volkswagen -->
              <div v-if="form.model == 'ID.4' && row.item.onlineSalesURL != ''">
                <b-row class="py-2" align-h="center">
                  <b-button
                    size="md"
                    variant="light"
                    @click="openUrlInNewWindow(row.item.onlineSalesURL)"
                    class="mr-2 align-middle"
                  >
                    Dealer's Website for This Vehicle
                    <b-icon-box-arrow-up-right
                      aria-hidden="true"
                      class="ml-2"
                      shift-v="5"
                      font-scale=".8"
                    ></b-icon-box-arrow-up-right>
                  </b-button>
                </b-row>
              </div>
              <!-- Window sticker for Ford -->
              <div
                v-if="
                  form.model == 'mache' &&
                  row.item.windowStickerUrl != '' &&
                  !vinTableBusy
                "
              >
                <b-row class="py-2" align-h="center">
                  <b-button
                    size="md"
                    variant="light"
                    @click="openUrlInNewWindow(row.item.windowStickerUrl)"
                    class="mr-2 align-middle rounded"
                  >
                    Window Sticker for This Vehicle
                    <b-icon-box-arrow-up-right
                      aria-hidden="true"
                      class="ml-2"
                      shift-v="5"
                      font-scale=".8"
                    ></b-icon-box-arrow-up-right>
                  </b-button>
                </b-row>
              </div>
              <!-- Direct Dealer URL for BMW -->
              <div v-if="row.item.vehicleDetailsPage">
                <b-row class="py-2" align-h="center">
                  <b-button
                    size="md"
                    variant="light"
                    @click="openUrlInNewWindow(row.item.vehicleDetailsPage)"
                    class="mr-2 align-middle"
                  >
                    Dealer's Website for This Vehicle
                    <b-icon-box-arrow-up-right
                      aria-hidden="true"
                      class="ml-2"
                      shift-v="5"
                      font-scale=".8"
                    ></b-icon-box-arrow-up-right>
                  </b-button>
                </b-row>
              </div>
              <!-- VIN Detail Section -->
              <b-list-group
                horizontal
                v-for="(item, key) in vinDetail[row.item.vin]"
                :key="key"
              >
                <!-- We're displaying the Dealer URL above, don't display it here -->
                <b-col cols="7" md="4" class="px-0" v-if="key != 'DI'">
                  <b-list-group-item class="border-0 py-1 px-0"
                    ><b>{{ key }}</b></b-list-group-item
                  >
                </b-col>
                <div v-if="key != 'DI'">
                  <b-list-group-item class="border-0 py-1 px-0">{{
                    item
                  }}</b-list-group-item>
                </div>
              </b-list-group>

              <b-button size="sm" @click="row.toggleDetails" variant="light"
                >Hide Details</b-button
              >
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
    </div>
  </b-container>
</template>

<script>
  import ErrorMessage from "./ErrorMessage.vue";
  import Filters from "./Filters.vue";
  import InfoMessage from "./InfoMessage.vue";

  import { mapActions, mapState } from "vuex";
  import { has } from "lodash";

  import { convertToCurrency, priceStringToNumber } from "../helpers/libs";

  import { getAudiVinDetail } from "../manufacturers/audi";
  import { getBMWVinDetail } from "../manufacturers/bmw";
  import { getFordVinDetail } from "../manufacturers/ford";
  import { getGenesisVinDetail } from "../manufacturers/genesis";
  import { getChevroletVinDetail } from "../manufacturers/chevrolet";
  import { getHyundaiVinDetail } from "../manufacturers/hyundai";
  import { getKiaVinDetail } from "../manufacturers/kia";
  import { getVolkswagenVinDetail } from "../manufacturers/volkswagen";

  export default {
    components: {
      ErrorMessage,
      Filters,
      InfoMessage,
    },

    created() {
      window.addEventListener("beforeunload", this.beforeWindowUnload);
    },

    mounted() {},

    beforeDestroy() {
      window.removeEventListener("beforeunload", this.beforeWindowUnload);
    },

    data() {
      return {
        vinDetail: {},
        vinTableBusy: false,

        /**
         * The table fields which are used for inventory display. The default fields which
         * are used for all manufacturers are indicated with an "all" element in the showFor
         * array.
         * The order of the elements in this array dictates the columns displayed in the UI.
         */
        fields: [
          // Column specific for Audi
          {
            key: "vehicleDesc",
            label: "Model",
            sortable: true,
            sortDirection: "desc",
            showFor: ["Audi"],
            hideFor: [],
          },

          {
            key: "trimDesc",
            label: "Trim",
            sortable: true,
            sortDirection: "desc",
            showFor: ["all"],
            hideFor: [],
          },
          {
            key: "exteriorColor",
            label: "Ext. Color",
            sortable: true,
            sortDirection: "desc",
            showFor: ["all"],
            hideFor: [],
          },
          {
            key: "interiorColor",
            label: "Int. Color",
            sortable: true,
            sortDirection: "desc",
            showFor: ["all"],
            hideFor: [],
          },
          {
            key: "drivetrainDesc",
            label: "Drivetrain",
            sortable: true,
            sortDirection: "desc",
            showFor: ["all"],
            hideFor: [],
          },
          {
            key: "price",
            label: "MSRP",
            sortable: true,
            sortDirection: "desc",
            formatter: convertToCurrency,
            showFor: ["all"],
            hideFor: [],
          },
          {
            key: "deliveryDate",
            label: "Delivery Date",
            formatter: "formatDate",
            sortable: true,
            sortByFormatted: true,
            filterByFormatted: true,
            showFor: ["all"],
            hideFor: [],
          },

          // Display the Dealer's name - city, state on large-screen devices (hidden on mobile, iPad portrait, etc)
          {
            key: "dealer-name-address",
            label: "Dealer",
            sortable: true,
            sortByFormatted: true,
            filterByFormatted: true,
            class: "d-none d-lg-table-cell",
            showFor: ["all"],
            hideFor: [],
          },

          // Display only the Dealer's name on mobile devices (hidden on desktop, iPad landscape, etc)
          {
            key: "dealer-name-only",
            label: "Dealer",
            sortable: true,
            sortByFormatted: true,
            filterByFormatted: true,
            class: "d-lg-none",
            showFor: ["all"],
            hideFor: [],
          },

          // Only show the Distance column on large+ devices (hidden on mobile, iPad portrait, etc)
          {
            key: "distance",
            label: "Distance",
            sortable: true,
            sortDirection: "desc",
            class: "d-none d-lg-table-cell",
            showFor: ["all"],
            hideFor: [],
          },

          {
            key: "vin-with-more-details",
            label: "VIN",
            sortable: false,
            showFor: ["all"],
            hideFor: [],
          },
        ],
      }; // End of return
    },
    methods: {
      ...mapActions(["updateStore"]),

      async toggleDetails(item) {
        // Inject _showDetails into the row items. Vue expects this to be present
        // to know this row has additional detail to display upon click
        if (item["_showDetails"]) item["_showDetails"] = false;
        else this.$set(item, "_showDetails", true);

        // Show users that we're fetching data
        this.vinTableBusy = true;
        // let manufacturer = this.
        const vinApiCall = {
          manufacturer: this.form.manufacturer.toLowerCase(),
          zipcode: this.form.zipcode,
          model: this.form.model,
          // Year is needed for Hyundai. API change needed to remove this
          year: this.form.year,
          item: item,

          async bmw() {
            return await getBMWVinDetail(
              this.item.vin,
              this.manufacturer,
              // A lot of additional detail is included in the inventory data, so
              // passing the inventory API response into getVinDetail to display in the
              // VIN detail section
              this.item,
            );
          },
          async hyundai() {
            return await getHyundaiVinDetail(
              this.item.vin,
              this.manufacturer,
              this.model,
              this.year,
            );
          },
          async kia() {
            return getKiaVinDetail(this.item);
          },
          async chevrolet() {
            return await getChevroletVinDetail(this.item.vin);
          },
          async genesis() {
            return getGenesisVinDetail(this.item.vin, this.zipcode, this.manufacturer);
          },
          async volkswagen() {
            return await getVolkswagenVinDetail(
              this.zipcode,
              this.item.vin,
              this.manufacturer,
            );
          },
          async ford() {
            return await getFordVinDetail(
              this.item.vin,
              this.item.dealerSlug,
              this.model,
              this.item.modelYear,
              this.item.dealerPaCode,
              this.zipcode,
              this.manufacturer,
            );
          },
          async audi() {
            return await getAudiVinDetail(this.item.id, this.manufacturer);
          },
        };
        try {
          const vinData = await vinApiCall[this.form.manufacturer.toLowerCase()]();

          // $set(where to store, what's the key, data to store)
          this.$set(this.vinDetail, item.vin, await vinData);
        } catch (error) {
          // TODO: Make this a proper error view in the UI
          this.$set(this.vinDetail, item.vin, error);
        }

        // Remove the table busy indicator
        this.vinTableBusy = false;
      },

      formatDate(isoDate) {
        if (isoDate) {
          // Checking for null values
          // Parsing the ISO8601 isoDate into a DateString (Mon Jan 01 1970) and
          // stripping the leading day of week resulting in Jan 01 1970
          const d = new Date(isoDate).toDateString();
          if (d != "Invalid Date") {
            return d.substring(4);
          } else {
            return isoDate;
          }
        }
        return "";
      },

      /**
       * @param {Object} a A record Object for the first row to be compared
       * @param {Object} b A record Object for the second row to be compared
       * @param {String} key The field key being sorted on (sortBy)
       * @returns {Number} One of:
       * -1 where a[key] < b[key]
       *  0 where a[key] === b[key]
       *  1  where a[key] > b[key]
       */
      customSort(a, b, key) {
        // This custom sort function was designed to sort dates, so only working with the
        // deliveryDate column
        if (key == "deliveryDate") {
          const _a = new Date(a[key]); // New Date object
          const _b = new Date(b[key]);
          const aDate = Date.parse(_a); // Convert Date object to epoch
          const bDate = Date.parse(_b);

          // Some manufacturers don't include a delivery date in their API response
          // If that's true, fall back to the built-in sort-compare routine
          if ((_a || _b) == "Invalid Date") {
            return false;
          }

          if (aDate < bDate) {
            return -1;
          } else if (aDate === bDate) {
            return 0;
          } else {
            return 1;
          }
        }
        // Fall back to the built-in sort-compare routine for all other columns
        return false;
      },

      onFiltered(filteredItems) {
        // Updating the "$num Vehicles Found" text due to filtering
        this.updateStore({ inventoryCount: filteredItems.length });
      },

      openUrlInNewWindow(url) {
        // Fire event to Plausible
        this.$plausible.trackEvent("Outbound Link: Click", { props: { url: url } });

        window.open(url, "_blank");
      },

      filterFunction(rowRecord, filterSelections) {
        // selectedCategories looks like ['trimDesc', ['LIMITED', 'SEL']]
        var selectedCategories = Object.entries(filterSelections).filter(
          (f) => f[1].length > 0,
        );
        var selectedCategoriesCount = selectedCategories.length;
        var isMatch = [];

        if (selectedCategoriesCount == 0) {
          // No filters are selected
          return true;
        } else if (selectedCategoriesCount == 1) {
          // Multiple selections in a single category
          if (selectedCategories[0][0] == "price") {
            let selectedPrice = selectedCategories[0][1];
            return this.filterByPrice(rowRecord, selectedPrice);
          } else {
            return selectedCategories[0][1].some((val) =>
              Object.values(rowRecord).includes(val),
            );
          }
        } else if (selectedCategoriesCount > 1) {
          // One or more selections across multiple categories
          for (var item of selectedCategories) {
            var category = item[0];
            var selectedItems = item[1];

            if (category == "price") {
              isMatch.push(this.filterByPrice(rowRecord, selectedItems[0]));
            } else {
              // Each loop is a category. Do we have an OR match for the selected filter items?
              // e.g. Blue OR Black OR White
              isMatch.push(
                selectedItems.some((s) => Object.values(rowRecord).includes(s)),
              );
            }
          }

          if (isMatch.includes(false)) {
            return false;
          } else {
            return true;
          }
        }
      },

      filterByPrice(rowRecord, selectedPrice) {
        return priceStringToNumber(rowRecord.price) < selectedPrice;
      },

      hasHyundaiVinDetail(item) {
        return has(item, "DI") && has(item["DI"], "DealerVDPURL");
      },

      generateGenesisWindowStickerUrl(vin, genesisModel) {
        const refreshToken = new Date().toISOString().split("T")[0]; // 2022-08-01
        return `https://www.genesis.com/us/en/services/windowsticker?refreshToken=${refreshToken}&vehicleType=new&VIN=${vin}&vehicleModel=${genesisModel}`;
      },
    }, // methods

    computed: {
      ...mapState([
        "apiErrorDetail",
        "filterSelections",
        "form",
        "inventory",
        "tableBusy",
      ]),

      manufacturerSpecificTableFields() {
        const f = this.fields.filter(
          (field) =>
            (field.showFor.includes("all") ||
              field.showFor.includes(this.form.manufacturer)) &&
            !field.hideFor.includes(this.form.manufacturer),
        );

        return f;
      },

      showInventoryAlert() {
        if (!this.tableBusy && Object.values(this.inventory).length == 0) {
          return true;
        } else {
          return false;
        }
      },
    }, // computed
    watch: {},
  }; // End of default
</script>

<style lang="scss">
  @import "../assets/app_style.scss";

  table.b-table[aria-busy="true"] {
    opacity: 0.6;
  }

  .table-striped tbody tr:nth-of-type(odd) {
    background-color: #f5ffeb !important;
  }

  .table-hover tbody tr:hover {
    background-color: $highlight-bluegreen !important;
  }
  .inventory-table {
    background-color: #ffffffd8;
    // padding-left: env(safe-area-inset-left);
    // padding-right: env(safe-area-inset-right);
  }

  @supports (padding-left: env(safe-area-inset-left)) {
    .ios-landscape {
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
    }
  }

  .card {
    background-color: #ffffffd8 !important;
  }

  .vin {
    font-family: $font-family-monospace;
    font-size: 1rem !important;
    letter-spacing: -0.03rem;
  }
</style>
