/**
 * Copyright 2023 Joel Gomez, 2023 - 2025 Ben Chapman
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

import { generateErrorMessage, titleCase } from "../helpers/libs";
import { apiRequest } from "../helpers/request";
import { chevroletVinMapping } from "./chevroletMappings";

const manufacturer = "chevrolet";

/**
 * Fetches vehicle inventory from the manufacturer's API.
 *
 * @param {String} zip The zipcode to use as the reference "center"
 * @param {String} year The vehicle model year
 * @param {String} model The vehicle model
 * @param {String} radius The radius from the zipcode
 * @returns A "normalized" response object for convenience or an Error array
 */
export async function getChevroletInventory(zip, year, model, radius, manufacturer) {
  try {
    const invResponse = await apiRequest("inventory", manufacturer, [...arguments]);
    return formatChevroletInventoryResults(invResponse);
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

/**
 * Extracts color code from Chevrolet image URL.
 *
 * @param {String} imageUrl The vehicle image URL
 * @returns {String|null} The color code or null if not found
 */
function extractColorCodeFromImageUrl(imageUrl) {
  if (!imageUrl) return null;

  // Extract from the 'i' parameter: i=2025/1MM48/1MM48__2RS/GNT_0ST_1MP_...
  // The color code is after the last slash and before the first underscore
  const match = imageUrl.match(/i=[^/]+\/[^/]+\/[^/]+\/([A-Z0-9]+)_/);
  return match ? match[1] : null;
}

/**
 * Extracts interior color code from Chevrolet image URL using facets data.
 *
 * @param {String} imageUrl The vehicle image URL
 * @param {Object} facetsData The facets data from API response containing available color codes
 * @returns {String|null} The interior color code or null if not found
 */
function extractInteriorColorCodeFromImageUrl(imageUrl, facetsData = null) {
  if (!imageUrl) return null;

  // If facetsData is provided, dynamically extract all interior color codes from the API response
  // This automatically adapts to new color codes without code changes
  let codes = [];
  if (facetsData?.facets?.data?.interiorColor) {
    codes = facetsData.facets.data.interiorColor.map((color) => color.values).flat();
  }

  // Fallback to legacy codes if facetsData is not available
  // This ensures backwards compatibility and handles edge cases
  if (codes.length === 0) {
    codes = ["ESU", "EKD", "H9F", "H7D", "EKV", "E2H", "EMJ", "EMG", "EPJ"];
  }

  // Search for color codes in the image URL
  for (const code of codes) {
    if (imageUrl.includes(`_${code}_`) || imageUrl.includes(`_${code}g`)) {
      return code;
    }
  }

  return null;
}

/**
 * Maps color code to actual color name using facets data.
 *
 * @param {String} colorCode The color code (e.g., "GAG")
 * @param {Object} facetsData The facets data from API response
 * @param {String} colorType Either "exteriorColor" or "interiorColor"
 * @returns {String} The actual color name or the color code if not found
 */
function mapColorCodeToName(colorCode, facetsData, colorType = "exteriorColor") {
  if (!colorCode || !facetsData?.facets?.data?.[colorType]) return colorCode;

  const colorMapping = facetsData.facets.data[colorType].find(
    (color) => color.values && color.values.includes(colorCode),
  );

  return colorMapping ? colorMapping.displayValue : colorCode;
}

/**
 * Formats warranty data into a more human-readable format.
 *
 * @param {Array} warrantyArray The warranty data array from API response
 * @returns {String} Formatted warranty information
 */
function formatWarrantyData(warrantyArray) {
  if (!Array.isArray(warrantyArray) || warrantyArray.length === 0) {
    return "Warranty information not available";
  }

  return warrantyArray
    .map((warranty) => {
      const label = warranty.label || "";
      const values = Array.isArray(warranty.values) ? warranty.values.join(", ") : "";
      return values ? `${label}: ${values}` : label;
    })
    .filter(Boolean)
    .join(" | ");
}

/**
 * Formats features data into a more human-readable format.
 *
 * @param {Array} featuresArray The features data array from API response
 * @returns {String} Formatted features information
 */
function formatFeaturesData(featuresArray) {
  if (!Array.isArray(featuresArray) || featuresArray.length === 0) {
    return "Features information not available";
  }

  return featuresArray
    .map((category) => {
      const categoryName = category.category || "";
      const features = Array.isArray(category.subcategories)
        ? category.subcategories
            .map((sub) => sub.name)
            .filter(Boolean)
            .join(", ")
        : "";
      return features ? `${categoryName}: ${features}` : categoryName;
    })
    .filter(Boolean)
    .join(" | ");
}

/**
 * Formats key features data into a more human-readable format.
 *
 * @param {Array} keyFeaturesArray The key features data array from API response
 * @returns {String} Formatted key features information
 */
function formatKeyFeaturesData(keyFeaturesArray) {
  if (!Array.isArray(keyFeaturesArray) || keyFeaturesArray.length === 0) {
    return "Key features information not available";
  }

  return keyFeaturesArray
    .map((feature) => {
      const label = feature.label || feature.name || "";
      const value = feature.value || "";
      return value ? `${label}: ${value}` : label;
    })
    .filter(Boolean)
    .join(" | ");
}

/**
 * Formats installed options data into a more human-readable format.
 *
 * @param {Array} optionsArray The installed options data array from API response
 * @returns {String} Formatted installed options information
 */
function formatInstalledOptionsData(optionsArray) {
  if (!Array.isArray(optionsArray) || optionsArray.length === 0) {
    return "Installed options information not available";
  }

  return optionsArray
    .map((option) => {
      const name = option.displayName || "";
      const price = option.pricing?.value ? `($${option.pricing.value})` : "";
      return price ? `${name} ${price}` : name;
    })
    .filter(Boolean)
    .join(" | ");
}

/**
 * Formats technical specifications data into a more human-readable format.
 *
 * @param {Object} specsObject The technical specifications object from API response
 * @returns {String} Formatted technical specifications information
 */
function formatTechnicalSpecsData(specsObject) {
  if (!specsObject || typeof specsObject !== "object") {
    return "Technical specifications not available";
  }

  const specs = [];

  // Fuel specifications
  if (specsObject.fuel) {
    const fuel = specsObject.fuel;

    if (fuel.fuelType?.description) {
      specs.push(`Fuel Type: ${fuel.fuelType.description}`);
    }

    if (fuel.performance?.batteryRange) {
      const range = fuel.performance.batteryRange;
      const rangeText =
        range.min === range.max
          ? `${range.min} ${range.unit || "mi"}`
          : `${range.min}-${range.max} ${range.unit || "mi"}`;
      specs.push(`Battery Range: ${rangeText}`);
    }

    if (fuel.performance?.economy) {
      const economy = fuel.performance.economy;

      if (economy.combined) {
        const combined = economy.combined;
        const mpgText =
          combined.low === combined.high
            ? `${combined.low} ${combined.unit || "MPG"}`
            : `${combined.low}-${combined.high} ${combined.unit || "MPG"}`;
        specs.push(`Combined MPG: ${mpgText}`);
      }

      if (economy.city) {
        const city = economy.city;
        const cityText =
          city.low === city.high
            ? `${city.low} ${city.unit || "MPG"}`
            : `${city.low}-${city.high} ${city.unit || "MPG"}`;
        specs.push(`City MPG: ${cityText}`);
      }

      if (economy.highway) {
        const highway = economy.highway;
        const hwText =
          highway.low === highway.high
            ? `${highway.low} ${highway.unit || "MPG"}`
            : `${highway.low}-${highway.high} ${highway.unit || "MPG"}`;
        specs.push(`Highway MPG: ${hwText}`);
      }
    }
  }

  return specs.length > 0
    ? specs.join(" | ")
    : "Technical specifications not available";
}

/**
 * Aggregates and flattens API response data for convenient frontend rendering.
 *
 * @param {Object} input a response object from the inventory API
 * @returns a "normalized" inventory object
 */
function formatChevroletInventoryResults(input) {
  const results = [];
  const facetsData = input;

  input?.data?.hits.forEach((vehicle) => {
    const imageUrl = vehicle.images?.[0]?.url;
    const exteriorColorCode = extractColorCodeFromImageUrl(imageUrl);
    const interiorColorCode = extractInteriorColorCodeFromImageUrl(
      imageUrl,
      facetsData,
    );
    const actualExteriorColorName = mapColorCodeToName(
      exteriorColorCode,
      facetsData,
      "exteriorColor",
    );
    const interiorColorMapped = mapColorCodeToName(
      interiorColorCode,
      facetsData,
      "interiorColor",
    );
    const actualInteriorColorName = interiorColorMapped
      ? interiorColorMapped.split(" seat trim")[0].trim()
      : null; // Remove " seat trim" suffix if present

    // Handle recalled vehicles that don't have status property
    const statusValue = vehicle.status?.value || vehicle.recall?.value;

    results.push({
      dealerName: titleCase(vehicle.dealer.name),
      deliveryDate: statusValue,
      inventoryStatus: statusValue,
      drivetrainDesc: vehicle.driveType,
      distance: vehicle.dealer.distance?.value,
      price: vehicle.pricing?.cash?.msrp?.value,
      exteriorColor: actualExteriorColorName || vehicle.baseExteriorColor,
      interiorColor: actualInteriorColorName || vehicle.baseInteriorColor,
      vin: vehicle.id,
      trimDesc: vehicle.variant.name,
    });
  });
  return results;
}

/**
 * Gets vehicle details by VIN from the manufacturer's API.
 *
 * @param {String} vin
 * @returns a "normalized" vehicle details object
 */
export async function getChevroletVinDetail(vin) {
  try {
    var vinData = await apiRequest("vin", manufacturer, [vin]);
  } catch (error) {
    throw generateErrorMessage(error);
  }
  const vinFormattedData = {};

  const enhancedResult = {
    ...vinData,
    dealerBac: vinData.dealer?.bac,
    dealerName: titleCase(vinData.dealer?.name),
    dealerPostalCode: vinData.dealer?.postalCode.substring(0, 5),
    trimName: vinData.variant?.name,
    extColorOptionCode: vinData.extColor?.optionCode,
    extColorDescription: vinData.extColor?.name,
    intColorOptionCode: vinData.intColor?.optionCode,
    intColorDescription: vinData.intColor?.name,
    epaElectricRange: `${vinData.techSpecs?.fuel?.performance?.batteryRange?.min} - ${vinData.techSpecs?.fuel?.performance?.batteryRange?.max} miles`,

    // Enhanced data from VIN API response
    features: formatFeaturesData(vinData.features),
    warranty: formatWarrantyData(vinData.warranty),
    keyFeatures: formatKeyFeaturesData(vinData.keyFeatures),
    installedOptions: formatInstalledOptionsData(vinData.installedOptions),
    specifications: formatTechnicalSpecsData(vinData.techSpecs),
    pricing: vinData.pricing,
    availability: vinData.availability,
    vehicleDescription: vinData.description,
    modelYear: vinData.modelYear,
    makeName: vinData.make?.name,
    modelName: vinData.model?.name,
    bodyStyle: vinData.bodyStyle?.name,
    driveType: vinData.driveType,
    transmission: vinData.transmission?.name,
    engine: vinData.engine,
    fuelType: vinData.techSpecs?.fuel?.type,
    mpgCity: vinData.techSpecs?.fuel?.economy?.city,
    mpgHighway: vinData.techSpecs?.fuel?.economy?.highway,
    mpgCombined: vinData.techSpecs?.fuel?.economy?.combined,
    seatingCapacity: vinData.techSpecs?.interior?.seating?.capacity,
    cargoCapacity: vinData.techSpecs?.interior?.cargo?.capacity,
    dimensions: vinData.techSpecs?.dimensions,
    weight: vinData.techSpecs?.weight,
    performance: vinData.techSpecs?.performance,
    safety: vinData.techSpecs?.safety,
    technology: vinData.techSpecs?.technology,
    comfort: vinData.techSpecs?.comfort,
    convenience: vinData.techSpecs?.convenience,
  };

  Object.keys(enhancedResult).forEach((vinKey) => {
    // Map Chevrolet-specific keys to EVFinder-specific keys
    if (
      Object.keys(chevroletVinMapping).includes(vinKey) &&
      enhancedResult[vinKey] !== undefined
    ) {
      vinFormattedData[chevroletVinMapping[vinKey]] = enhancedResult[vinKey];
    }
  });

  return vinFormattedData;
}
