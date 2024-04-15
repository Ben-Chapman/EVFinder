/**
 * Copyright 2023 Ben Chapman
 *
 * This file is part of The EV Finder.
 *
 * The EV Finder is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * The EV Finder is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with The EV Finder.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { apiRequest } from '../helpers/request'
import { convertToCurrency, generateErrorMessage } from '../helpers/libs'
import { volkswagenInventoryMapping } from './volkswagenMappings'
import { volkswagenVinMapping } from './volkswagenMappings'

export async function getVolkswagenInventory(zip, year, model, radius, manufacturer) {
  try {
    const invResponse = await apiRequest('inventory', manufacturer, [...arguments])
    return formatVolkswagenInventoryResults(invResponse)
  } catch (error) {
    throw generateErrorMessage(error)
  }
}

function formatVolkswagenInventoryResults(input) {
  /**
   * Volkswagen has an amazingly sane GraphQL-powered inventory API!
   */
  const res = []
  input['data']['inventory']['vehicles'].forEach((vehicle) => {
    // Pulling the dealer info up to the top-level object
    const tmp = { ...vehicle, ...vehicle['dealer'] }
    delete tmp['dealer'] // Don't need the nested object, so deleting

    // Map VW-specific keys to EVFinder-specific keys
    Object.keys(tmp).forEach((key) => {
      Object.keys(volkswagenInventoryMapping).includes(key)
        ? (tmp[volkswagenInventoryMapping[key]] = tmp[key])
        : null
    })

    // Distance to 2 decimal places
    tmp['distance'] = tmp['distance'].toFixed(2)

    // price needs to be a string
    tmp['price'] = String(tmp['price'])
    res.push(tmp)

    // VW does not expose the drivetrain directly, so inferring from the trim level
    tmp['trimDesc'].includes('AWD')
      ? (tmp['drivetrainDesc'] = 'AWD')
      : (tmp['drivetrainDesc'] = 'RWD')

    // Inventory Status
    tmp['inTransit'] === true
      ? (tmp['deliveryDate'] = 'In Transit')
      : (tmp['deliveryDate'] = 'Check With Dealer')
    tmp['inventoryStatus'] = tmp['deliveryDate']

    // VW provides a FQDN for the dealer URL. Some manufacturers don't so the
    // scheme is inserted in the table template. So removing the scheme here
    tmp['dealerUrl'] = tmp['dealerUrl'].replace('https://', '')
  })

  return res
}

export async function getVolkswagenVinDetail(zip, vin, manufacturer) {
  try {
    const vinData = await apiRequest('vin', manufacturer, [...arguments], {
      zip: zip,
      vin: vin
    })
    const needsCurrencyConversion = ['destinationCharge', 'msrp']
    const vinFormattedData = {}
    Object.keys(vinData.data.vehicle).forEach((vinKey) => {
      // Map VW-specific keys to EVFinder-specific keys
      Object.keys(volkswagenVinMapping).includes(vinKey)
        ? (vinFormattedData[volkswagenVinMapping[vinKey]] = vinData.data.vehicle[vinKey])
        : null

      // Need to format some values to display as dollars
      needsCurrencyConversion.includes(vinKey)
        ? (vinFormattedData[volkswagenVinMapping[vinKey]] = convertToCurrency(
            vinData.data.vehicle[vinKey]
          ))
        : null
    })

    // Accessories
    const dealerAccessory = []
    vinData.data.vehicle['dealerInstalledAccessories'].forEach((acc) => {
      dealerAccessory.push(`${acc['optionDescription']}: ${convertToCurrency(acc['price'])}`)
    })
    vinFormattedData['Dealer Installed Accessories'] = dealerAccessory.join(',  ')

    // Highlighted features
    const highlightFeatures = []
    vinData.data.vehicle['highlightFeatures'].forEach((feat) => {
      highlightFeatures.push(`${feat['name']}`)
    })
    vinFormattedData['Highlighted Features'] = highlightFeatures.join(',  ')

    // Specifications
    const specTmp = {}
    vinData.data.vehicle['specifications'].forEach((spec) => {
      const specType = spec['salesFamily']
      if (!specTmp[specType]) {
        specTmp[specType] = []
      }
      specTmp[specType].push(spec?.optionDescription != '' ? spec?.optionDescription : 'N/A')

      // If we have specification data, write it to vinFormattedData
      if (specTmp.length > 0) {
        vinFormattedData[specType] = specTmp.join(', ')
      }
    })
    Object.keys(specTmp).forEach((specKey) => {
      vinFormattedData[`${specKey} Specs: `] = specTmp[specKey].join(', ')
    })

    return vinFormattedData
  } catch (error) {
    throw generateErrorMessage(error)
  }
}
