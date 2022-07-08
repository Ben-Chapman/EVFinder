import { convertToCurrency, titleCase } from "../libs"
import { hyundaiVinDetailMapping } from "./hyundaiMappings"

const apiBase = 'https://api.theevfinder.com'

export async function getHyundaiInventory(zip, year, model, radius) {
  const response = await fetch(apiBase + '/api/inventory/hyundai?' + new URLSearchParams({
    zip: zip,
    year: year,
    model: model,
    radius: radius,
  }),
  {method: 'GET', mode: 'cors',})

  if (!response.ok) {
    return ['ERROR', response.status, await response.text()]
  } else {
    // do stuff here
  }
}

export async function getVinDetail(vin, model, year) {
  const response = await fetch(apiBase + '/api/vin?' + new URLSearchParams({
      model: model,
      year: year,
      vin: vin,
    }),
    {
    method: 'GET',
    mode: 'cors', 
    })
  
  // Get VIN detail data for a single vehicle
  const vinData = await response.json()
  
  
  if (vinData['data'].length > 0) {
    return formatVinDetails(vinData['data'][0]['vehicle'][0])
  } else if (vinData['data'].length == 0) {
      return {'': 'No information was found for this VIN'}
  } else {
      return {'Error': 'An error occured fetching detail for this VIN'}
  }
}

function formatHyundaiApiResults(input) {
  const res = []
  input['data'][0]['dealerInfo'].forEach(dealer => {
    dealer['vehicles'].forEach(vehicle => {
      delete dealer['vehicles'][vehicle]
      res.push({...dealer, ...vehicle})
    })
  })
  // Becuase we just merged the dealer and vehicle Objects, deleting the vehicles
  // array from each vehicle (which was carried over from the dealer object)
  res.forEach(vehicle => {
    delete vehicle['vehicles']
  })

  return res
}

function formatVinDetails(input) {
  var tmp = {}
  var keysToDelete = [
    'colors',
    'DDCSpecialProgam',
  ]
  var needsCurrencyConversion = [
    'DealerPrice',
    'MAPPrice',
    'freight',
    'msrp',
    'rbcSavings',
    'totalAccessoryPrice',
    'totalExtColorPrice',
    'totalIntColotPrice',
    'totalOptions',
    'totalPackageOptionPrice',
    'totalPackagePrice',
  ]

  Object.entries(input).forEach(([key, value]) => {
    if (value === null || value == '') {
      if (hyundaiVinDetailMapping[key] != undefined) {
        tmp[hyundaiVinDetailMapping[key]] = 'N/A'
      }
      else {
        key = 'N/A'
      }
    } else if (key == 'accessories') {
      var aTmp = []
      for (var a=0; a<input[key].length; a++) {
        aTmp.push(
          `${titleCase(input[key][a]['accessoryNm'])}: ${convertToCurrency(input[key][a]['accessoryPrice'])}`)
      }
      tmp['Accessories'] = aTmp.join(',  ')
    } else if (key == 'inventoryStatus') {
      // Translate status codes to something meaningful
      const transitStatus = {
        'AA': 'At Sea 🚢',
        'DS': 'Dealer Stock 🚩',
        'IR': '🚛 In Transit',
        'IT': '🚛 In Transit',
        'PA': 'Port Arrival',
        'TN': 'Ready for Shipment',
      }
      tmp['Inventory Status'] = transitStatus[value]
    } else if (needsCurrencyConversion.includes(key)) {
      tmp[hyundaiVinDetailMapping[key]] = convertToCurrency(value)
    } else if (keysToDelete.includes(key) == false) {
      tmp[hyundaiVinDetailMapping[key]] = value
    }
  })

  // Delete elements no longer needed
  for (let j = 0; j < keysToDelete.length; j++) {
    const element = keysToDelete[j]
    delete tmp[element]
  }

return tmp
  }

