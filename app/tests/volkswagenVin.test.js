import { getVolkswagenVinDetail } from "../src/manufacturers/volkswagen";
import { apiRequest } from "../src/helpers/request";

jest.mock("../src/helpers/request");

// A representative slice of a getVehicleByVinAndZip response (single vehicle object,
// not an array), covering the fields the formatter labels and the arrays it folds into
// Accessories / Highlighted Features / specifications.
const makeVinResponse = (vehicle = {}) => ({
  data: {
    vehicle: {
      vin: "1V2CRPE85TC000927",
      model: "ID.4",
      modelYear: "2026",
      trimLevel: "Pro",
      msrp: 46961,
      destinationCharge: 1475,
      exteriorColorDescription: "Pure Gray",
      interiorColorDescription: "Stone",
      interiorColorCode: "ZA",
      highlightFeatures: [{ code: "A1", name: "Heated Seats" }],
      dealerInstalledAccessories: [
        { optionDescription: "Carpeted Mats", price: 235 },
      ],
      specifications: [
        {
          optionCode: "X1",
          optionDescription: "Heat Pump",
          salesFamily: "Comfort",
        },
      ],
      ...vehicle,
    },
  },
});

describe("getVolkswagenVinDetail", () => {
  afterEach(() => jest.clearAllMocks());

  it("maps the VIN-detail response onto labelled fields including interior color", async () => {
    apiRequest.mockResolvedValue(makeVinResponse());

    const result = await getVolkswagenVinDetail(
      "90210",
      "1V2CRPE85TC000927",
      "Volkswagen",
    );

    expect(result).toMatchObject({
      VIN: "1V2CRPE85TC000927",
      Trim: "Pro",
      "Exterior Color": "Pure Gray",
      "Interior Color": "Stone",
      MSRP: "$46,961",
      "Destination Charge": "$1,475",
    });
    expect(result["Highlighted Features"]).toContain("Heated Seats");
    expect(result["Dealer Installed Accessories"]).toContain("Carpeted Mats");
  });

  it("returns a friendly message when VW has no detail for the VIN (null vehicle)", async () => {
    apiRequest.mockResolvedValue({ data: { vehicle: null } });

    const result = await getVolkswagenVinDetail(
      "90210",
      "1V2CRPE8XTC004214",
      "Volkswagen",
    );

    expect(result).toEqual({
      "Vehicle Details":
        "Detailed information is not available for this vehicle.",
    });
  });
});
