<template>
<div>
  <b-form @submit="onSubmit">
  <b-row>
    <b-col>
      <b-form-input v-model="zip" type="text" placeholder="Enter your zip code"></b-form-input>
    </b-col>

    <b-col>
      <b-form-input v-model="radius" type="text" placeholder="Enter a search radius in miles"></b-form-input>
    </b-col>

    <b-col>
       <b-form-select v-model="selected" :options="options"></b-form-select>
    </b-col>
    <b-col>
      <b-button type="submit" @submit="onSubmit()" variant="primary">Submit</b-button>
    </b-col>
  </b-row>
  </b-form>
</div>
</template>
<script>
export default {
  data() {
      return {
        form: {
        zip: '',
        radius: '25',
        selected: null,
        },
        options: [
          { value: null, text: 'Please select an option' },
          { value: 'a', text: 'This is First option' },
          { value: 'b', text: 'Selected Option' },
          { value: { C: '3PO' }, text: 'This is an option with object value' },
          { value: 'd', text: 'This one is disabled', disabled: true }
        ],
        year: [{ text: 'Model Year', value: 2022 }, '2022'],
        model: [{ text: 'Select a Model' }, 'Ioniq5', "Evo"],
      
      }
    },
methods: {
  onSubmit(event) {
        event.preventDefault()
        alert(JSON.stringify(this.form))
      },
},
}
</script>
<style lang="">
  
</style>