/**
 * Copyright 2025 Ben Chapman
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

import { apiRequest } from "../helpers/request";
import {
  convertToCurrency,
  convertToISODate,
  generateErrorMessage,
  titleCase,
} from "../helpers/libs";

import {
  cadillacVinMapping,
  getCadillacColorsFromPackageCodes,
} from "./cadillacMappings";

export async function getCadillacInventory(zip, year, model, radius, manufacturer) {
  try {
    const invResponse = await apiRequest("inventory", manufacturer, [...arguments]);
    return formatCadillacInventoryResults(invResponse);
  } catch (error) {
    if ("404" in error?.detail?.errorData) {
      return [];
    }
    throw generateErrorMessage("error");
  }
}

function formatCadillacInventoryResults(input) {
  const res = [];

  // Process each vehicle in the response
  input.data.hits.forEach((vehicle) => {
    // Skip recalled vehicles
    if (vehicle.recall && vehicle.recall.isRecalled === true) {
      return;
    }

    // Get the image URL and package codes for color extraction
    const imageUrl =
      vehicle.images && vehicle.images.length > 0 ? vehicle.images[0].url : null;
    const packageOemCodes = vehicle.packageOemCodes || [];

    // Extract colors using both packageOemCodes and image URL
    const { exteriorColor, interiorColor } = getCadillacColorsFromPackageCodes(
      packageOemCodes,
      imageUrl,
      vehicle.baseExteriorColor || "N/A",
      vehicle.interiorColor || "N/A",
      input,
    );

    // Create a vehicle object with the required structure
    const cleanVehicle = {
      price: vehicle.pricing?.cash?.msrp?.value,
      inventoryStatus:
        vehicle.status?.value ||
        (vehicle.stockDetails?.type === "CentralStock"
          ? "In Transit"
          : "Check With Dealer"),
      interiorColor: interiorColor.split(",")[0],
      exteriorColor: exteriorColor,
      // drivetrainDesc: vehicle.driveType || "N/A",
      deliveryDate: getDeliveryDate(vehicle),
      dealerName: vehicle.dealer?.name ? titleCase(vehicle.dealer.name) : "N/A",
      drivetrainDesc: vehicle.driveType || "N/A",
      trimDesc: vehicle?.variant?.name || "N/A",
      vin: vehicle?.id,
      distance: vehicle?.dealer?.distance?.value || "N/A",
    };

    res.push(cleanVehicle);
  });

  return res;
}

// Helper function to determine delivery date
function getDeliveryDate(vehicle) {
  // Check for estimated delivery date first
  if (vehicle.stockDetails && vehicle.stockDetails.estimatedDeliveryDate) {
    const isoDate = convertToISODate(vehicle.stockDetails.estimatedDeliveryDate);
    return isoDate || vehicle.stockDetails.estimatedDeliveryDate;
  }

  // Fall back to status-based logic
  if (vehicle.stockDetails && vehicle.stockDetails.type === "CentralStock") {
    return "In Transit";
  } else if (vehicle.status && vehicle.status.value) {
    return vehicle.status.value;
  }
  return "Check With Dealer";
}

export async function getCadillacVinDetail(vin, model, year, manufacturer) {
  try {
    const response = await apiRequest("vin", manufacturer, [...arguments], {
      model: model,
      year: year,
      vin: vin,
    });

    const vinData = response.data;
    const vinFormattedData = {};

    // Basic vehicle data mappings using the mapping object
    Object.keys(vinData).forEach((vinKey) => {
      if (Object.keys(cadillacVinMapping).includes(vinKey)) {
        vinFormattedData[cadillacVinMapping[vinKey]] = vinData[vinKey];
      }
    });

    // Extract basic vehicle information
    if (vinData.id) vinFormattedData["VIN"] = vinData.id;
    // Extract status information
    if (vinData.status?.value) {
      vinFormattedData["Availability Status"] = vinData.status.value;
    }
    if (vinData.model) vinFormattedData["Model"] = vinData.model;
    if (vinData.make) vinFormattedData["Make"] = vinData.make;
    if (vinData.year) vinFormattedData["Year"] = vinData.year;
    if (vinData.driveType) vinFormattedData["Drive Type"] = vinData.driveType;
    if (vinData.mileage) vinFormattedData["Mileage"] = vinData.mileage + " miles";

    // Extract variant information
    if (vinData.variant) {
      if (vinData.variant.name) vinFormattedData["Trim"] = vinData.variant.name;
      if (vinData.variant.code) vinFormattedData["Variant Code"] = vinData.variant.code;
      if (vinData.variant.merchandisingModelCode) {
        vinFormattedData["Merchandising Model Code"] =
          vinData.variant.merchandisingModelCode;
      }
    }

    // Extract technical specifications
    if (vinData.techSpecs) {
      const techSpecs = vinData.techSpecs;

      // Battery and performance information
      if (techSpecs.fuel?.performance?.batteryRange) {
        const range = techSpecs.fuel.performance.batteryRange;
        vinFormattedData["Battery Range"] = `${range.min} - ${range.max} ${range.unit}`;
      }

      // Fuel economy information
      if (techSpecs.fuel?.performance?.economy) {
        const economy = techSpecs.fuel.performance.economy;
        const cityMpg = economy.city
          ? `${economy.city.low}-${economy.city.high}`
          : "N/A";
        const hwyMpg = economy.highway
          ? `${economy.highway.low}-${economy.highway.high}`
          : "N/A";
        const combinedMpg = economy.combined
          ? `${economy.combined.low}-${economy.combined.high}`
          : "N/A";

        vinFormattedData["Fuel Economy"] =
          `City: ${cityMpg} MPG, Highway: ${hwyMpg} MPG, Combined: ${combinedMpg} MPG`;
      }

      if (techSpecs.fuel?.fuelType?.description) {
        vinFormattedData["Fuel Type"] = techSpecs.fuel.fuelType.description;
      }
    }

    // Extract stock details
    if (vinData.stockDetails) {
      if (vinData.stockDetails.type)
        vinFormattedData["Stock Type"] = vinData.stockDetails.type;
      if (vinData.stockDetails.number)
        vinFormattedData["Stock Number"] = vinData.stockDetails.number;
      if (vinData.stockDetails.condition)
        vinFormattedData["Condition"] = vinData.stockDetails.condition;
    }

    // Extract dealer information
    if (vinData.dealer) {
      if (vinData.dealer.name)
        vinFormattedData["Dealer"] = titleCase(vinData.dealer.name);
      if (vinData.dealer.postalCode)
        vinFormattedData["Dealer Postal Code"] = vinData.dealer.postalCode;
    }

    // Extract color information
    if (vinData.extColor) {
      vinFormattedData["Exterior Color"] = vinData.extColor.name || "N/A";
      if (vinData.extColor.optionCode) {
        vinFormattedData["Exterior Color Code"] = vinData.extColor.optionCode;
      }
    }

    if (vinData.intColor) {
      vinFormattedData["Interior Color"] = vinData.intColor.name || "N/A";
      if (vinData.intColor.optionCode) {
        vinFormattedData["Interior Color Code"] = vinData.intColor.optionCode;
      }
    }

    // Extract pricing information
    if (vinData.pricing) {
      if (vinData.pricing.cash?.msrp?.value) {
        vinFormattedData["MSRP"] = convertToCurrency(vinData.pricing.cash.msrp.value);
      }
      if (vinData.pricing.cash?.netPrice?.value) {
        vinFormattedData["Net Price"] = convertToCurrency(
          vinData.pricing.cash.netPrice.value,
        );
      }
    }

    // Extract key features
    if (vinData.keyFeatures && vinData.keyFeatures.length > 0) {
      const keyFeaturesList = vinData.keyFeatures
        .map((feature) => `${feature.label}: ${feature.value}`)
        .join(", ");
      vinFormattedData["Key Features"] = keyFeaturesList;
    }

    // Extract vehicle category information
    if (vinData.category) {
      if (vinData.category.vehicleType)
        vinFormattedData["Vehicle Type"] = vinData.category.vehicleType;
      if (vinData.category.bodyStyle)
        vinFormattedData["Body Style"] = vinData.category.bodyStyle;
    }

    // Process features by category
    if (vinData.features && vinData.features.length > 0) {
      vinData.features.forEach((featureCategory) => {
        const categoryName = featureCategory.category;
        const featureNames = [];

        if (featureCategory.subcategories && featureCategory.subcategories.length > 0) {
          featureCategory.subcategories.forEach((subcategory) => {
            if (subcategory.name) {
              featureNames.push(subcategory.name);
            }
          });
        }

        if (featureNames.length > 0) {
          vinFormattedData[categoryName] = featureNames.join(", ");
        }
      });
    }

    // Process warranty information
    if (vinData.warranty && vinData.warranty.length > 0) {
      const warrantyInfo = vinData.warranty
        .map((warranty) => `${warranty.label}: ${warranty.values.join(", ")}`)
        .join("; ");
      vinFormattedData["Warranty"] = warrantyInfo;
    }

    // Process installed options
    if (vinData.installedOptions && vinData.installedOptions.length > 0) {
      const installedOptionsList = vinData.installedOptions
        .map((option) => {
          let optionText = option.displayName;
          if (option.pricing?.value) {
            optionText += ` (+${convertToCurrency(option.pricing.value)})`;
          }
          return optionText;
        })
        .join(", ");
      vinFormattedData["Installed Options"] = installedOptionsList;
    }

    // Process package OEM codes
    if (vinData.packageOemCodes && vinData.packageOemCodes.length > 0) {
      vinFormattedData["Package OEM Codes"] = vinData.packageOemCodes.join(", ");
    }

    return vinFormattedData;
  } catch (error) {
    throw generateErrorMessage(error);
  }
}
