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

function formatFordInventoryResults(input) {
  const vehicles = input.data.filterResults.ExactMatch.vehicles
  var n = normalizeJson(vehicles, fordInventoryMapping)
  console.log(n)
  return n
}