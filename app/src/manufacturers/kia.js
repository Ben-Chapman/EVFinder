import normalizeJson from '../libs'
import { kiaJsonMapping } from './kiaMappings'

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

  var r = await response.json()  // Raw results
  var n = normalizeJson(r['vehicles'], kiaJsonMapping)  // Normalized results

  n.forEach(vehicle => {
    // Lookup the dealer name/address from the dealer code
    const dCode = vehicle['dealerCode']
    const dealerDetail = r['filterSet']['dealers'].find(dealer => dealer['code'] === dCode);

    // Some results have a fqdn for a dealerUrl, some not. Stripping the
    // scheme, which will be re-inserted by the template
    vehicle['dealerUrl'] = dealerDetail['url'].replace(/http(s)?:\/\//i, '')
    vehicle['dealerNm'] = dealerDetail['name']
    vehicle['city'] = dealerDetail['location']['city']
    vehicle['state'] = dealerDetail['location']['state']

    // Distance to 2 decimal places
    vehicle['distance'] = parseFloat(vehicle['distance']).toFixed(2).toString()
    
    // Delivery Date
    if (vehicle['status'] == 'DS') {
      vehicle['PlannedDeliveryDate'] = "In Stock"
      vehicle['inventoryStatus'] = "In Stock"
    }
    else if (vehicle['status'] == 'IT') {
      vehicle['PlannedDeliveryDate'] = "Coming Soon"
      vehicle['inventoryStatus'] = "Coming Soon"
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