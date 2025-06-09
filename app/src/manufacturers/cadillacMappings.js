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
  // Additional ESCALADE IQ exterior colors
  G9K: "Manhattan Noir Metallic",
  GAZ: "Zeus Bronze Metallic",
  G0U: "Summit White",
  G1L: "Radiant Silver Metallic",
  // ESCALADE IQ exterior colors from facets (remove duplicate GBA)
  GAB: "Black Cherry Tintcoat",
  GAI: "Deep Space Metallic",
  GSJ: "Flare Metallic",
  GLG: "Midnight Steel Frost",
  // Interior Colors - these correspond to trim levels and specific interior configs
  "1SC": "Noir with Santorini Blue Accents", // LYRIQ Luxury trim
  "1SF": "Noir with Santorini Blue Accents", // LYRIQ Sport trim
  "1SD": "Noir with Santorini Blue Accents", // LYRIQ Luxury 2 trim
  "1SJ": "Sky Cool Gray with Santorini Blue Accents", // LYRIQ Sport 2 trim
  "1SK": "Noir with Sky Cool Gray Accents", // LYRIQ Sport 3 trim
  E4T: "Sky Cool Gray with Santorini Blue Accents", // LYRIQ Premium Luxury trim
  EGW: "Noir",
  // ESCALADE IQ specific interior color codes from facets
  EMY: "Camelia with Backen Black accents", // ESCALADE IQ
  ENK: "Harbor Blue with Backen Black accents", // ESCALADE IQ
  ENB: "Sheer Gray with Dark Medium Cinder accents", // ESCALADE IQ
  H7D: "Backen Black with Santorini Accents", // ESCALADE IQ
  // Additional interior color codes
  "1SA": "Jet Black",
  "1SB": "Jet Black with Red Accents",
  "1SE": "Sky Cool Gray",
  E38: "Semi-Aniline Leather in Jet Black",
  E72: "Semi-Aniline Leather in Sky Cool Gray",
};

// Function to extract option codes from Cadillac image URL
function extractCadillacOptionCodes(imageUrl) {
  if (!imageUrl) return [];

  // Extract the long option codes string after the model/trim part
  const urlParts = imageUrl.split("/");
  let optionString = "";

  // Find the part with the long option codes (usually after the model/trim part)
  for (let i = 0; i < urlParts.length; i++) {
    const part = urlParts[i];
    // Look for the part that starts with an option code and has many underscores
    if (part.includes("_") && part.length > 50) {
      // Remove file extension and query parameters
      optionString = part.split(".")[0].split("?")[0];
      break;
    }
  }

  if (!optionString) {
    // Fallback to the original logic
    const fallbackString = urlParts.find(
      (part) => part.includes("_") && part.length > 10,
    );
    if (fallbackString) {
      optionString = fallbackString.split(".")[0].split("?")[0];
    }
  }

  if (!optionString) return [];

  // Split by underscore and filter out empty strings and very short codes
  return optionString.split("_").filter((code) => code.length >= 2);
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
    return Object.keys(facetsMapping).some(
      (key) => key === code && facetsMapping[key].type === "interior",
    );
  }

  // Known interior color codes for Cadillac
  const interiorCodes = [
    // LYRIQ codes
    "1SC",
    "1SF",
    "1SD",
    "1SJ",
    "1SK",
    // ESCALADE IQ codes
    "1SA",
    "1SB",
    "1SE",
    "1SG",
    // Other interior codes
    "E4T",
    "EGW",
    "EMY",
    "ENK",
    "ENB",
    "H7D",
    "E38",
    "E72",
  ];

  if (interiorCodes.includes(code)) {
    return true;
  }

  // Fallback: Interior color codes for Cadillac often start with '1S' or 'E' or 'H'
  return (
    (code.startsWith("1S") && code.length === 3) ||
    (code.startsWith("E") && code.length === 3) ||
    (code.startsWith("H") && code.length === 3)
  );
}

// Extract color codes from facets data to build dynamic mapping
function buildColorMappingFromFacets(input) {
  const colorMapping = {};
  const facetsMapping = {};

  // Extract exterior color mappings from facets data
  if (input?.facets?.data?.exteriorColor) {
    input.facets.data.exteriorColor.forEach((color) => {
      // Handle different possible structures for color values
      let colorValues = [];
      if (Array.isArray(color.values)) {
        colorValues = color.values;
      } else if (color.values && typeof color.values === "string") {
        colorValues = [color.values];
      } else if (color.value) {
        colorValues = Array.isArray(color.value) ? color.value : [color.value];
      } else if (color.code) {
        colorValues = Array.isArray(color.code) ? color.code : [color.code];
      }

      const displayValue = color.displayValue || color.name || color.label;

      if (colorValues.length > 0 && displayValue) {
        // Map all codes for this color
        colorValues.forEach((code) => {
          colorMapping[code] = displayValue;
          facetsMapping[code] = { type: "exterior", displayValue: displayValue };
        });
      }
    });
  }

  // Extract interior color mappings from facets data
  if (input?.facets?.data?.interiorColor) {
    input.facets.data.interiorColor.forEach((color) => {
      // Handle different possible structures for color values
      let colorValues = [];
      if (Array.isArray(color.values)) {
        colorValues = color.values;
      } else if (color.values && typeof color.values === "string") {
        colorValues = [color.values];
      } else if (color.value) {
        colorValues = Array.isArray(color.value) ? color.value : [color.value];
      } else if (color.code) {
        colorValues = Array.isArray(color.code) ? color.code : [color.code];
      }

      const displayValue = color.displayValue || color.name || color.label;

      if (colorValues.length > 0 && displayValue) {
        // Map all codes for this color
        colorValues.forEach((code) => {
          colorMapping[code] = displayValue;
          facetsMapping[code] = { type: "interior", displayValue: displayValue };
        });
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
        // Handle different possible structures for color values
        let colorValues = [];
        if (Array.isArray(color.values)) {
          colorValues = color.values;
        } else if (color.values && typeof color.values === "string") {
          colorValues = [color.values];
        } else if (color.value) {
          // Some APIs might use 'value' instead of 'values'
          colorValues = Array.isArray(color.value) ? color.value : [color.value];
        } else if (color.code) {
          // Some APIs might use 'code' field
          colorValues = Array.isArray(color.code) ? color.code : [color.code];
        }

        if (colorValues.includes(searchCode)) {
          return {
            type: "exterior",
            color: color.displayValue || color.name || color.label || searchCode,
          };
        }
      }
    }

    // Search in interior colors
    if (input.facets.data.interiorColor) {
      for (const color of input.facets.data.interiorColor) {
        // Handle different possible structures for color values
        let colorValues = [];
        if (Array.isArray(color.values)) {
          colorValues = color.values;
        } else if (color.values && typeof color.values === "string") {
          colorValues = [color.values];
        } else if (color.value) {
          // Some APIs might use 'value' instead of 'values'
          colorValues = Array.isArray(color.value) ? color.value : [color.value];
        } else if (color.code) {
          // Some APIs might use 'code' field
          colorValues = Array.isArray(color.code) ? color.code : [color.code];
        }

        if (colorValues.includes(searchCode)) {
          return {
            type: "interior",
            color: color.displayValue || color.name || color.label || searchCode,
          };
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
        if (facetResult.type === "exterior") {
          exteriorColor = facetResult.color;
        } else if (facetResult.type === "interior") {
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
        if (facetResult.type === "exterior") {
          exteriorColor = facetResult.color;
        } else if (facetResult.type === "interior") {
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
