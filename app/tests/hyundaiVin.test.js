import { getHyundaiVinDetail } from "../src/manufacturers/hyundai";
import { apiRequest } from "../src/helpers/request";

jest.mock("../src/helpers/request");

// A representative slice of a real vehicleDetails.vin.json response, including the
// edge cases formatVinDetails must handle: a numeric msrp, a zero MAPPrice, a null
// accessories list, the nested colors array, the DDCSpecialProgam/WebDCSAccessories
// blobs, an inventoryStatus code, and the DI object the table reads for the VDP URL.
const makeVinResponse = (vehicleOverrides = {}) => ({
  data: [
    {
      vehicle: [
        {
          vin: "7YAKN4DA0TY064624",
          MAPPrice: 0.0,
          DI: { DealerVDPURL: "" },
          modelNm: "Ioniq 5",
          modelYear: 2026,
          modelGroupCd: "5004",
          modelCd: "51442REZ",
          freight: 1600.0,
          msrp: 40545.0,
          dealerCd: "CA121",
          trimDesc: "SEL",
          extColorDesc: "Atlas White",
          intColorDesc: "Black",
          drivetrain: "RWD",
          drivetrainDesc: "REAR WHEEL DRIVE",
          transmissionDesc: "AUTO",
          horsepower: 225,
          accessories: null,
          colors: [{ SAPExteriorColorCode: "SAW", ExtColorLongDesc: "Atlas White" }],
          inventoryStatus: "TN",
          plannedDeliveryDate: "2026-06-01T07:00:00",
          DDCSpecialProgam: [{ DDCincentiveID: 242948 }],
          WebDCSAccessories: [
            { Part: "Carpet Floor Mats", PartPrice: 173.0 },
            { Part: "Cargo Net", PartPrice: 68.0 },
          ],
          ...vehicleOverrides,
        },
      ],
      dealer: [{ dealerCd: "CA121", dealerNm: "ONTARIO HYUNDAI" }],
    },
  ],
});

describe("getHyundaiVinDetail (vehicleDetails.vin.json)", () => {
  afterEach(() => jest.clearAllMocks());

  it("maps the current VIN-detail response onto labelled fields", async () => {
    apiRequest.mockResolvedValue(makeVinResponse());

    const result = await getHyundaiVinDetail(
      "7YAKN4DA0TY064624",
      "Hyundai",
      "Ioniq 5",
      "2026",
    );

    expect(result).toMatchObject({
      VIN: "7YAKN4DA0TY064624",
      "Trim Description": "SEL",
      "External Color Description": "Atlas White",
      "Interior Color Description": "Black",
      "Drivetrain Description": "REAR WHEEL DRIVE",
      MSRP: "$40,545",
      "Freight Charge": "$1,600",
      "Inventory Status": "Ready for Shipment",
      "Planned Delivery Date": "2026-06-01T07:00:00",
    });
  });

  it("preserves the DI object the table uses for the dealer VDP URL", async () => {
    apiRequest.mockResolvedValue(makeVinResponse());

    const result = await getHyundaiVinDetail(
      "7YAKN4DA0TY064624",
      "Hyundai",
      "Ioniq 5",
      "2026",
    );

    expect(result["DI"]).toEqual({ DealerVDPURL: "" });
  });

  it("drops the colors array from the formatted result", async () => {
    apiRequest.mockResolvedValue(makeVinResponse());

    const result = await getHyundaiVinDetail(
      "7YAKN4DA0TY064624",
      "Hyundai",
      "Ioniq 5",
      "2026",
    );

    expect(result["colors"]).toBeUndefined();
  });

  it("renders WebDCSAccessories as a readable Accessories list", async () => {
    apiRequest.mockResolvedValue(makeVinResponse());

    const result = await getHyundaiVinDetail(
      "7YAKN4DA0TY064624",
      "Hyundai",
      "Ioniq 5",
      "2026",
    );

    expect(result["Accessories"]).toBe("Carpet Floor Mats: $173,  Cargo Net: $68");
  });

  it("shows N/A for Accessories when no accessories are present", async () => {
    apiRequest.mockResolvedValue(
      makeVinResponse({ accessories: null, WebDCSAccessories: null }),
    );

    const result = await getHyundaiVinDetail(
      "7YAKN4DA0TY064624",
      "Hyundai",
      "Ioniq 5",
      "2026",
    );

    expect(result["Accessories"]).toBe("N/A");
  });

  it("does not surface unmapped fields under an 'undefined' title", async () => {
    apiRequest.mockResolvedValue(
      makeVinResponse({
        GERPModelCd: "I54ARZHZW5AZ",
        IRS_30D: 0,
        Recall: 0,
        WebDCSAccessories: [{ Part: "Vehicle Load Adapter", PartPrice: 265 }],
      }),
    );

    const result = await getHyundaiVinDetail(
      "7YAKN4DA0TY064624",
      "Hyundai",
      "Ioniq 5",
      "2026",
    );

    // The big WebDCSAccessories blob (and other unmapped keys) must not appear as
    // an "undefined" titled field in the VIN detail view.
    expect(result).not.toHaveProperty("undefined");
    expect(Object.keys(result)).not.toContain("WebDCSAccessories");
  });

  it("returns an error message when no VIN data is found", async () => {
    apiRequest.mockResolvedValue({ data: [] });

    const result = await getHyundaiVinDetail("nope", "Hyundai", "Ioniq 5", "2026");

    expect(result[1].detail.errorMessage).toMatch(/No information was found/i);
  });
});
