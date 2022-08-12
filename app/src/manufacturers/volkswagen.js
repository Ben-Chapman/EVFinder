// import { convertToCurrency, titleCase } from "../libs"
import { volkswagenInventoryMapping, volkswagenVinMapping } from "./volkswagenMappings"

const apiBase = 'https://api.theevfinder.com'
export async function getVolkswagenInventory(zip, year, model, radius) {
  /**
   * Volkswagen is only returning inventory results for 2022 model year, so if
   * the user selects 2023, return an empty array (for now).
   */

  if (year == 2023) {
    return []
  }
  
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
     _ = {...vehicle, ...vehicle['dealer']}  // Pulling the dealer info up to the top-level object
     delete _['dealer']  // No longer needed, so deleting
     res.push(_)
   })
   return res

  // const res = []
  // input['Vehicles'].forEach(vehicle => {
  //   const k = {}
  //   Object.keys(vehicle['Veh']).forEach(key => {
  //     // Remap the Volkswagen-specific key into the EV Finder specific key
  //     if (Object.keys(volkswagenInventoryMapping).includes(key)) {
  //       if (key == "SortablePrice") {  // For now, 'price' needs to be a string
  //         k[volkswagenInventoryMapping[key]] = vehicle['Veh'][key].toString()
  //       } else {
  //         k[volkswagenInventoryMapping[key]] = vehicle['Veh'][key]
  //       }
  //     } else {
  //       // If there's no EV Finder-specific key, just append the Volkswagen key
  //       k[key] = vehicle['Veh'][key]
  //     }

  //     Object.entries(dealerList['dealers']).forEach(f => {
  //       if (f[1]['dealerCd'] == k['DealerCd']) {
  //         k['distance'] = f[1]['distance']
  //         k['dealerUrl'] = f[1]['dealerUrl']
  //       }
  //     })
  //   })
    
  //   if (k['distance'] <= radius) {
  //     res.push(k)
  //   }
  // })
  return res
}

export function getVolkswagenVinDetail(input) {
  /** The Volkswagen Inventory service does not provide a lot of additional detail
   * for each vehicle, and it appears there is no JSON endpoint for a VIN lookup.
   * So for now, just storing the /inventory API data directly in the vinDetail
   * local store.
   */
    const k = {}
    Object.keys(input).forEach(key => {
      if (Object.keys(volkswagenVinMapping).includes(key)) {
        k[volkswagenVinMapping[key]] = input[key]
      }
    })
  
    return k
}
