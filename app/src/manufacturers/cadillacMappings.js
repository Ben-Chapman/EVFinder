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

/**
 * This file is used to map API-specific JSON key descriptions to normalized key
 * descriptions used throughout the site.
 *
 * The structure of the jsonMapping object is:
 * {
 *   'apiSpecificKey': 'normalizedKey'
 * }
 *
 */

const cadillacVinMapping = {
  destinationCharge: "Destination Charge",
  driveType: "Drivetrain",
  baseExteriorColor: "Exterior Color",
  fuelType: "Fuel Type",
  make: "Make",
  model: "Model",
  msrp: "MSRP",
  variant: "Trim",
  year: "Year",
  id: "VIN",
  mileage: "Odometer",
  bodyStyle: "Body Style",
  vehicleType: "Vehicle Type",
};

// Cadillac option code to color description mappings
// These codes are extracted from the vehicle image URLs
const cadillacColorMapping = {
  // Exterior Colors (from facets data)
  GB8: "Stellar Black Metallic",
  GXD: "Argent Silver Metallic",
  G1W: "Crystal White Tricoat",
  GNT: "Radiant Red Tintcoat",
  G6I: "Emerald Lake Metallic",
  GTR: "Opulent Blue Metallic",
  G7X: "Nimbus Metallic",
  GBA: "Black Raven",
  G1U: "Satin Steel Metallic",
  G1E: "Electric Blue",
  GAG: "Monarch Orange",
  // Interior Colors - these correspond to trim levels and specific interior configs
  "1SC": "Noir with Santorini Blue Accents", // Luxury trim
  "1SF": "Noir with Santorini Blue Accents", // Sport trim
  "1SD": "Noir with Santorini Blue Accents", // Luxury 2 trim
  "1SJ": "Sky Cool Gray with Santorini Blue Accents", // Sport 2 trim
  "1SK": "Noir with Sky Cool Gray Accents", // Sport 3 trim
  E4T: "Sky Cool Gray with Santorini Blue Accents", // Premium Luxury trim
  EGW: "Noir",
};

// Function to extract option codes from Cadillac image URL
function extractCadillacOptionCodes(imageUrl) {
  if (!imageUrl) return [];

  // Extract the option codes section from the URL
  const urlParts = imageUrl.split("/");
  const optionString = urlParts.find((part) => part.includes("_") && part.length > 10);

  if (!optionString) return [];

  // Split by underscore and filter out empty strings
  return optionString.split("_").filter((code) => code.length > 0);
}

// Function to get exterior color from option codes
function getCadillacExteriorColor(imageUrl, fallbackColor = "N/A") {
  const optionCodes = extractCadillacOptionCodes(imageUrl);

  for (const code of optionCodes) {
    if (cadillacColorMapping[code] && isExteriorColorCode(code)) {
      return cadillacColorMapping[code];
    }
  }

  return fallbackColor;
}

// Function to get interior color from option codes
function getCadillacInteriorColor(imageUrl, fallbackColor = "N/A") {
  const optionCodes = extractCadillacOptionCodes(imageUrl);

  for (const code of optionCodes) {
    if (cadillacColorMapping[code] && isInteriorColorCode(code)) {
      return cadillacColorMapping[code];
    }
  }

  return fallbackColor;
}

// Helper function to determine if a code represents exterior color
function isExteriorColorCode(code) {
  // Exterior color codes typically start with 'G' for GM vehicles
  return code.startsWith("G") && code.length === 3;
}

// Helper function to determine if a code represents interior color
function isInteriorColorCode(code, facetsMapping = {}) {
  // First check if it's in the facets interior color mapping
  if (facetsMapping && Object.keys(facetsMapping).length > 0) {
    // Check if this code exists in interior colors from facets
    return Object.keys(facetsMapping).some(key => 
      key === code && facetsMapping[key].type === 'interior'
    );
  }
  
  // Fallback: Interior color codes for Cadillac often start with '1S' or 'E'
  return (code.startsWith("1S") && code.length === 3) || 
         (code.startsWith("E") && code.length === 3);
}

// Extract color codes from facets data to build dynamic mapping
function buildColorMappingFromFacets(input) {
  const colorMapping = {};
  const facetsMapping = {};

  // Extract exterior color mappings from facets data
  if (input?.facets?.data?.exteriorColor) {
    input.facets.data.exteriorColor.forEach((color) => {
      if (color.values && color.values[0] && color.displayValue) {
        const code = color.values[0];
        colorMapping[code] = color.displayValue;
        facetsMapping[code] = { type: 'exterior', displayValue: color.displayValue };
      }
    });
  }

  // Extract interior color mappings from facets data
  if (input?.facets?.data?.interiorColor) {
    input.facets.data.interiorColor.forEach((color) => {
      if (color.values && color.values[0] && color.displayValue) {
        const code = color.values[0];
        colorMapping[code] = color.displayValue;
        facetsMapping[code] = { type: 'interior', displayValue: color.displayValue };
      }
    });
  }

  return { colorMapping, facetsMapping };
}

// Alternative approach: get colors directly from packageOemCodes array
function getCadillacColorsFromPackageCodes(
  packageOemCodes,
  imageUrl,
  fallbackExterior = "N/A",
  fallbackInterior = "N/A",
  input = null,
) {
  let exteriorColor = fallbackExterior;
  let interiorColor = fallbackInterior;

  // Build dynamic color mapping from JSON response if available
  let colorMapping = { ...cadillacColorMapping };
  let facetsMapping = {};
  
  if (input) {
    const mappingResult = buildColorMappingFromFacets(input);
    colorMapping = { ...colorMapping, ...mappingResult.colorMapping };
    facetsMapping = mappingResult.facetsMapping;
  }

  // Function to search for color codes in the facets data
  function findColorInFacets(searchCode) {
    if (!input?.facets?.data) return null;
    
    // Search in exterior colors
    if (input.facets.data.exteriorColor) {
      for (const color of input.facets.data.exteriorColor) {
        if (color.values && color.values.includes(searchCode)) {
          return { type: 'exterior', color: color.displayValue };
        }
      }
    }
    
    // Search in interior colors
    if (input.facets.data.interiorColor) {
      for (const color of input.facets.data.interiorColor) {
        if (color.values && color.values.includes(searchCode)) {
          return { type: 'interior', color: color.displayValue };
        }
      }
    }
    
    return null;
  }

  // First try packageOemCodes array (more reliable)
  if (packageOemCodes && Array.isArray(packageOemCodes)) {
    for (const code of packageOemCodes) {
      // First check facets data
      const facetResult = findColorInFacets(code);
      if (facetResult) {
        if (facetResult.type === 'exterior') {
          exteriorColor = facetResult.color;
        } else if (facetResult.type === 'interior') {
          interiorColor = facetResult.color;
        }
      }
      // Fallback to static mapping
      else if (colorMapping[code]) {
        if (isInteriorColorCode(code, facetsMapping)) {
          interiorColor = colorMapping[code];
        } else if (isExteriorColorCode(code)) {
          exteriorColor = colorMapping[code];
        }
      }
    }
  }

  // Then try image URL parsing for both exterior and interior
  if (imageUrl) {
    const optionCodes = extractCadillacOptionCodes(imageUrl);
    for (const code of optionCodes) {
      // First check facets data
      const facetResult = findColorInFacets(code);
      if (facetResult) {
        if (facetResult.type === 'exterior') {
          exteriorColor = facetResult.color;
        } else if (facetResult.type === 'interior') {
          interiorColor = facetResult.color;
        }
      }
      // Fallback to static mapping
      else if (colorMapping[code]) {
        if (isExteriorColorCode(code)) {
          exteriorColor = colorMapping[code];
        } else if (isInteriorColorCode(code, facetsMapping)) {
          interiorColor = colorMapping[code];
        }
      }
    }
  }

  return { exteriorColor, interiorColor };
}

export {
  cadillacVinMapping,
  cadillacColorMapping,
  extractCadillacOptionCodes,
  getCadillacExteriorColor,
  getCadillacInteriorColor,
  getCadillacColorsFromPackageCodes,
  buildColorMappingFromFacets,
};
