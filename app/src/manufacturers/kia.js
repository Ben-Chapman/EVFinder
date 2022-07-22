import normalizeJson from '../libs'
import { kiaInventoryMapping, kiaVinMapping } from './kiaMappings'

const apiBase = 'https://api.theevfinder.com'

export async function getKiaInventory(zip, year, model, seriesName, radius) {
  const response = await fetch(apiBase + '/api/inventory/kia?' + new URLSearchParams({
    zip: zip,
    year: year,
    model: model,
    seriesName: seriesName,
    radius: radius,
  }),
  {method: 'GET', mode: 'cors',})

  if (!response.ok) {
    return ['ERROR', response.status, await response.text()]
  } else {
    var r = await response.json()  // Raw results
    var n = normalizeJson(r['vehicles'], kiaInventoryMapping)  // Normalized results

    n.forEach(vehicle => {
      // Lookup the dealer name/address from the dealer code
      const dCode = vehicle['dealerCode']
      const dealerDetail = r['filterSet']['dealers'].find(dealer => dealer['code'] === dCode);

      // Some results have a fqdn for a dealerUrl, some not. Stripping the
      // scheme, which will be re-inserted by the template
      vehicle['dealerUrl'] = dealerDetail['url'].replace(/http(s)?:\/\//i, '')
      vehicle['dealerName'] = dealerDetail['name']
      vehicle['city'] = dealerDetail['location']['city']
      vehicle['state'] = dealerDetail['location']['state']

      // Distance to 2 decimal places
      vehicle['distance'] = parseFloat(vehicle['distance']).toFixed(2).toString()
      
      // Delivery Date
      if (vehicle['status'] == 'DS') {
        vehicle['deliveryDate'] = "Available"
        vehicle['inventoryStatus'] = "Available"
      }
      else if (vehicle['status'] == 'IT') {
        vehicle['deliveryDate'] = "Arriving Soon"
        vehicle['inventoryStatus'] = "Arriving Soon"
      }
      
      /* The Kia API data is inconsistent and some vehicles don't have a
      drivetrainDesc field (AWD/RWD), but do include this information in
      a longer string description. For these vehicles, extracting the desc
      from the string
      */
      if (vehicle['edwTrim'].match(/RWD|AWD/) != null) {
        vehicle['drivetrainDesc'] = vehicle['edwTrim'].match(/RWD|AWD/)[0]
      } else {
        vehicle['drivetrainDesc'] = "Unknown"
      }
    })

    return n
  }
}

export function getKiaVinDetail(input) {
  /** The KIA API response contains all publically available information
   * about the vehicle, so there's no additional VIN API call needed. Thus
   * storing the /inventory API data directly in the vinDetail local store.
   */
    const k = {}
    Object.keys(input).forEach(key => {
      if (Object.keys(kiaVinMapping).includes(key)) {
        k[kiaVinMapping[key]] = input[key]
      }
      // The Kia API returns individual elements for each feature, so
      // concatinating into a single string for display
      if (key.indexOf("features0Options") >= 0) {  // Does the key contain features0Options
        if (k['Top Features']) {
          k['Top Features'] = `${k['Top Features']}, ${input[key]}`
        } else {
          k['Top Features'] = input[key]
        }
      }
    })
  
    return k
}