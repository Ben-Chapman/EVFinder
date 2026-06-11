import { formatGenesisInventoryResults } from "../src/manufacturers/genesis";

// A single vehicle record shaped like the EV Finder API's slimmed Genesis v2 search
// item (flat, no "Veh" wrapper).
const makeVehicle = (overrides = {}) => ({
  VIN: "KMUKCDSC9TU031563",
  ModelYear: "2026",
  Model: "Gv60",
  TrimDesc: "Advanced",
  SortablePrice: 62145.0,
  FormattedPrice: "$62,145",
  ExtColorDesc: "Vik Black",
  IntColor: "obsidian black",
  Drivetrain: "AWD",
  PlannedDeliveryDate: "2026-06-04T07:00:00",
  DlrName: "GENESIS SANTA MONICA",
  Distance: 5.61,
  ...overrides,
});

describe("formatGenesisInventoryResults", () => {
  it("returns an empty array when there is no inventory", () => {
    expect(formatGenesisInventoryResults({}, 125, 2026)).toEqual([]);
  });

  it("maps v2 fields onto the keys the inventory table renders", () => {
    const [vehicle] = formatGenesisInventoryResults(
      { status: "SUCCESS", data: [makeVehicle()] },
      125,
      2026,
    );

    expect(vehicle).toMatchObject({
      vin: "KMUKCDSC9TU031563",
      trimDesc: "Advanced",
      // 'price' is kept as a string for the currency formatter
      price: "62145",
      exteriorColor: "Vik Black",
      interiorColor: "Obsidian Black",
      drivetrainDesc: "AWD",
      deliveryDate: "2026-06-04T07:00:00",
      distance: 5.61,
      dealerName: "Genesis Santa Monica",
      // Passed through under its Genesis key for the exact-year filter
      ModelYear: "2026",
    });
  });

  it("filters out vehicles whose model year does not match the search", () => {
    const results = formatGenesisInventoryResults(
      { status: "SUCCESS", data: [makeVehicle({ ModelYear: "2025" })] },
      125,
      2026,
    );

    expect(results).toHaveLength(0);
  });

  it("filters out vehicles beyond the search radius", () => {
    const results = formatGenesisInventoryResults(
      { status: "SUCCESS", data: [makeVehicle({ Distance: 200 })] },
      125,
      2026,
    );

    expect(results).toHaveLength(0);
  });

  it("derives 'In Stock' from a past planned delivery date", () => {
    const [vehicle] = formatGenesisInventoryResults(
      {
        status: "SUCCESS",
        data: [makeVehicle({ PlannedDeliveryDate: "2020-01-01T07:00:00" })],
      },
      125,
      2026,
    );

    expect(vehicle.inventoryStatus).toBe("In Stock");
  });

  it("derives 'In Transit' from a future planned delivery date", () => {
    const [vehicle] = formatGenesisInventoryResults(
      {
        status: "SUCCESS",
        data: [makeVehicle({ PlannedDeliveryDate: "2099-01-01T07:00:00" })],
      },
      125,
      2026,
    );

    expect(vehicle.inventoryStatus).toBe("In Transit");
  });

  it("treats a missing planned delivery date as 'In Stock'", () => {
    const [vehicle] = formatGenesisInventoryResults(
      { status: "SUCCESS", data: [makeVehicle({ PlannedDeliveryDate: null })] },
      125,
      2026,
    );

    expect(vehicle.inventoryStatus).toBe("In Stock");
  });

  it("formats every vehicle within the radius and year", () => {
    const results = formatGenesisInventoryResults(
      {
        status: "SUCCESS",
        data: [
          makeVehicle(),
          makeVehicle({ VIN: "ABC", Drivetrain: "RWD", Distance: 9.74 }),
        ],
      },
      125,
      2026,
    );

    expect(results).toHaveLength(2);
    expect(results[1]).toMatchObject({ vin: "ABC", drivetrainDesc: "RWD" });
  });
});
