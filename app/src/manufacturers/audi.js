import { titleCase } from "../helpers/libs"
import { audiInventoryMapping } from "./audiMappings"

const apiBase = 'https://api.theevfinder.com'

export async function getAudiInventory(zip, year, model, radius) {
  const geo = await getGeoFromZipcode(zip)

  const inventory = await fetch(apiBase + '/api/inventory/audi?' + new URLSearchParams({
    geo: geo,
    year: year,
    model: model,
    radius: radius,
  }),
    { method: 'GET', mode: 'cors', })

  if (inventory.ok) {
    return formatAudiInventoryResults(await inventory.json())
  } else {
    return ['ERROR', inventory.status, await inventory.text()]
  }
}


async function getGeoFromZipcode(zip) {
  const osmApi = "https://nominatim.openstreetmap.org/search?"

  const geo = await fetch(osmApi + new URLSearchParams({ postalcode: zip, country: "US", format: "json" }),
    { method: 'GET', mode: 'cors', })


  if (geo.ok) {
    const mapData = await geo.json()

    // The Audi API expects the lat/long to be provided as latitude_longitude
    return `${mapData[0].lat}_${mapData[0].lon}`
  } else {
    return ['ERROR', geo.status, geo.text]
  }
}

function formatAudiInventoryResults(input) {
  const res = []

  input.data?.getFilteredVehiclesForWormwood?.vehicles?.forEach(vehicle => {
    var tmp = {}
    Object.keys(vehicle).forEach(key => {
      Object.keys(audiInventoryMapping).includes(key)
        ? tmp[audiInventoryMapping[key]] = vehicle[key]
        : null
    })

    // The Audi MSRP is provided as $12,345.00. Stripping the cents, and removing non-digits
    tmp['price'] = tmp['price'].split('.')[0].replace(/\D/g, '')

    /**
     * Vehicles in transit have more specific availability data in 'vehicleOrderStatus'.
     * Vehicles in stock at the dealer only have availability info in `vehicleInventoryType
     * So dealing with that here
     */
    //
    vehicle['vehicleOrderStatus'] === null
      ? tmp['deliveryDate'] = titleCase(vehicle['vehicleInventoryType'].replace('-', ' '))
      : null

    // Populating the Availability filter
    tmp['inventoryStatus'] = tmp['deliveryDate']

    res.push({ ...tmp, ...vehicle })
  })

  return res
}
