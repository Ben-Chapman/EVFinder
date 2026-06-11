import {
  formatKiaVinDetails,
  formatKiaInventoryResults,
} from "../src/manufacturers/kia";

// An inventory payload shaped like the Kia /inventory/initial response (the EV Finder
// API passes it through unchanged). Only the fields the formatter reads are included.
const makeInventory = (vehicleOverrides = {}) => ({
  filterSet: {
    series: "NAE",
    dealers: [
      {
        code: "CA320",
        name: "Van Nuys Kia",
        url: "http://VANNUYSKIA.COM",
        location: { city: "Van Nuys", state: "CA" },
      },
    ],
  },
  inventoryVehicles: [
    {
      vin: "5XYC44JA7TG015075",
      year: "2026",
      model: "Ev6",
      trim: "GT-Line RWD",
      edwTrim: "GTL RWD",
      status: "DS",
      msrp: "51090",
      extColor: "Nebular Blue",
      intColor: "Saturn Black Syntex W/ Off-white Syntex Seat Trim Vegan SynTex",
      dealer: {
        code: "CA320",
        name: "Van Nuys Kia",
        distance: "7.053016106923555",
        url: "http://VANNUYSKIA.COM",
        vdp_URL: null,
      },
      // Image-path hex (357ceb) intentionally differs from the swatch baseHex for
      // Nebular Blue (3b6ccb); the readable extColor must still be used.
      exteriorImages: {
        exteriorProfile:
          "/us/content/dam/kia/us/en/vehicles/ev6/2026/trims/gt-line-rwd/exterior/357ceb/360/05.png",
        exterior360:
          "/us/content/dam/kia/us/en/vehicles/ev6/2026/trims/gt-line-rwd/exterior/357ceb/360",
      },
      ...vehicleOverrides,
    },
  ],
});

describe("formatKiaInventoryResults", () => {
  it("returns an empty array when there is no inventory", () => {
    expect(formatKiaInventoryResults({})).toEqual([]);
  });

  it("uses the readable exterior and interior colors from the vehicle record", () => {
    const [vehicle] = formatKiaInventoryResults(makeInventory());

    expect(vehicle.exteriorColor).toBe("Nebular Blue");
    expect(vehicle.interiorColor).toBe(
      "Saturn Black Syntex W/ Off-white Syntex Seat Trim Vegan SynTex",
    );
  });

  it("still resolves the exterior color when exteriorImages is null", () => {
    const [vehicle] = formatKiaInventoryResults(
      makeInventory({ exteriorImages: null, extColor: "Glacial White" }),
    );

    expect(vehicle.exteriorColor).toBe("Glacial White");
  });

  it("falls back to 'Unknown' when a color is absent", () => {
    const [vehicle] = formatKiaInventoryResults(
      makeInventory({ extColor: undefined, intColor: undefined }),
    );

    expect(vehicle.exteriorColor).toBe("Unknown");
    expect(vehicle.interiorColor).toBe("Unknown");
  });

  it("resolves dealer details from the dealer code", () => {
    const [vehicle] = formatKiaInventoryResults(makeInventory());

    expect(vehicle.dealerName).toBe("Van Nuys Kia");
    expect(vehicle.city).toBe("Van Nuys");
    expect(vehicle.distance).toBe("7.05");
  });
});

// A VIN detail payload shaped like the Kia vinInfo API response (the EV Finder API
// passes it through unchanged). Only the fields the formatter reads are included.
const makeVinResponse = (vehicleOverrides = {}, dealerOverrides = {}) => ({
  statusCode: "200",
  vehicles: [
    {
      vin: "5XYC3DJC6TG016805",
      dealerCode: "CA333",
      year: { year: "2026" },
      model: { model: "Ev6" },
      modelCode: "NAE5445",
      trim: {
        name: "Light Long Range AWD",
        longName: "Light Long Range AWD",
        desc: "Light Long Range AWD",
      },
      msrp: "47440",
      dealerPrice: "46418",
      exteriorColor: {
        code: "PML",
        name: "Panthera Metal",
        description: "Panthera Metal",
      },
      interiorColor: {
        code: "WK",
        name: "Saturn Black Recycled Fabric W/ Syntex Seat Trim",
        description:
          "Saturn Black Recycled Fabric W/ Syntex Seat Trim Recycled Fabric w/ Vegan SynTex Seat Trim",
      },
      transmission: { transmission: "Awd Auto" },
      options: ["Cargo Mat w/Luggage Board", "Carpeted Floor Mats", "Cargo Cover"],
      bodyDescription: "5dr Sport Utility",
      engineDisplacement: "239kw Electric Motor",
      engineCylinders: { engineCylinders: "Electric Motor" },
      mileage: "117 City 95 Highway",
      features: [
        {
          title: "TOP FEATURES",
          options: ["84 kWh Lithium Ion Battery", "Single Electric Motor (225hp)"],
        },
        { title: "SAFETY", options: ["Dual Front Advanced Airbags"] },
      ],
      optionPackageCode: "STD",
      seriesId: "NAE",
      edwTrim: "LT LR AWD",
      status: "IT",
      ...vehicleOverrides,
    },
  ],
  dealers: [
    {
      name: "Kia Santa Monica",
      code: "CA333",
      url: "http://KIASANTAMONICA.COM",
      distance: "5.5015304825233065",
      location: { city: "Santa Monica", state: "CA", zipCode: "90404" },
      ...dealerOverrides,
    },
  ],
});

describe("formatKiaVinDetails", () => {
  it("returns an empty object when the response has no vehicles", () => {
    expect(formatKiaVinDetails({ statusCode: "200", vehicles: [] })).toEqual({});
  });

  it("maps the nested vinInfo payload onto labelled detail fields", () => {
    const detail = formatKiaVinDetails(makeVinResponse());

    expect(detail).toMatchObject({
      VIN: "5XYC3DJC6TG016805",
      Year: "2026",
      Model: "Ev6",
      "Model Code": "NAE5445",
      Trim: "Light Long Range AWD",
      "Series ID": "NAE",
      MSRP: "$47,440",
      "Dealer Price": "$46,418",
      "Exterior Color": "Panthera Metal",
      "Exterior Color Code": "PML",
      "Interior Color Code": "WK",
      Transmission: "Awd Auto",
      "Engine Displacement": "239kw Electric Motor",
      "Engine Cylinders": "Electric Motor",
      Mileage: "117 City 95 Highway",
      "Body Description": "5dr Sport Utility",
    });
  });

  it("derives the drivetrain from edwTrim", () => {
    expect(formatKiaVinDetails(makeVinResponse())["Drivetrain"]).toBe("AWD");
    expect(
      formatKiaVinDetails(makeVinResponse({ edwTrim: "WIND RWD" }))["Drivetrain"],
    ).toBe("RWD");
    expect(formatKiaVinDetails(makeVinResponse({ edwTrim: "" }))["Drivetrain"]).toBe(
      "Unknown",
    );
  });

  it("derives a readable inventory status from the status code", () => {
    expect(formatKiaVinDetails(makeVinResponse())["Inventory Status"]).toBe(
      "Arriving Soon",
    );
    expect(
      formatKiaVinDetails(makeVinResponse({ status: "DS" }))["Inventory Status"],
    ).toBe("Available");
  });

  it("joins the first feature group into Top Features", () => {
    expect(formatKiaVinDetails(makeVinResponse())["Top Features"]).toBe(
      "84 kWh Lithium Ion Battery, Single Electric Motor (225hp)",
    );
  });

  it("joins the option list into a single string", () => {
    expect(formatKiaVinDetails(makeVinResponse())["Options"]).toBe(
      "Cargo Mat w/Luggage Board, Carpeted Floor Mats, Cargo Cover",
    );
  });

  it("sources dealer details from the dealers array", () => {
    const detail = formatKiaVinDetails(makeVinResponse());

    expect(detail).toMatchObject({
      "Dealer Code": "CA333",
      "Dealer Name": "Kia Santa Monica",
      City: "Santa Monica",
      State: "CA",
      "Miles from ZIP Code": "5.50",
    });
  });

  it("title-cases an all-caps dealer name", () => {
    const detail = formatKiaVinDetails(makeVinResponse({}, { name: "VAN NUYS KIA" }));
    expect(detail["Dealer Name"]).toBe("Van Nuys Kia");
  });
});
