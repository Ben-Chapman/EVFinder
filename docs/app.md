# The EV Finder VueJS Application

## Adding a new vehicle to the site
- Create a two new manufacturer javascript files in src/manufacturers:
  - `<manufacturer>.js`
    - Detail here on what this file is for
  - `<manufacturer>Mappings.js`
    - Detail here on what this file is for

- Add the manufacturer and model name(s) to app/src/components/FormSelectors.vue. Ensure you maintain alphabetical order by manufacturer.
```
  {
    label: 'ElectroCar',
    options: [
      { value: 'e-car1', text: 'ElectoCar 1'},
    ],
  }
```
  - The `label` key is used as the dropdown option group heading, and should be the name of the manufacturer.
    - ✅ "Volkswagen"
    - ⛔ "VW"
  - Each vehicle associated with this manufacturer will need an entry in the 
  `options` array.
    - `options.value` is typically the internal value the manufacturer uses within
    their API. This value will be passed into the EVFinder API which then makes a call to the manufacturers inventory APIs, so it should match exactly what the manufacturer's API is expecting.
      - ✅ "Ioniq%205"
      - ⛔ "Ioniq 5"
    - `options.text` is the human-readable model name displayed in the UI of the site. It should match the name of the vehicle as published by the manufacturer:
      - ✅ "ID.4"
      - ⛔ "id4"
      - ✅: "Niro Plug-In Hybrid"
      - ⛔ "Niro Plug In"
  
  - Add a new `else{}` statement to app/src/components/FormSelectors.vue, by duplicating
   an exising `else if (this.localForm.manufacturer.toLowerCase() === '<manufacturer>') {`
   statement. Within this `else if` statement, modify the various function calls
   to reflect the new manufacturer. 