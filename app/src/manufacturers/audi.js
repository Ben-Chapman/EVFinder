// import normalizeJson from "../helpers/libs"
import { convertToCurrency, sortObjectByKey, titleCase } from "../helpers/libs"
import { audiInventoryMapping, audiVinMapping } from "./audiMappings"

const apiBase = 'https://api.theevfinder.com'

export async function getAudiInventory(zip, year, model, radius) {
  const inventory = await fetch(apiBase + '/api/inventory/audi?' + new URLSearchParams({
    zip: zip,
    year: year,
    model: model,
    radius: radius,
  }),
    { method: 'GET', mode: 'cors', })

  if (inventory.ok) {
    return formatAudiInventoryResults(await inventory.json())
  } else {
    return ['ERROR', inventory.status, await inventory.text()]
  }
}

// https://nominatim.openstreetmap.org/search\?postalcode\=90210\&country\=US\&format\=json
