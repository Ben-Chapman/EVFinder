<template>
  <b-container>
    <b-row>
      Results Grid Here 🐼
    </b-row>
    <b-row>
    </b-row>
    <b-row>
      <ul id="array-rendering">
        <li v-for="item in this.inventory[0].dealerInfo" :key="item.dealerCd">
          {{ item.address1 }}
          <br>
        </li>
      </ul>
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
      items: [{ message: 'Foo' }, { message: 'Bar' }],
      inventory: [],
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
      // this.inventory = data
      // console.log("Data here: ")
      // console.log(data)
      
    }
  }, // methods

  computed: {

  }, // computed
}  // default


</script>

<style lang="">
  
</style>