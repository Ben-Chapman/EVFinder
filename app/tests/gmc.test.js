import { formatGMCInventoryResults } from "../src/manufacturers/gmc";
import { gmcInteriorByTrim } from "../src/manufacturers/gmcMappings";

// Image URL with GBA (Onyx Black) paint code embedded
const IMAGE_URL_GBA =
  "https://cgi.gmc.com/mmgprod-us/dynres/prove/image.gen?i=2026/TT35743/TT35743__3VL/GBA_0ST_1NF.jpg";
// Image URL with GAI (Deep Ocean Metallic) paint code
const IMAGE_URL_GAI =
  "https://cgi.gmc.com/mmgprod-us/dynres/prove/image.gen?i=2026/TT35843/TT35843__3SB/GAI_0ST_1NF.jpg";

const makeFacets = (exteriorEntries = []) => ({
  data: {
    exteriorColor: exteriorEntries,
    interiorColor: [],
  },
});

const DEFAULT_FACETS = makeFacets([
  { displayValue: "Onyx Black", values: ["GBA"] },
  { displayValue: "Deep Ocean Metallic", values: ["GAI"] },
  { displayValue: "Summit White", values: ["GAZ"] },
]);

const makeVehicle = (overrides = {}) => ({
  id: "1GT4EADD1TU603414",
  make: "GMC",
  model: "HUMMER EV Pickup",
  year: "2026",
  driveType: "4WD",
  fuelType: "Electric Fuel System",
  baseExteriorColor: "Black",
  images: [{ url: IMAGE_URL_GBA }],
  variant: {
    code: "TT35743_3VL",
    name: "2X",
    chromeStyleId: "476097",
  },
  stockDetails: {
    type: "DealerStock",
    stockNumber: "TU603414",
    condition: "NEW",
  },
  dealer: {
    name: "SANTA MONICA GMC",
    postalCode: "904041906",
    distance: { unit: "MILES", value: 6 },
    bac: "327134",
  },
  pricing: {
    cash: {
      msrp: { value: "99590.0", prefix: "$" },
      netPrice: { value: "95606.0", prefix: "$" },
    },
  },
  status: { deleted: false, value: "Available Now" },
  bodyStyle: "Crew Cab",
  vehicleType: "Truck",
  boxType: "Short Box",
  ...overrides,
});

const makeResponse = (vehicles, facets = DEFAULT_FACETS) => ({
  data: { hits: vehicles, count: vehicles.length },
  facets,
});

describe("formatGMCInventoryResults", () => {
  describe("field extraction", () => {
    let result;
    beforeEach(() => {
      result = formatGMCInventoryResults(makeResponse([makeVehicle()]))[0];
    });

    test("extracts vin from id", () => {
      expect(result.vin).toBe("1GT4EADD1TU603414");
    });

    test("extracts year", () => {
      expect(result.year).toBe("2026");
    });

    test("extracts model", () => {
      expect(result.model).toBe("HUMMER EV Pickup");
    });

    test("extracts trimDesc from variant name", () => {
      expect(result.trimDesc).toBe("2X");
    });

    test("resolves full exterior color name from paint code in image URL", () => {
      expect(result.exteriorColor).toBe("Onyx Black");
    });

    test("resolves interiorColor from variant name via trim map", () => {
      expect(result.interiorColor).toBe("Granite Drift");
    });

    test("extracts price from pricing.cash.msrp.value", () => {
      expect(result.price).toBe("99590.0");
    });

    test("extracts drivetrainDesc from driveType", () => {
      expect(result.drivetrainDesc).toBe("4WD");
    });

    test("title-cases the dealer name (preserving GMC acronym)", () => {
      expect(result.dealerName).toBe("Santa Monica GMC");
    });

    test("extracts distance to 2 decimal places", () => {
      expect(result.distance).toBe("6.00");
    });
  });

  describe("exterior color resolution", () => {
    test("resolves GAI to Deep Ocean Metallic", () => {
      const vehicle = makeVehicle({
        baseExteriorColor: "Blue",
        images: [{ url: IMAGE_URL_GAI }],
      });
      const result = formatGMCInventoryResults(makeResponse([vehicle]))[0];
      expect(result.exteriorColor).toBe("Deep Ocean Metallic");
    });

    test("falls back to baseExteriorColor when paint code is not in facets map", () => {
      const vehicle = makeVehicle({
        baseExteriorColor: "Gray",
        images: [{ url: "https://cgi.gmc.com/.../GXX_0ST.jpg" }],
      });
      const result = formatGMCInventoryResults(
        makeResponse([vehicle], makeFacets([])),
      )[0];
      expect(result.exteriorColor).toBe("Gray");
    });

    test("falls back to baseExteriorColor when images array is missing", () => {
      const vehicle = makeVehicle({ baseExteriorColor: "White", images: undefined });
      const result = formatGMCInventoryResults(makeResponse([vehicle]))[0];
      expect(result.exteriorColor).toBe("White");
    });

    test("falls back to N/A when both image and baseExteriorColor are missing", () => {
      const vehicle = makeVehicle({ baseExteriorColor: undefined, images: undefined });
      const result = formatGMCInventoryResults(makeResponse([vehicle]))[0];
      expect(result.exteriorColor).toBe("N/A");
    });

    test("uses facets from response, not a hardcoded map", () => {
      const customFacets = makeFacets([
        { displayValue: "Custom Test Color", values: ["GBA"] },
      ]);
      const result = formatGMCInventoryResults(
        makeResponse([makeVehicle()], customFacets),
      )[0];
      expect(result.exteriorColor).toBe("Custom Test Color");
    });

    test("handles missing facets gracefully", () => {
      const response = { data: { hits: [makeVehicle()], count: 1 } };
      const result = formatGMCInventoryResults(response)[0];
      expect(result.exteriorColor).toBe("Black");
    });
  });

  describe("interior color resolution", () => {
    test("resolves each known trim to its interior", () => {
      const cases = [
        ["Elevation Standard Range", "After Dark (Black)"],
        ["Elevation Extended Range", "After Dark (Black)"],
        ["AT4 Extended Range", "Forest Storm"],
        ["AT4 Max Range", "Forest Storm"],
        ["Denali Max Range", "Desert Dune"],
        ["2X", "Granite Drift"],
        ["3X", "Lunar Horizon (Jet Black/Light Grey)"],
      ];
      for (const [trimName, expectedInterior] of cases) {
        const vehicle = makeVehicle({ variant: { name: trimName } });
        const result = formatGMCInventoryResults(makeResponse([vehicle]))[0];
        expect(result.interiorColor).toBe(expectedInterior);
      }
    });

    test("covers all trims defined in gmcInteriorByTrim", () => {
      for (const [trimName, fullInterior] of Object.entries(gmcInteriorByTrim)) {
        const vehicle = makeVehicle({ variant: { name: trimName } });
        const result = formatGMCInventoryResults(makeResponse([vehicle]))[0];
        expect(result.interiorColor).toBe(fullInterior.split(",")[0]);
      }
    });

    test("falls back to N/A for an unrecognized trim", () => {
      const vehicle = makeVehicle({ variant: { name: "Unknown Future Trim" } });
      const result = formatGMCInventoryResults(makeResponse([vehicle]))[0];
      expect(result.interiorColor).toBe("N/A");
    });

    test("falls back to N/A when variant is missing", () => {
      const vehicle = makeVehicle({ variant: undefined });
      const result = formatGMCInventoryResults(makeResponse([vehicle]))[0];
      expect(result.interiorColor).toBe("N/A");
    });
  });

  describe("inventory status", () => {
    test("uses status.value as deliveryDate for available vehicles", () => {
      const result = formatGMCInventoryResults(makeResponse([makeVehicle()]))[0];
      expect(result.deliveryDate).toBe("Available Now");
      expect(result.inventoryStatus).toBe("Available Now");
    });

    test("marks in-transit vehicles from status.value", () => {
      const vehicle = makeVehicle({
        stockDetails: { type: "InTransit", stockNumber: "TU603414", condition: "NEW" },
        status: { deleted: false, value: "In Transit" },
      });
      const result = formatGMCInventoryResults(makeResponse([vehicle]))[0];
      expect(result.deliveryDate).toBe("In Transit");
    });

    test("falls back to Check With Dealer when status is missing", () => {
      const vehicle = makeVehicle({ status: undefined });
      const result = formatGMCInventoryResults(makeResponse([vehicle]))[0];
      expect(result.deliveryDate).toBe("Check With Dealer");
    });
  });

  describe("missing / null fields", () => {
    test("falls back to N/A when driveType is missing", () => {
      const vehicle = makeVehicle({ driveType: undefined });
      const result = formatGMCInventoryResults(makeResponse([vehicle]))[0];
      expect(result.drivetrainDesc).toBe("N/A");
    });

    test("falls back to N/A when variant is missing", () => {
      const vehicle = makeVehicle({ variant: undefined });
      const result = formatGMCInventoryResults(makeResponse([vehicle]))[0];
      expect(result.trimDesc).toBe("N/A");
    });

    test("falls back to 0 price when pricing is missing", () => {
      const vehicle = makeVehicle({ pricing: undefined });
      const result = formatGMCInventoryResults(makeResponse([vehicle]))[0];
      expect(result.price).toBe("0");
    });

    test("returns distance of 0.00 when dealer distance is missing", () => {
      const vehicle = makeVehicle({
        dealer: { ...makeVehicle().dealer, distance: undefined },
      });
      const result = formatGMCInventoryResults(makeResponse([vehicle]))[0];
      expect(result.distance).toBe("0.00");
    });

    test("handles empty hits array", () => {
      const result = formatGMCInventoryResults(makeResponse([]));
      expect(result).toEqual([]);
    });
  });
});
