import { convertToCurrency, titleCase } from "../libs"

const apiBase = 'https://api.theevfinder.com'

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

// export async function lookupByVin(vin) {
//   // This is used for the search by VIN feature

// if (validateVin(vin)) {

// }

// }

function formatVinDetails(input) {
  var tmp = {}
  var keysToDelete = [
    'colors',
  ]
  var needsCurrencyConversion = [
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
  var nameMapping = {
    'DI': 'DI',
    'colors': 'colors',
    'MAPPrice': 'MAP Price',
    'accessories': 'Accessories',
    'cityMpg': 'City MPG',
    'classDesc': 'Class Description',
    'colorDesc': 'Color Description',
    'cylinders': 'Cylinders',
    'dealerCd': 'Dealer Code',
    'doorCd': 'Door Code',
    'drivetrain': 'Drivetrain',
    'drivetrainDesc': 'Drivetrain Description',
    'engineDesc': 'Engine Description',
    'engineDisplacement': 'Engine Displacement',
    'epaClassDesc': 'EPA Class Description',
    'epaEstAvgMpg': 'EPA Estimated Average MPG',
    'extColorDesc': 'External Color Description',
    'freight': 'Freight Charge',
    'fuelDesc': 'Fuel Description',
    'highwayMpg': 'Highway MPG',
    'horsepower': 'Horsepower',
    'intColorDesc': 'Interior Color Description',
    'inventoryStatus': 'Inventory Status',
    'mileage': 'Mileage',
    'modelCd': 'Model Code',
    'modelGroupCd': 'Model Group Code',
    'modelNm': 'Model Number',
    'modelYear': 'Model Year',
    'msrp': 'MSRP',
    'packages': 'Packages',
    'plannedDeliveryDate': 'Planned Delivery Date',
    'rbcSavings': 'RBC Savings',
    'sortableMileage': 'Vehicle Mileage',
    'totalAccessoryPrice': 'Total Accessory Price',
    'totalExtColorPrice': 'Total Exterior Color Price',
    'totalIntColorPrice': 'Total Interior Color Price',
    'totalOptions': 'Total Options Price',
    'totalPackageOptionPrice': 'Total Package Options Price',
    'totalPackagePrice': 'Total Package Price',
    'totalPackages': 'Total Packages',
    'transmissionDesc': 'Transmission Description',
    'trimDesc': 'Trim Description',
    'vin': 'VIN'}

  for (let i in input) {
    const key = i
    const value = input[i]
    
    if (value === null || value == '') {
      tmp[nameMapping[key]] = 'N/A'
    }
    else if (key == 'accessories') {
      var aTmp = []
      for (var a=0; a<input[key].length; a++) {
        aTmp.push(
          `${titleCase(input[key][a]['accessoryNm'])}: ${convertToCurrency(input[key][a]['accessoryPrice'])}`)
      }
      tmp['Accessories'] = aTmp.join(',  ')
    }
    else if (key == 'inventoryStatus') {
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
    }
    else if (needsCurrencyConversion.includes(key)) {
      tmp[nameMapping[key]] = convertToCurrency(value)
    }
    else tmp[nameMapping[key]] = value
  }

  // Delete elements no longer needed
  for (let j = 0; j < keysToDelete.length; j++) {
    const element = keysToDelete[j]
    delete tmp[element]
  }

return tmp
}

// function validateVin(manufacturer) {
//   if (manufacturer == "hyundai" | manufacturer == "kia" ) {
//     return /[A-Za-z]{2}[\w|\d]{9}\d{6}/.test(manufacturer)
//   }
// }
