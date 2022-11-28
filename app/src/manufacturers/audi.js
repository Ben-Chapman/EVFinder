import { stripHTML, titleCase } from "../helpers/libs";
import { audiInventoryMapping, audiVinMapping } from "./audiMappings";

const apiBase = "https://api.theevfinder.com";

export async function getAudiInventory(zip, year, model, radius) {
  const geo = await getGeoFromZipcode(zip);

  const inventory = await fetch(
    apiBase +
      "/api/inventory/audi?" +
      new URLSearchParams({
        geo: geo,
        year: year,
        model: model,
        radius: radius,
      }),
    { method: "GET", mode: "cors" }
  );

  if (inventory.ok) {
    return formatAudiInventoryResults(await inventory.json());
  } else {
    return ["ERROR", inventory.status, await inventory.text()];
  }
}

export async function getAudiVinDetail(vehicleId) {
  const vinData = await fetch(
    apiBase +
      "/api/vin/audi?" +
      new URLSearchParams({
        vehicleId: vehicleId,
      }),
    { method: "GET", mode: "cors" }
  );

  if (vinData.ok) {
    return formatAudiVinResults(await vinData.json());
  } else {
    return ["ERROR", vinData.status, vinData.text];
  }
}

async function getGeoFromZipcode(zip) {
  const osmApi = "https://nominatim.openstreetmap.org/search?";

  const geo = await fetch(
    osmApi + new URLSearchParams({ postalcode: zip, country: "US", format: "json" }),
    { method: "GET", mode: "cors" }
  );

  if (geo.ok) {
    const mapData = await geo.json();

    // The Audi API expects the lat/long to be provided as latitude_longitude
    return `${mapData[0].lat}_${mapData[0].lon}`;
  } else {
    return ["ERROR", geo.status, geo.text];
  }
}

function formatAudiInventoryResults(input) {
  const res = [];

  input.data?.getFilteredVehiclesForWormwood?.vehicles?.forEach((vehicle) => {
    var tmp = {};
    Object.keys(vehicle).forEach((key) => {
      Object.keys(audiInventoryMapping).includes(key)
        ? (tmp[audiInventoryMapping[key]] = vehicle[key])
        : null;
    });

    // The Audi MSRP is provided as $12,345.00. Stripping the cents, and removing non-digits
    tmp["price"] = tmp["price"].split(".")[0].replace(/\D/g, "");

    /**
     * Vehicles in transit have more specific availability data in 'vehicleOrderStatus'.
     * Vehicles in stock at the dealer only have availability info in `vehicleInventoryType
     * So dealing with that here
     */
    //
    vehicle["vehicleOrderStatus"] === null
      ? (tmp["deliveryDate"] = titleCase(
          vehicle["vehicleInventoryType"].replace("-", " ")
        ))
      : null;

    // Populating the Availability filter
    tmp["inventoryStatus"] = tmp["deliveryDate"];

    res.push({ ...tmp, ...vehicle });
  });

  return res;
}

function formatAudiVinResults(input) {
  const vinFormattedData = {};
  const vinData = input.data.getVehicleInfoForWormwood;

  // Replace Audi JSON keys with EV Finder JSON keys
  Object.keys(vinData).forEach((vinKey) => {
    Object.keys(audiVinMapping).includes(vinKey)
      ? (vinFormattedData[audiVinMapping[vinKey]] = vinData[vinKey])
      : null;
  });

  // The dealer note is provided as raw HTML. Stripping the HTML to display plain text
  vinFormattedData["Dealer Note"] = stripHTML(vinFormattedData["Dealer Note"]);

  // It appears for new vehicles, 'vehicleMilage' is null. Replacing with something descriptive
  if (vinFormattedData["Vehicle Mileage"] === null) {
    vinFormattedData["Vehicle Mileage"] = "N/A";
  }

  // Adjust
  vinFormattedData["Market"] = vinFormattedData["Market"].toUpperCase();

  // Titlecase Vehicle Type
  vinFormattedData["Vehicle Type"] = titleCase(vinFormattedData["Vehicle Type"]);

  // Building the technical specification and equipments data
  // vinFormattedData["Technical Specifications"] = "";
  let techSpecs = [];
  Object.keys(input.data.getVehicleInfoForWormwood.technicalSpecifications).forEach(
    (key) => {
      let value = input.data.getVehicleInfoForWormwood.technicalSpecifications[key];
      if (value === null) value = "N/A";

      // excluding this metadata-related key
      if (key != "__typename") {
        techSpecs.push(`${titleCase(key)}: ${value}`);
      }
      vinFormattedData["Technical Specifications"] = techSpecs.join(",  ");
    }
  );

  /**
   * Audi provide two types of equipment data, standard and optional with slightly
   * different data structures, hence the nested logic here to deal with that.
   */
  Object.keys(input.data.getVehicleInfoForWormwood.equipments).forEach(
    (equipmentType) => {
      if (equipmentType != "__typename") {
        let equipment = [];
        // Optional equipment
        if (equipmentType == "optionalEquipments") {
          input.data.getVehicleInfoForWormwood.equipments[equipmentType].forEach(
            (e) => {
              equipment.push(e["headline"]);
            }
          );
        }
        // Standard equipment
        else if (equipmentType == "standardEquipments") {
          Object.keys(
            input.data.getVehicleInfoForWormwood.equipments[equipmentType]
          ).forEach((e) => {
            if (
              e != "__typename" &&
              input.data.getVehicleInfoForWormwood.equipments[equipmentType][e] !==
                null &&
              input.data.getVehicleInfoForWormwood.equipments[equipmentType][e].length >
                0
            ) {
              Object.keys(
                input.data.getVehicleInfoForWormwood.equipments[equipmentType][e]
              ).forEach((key) => {
                const value =
                  input.data.getVehicleInfoForWormwood.equipments[equipmentType][e][
                    key
                  ];
                equipment.push(value["headline"]);
              });
            }
          });
        }
        if (equipment.length > 0) {
          vinFormattedData[titleCase(equipmentType)] = equipment.join(",  ");
        }
      }
    }
  );
  return vinFormattedData;
}
