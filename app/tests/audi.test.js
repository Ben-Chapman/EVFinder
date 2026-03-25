import {
  formatAudiInventoryResults,
  formatAudiVinResults,
} from "../src/manufacturers/audi";

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

const makeVinStockCar = (overrides = {}) => ({
  id: "vin-test-id",
  vin: "WAUJ8BFW5S7901084",
  titleText: "2025 Audi e-tron GT",
  subtitleText: "Premium Plus",
  cartypeText: "Sedan",
  model: { id: { year: 2025, code: "FW" }, name: "e-tron GT" },
  modelInfo: { modelyear: 2025, genericModel: { code: "FW", text: "e-tron GT" } },
  dealer: { id: "dealer-001", name: "Audi Beverly Hills" },
  descriptionByDealer: "<p>Great car!</p>",
  colorInfo: {
    exteriorColor: {
      colorInfo: { text: "Kemora Gray Metallic", code: "GY" },
      baseColorInfo: { text: "Gray", code: "GY" },
    },
    interiorColor: {
      colorInfo: { text: "Black", code: "BK" },
      baseColorInfo: { text: "Black", code: "BK" },
    },
  },
  salesInfo: { availableFromDateInfo: { value: "2025-01-15" } },
  engineInfo: { fuel: { text: "Electric" } },
  techDataGroups: [
    {
      id: "performance",
      label: "Performance",
      techDataList: [
        { id: "topSpeed", text: "152 mph", label: "Top Speed" },
        { id: "acceleration", text: "3.1 sec", label: "0-60 mph" },
      ],
    },
  ],
  manufacturerSpecificItems: {
    cdbCategories: [
      {
        id: "comfort",
        label: "Comfort & Convenience",
        categories: [
          {
            id: "seats",
            label: "Seats",
            features: [{ text: "Heated Front Seats", featureType: "standard" }],
          },
        ],
      },
    ],
  },
  ...overrides,
});

const makeVinResponse = (stockCar) => ({
  data: {
    stockCarSearch: {
      resultNumber: 1,
      results: { cars: [{ stockCar }] },
    },
  },
});

describe("formatAudiVinResults", () => {
  describe("basic field extraction", () => {
    let result;
    beforeEach(() => {
      result = formatAudiVinResults(makeVinResponse(makeVinStockCar()));
    });

    test("extracts Model Name from titleText", () => {
      expect(result["Model Name"]).toBe("2025 Audi e-tron GT");
    });

    test("extracts Trim Name from subtitleText", () => {
      expect(result["Trim Name"]).toBe("Premium Plus");
    });

    test("extracts Model Year from modelInfo", () => {
      expect(result["Model Year"]).toBe(2025);
    });

    test("extracts Body Type from cartypeText", () => {
      expect(result["Body Type"]).toBe("Sedan");
    });

    test("extracts Dealer Name from nested dealer object", () => {
      expect(result["Dealer Name"]).toBe("Audi Beverly Hills");
    });

    test("strips HTML from Dealer Note", () => {
      expect(result["Dealer Note"]).toBe("Great car!");
    });

    test("extracts Exterior Color from colorInfo", () => {
      expect(result["Exterior Color"]).toBe("Kemora Gray Metallic");
    });

    test("extracts Interior Color from colorInfo", () => {
      expect(result["Interior Color"]).toBe("Black");
    });

    test("extracts Fuel Type from engineInfo", () => {
      expect(result["Fuel Type"]).toBe("Electric");
    });

    test("sets Vehicle Mileage to N/A for new vehicles", () => {
      expect(result["Vehicle Mileage"]).toBe("N/A");
    });
  });

  describe("technical specifications", () => {
    test("builds Technical Specifications from techDataGroups", () => {
      const result = formatAudiVinResults(makeVinResponse(makeVinStockCar()));
      expect(result["Technical Specifications"]).toContain("Top Speed: 152 mph");
      expect(result["Technical Specifications"]).toContain("0-60 mph: 3.1 sec");
    });

    test("handles empty techDataGroups gracefully", () => {
      const car = makeVinStockCar({ techDataGroups: [] });
      const result = formatAudiVinResults(makeVinResponse(car));
      expect(result["Technical Specifications"]).toBeUndefined();
    });

    test("skips tech data entries with no text value", () => {
      const car = makeVinStockCar({
        techDataGroups: [
          {
            id: "group",
            label: "Group",
            techDataList: [
              { id: "empty", text: null, label: "Empty Field" },
              { id: "filled", text: "100 kW", label: "Power" },
            ],
          },
        ],
      });
      const result = formatAudiVinResults(makeVinResponse(car));
      expect(result["Technical Specifications"]).toBe("Power: 100 kW");
    });
  });

  describe("equipment sections", () => {
    test("builds equipment section from cdbCategories", () => {
      const result = formatAudiVinResults(makeVinResponse(makeVinStockCar()));
      expect(result["Comfort & Convenience"]).toContain("Heated Front Seats");
    });

    test("handles missing manufacturerSpecificItems gracefully", () => {
      const car = makeVinStockCar({ manufacturerSpecificItems: null });
      expect(() => formatAudiVinResults(makeVinResponse(car))).not.toThrow();
    });

    test("skips empty equipment categories", () => {
      const car = makeVinStockCar({
        manufacturerSpecificItems: {
          cdbCategories: [{ id: "empty", label: "Empty Section", categories: [] }],
        },
      });
      const result = formatAudiVinResults(makeVinResponse(car));
      expect(result["Empty Section"]).toBeUndefined();
    });
  });

  describe("null safety", () => {
    test("returns empty object when no cars in response", () => {
      const input = {
        data: { stockCarSearch: { resultNumber: 0, results: { cars: [] } } },
      };
      expect(formatAudiVinResults(input)).toEqual({});
    });

    test("handles null descriptionByDealer", () => {
      const car = makeVinStockCar({ descriptionByDealer: null });
      const result = formatAudiVinResults(makeVinResponse(car));
      expect(result["Dealer Note"]).toBe("");
    });
  });
});
