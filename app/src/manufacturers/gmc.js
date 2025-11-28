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
import { convertToCurrency, generateErrorMessage, titleCase } from "../helpers/libs";
import { gmcVinMapping } from "./gmcMappings";

export async function getGMCInventory(zip, year, model, radius, manufacturer) {
  try {
    const invResponse = await apiRequest("inventory", manufacturer, [...arguments]);
    return formatGMCInventoryResults(invResponse);
  } catch (error) {
    throw generateErrorMessage(error);
  }
}

function formatGMCInventoryResults(input) {
  const res = [];

  // Process each vehicle in the response
  input["vehicles"].forEach((vehicle) => {
    // Create a temporary object to build the normalized data
    const tmp = {};

    // Basic vehicle info
    tmp["vin"] = vehicle["vin"];
    tmp["year"] = vehicle["year"];
    tmp["model"] = vehicle["model"];
    tmp["trimDesc"] = vehicle["trim"];

    // Color information
    tmp["exteriorColor"] = vehicle["exteriorcolor"] || "N/A";
    tmp["interiorColor"] = vehicle["interior"].split(",")[0] || "N/A";

    // Dealer information
    if (vehicle["location"]) {
      tmp["dealerName"] = titleCase(vehicle["location"]["name"]) || "N/A";
      tmp["distance"] = vehicle["location"]["distanceaway"]
        ? parseFloat(vehicle["location"]["distanceaway"]).toFixed(2)
        : "0.00";
    }

    // Pricing information (use optional chaining for recalled/unavailable vehicles)
    tmp["price"] = vehicle.pricing?.totalVehiclePrice?.price || "0";

    // Inventory status
    tmp["inTransit"] = vehicle["intransit"];

    tmp["drivetrainDesc"] = vehicle["drive"] || "N/A";

    // Set inventory status and delivery date
    if (vehicle["intransit"] === true) {
      tmp["deliveryDate"] = "In Transit";
      if (vehicle["estimatedDeliveryDate"]) {
        tmp["deliveryDate"] = `In Transit (Est: ${vehicle["estimatedDeliveryDate"]})`;
      }
    } else if (
      vehicle["inventoryStatus"] &&
      vehicle["inventoryStatus"]["description"]
    ) {
      tmp["deliveryDate"] = vehicle["inventoryStatus"]["description"];
    } else {
      tmp["deliveryDate"] = "Check With Dealer";
    }

    tmp["inventoryStatus"] = tmp["deliveryDate"];

    // Set dealer website URL if available (brandDomain can work as a fallback)
    if (vehicle["brandDomain"]) {
      tmp["dealerUrl"] = vehicle["brandDomain"].replace("https://", "");
    }

    // Create a clean object with only the required fields
    const cleanVehicle = {
      price: tmp["price"],
      inventoryStatus: tmp["inventoryStatus"],
      interiorColor: tmp["interiorColor"],
      exteriorColor: tmp["exteriorColor"],
      drivetrainDesc: tmp["drivetrainDesc"],
      deliveryDate: tmp["deliveryDate"],
      dealerName: tmp["dealerName"],

      // Keep additional fields that might be needed for display
      distance: tmp["distance"],
      dealerUrl: tmp["dealerUrl"],
      vin: tmp["vin"],
      year: tmp["year"],
      model: tmp["model"],
      trimDesc: tmp["trimDesc"],
    };

    res.push(cleanVehicle);
  });

  return res;
}

export async function getGMCVinDetail(vin, zip, manufacturer) {
  try {
    const vinData = await apiRequest("vin", manufacturer, [...arguments], {
      zip: zip,
      vin: vin,
    });

    const needsCurrencyConversion = ["destinationCharge", "msrp"];
    const vinFormattedData = {};

    // Basic vehicle data mappings
    Object.keys(vinData).forEach((vinKey) => {
      // Map GMC-specific keys to EVFinder-specific keys
      if (Object.keys(gmcVinMapping).includes(vinKey)) {
        vinFormattedData[gmcVinMapping[vinKey]] = vinData[vinKey];
      }

      // Need to format some values to display as dollars
      if (needsCurrencyConversion.includes(vinKey) && vinData[vinKey]) {
        vinFormattedData[gmcVinMapping[vinKey]] = convertToCurrency(vinData[vinKey]);
      }
    });

    // Extract Fuel Economy data and format into a single field
    if (vinData.fuelEconomy) {
      const fuelEcon = vinData.fuelEconomy;
      const cityValue = fuelEcon.city?.low || fuelEcon.city?.value || "N/A";
      const cityUnit = fuelEcon.city?.unit || "MPG";
      const hwyValue = fuelEcon.hwy?.low || fuelEcon.hwy?.value || "N/A";
      const hwyUnit = fuelEcon.hwy?.unit || "MPG";
      const combinedValue = fuelEcon.combined?.value || "N/A";
      const combinedUnit = fuelEcon.combined?.unit || "MPG";

      vinFormattedData["Fuel Economy"] =
        `City: ${cityValue} ${cityUnit}, Highway: ${hwyValue} ${hwyUnit}, Combined: ${combinedValue} ${combinedUnit}`;
    }

    // Extract vehicle-specific data
    if (vinData.vin) vinFormattedData["VIN"] = vinData.vin;
    if (vinData.condition) vinFormattedData["Condition"] = vinData.condition;
    if (vinData.intransit !== undefined)
      vinFormattedData["In Transit"] = vinData.intransit ? "Yes" : "No";
    if (vinData.inventoryStatus && vinData.inventoryStatus.description) {
      vinFormattedData["Inventory Status"] = vinData.inventoryStatus.description;
    }
    if (vinData.estimatedDeliveryDate)
      vinFormattedData["Estimated Delivery Date"] = vinData.estimatedDeliveryDate;
    if (vinData.salepending) vinFormattedData["Sale Pending"] = vinData.salepending;
    if (vinData.mmc) vinFormattedData["MMC"] = vinData.mmc;
    if (vinData.bodystyle) vinFormattedData["Body Style"] = vinData.bodystyle;
    if (vinData.boxtype) vinFormattedData["Box Type"] = vinData.boxtype;
    if (vinData.seatingcapacity)
      vinFormattedData["Seating Capacity"] = vinData.seatingcapacity;
    if (vinData.trim) vinFormattedData["Trim"] = vinData.trim;
    if (vinData.exteriorcolor)
      vinFormattedData["Exterior Color"] = vinData.exteriorcolor;
    if (vinData.interior) vinFormattedData["Interior"] = vinData.interior;
    if (vinData.odometer)
      vinFormattedData["Odometer"] =
        vinData.odometer +
        (vinData.odometerunits ? " " + vinData.odometerunits : " miles");

    // Add horsepower if available
    if (vinData.horsepower && vinData.horsepower.description) {
      vinFormattedData["Horsepower"] = vinData.horsepower.description;
    }

    // Process Math Box pricing data
    if (vinData.mathBox) {
      const mathBox = vinData.mathBox;
      if (mathBox.netprice && mathBox.netprice.price) {
        vinFormattedData["Net Price"] = convertToCurrency(mathBox.netprice.price);
      }

      if (mathBox.destinationcharge && mathBox.destinationcharge.price) {
        vinFormattedData["Destination Charge"] = convertToCurrency(
          mathBox.destinationcharge.price,
        );
      }

      if (mathBox.totalvehicleprice && mathBox.totalvehicleprice.price) {
        vinFormattedData["Total Vehicle Price"] = convertToCurrency(
          mathBox.totalvehicleprice.price,
        );
      }

      // Handle cash incentives if available
      if (mathBox.cashincentives && mathBox.cashincentives.length > 0) {
        const incentives = [];
        mathBox.cashincentives.forEach((incentive) => {
          if (incentive.label && incentive.price) {
            incentives.push(
              `${incentive.label}: ${convertToCurrency(Math.abs(incentive.price))}`,
            );
          }
        });
        if (incentives.length > 0) {
          vinFormattedData["Cash Incentives"] = incentives.join(", ");
        }
      }

      if (mathBox.standardvehicleprice && mathBox.standardvehicleprice.price) {
        vinFormattedData["Standard Vehicle Price"] = convertToCurrency(
          mathBox.standardvehicleprice.price,
        );
      }
    }

    // Process dealer installed accessories
    const dealerAccessory = [];
    if (vinData.dealerInstalledAccessories) {
      vinData.dealerInstalledAccessories.forEach((acc) => {
        dealerAccessory.push(
          `${acc.optionDescription}: ${convertToCurrency(acc.price)}`,
        );
      });
      vinFormattedData["Dealer Installed Accessories"] = dealerAccessory.join(",  ");
    }

    // Process highlighted features
    const highlightFeatures = [];
    if (vinData.highlightFeatures) {
      vinData.highlightFeatures.forEach((feat) => {
        highlightFeatures.push(`${feat.name}`);
      });
      vinFormattedData["Highlighted Features"] = highlightFeatures.join(",  ");
    }

    // Process Standard Equipment (by category)
    if (vinData.standardequipment && vinData.standardequipment.length > 0) {
      const equipmentByCategory = {};

      vinData.standardequipment.forEach((category) => {
        if (category.header && category.data && category.data.length > 0) {
          const categoryName = category.header;
          if (!equipmentByCategory[categoryName]) {
            equipmentByCategory[categoryName] = [];
          }

          category.data.forEach((item) => {
            if (item.displayTitle) {
              equipmentByCategory[categoryName].push(item.displayTitle);
            }
          });
        }
      });

      // Add each equipment category to formatted data
      Object.keys(equipmentByCategory).forEach((category) => {
        if (equipmentByCategory[category].length > 0) {
          vinFormattedData[`${titleCase(category)} Equipment`] =
            equipmentByCategory[category].join(", ");
        }
      });

      // Also add a combined list of all equipment
      const allEquipment = [];
      Object.values(equipmentByCategory).forEach((items) => {
        allEquipment.push(...items);
      });
    }

    // Process Standard Equipment Ordered
    if (
      vinData.standardequipmentordered &&
      vinData.standardequipmentordered.length > 0
    ) {
      const orderedEquipment = [];

      vinData.standardequipmentordered.forEach((item) => {
        if (item.displayTitle) {
          orderedEquipment.push(item.displayTitle);
        }
      });

      if (orderedEquipment.length > 0) {
        vinFormattedData["Standard Equipment Ordered"] = orderedEquipment.join(", ");
      }
    }

    // Process specifications
    const specTmp = {};
    if (vinData.specifications) {
      vinData.specifications.forEach((spec) => {
        const specType = spec.salesFamily;
        if (!specTmp[specType]) {
          specTmp[specType] = [];
        }
        specTmp[specType].push(
          spec?.optionDescription != "" ? spec?.optionDescription : "N/A",
        );
      });

      Object.keys(specTmp).forEach((specKey) => {
        vinFormattedData[`${specKey} Specs`] = specTmp[specKey].join(", ");
      });
    }

    return vinFormattedData;
  } catch (error) {
    throw generateErrorMessage(error);
  }
}
