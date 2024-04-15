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

/**
 * The BMW inventory API does not return descriptive interior and exterior color names
 * within it's response. Only an individual VIN lookup returns the actual color name.
 * The BMW vehicle configurator has an API endpoint which provides a color code -> color name
 * mapping, so this script grabs that color mapping and builds a JS Object containing
 * the colorCode/colorName pairs.
 *
 * To find new model endpoints, navigate to the Build Your Own section of the BMW website
 * and select the appropriate model. The model code is appended to theBMW Studio URL.
 */
const endpoints = [
  '24II', // iX
  '24IJ', // iX M60
  '24DD', // i4 eDrive35
  '24DA', // i4 eDrive40
  '24DF', // i4 xDrive40
  '24DB', // i4 M50
  '245T', // i5 eDrive40
  '245U', // i5 M60
  '247R', // i7 eDrive50 Sedan
  '247Q' // i7 xDrive60 Sedan
]

const baseUrl = 'https://configure.bmwusa.com/UBYOConfigurator/v4/configuration/start/'

const colorMappings = {}

endpoints.forEach(async (endpoint) => {
  try {
    const r = await fetch(baseUrl + endpoint)
    const j = await r.json()
    Object.keys(j.optionDetails).forEach((key) => {
      j.optionDetails[key].isUpholstery || j.optionDetails[key].isPaint
        ? (colorMappings[key] = j.optionDetails[key]['name'])
        : null
    })
  } catch (error) {
    console.error(error)
  }
})

console.log(colorMappings)
