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
    // console.log(await inventory.json())
    return formatFordInventoryResults(await inventory.json())
  } else {
    return ['ERROR', inventory.status, await inventory.text()]
  }
}

function formatFordInventoryResults(input) {
  const vehicles = input.data.filterResults.ExactMatch.vehicles
  const dealer = input.data.jsonResponse.commonJsonData.selected.dealer

  var n = normalizeJson(vehicles, fordInventoryMapping)

  n.forEach(vehicle => {
    // Format the inventory status
    vehicle['daysOnDealerLot'] > 0 ? vehicle['deliveryDate'] = `In Stock for ${vehicle['daysOnDealerLot']} days` : vehicle['deliveryDate'] = "Unknown"

    vehicle['distance'] = dealer['Distance']
    vehicle['dealerName'] = dealer['dealerName']
    vehicle['dealerUrl'] = dealer['dealerURL'].replace('https://', '')
  })

  
  return n
}