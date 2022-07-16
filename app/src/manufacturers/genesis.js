// import { convertToCurrency, titleCase } from "../libs"
import { genesisInventoryMapping } from "./genesisMappings"


// const apiBase = 'https://api.theevfinder.com'
const apiBase = 'http://localhost:8081'
export async function getGenesisInventory(zip, year, model, radius) {
  const response = await fetch(apiBase + '/api/inventory/genesis?' + new URLSearchParams({
    zip: zip,
    year: year,
    model: model,
    radius: radius,
  }),
  {method: 'GET', mode: 'cors',})

  if (!response.ok) {
    return ['ERROR', response.status, await response.text()]
  } else {
    return formatGenesisInventoryResults(await response.json())
  }
}

// export async function getHyundaiVinDetail(vin, model, year) {
//   const response = await fetch(apiBase + '/api/vin?' + new URLSearchParams({
//       model: model,
//       year: year,
//       vin: vin,
//     }),
//     {
//     method: 'GET',
//     mode: 'cors', 
//     })
  
//   // Get VIN detail data for a single vehicle
//   const vinData = await response.json()
  
//   if (vinData['data'].length > 0) {
//     return formatVinDetails(vinData['data'][0]['vehicle'][0])
//   } else if (vinData['data'].length == 0) {
//       return {'': 'No information was found for this VIN'}
//   } else {
//       return {'Error': 'An error occured fetching detail for this VIN'}
//   }
// }

function formatGenesisInventoryResults(input) {
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
    })
    res.push(k)
  })
  return res
}

// function formatVinDetails(input) {
//   var tmp = {}
//   var keysToDelete = [
//     'colors',
//     'DDCSpecialProgam',
//   ]
//   var needsCurrencyConversion = [
//     'DealerPrice',
//     'MAPPrice',
//     'freight',
//     'msrp',
//     'rbcSavings',
//     'totalAccessoryPrice',
//     'totalExtColorPrice',
//     'totalIntColotPrice',
//     'totalOptions',
//     'totalPackageOptionPrice',
//     'totalPackagePrice',
//   ]

//   Object.entries(input).forEach(([key, value]) => {
//     if (value === null || value == '') {
//       if (hyundaiVinDetailMapping[key] != undefined) {
//         tmp[hyundaiVinDetailMapping[key]] = 'N/A'
//       }
//       else {
//         key = 'N/A'
//       }
//     } else if (key == 'accessories') {
//       var aTmp = []
//       for (var a=0; a<input[key].length; a++) {
//         aTmp.push(
//           `${titleCase(input[key][a]['accessoryNm'])}: ${convertToCurrency(input[key][a]['accessoryPrice'])}`)
//       }
//       tmp['Accessories'] = aTmp.join(',  ')
//     } else if (key == 'inventoryStatus') {
//       // Translate status codes to something meaningful
//       const transitStatus = {
//         'AA': 'At Sea 🚢',
//         'DS': 'Dealer Stock 🚩',
//         'IR': '🚛 In Transit',
//         'IT': '🚛 In Transit',
//         'PA': 'Port Arrival',
//         'TN': 'Ready for Shipment',
//       }
//       tmp['Inventory Status'] = transitStatus[value]
//     } else if (needsCurrencyConversion.includes(key)) {
//       tmp[hyundaiVinDetailMapping[key]] = convertToCurrency(value)
//     } else if (keysToDelete.includes(key) == false) {
//       tmp[hyundaiVinDetailMapping[key]] = value
//     }
//   })

//   // Delete elements no longer needed
//   for (let j = 0; j < keysToDelete.length; j++) {
//     const element = keysToDelete[j]
//     delete tmp[element]
//   }

// return tmp
//   }

