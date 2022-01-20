<template>
  <b-container>
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
    this.getCurrentInventory()
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
      
    }
  },
  methods: {
    async getCurrentInventory() {
      const response = await fetch('http://127.0.0.1:5000/inventory?' + new URLSearchParams({
          zip: '07040',
          year: '2022',
          model: 'IONIQ5',
          radius: '50',
        }),
        {
        method: 'GET',
        mode: 'cors', 
        })
      
      this.inventory = await response.json();
    }
  }, // methods

  computed: {
  }, // computed
}  // default


</script>

<style lang="">
  
</style>