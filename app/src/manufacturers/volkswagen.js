import { convertToCurrency } from "../libs"
import { volkswagenInventoryMapping } from "./volkswagenMappings"
import { volkswagenVinMapping } from "./volkswagenMappings"

const apiBase = 'https://api.theevfinder.com'
export async function getVolkswagenInventory(zip, year, model, radius) {
  const inventory = await fetch(apiBase + '/api/inventory/volkswagen?' + new URLSearchParams({
    zip: zip,
    year: year,
    model: model,
    radius: radius,
  }),
  {method: 'GET', mode: 'cors',})
  
  if (inventory.ok) {
    return formatVolkswagenInventoryResults(await inventory.json())
  } else {
    return ['ERROR', inventory.status, await inventory.text()]
  }
  
}

function formatVolkswagenInventoryResults(input) {
  /**
   * Volkswagen has an amazingly sane GraphQL-powered inventory API!
   */
   const res = []
   input['data']['inventory']['vehicles'].forEach(vehicle => {
    // Pulling the dealer info up to the top-level object
    const tmp = {...vehicle, ...vehicle['dealer']}
    delete tmp['dealer']  // Don't need the nested object, so deleting

    // Map VW-specific keys to EVFinder-specific keys
    Object.keys(tmp).forEach(key => {
      Object.keys(volkswagenInventoryMapping).includes(key) ? tmp[volkswagenInventoryMapping[key]] = tmp[key] : null
    })

    // Distance to 2 decimal places
    tmp['distance'] = tmp['distance'].toFixed(2)

    // price needs to be a string
    tmp['price'] = String(tmp['price'])
    res.push(tmp)

    // VW does not expose the drivetrain directly, so inferring from the trim level
    tmp['trimDesc'].includes('AWD') ? tmp['drivetrainDesc'] = 'AWD' : tmp['drivetrainDesc'] = 'RWD'

    // Inventory Status
    tmp['inTransit'] === true ? tmp['deliveryDate'] = 'In Transit' : tmp['deliveryDate'] = 'Check With Dealer'
    tmp['inventoryStatus'] = tmp['deliveryDate']

    // VW provides a FQDN for the dealer URL. Some manufacturers don't so the 
    // scheme is inserted in the table template. So removing the scheme here
    tmp['dealerUrl'] = tmp['dealerUrl'].replace('https://', '')
   })
   
   return res
}

export async function getVolkswagenVinDetail(zip, vin) {
  /** 
   */

  const response = await fetch(apiBase + '/api/vin/volkswagen?' + new URLSearchParams({
  zip: zip,
  vin: vin,
  }),
  {
  method: 'GET',
  mode: 'cors', 
  })

// Get VIN detail data for a single vehicle
const vinData = await response.json()

const needsCurrencyConversion = [
  'destinationCharge',
  'msrp'
]
const vinFormattedData = {}

Object.keys(vinData['data']['vehicle']).forEach(vinKey => {
  // Map VW-specific keys to EVFinder-specific keys
  Object.keys(volkswagenVinMapping).includes(vinKey) ? vinFormattedData[volkswagenVinMapping[vinKey]] = vinData['data']['vehicle'][vinKey] : null

  // Need to format some values to display as dollars
  needsCurrencyConversion.includes(vinKey) ? vinFormattedData[volkswagenVinMapping[vinKey]] = convertToCurrency(vinData['data']['vehicle'][vinKey]) : null
})

/**
 * VW exposes the various options and specifications in nested Objects. 
 * Dealing with those here
 */

// Dealer Installed Accessories
const dealerAccessory = []
vinData['data']['vehicle']['dealerInstalledAccessories'].forEach(acc => {
dealerAccessory.push(`${acc['longTitle']}: ${convertToCurrency(acc['itemPrice'])}`)
})

vinFormattedData['Dealer Installed Accessories'] = dealerAccessory.join(',  ')

// Highlighted features
const highlightFeatures = []
vinData['data']['vehicle']['highlightFeatures'].forEach(feat => {
  highlightFeatures.push(`${feat['title']}`)
  })

  vinFormattedData['Highlighted Features'] = highlightFeatures.join(',  ')

  // Specifications
vinFormattedData['Specifications:'] = ""
vinData['data']['vehicle']['specifications'].forEach(spec => {
  const specType = spec['text']
  const specTmp = []
  spec['values'].forEach(value => {
    const specName = value['label']
    const specDesc = value['value'].replace(' VISIBLE', '')
    specName != "" ? specTmp.push(`${specName}: ${specDesc}`) : specTmp.push(specDesc)
  })

  vinFormattedData[specType] = specTmp.join(', ')
})

return vinFormattedData
}
