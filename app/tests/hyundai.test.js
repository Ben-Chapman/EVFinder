import { formatHyundaiInventoryResults } from "../src/manufacturers/hyundai";

// A single vehicle record shaped like the EV Finder API's slimmed BSI search item.
const makeVehicle = (overrides = {}) => ({
  vin: "7YAKN4DA0TY064624",
  modelYear: 2026,
  model: "IONIQ 5",
  trim: "SEL",
  msrp: 42145.0,
  exteriorColor: "ATLAS WHITE",
  exteriorColorCode: "SAW",
  interiorColor: "BLACK",
  interiorColorCode: "NNB",
  drivetrain: "REAR WHEEL DRIVE",
  drivetrainName: "RWD",
  plannedDeliveryDate: "2026-06-01 07:00:00",
  inventoryStatusCode: "DS",
  dealerName: "Ontario Hyundai",
  dealerAddress: "1307 Kettering Drive",
  dealerVDPURL: "https://www.ontariohyundai.com/inventory/new-2026-hyundai-ioniq-5/",
  distanceFromOrigin: "4.2",
  ...overrides,
});

describe("formatHyundaiInventoryResults", () => {
  it("returns an empty array when there is no inventory", () => {
    expect(formatHyundaiInventoryResults({})).toEqual([]);
  });

  it("maps BSI fields onto the keys the inventory table renders", () => {
    const [vehicle] = formatHyundaiInventoryResults({
      status: "SUCCESS",
      data: [makeVehicle()],
    });

    expect(vehicle).toMatchObject({
      vin: "7YAKN4DA0TY064624",
      trimDesc: "SEL",
      price: 42145.0,
      exteriorColor: "Atlas White",
      interiorColor: "Black",
      drivetrainDesc: "Rear Wheel Drive",
      deliveryDate: "2026-06-01 07:00:00",
      inventoryStatus: "Dealer Stock",
      distance: "4.2",
      dealerName: "Ontario Hyundai",
      // Passed through for the "Dealer's Website for This Vehicle" button
      dealerVDPURL:
        "https://www.ontariohyundai.com/inventory/new-2026-hyundai-ioniq-5/",
    });
  });

  it("translates inventory status codes, including the new VA code", () => {
    const results = formatHyundaiInventoryResults({
      status: "SUCCESS",
      data: [
        makeVehicle({ inventoryStatusCode: "TN" }),
        makeVehicle({ inventoryStatusCode: "VA" }),
      ],
    });

    expect(results[0].inventoryStatus).toBe("Ready for Shipment");
    expect(results[1].inventoryStatus).toBe("In Transit");
  });

  it("formats every vehicle in the list", () => {
    const results = formatHyundaiInventoryResults({
      status: "SUCCESS",
      data: [makeVehicle(), makeVehicle({ vin: "ABC", drivetrain: "ALL WHEEL DRIVE" })],
    });

    expect(results).toHaveLength(2);
    expect(results[1].drivetrainDesc).toBe("All Wheel Drive");
  });
});
