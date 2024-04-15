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

const fordInventoryMapping = {
  interiorColor: 'vehicleFeaturesInteriorColorDisplayName',
  exteriorColor: 'vehicleFeaturesExteriorColorDisplayName',
  trimDesc: 'vehicleTrimDisplayName',
  drivetrainDesc: 'keyDisplayFeaturesDrivetrain',
  price: 'pricingMsrpPricingAdjustedPrice',
  'vin-with-more-details': ''
}

const fordVinMapping = {
  vehicleStage: 'Vehicle Stage',
  vehicleVin: 'VIN',
  trimId: 'Trim ID',
  vehiclePricingMsrpPricingBase: 'Pricing - Base MSRP',
  vehiclePricingMsrpPricingOptions: 'Pricing - Options',
  vehiclePricingDestinationDeliveryCharge: 'Pricing - Dest and Delivery Charge',
  vehiclePricingMsrpPricingNetPrice: 'Pricing - Total MSRP',
  daysOnDealerLot: 'Days on Dealer Lot',
  vehicleTrimDisplayName: 'Trim Level'
}

export { fordInventoryMapping, fordVinMapping }
