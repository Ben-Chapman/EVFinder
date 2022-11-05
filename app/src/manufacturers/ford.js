import normalizeJson from "../helpers/libs"
import { fordInventoryMapping } from "./fordMappings"

const apiBase = 'https://api.theevfinder.com'
export async function getFordInventory(zip, year, model, radius) {
  const inventory = await fetch(apiBase + '/api/inventory/ford?' + new URLSearchParams({
    zip: zip,
    year: year,
    model: model,
    radius: radius,
  }),
  {method: 'GET', mode: 'cors',})
  
  if (inventory.ok) {
    return formatFordInventoryResults(await inventory.json())
  } else {
    return ['ERROR', inventory.status, await inventory.text()]
  }
}

export async function getFordVinDetail(dealerSlug, model, vin, year, paCode, zip) {
  const response = await fetch(apiBase + '/api/vin/ford?' + new URLSearchParams({
    dealerSlug: dealerSlug,
    modelSlug: `${year}-${model}`,  // 2022-mache
    vin: vin,
    paCode: paCode,
    zip: zip,
    model: model,
    year: year
  }),
  {method: 'GET', mode: 'cors',})

  // Get VIN detail data for a single vehicle
const vinData = await response.json()
console.log(vinData)
}


function formatFordInventoryResults(input) {
  // Merging the initial inventory results with any paginated vehicle results
  let vehicles = []
  if ( Object.hasOwn(input, 'rdata') ) {
    vehicles = input.data.filterResults.ExactMatch.vehicles.concat(input.rdata.filterResults.ExactMatch.vehicles)
  } else {
    // No paginated inventory results
    vehicles = input.data.filterResults.ExactMatch.vehicles
  }

  var n = normalizeJson(vehicles, fordInventoryMapping)

  /**
   * Loop through the dealer information in the returned inventory object,
   * and pull out the dealerId and dealer name. We'll use this hashmap to
   * populate information displayed in the UI
   */
  const dealers = {}
  input.data.filterSet.filterGroupsMap.Dealer[0].filterItemsMetadata.filterItems.forEach(dealer => {
    dealers[dealer['value']] = {  // 'value' is the key for the dealer ID
      'displayName': dealer['displayName'],
      'distance': dealer['distance']
    }
  })
  
  n.forEach(vehicle => {
    const dealerId = vehicle['dealerPaCode']
    // Format the inventory status
    vehicle['daysOnDealerLot'] > 0 ? vehicle['deliveryDate'] = `In Stock for ${vehicle['daysOnDealerLot']} days` : vehicle['deliveryDate'] = "Unknown"
    
    vehicle['distance'] = dealers[dealerId]['distance']
    vehicle['dealerName'] = dealers[dealerId]['displayName']
    // The dealerSlug is needed for VIN detail calls. Storing here for use later
    vehicle['dealerSlug'] = input['dealerSlug']
  })

  return n
}

// function formatFordVinResults(input) {

// }