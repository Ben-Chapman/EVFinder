import { formatAudiInventoryResults } from "../src/manufacturers/audi";

const makeCar = (overrides = {}) => ({
  geoDistance: {
    unitText: "mi",
    value: { formatted: "12.5", number: 12.5 },
  },
  stockCar: {
    id: "test-id-123",
    vin: "WAUZZZ4MXND123456",
    titleText: "2026 Audi Q4 e-tron",
    model: { name: "Q4 e-tron", salesModelyear: 2026 },
    dealer: { id: "dealer-001", name: "Audi Beverly Hills", region: "West" },
    carPrices: [
      {
        label: "MSRP",
        price: { value: 48900, valueAsText: "$48,900", formattedValue: "$48,900.00" },
        type: "MSRP",
      },
    ],
    salesInfo: {
      availableFromDateInfo: { type: "DATE", value: "2026-03-01" },
      orderStatusText: "In Transit",
      saleOrderTypeText: "Dealer Order",
    },
    subtitleText: "Premium Plus",
    colorInfo: {
      exteriorColor: {
        colorInfo: { text: "Mythos Black Metallic" },
        baseColorInfo: { code: "MB", text: "Black" },
      },
      interiorColor: {
        colorInfo: { text: "Black" },
        baseColorInfo: { code: "BK", text: "Black" },
      },
    },
    driveText: "quattro®",
    gearText: "Automatic",
  },
  ...overrides,
});

const makeResponse = (cars) => ({
  data: { stockCarSearch: { resultNumber: cars.length, results: { cars } } },
});

describe("formatAudiInventoryResults", () => {
  describe("data path navigation", () => {
    test("returns empty array for empty cars list", () => {
      expect(formatAudiInventoryResults(makeResponse([]), 2026)).toEqual([]);
    });

    test("returns empty array when stockCarSearch is missing", () => {
      expect(formatAudiInventoryResults({ data: {} }, 2026)).toEqual([]);
    });

    test("returns empty array when results are missing", () => {
      const input = { data: { stockCarSearch: { resultNumber: 0 } } };
      expect(formatAudiInventoryResults(input, 2026)).toEqual([]);
    });
  });

  describe("year filtering", () => {
    test("includes vehicles matching the requested model year", () => {
      const result = formatAudiInventoryResults(makeResponse([makeCar()]), 2026);
      expect(result).toHaveLength(1);
    });

    test("excludes vehicles not matching the requested model year", () => {
      const result = formatAudiInventoryResults(makeResponse([makeCar()]), 2025);
      expect(result).toHaveLength(0);
    });

    test("filters correctly when multiple years are present", () => {
      const car2026 = makeCar();
      const car2025 = makeCar({
        stockCar: {
          ...makeCar().stockCar,
          model: { name: "Q4 e-tron", salesModelyear: 2025 },
          titleText: "2025 Audi Q4 e-tron",
        },
      });
      const result = formatAudiInventoryResults(makeResponse([car2026, car2025]), 2026);
      expect(result).toHaveLength(1);
      expect(result[0].vin).toBe("WAUZZZ4MXND123456");
    });
  });

  describe("field extraction", () => {
    let result;
    beforeEach(() => {
      result = formatAudiInventoryResults(makeResponse([makeCar()]), 2026)[0];
    });

    test("extracts distance from geoDistance", () => {
      expect(result.distance).toBe(12.5);
    });

    test("extracts drivetrainDesc from driveText", () => {
      expect(result.drivetrainDesc).toBe("quattro®");
    });

    test("extracts trimDesc from subtitleText", () => {
      expect(result.trimDesc).toBe("Premium Plus");
    });

    test("extracts dealerName from nested dealer object", () => {
      expect(result.dealerName).toBe("Audi Beverly Hills");
    });

    test("extracts vin from stockCar", () => {
      expect(result.vin).toBe("WAUZZZ4MXND123456");
    });

    test("extracts id from stockCar", () => {
      expect(result.id).toBe("test-id-123");
    });

    test("extracts exteriorColor from colorInfo", () => {
      expect(result.exteriorColor).toBe("Mythos Black Metallic");
    });

    test("extracts interiorColor from colorInfo", () => {
      expect(result.interiorColor).toBe("Black");
    });
  });

  describe("price extraction", () => {
    test("extracts MSRP price as a number", () => {
      const result = formatAudiInventoryResults(makeResponse([makeCar()]), 2026)[0];
      expect(result.price).toBe(48900);
    });

    test("returns 0 when carPrices is empty", () => {
      const car = makeCar({
        stockCar: { ...makeCar().stockCar, carPrices: [] },
      });
      const result = formatAudiInventoryResults(makeResponse([car]), 2026)[0];
      expect(result.price).toBe(0);
    });

    test("returns 0 when no MSRP entry exists in carPrices", () => {
      const car = makeCar({
        stockCar: {
          ...makeCar().stockCar,
          carPrices: [{ label: "Other", price: { value: 500 }, type: "DESTINATION" }],
        },
      });
      const result = formatAudiInventoryResults(makeResponse([car]), 2026)[0];
      expect(result.price).toBe(0);
    });
  });

  describe("vehicleDesc extraction", () => {
    test("strips year and Audi brand from titleText", () => {
      const result = formatAudiInventoryResults(makeResponse([makeCar()]), 2026)[0];
      expect(result.vehicleDesc).toBe("Q4 e-tron");
    });

    test("strips year and Audi brand from e-tron GT titleText", () => {
      const car = makeCar({
        stockCar: {
          ...makeCar().stockCar,
          titleText: "2026 Audi e-tron GT",
          model: { name: "e-tron GT", salesModelyear: 2026 },
        },
      });
      const result = formatAudiInventoryResults(makeResponse([car]), 2026)[0];
      expect(result.vehicleDesc).toBe("e-tron GT");
    });
  });

  describe("deliveryDate and inventoryStatus", () => {
    test("uses orderStatusText when present", () => {
      const result = formatAudiInventoryResults(makeResponse([makeCar()]), 2026)[0];
      expect(result.deliveryDate).toBe("In Transit");
      expect(result.inventoryStatus).toBe("In Transit");
    });

    test("falls back to saleOrderTypeText when orderStatusText is null", () => {
      const car = makeCar({
        stockCar: {
          ...makeCar().stockCar,
          salesInfo: {
            orderStatusText: null,
            saleOrderTypeText: "dealer-stock",
          },
        },
      });
      const result = formatAudiInventoryResults(makeResponse([car]), 2026)[0];
      expect(result.deliveryDate).toBe("Dealer Stock");
      expect(result.inventoryStatus).toBe("Dealer Stock");
    });

    test("falls back to saleOrderTypeText when orderStatusText is empty string", () => {
      const car = makeCar({
        stockCar: {
          ...makeCar().stockCar,
          salesInfo: { orderStatusText: "", saleOrderTypeText: "In Stock" },
        },
      });
      const result = formatAudiInventoryResults(makeResponse([car]), 2026)[0];
      expect(result.deliveryDate).toBe("In Stock");
    });
  });
});
