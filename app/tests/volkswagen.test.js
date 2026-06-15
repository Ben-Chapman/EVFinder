import { formatVolkswagenInventoryResults } from "../src/manufacturers/volkswagen";

const makeCar = (overrides = {}) => ({
  vin: "1V2CRPE89TC001353",
  carid: "USA22507VW260498",
  title: "2026 Volkswagen ID.4 Pro",
  subtitle: { value: "Pro" },
  model: { value: "Volkswagen ID.4" },
  modelyear: { value: "2026" },
  salesModelYear: { value: "2026" },
  color: { in: [], out: { code: "08", value: "Pure Gray" } },
  drive: { value: "Rear-wheel drive" },
  parsedPrice: { value: 47004 },
  deliveryInfo: { value: "NEW in stock" },
  availableFrom: "Immediately",
  businessModel: "dealer_stock",
  powerLabel: " (282 HP)",
  buildMyDealLinks: {
    onlineSalesUrl: "https://dealer.example.com/inventory/id4-1V2CRPE89TC001353/",
    dealerDeepLink: "https://express.example.com/express/1V2CRPE89TC001353",
  },
  dealer: {
    name: "Galpin VW of San Fernando Valley",
    city: "North Hills",
    region: "CA",
    zip: "91343",
    phone: "8188953800",
  },
  distance: 12.34,
  ...overrides,
});

describe("formatVolkswagenInventoryResults", () => {
  describe("data path navigation", () => {
    test("returns empty array for an empty (no-inventory) response", () => {
      expect(formatVolkswagenInventoryResults({})).toEqual([]);
    });

    test("returns empty array when cars list is empty", () => {
      expect(formatVolkswagenInventoryResults({ cars: [] })).toEqual([]);
    });
  });

  describe("field extraction", () => {
    let result;
    beforeEach(() => {
      result = formatVolkswagenInventoryResults({ cars: [makeCar()] })[0];
    });

    test("extracts vin", () => {
      expect(result.vin).toBe("1V2CRPE89TC001353");
    });

    test("extracts model and modelYear", () => {
      expect(result.model).toBe("Volkswagen ID.4");
      expect(result.modelYear).toBe("2026");
    });

    test("derives trimDesc from the title", () => {
      expect(result.trimDesc).toBe("Pro");
    });

    test("extracts exteriorColor, title-cased", () => {
      expect(result.exteriorColor).toBe("Pure Gray");
    });

    test("extracts price as a number", () => {
      expect(result.price).toBe(47004);
    });

    test("passes through the backend-computed distance", () => {
      expect(result.distance).toBe(12.34);
    });

    test("extracts the per-vehicle online sales URL", () => {
      expect(result.onlineSalesURL).toBe(
        "https://dealer.example.com/inventory/id4-1V2CRPE89TC001353/",
      );
    });
  });

  describe("trim derivation", () => {
    test("derives the trim from the title for ID. Buzz, ignoring the verbose subtitle", () => {
      const car = makeCar({
        title: "2025 Volkswagen ID. Buzz Pro S",
        model: { value: "Volkswagen ID. Buzz" },
        modelyear: { value: "2025" },
        subtitle: {
          value:
            "ID. Buzz Pro long wheelbase 210 kW (286 PS), rear-wheel drive, " +
            "1-speed automatic transm., wheelbase 3 239 mm",
        },
      });
      const result = formatVolkswagenInventoryResults({ cars: [car] })[0];
      expect(result.trimDesc).toBe("Pro S");
    });

    test("falls back to the subtitle when the title is not in the expected form", () => {
      const car = makeCar({
        title: "Some Unexpected Title",
        subtitle: { value: "Pro" },
      });
      const result = formatVolkswagenInventoryResults({ cars: [car] })[0];
      expect(result.trimDesc).toBe("Pro");
    });
  });

  describe("interior color", () => {
    test("defaults to N/A when the inventory feed omits it", () => {
      const result = formatVolkswagenInventoryResults({ cars: [makeCar()] })[0];
      expect(result.interiorColor).toBe("N/A");
    });

    test("uses the interior color when present, title-cased", () => {
      const car = makeCar({
        color: { in: [{ value: "GALAXY BLACK" }], out: { value: "Pure Gray" } },
      });
      const result = formatVolkswagenInventoryResults({ cars: [car] })[0];
      expect(result.interiorColor).toBe("Galaxy Black");
    });
  });

  describe("drivetrain derivation", () => {
    test.each([
      ["Rear-wheel drive", "RWD"],
      ["All-Wheel Drive", "AWD"],
      ["Front-wheel drive", "FWD"],
    ])("maps drive '%s' to '%s'", (driveValue, expected) => {
      const car = makeCar({ drive: { value: driveValue } });
      const result = formatVolkswagenInventoryResults({ cars: [car] })[0];
      expect(result.drivetrainDesc).toBe(expected);
    });

    test("falls back to the raw drive string when unrecognized", () => {
      const car = makeCar({ drive: { value: "4MOTION" } });
      const result = formatVolkswagenInventoryResults({ cars: [car] })[0];
      expect(result.drivetrainDesc).toBe("4MOTION");
    });
  });

  describe("availability and inventory status", () => {
    test("dealer stock maps to In Stock with availableFrom as the delivery date", () => {
      const result = formatVolkswagenInventoryResults({ cars: [makeCar()] })[0];
      expect(result.inventoryStatus).toBe("In Stock");
      expect(result.deliveryDate).toBe("Immediately");
    });

    test("a non-dealer-stock business model is title-cased into the status", () => {
      const car = makeCar({ businessModel: "in_transit", availableFrom: null });
      const result = formatVolkswagenInventoryResults({ cars: [car] })[0];
      expect(result.inventoryStatus).toBe("In Transit");
      expect(result.deliveryDate).toBe("In Transit");
    });
  });
});
