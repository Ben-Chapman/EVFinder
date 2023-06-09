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
 */
const endpoints = [
  "f0cg8pjp", // iX
  "f0cqppr8", // i4
  "f1m40x0z", // i7
];

const baseUrl = "https://configure.bmwusa.com/UBYOConfigurator/v4/configuration/start/";

const colorMappings = {};

endpoints.forEach(async (endpoint) => {
  try {
    const r = await fetch(baseUrl + endpoint);
    const j = await r.json();
    Object.keys(j.optionDetails).forEach((key) => {
      j.optionDetails[key].isUpholstery || j.optionDetails[key].isPaint
        ? (colorMappings[key] = j.optionDetails[key]["name"])
        : null;
    });
  } catch (error) {
    console.error(error);
  }
});
