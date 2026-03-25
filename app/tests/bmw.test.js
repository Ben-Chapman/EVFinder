import { formatBMWInventoryResults } from "../src/manufacturers/bmw";

const makeDealerInfo = (centerID = "dealer-001") => ({
  centerID,
  newVehicleSales: [
    {
      dealerName: "BMW of Beverly Hills",
      dealerURL: "https://www.bmwofbeverlyhills.com",
      distance: 5.2,
    },
  ],
});

const makeCar = (overrides = {}) => ({
  name: "i4 eDrive40 Gran Coupe",
  modelYear: 2026,
  vin: "WBY73AW08RFR82345",
  code: "G26",
  totalMsrp: 65900,
  orderStatus: "1",
  dealerId: "dealer-001",
  dealerLocation: "Beverly Hills, CA",
  distanceToLocatorZip: "5.2456",
  engineDriveType: { name: "RWD/sDrive" },
  bodyStyle: { name: "Gran Coupe" },
  series: { code: "i4", name: "4 Series" },
  interiorGenericColor: "Black",
  dealerEstArrivalDate: null,
  initialCOSYURL: "https://www.bmwusa.com/cosy?paint=P0668&fabric=FSASW",
  ...overrides,
});

const makeResponse = (cars, dealerInfoOverrides = {}) => ({
  data: {
    getInventory: {
      numberOfFilteredVehicles: cars.length,
      result: cars,
      dealerInfo: cars.map((c) => ({
        ...makeDealerInfo(c.dealerId || "dealer-001"),
        ...dealerInfoOverrides,
      })),
    },
  },
});

describe("formatBMWInventoryResults", () => {
  describe("drivetrain normalization", () => {
    test("formats RWD/sDrive as RWD sDrive", () => {
      const result = formatBMWInventoryResults(makeResponse([makeCar()]))[0];
      expect(result.drivetrainDesc).toBe("RWD sDrive");
    });

    test("formats AWD/xDrive as AWD xDrive", () => {
      const car = makeCar({ engineDriveType: { name: "AWD/xDrive" } });
      const result = formatBMWInventoryResults(makeResponse([car]))[0];
      expect(result.drivetrainDesc).toBe("AWD xDrive");
    });

    test("leaves xDrive-only value unchanged", () => {
      const car = makeCar({
        name: "iX xDrive50",
        engineDriveType: { name: "xDrive" },
      });
      const result = formatBMWInventoryResults(makeResponse([car]))[0];
      expect(result.drivetrainDesc).toBe("xDrive");
    });
  });

  describe("field extraction", () => {
    let result;
    beforeEach(() => {
      result = formatBMWInventoryResults(makeResponse([makeCar()]))[0];
    });

    test("extracts price from totalMsrp", () => {
      expect(result.price).toBe(65900);
    });

    test("extracts trimDesc from name", () => {
      expect(result.trimDesc).toBe("i4 eDrive40 Gran Coupe");
    });

    test("extracts interiorColor via COSY URL color mapping", () => {
      // initialCOSYURL has fabric=FSASW which maps to "Black Perforated SensaTec"
      expect(result.interiorColor).toBe("Black Perforated SensaTec");
    });

    test("extracts distance to 2 decimal places", () => {
      expect(result.distance).toBe("5.25");
    });

    test("extracts dealerName from matched dealerInfo", () => {
      expect(result.dealerName).toBe("BMW of Beverly Hills");
    });

    test("extracts dealerUrl with protocol stripped", () => {
      expect(result.dealerUrl).toBe("www.bmwofbeverlyhills.com");
    });
  });
});
