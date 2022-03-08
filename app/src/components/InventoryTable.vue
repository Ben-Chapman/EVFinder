<template>
  <b-table
    hover
    sticky-header="78vh"
    stacked="md"
    :busy="tableBusy"
    :items="this.inventory"
    :fields="this.fields"
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

    <!-- VIN Column -->
    <template #cell(vin-with-more-details)="row">
      <!-- If we've already made the API call and stored the VIN data, just show it -->
      <div v-if="row.item.vin in vinDetail">
        <b-button size="sm" variant="light" @click="row.toggleDetails" class="mr-2 align-middle vin">
          {{ row.item.vin }} <b-icon-chevron-down aria-hidden="true"></b-icon-chevron-down>
        </b-button>
      </div>
      <!-- Otherwise, make the VIN data API call -->
      <div v-else>
        <b-button size="sm" variant="light" @click="toggleDetails(row.item)" class="mr-2 align-middle vin">
          {{ row.item.vin }} <b-icon-chevron-down aria-hidden="true"></b-icon-chevron-down>
        </b-button>
      </div>
    </template>

    <!-- Vin Details Section -->
    <template #row-details="row">
    <b-card>
      <b-row class="justify-content-md-center">
        <div v-if="vinTableBusy" class="text-center my-2">
            <b-spinner class="align-middle mr-2" variant="success"></b-spinner>
            <strong>Fetching Details for This Vehicle...</strong>
          </div>
      </b-row>

        <!-- Vin Details List Group -->
        <!-- Dealer Website Button -->
        <div v-if="vinDetail[row.item.vin]['DI']['DealerVDPURL']">
          <b-row class="py-2" align-h="center">
            <b-button
              size="md"
              variant="light"
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
          <div class="text-center my-2">
            <b-spinner class="align-middle mr-2" variant="success"></b-spinner>
            <strong>Fetching Vehicle Inventory...</strong>
          </div>
      </template>
    </b-table>
</template>

<script>
import Filters from './Filters.vue'
export default {

}
</script>

<style>

</style>