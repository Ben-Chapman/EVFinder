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

const genesisInventoryMapping = {
  IntColor: 'interiorColor',
  ExtColorDesc: 'exteriorColor',
  TrimDesc: 'trimDesc',
  Drivetrain: 'drivetrainDesc',
  SortablePrice: 'price',
  status: 'inventoryStatus',
  range: 'distance',
  VIN: 'vin',
  DlrName: 'dealerName',
  PlannedDeliveryDate: 'deliveryDate'
}

const genesisVinMapping = {
  VIN: 'VIN',
  DealerCd: 'Dealer Code',
  DlrName: 'Dealer Name',
  DlrZipCode: 'Dealer Zip Code',
  deliveryDate: 'Planned Delivery Date',
  PresaleVehicleFlag: 'Presale Vehicle Flag',
  Model: 'Model',
  ModelTitle: 'Model Title',
  ModelYear: 'Model Year',
  trimDesc: 'Trim Description',
  Mileage: 'Mileage',
  Seating: 'Seating',
  Drivetrain: 'Drivetrain',
  DrivetrainDesc: 'Drivetrain Description',
  Trans: 'Transmission',
  ExtColorCd: 'Exterior Color Code',
  ExtColorDesc: 'Exterior Color',
  IntColorCd: 'Interior Color Code',
  IntColor: 'Interior Color',
  HorsePower: 'Horsepower',
  CityMPGRating: 'City MPG Rating',
  EPAEstAvgMPGRating: 'EPA Estimated MPG Rating',
  HighwayMPGRating: 'Highway MPG Rating',
  Freight: 'Freight',
  Package: 'Package',
  EVMotor: 'EV Motor(s)',
  EVRange: 'EV Range',
  msrp: 'MSRP',
  totalExtColorPrice: 'Exterior Color Price',
  totalIntColorPrice: 'Interior Color Price',
  totalPackagePrice: 'Package Price',
  MAPPrice: 'Market Adjustment Price',
  FormattedPrice: 'Total Price',
  TotalAccessoryPrice: 'Accessory Price'
}

export { genesisInventoryMapping, genesisVinMapping }
