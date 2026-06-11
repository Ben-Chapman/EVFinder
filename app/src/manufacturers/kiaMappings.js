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
/*
This file is used to map API specific JSON key descriptions to normalized key
descriptions used throughout the site.
The structure of the jsonMapping object is:
{
'normalizedKey': 'apiSpecificKey'
}

And more specifically:
{
'exteriorColor': 'colorOfTheOutsideOfTheCar',
'year': 'modelYear',
'horsepower': 'powerLevelAsMeasuredByHorses'
}
 */

export const kiaInventoryMapping = {
  interiorColor: "intColor",
  exteriorColor: "extColor",
  trimDesc: "edwTrim",
  drivetrainDesc: "drivetrainDescription",
  price: "msrp",
  inventoryStatus: "status",
  distance: "range",
  "vin-with-more-details": "",
};
