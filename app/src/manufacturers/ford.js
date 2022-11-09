import normalizeJson from "../helpers/libs"
import { cl, convertToCurrency, sortObjectByKey, titleCase } from "../helpers/libs"
import { fordInventoryMapping, fordVinMapping } from "./fordMappings"

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
  const vinData = await fetch(apiBase + '/api/vin/ford?' + new URLSearchParams({
    dealerSlug: dealerSlug,
    modelSlug: `${year}-${model}`.toLowerCase(),  // 2022-mache
    vin: vin,
    paCode: paCode,
    zip: zip,
    model: model,
    year: year
  }),
  {method: 'GET', mode: 'cors',})

  // Get VIN detail data for a single vehicle
  if (vinData.ok) {
    return formatFordVinResults(await vinData.json())
  } else {
    return ['ERROR', vinData.status, await vinData.text()]
  }
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
    
    /**
     * In testing, I've seen where the dealerId provided in an individual
     * vehicle response, doesn't match any dealerId provided by the inventory
     * API response (an error?). So catching that and falling back to deriving
     * the dealer's name from another field.
     */
    try {
      vehicle['distance'] = dealers[dealerId]['distance']
      vehicle['dealerName'] = dealers[dealerId]['displayName']
    } catch (error) {
      // /dealer/Santa-Monica-Ford-12345/model/2022-Mache/... ->
      // Santa Monica Ford 12345
      vehicle['dealerName'] = vehicle['detailPageUrl'].split('/')[2].replaceAll('-', ' ')
      vehicle['distance'] = "0"
    }
    // The dealerSlug is needed for VIN detail calls. Storing here for use later
    vehicle['dealerSlug'] = input['dealerSlug']
  })

  return n
}

function formatFordVinResults(input) {
  const v = normalizeJson([input.data.selected], fordVinMapping)[0]
  needsCurrencyConversion = [
    'vehiclePricingMsrpPricingBase',
    'vehiclePricingMsrpPricingOptions',
    'vehiclePricingDestinationDeliveryCharge',
    'vehiclePricingMsrpPricingNetPrice'
  ]

  const vinFormattedData = {}
  Object.keys(v).forEach(vinKey => {
    // Map Ford-specific keys to EVFinder-specific keys
    Object.keys(fordVinMapping).includes(vinKey) ? vinFormattedData[fordVinMapping[vinKey]] = v[vinKey] : null

    // Need to format some values to display as dollars
    needsCurrencyConversion.includes(vinKey) ? vinFormattedData[fordVinMapping[vinKey]] = convertToCurrency(v[vinKey]) : null
  })

  // Provide dealer details
  vinFormattedData['Dealer Address'] = `${v['dealerName']}\n${v['dealerDealerAddressStreet1']} ${v['dealerDealerAddressStreet2']} ${v['dealerDealerAddressStreet3']}\n${v['dealerAddressCity']}, ${v['dealerAddressState']} ${v['dealerAddressZipCode']}`
  
  vinFormattedData['Dealer Phone'] = v['dealerDealerPhone']

  // Ford exposes dealer installed accessories in nested Objects, dealing with
  // that here
  const features = input.data.selected.vehicle.vehicleFeatures
  Object.keys(features).forEach(key => {
    // WheelSize desc is a duplicate of another key, so excluding it
    if (features[key]['displayName'] != null && key != "WheelSize") {
      vinFormattedData[titleCase(key)] = features[key]['displayName']
    }
  })
  return sortObjectByKey(vinFormattedData)
}