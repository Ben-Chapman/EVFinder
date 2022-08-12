// import { convertToCurrency, titleCase } from "../libs"
import { genesisInventoryMapping } from "./genesisMappings"


const apiBase = 'https://api.theevfinder.com'
export async function getGenesisInventory(zip, year, model, radius) {
  const inventory = await fetch(apiBase + '/api/inventory/genesis?' + new URLSearchParams({
    zip: zip,
    year: year,
    model: model,
    radius: radius,
  }),
  {method: 'GET', mode: 'cors',})
  
  const dealers = await fetch(apiBase + '/api/dealer/genesis?' + new URLSearchParams({
    zip: zip,
    year: year,
    model: model,
    radius: radius,
  }),
  {method: 'GET', mode: 'cors',})

  if (inventory.ok) {
    return formatGenesisInventoryResults(await inventory.json(), await dealers.json(), radius)
  } else {
    return ['ERROR', inventory.status, await inventory.text()]
  }
  
}

function formatGenesisInventoryResults(input, dealerList, radius) {
  const res = []
  input['Vehicles'].forEach(vehicle => {
    const k = {}
    Object.keys(vehicle['Veh']).forEach(key => {
      // Remap the Genesis-specific key into the EV Finder specific key
      if (Object.keys(genesisInventoryMapping).includes(key)) {
        if (key == "SortablePrice") {  // For now, 'price' needs to be a string
          k[genesisInventoryMapping[key]] = vehicle['Veh'][key].toString()
        } else {
          k[genesisInventoryMapping[key]] = vehicle['Veh'][key]
        }
      } else {
        // If there's no EV Finder-specific key, just append the Genesis key
        k[key] = vehicle['Veh'][key]
      }
      
      Object.entries(dealerList['dealers']).forEach(f => {
        if (f[1]['dealerCd'] == k['DealerCd']) {
          k['distance'] = f[1]['distance']
          k['dealerUrl'] = f[1]['dealerUrl']
        }
      })
    })
    
    if (k['distance'] <= radius) {
      res.push(k)
    }
  })
  return res
}
