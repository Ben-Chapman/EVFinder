import {
  cadillacVinMapping,
  cadillacColorMapping,
  extractCadillacOptionCodes,
  getCadillacExteriorColor,
  getCadillacInteriorColor,
  getCadillacColorsFromPackageCodes,
  buildColorMappingFromFacets,
} from "../src/manufacturers/cadillacMappings";

describe("Cadillac Mappings Tests", () => {
  describe("cadillacVinMapping", () => {
    test("should contain all required VIN mapping keys", () => {
      const expectedKeys = [
        "destinationCharge",
        "driveType",
        "baseExteriorColor",
        "fuelType",
        "make",
        "model",
        "msrp",
        "variant",
        "year",
        "id",
        "mileage",
        "bodyStyle",
        "vehicleType",
      ];

      expectedKeys.forEach((key) => {
        expect(cadillacVinMapping).toHaveProperty(key);
        expect(typeof cadillacVinMapping[key]).toBe("string");
      });
    });

    test("should map VIN fields correctly", () => {
      expect(cadillacVinMapping.id).toBe("VIN");
      expect(cadillacVinMapping.driveType).toBe("Drivetrain");
      expect(cadillacVinMapping.baseExteriorColor).toBe("Exterior Color");
    });
  });

  describe("cadillacColorMapping", () => {
    test("should contain exterior color codes", () => {
      const exteriorCodes = ["GBA", "GAB", "GAI", "GB8", "GXD"];
      exteriorCodes.forEach((code) => {
        expect(cadillacColorMapping).toHaveProperty(code);
        expect(typeof cadillacColorMapping[code]).toBe("string");
      });
    });

    test("should contain interior color codes", () => {
      const interiorCodes = ["1SC", "1SF", "1SD", "EMY", "ENK", "H7D"];
      interiorCodes.forEach((code) => {
        expect(cadillacColorMapping).toHaveProperty(code);
        expect(typeof cadillacColorMapping[code]).toBe("string");
      });
    });

    test("should have correct color descriptions", () => {
      expect(cadillacColorMapping["GBA"]).toBe("Black Raven");
      expect(cadillacColorMapping["1SC"]).toBe("Noir with Santorini Blue Accents");
      expect(cadillacColorMapping["H7D"]).toBe("Backen Black with Santorini Accents");
    });
  });

  describe("extractCadillacOptionCodes", () => {
    test("should return empty array for invalid input", () => {
      expect(extractCadillacOptionCodes(null)).toEqual([]);
      expect(extractCadillacOptionCodes(undefined)).toEqual([]);
      expect(extractCadillacOptionCodes("")).toEqual([]);
    });

    test("should extract codes from ESCALADE IQ image URL", () => {
      const escaladeUrl =
        "https://cgi.cadillac.com/mmgprod-us/dynres/prove/image.gen?i=2025/6T35726/6T35726__1SF/GAB_0ST_1NF_1SF_1SZ_2NF_2ST_3ST_41T_4NK_4ST_5A7_5AV_5FC_5RC_5ST_5ZC_65C_6X1_7X1_8X2_9L3_9X2_A2X_A45_A7K_AGG_AHV_AKO_AL0_AQ9_ARU_AS1_AS2_AS8_ASD_ATH_ATN_AU3_AVI_AVK_AVU_AXP_AZA_B30_B7K_BKL_BOY_BTT_BTV_C24_C25_C49_C69_C7G_CAV_CE1_CLR_CMO_CPL_CTB_CTT_CWA_D07_D75_DEA_DEH_DRZ_EF7_EMI_EN0_EPH_ETN_F47_FJP_FX3_GIC_H7D_HD7_HS1_IKP_IVE_J26_J77_JAD_JCF_JL1_JSZ_K28_K6J_K7B_KAM_KCD_KD4_KEJ_KI3_KI4_KPB_KRV_KSG_KTI_KU9_KV9_KWP_LHD_LPA_MAH_MF1_N06_N38_N50_NAM_NCG_NDC_NF6_NKF_NKR_NWM_NYS_NYU_P8N_PDB_PDF_PSC_PZ8_QMP_R6Y_R9M_R9N_RFD_RIA_RIK_RJJ_RSR_RYO_S0M_S3I_S80_SF7_SFE_SLM_SP9_T7Z_T87_T95_TAU_TCP_TDM_TGC_TLG_TQ5_TR7_U2K_U5G_UBC_UCB_UCV_UE1_UEN_UEU_UFB_UG1_UGN_UH5_UH6_UJN_UK3_UKI_UKK_UKL_UKT_UKZ_ULM_UMN_UOW_UQP_URB_URX_USK_UTJ_UTR_UTU_UTV_UTW_UUQ_UV2_UV6_UVX_UVZ_UW9_V8D_VGC_VK3_VRD_VRF_VRG_VRH_VRK_VRL_VRM_VRN_VRR_VSX_VV4_WLE_WMI_WNO_XFD_XL8_XRJ_YF5_YM8_Z75_Z82_Z95gmds4.jpg&v=deg43&std=true&country=US";

      const codes = extractCadillacOptionCodes(escaladeUrl);

      expect(codes).toContain("GAB"); // Exterior color
      expect(codes).toContain("1SF"); // Interior/trim code
      expect(codes).toContain("H7D"); // Interior color
      expect(codes.length).toBeGreaterThan(50); // Should extract many codes
    });

    test("should extract codes from shorter URL format", () => {
      const shortUrl = "https://example.com/image/6T35726_1SC_GBA_H7D_test.jpg";
      const codes = extractCadillacOptionCodes(shortUrl);

      expect(codes).toContain("6T35726");
      expect(codes).toContain("1SC");
      expect(codes).toContain("GBA");
      expect(codes).toContain("H7D");
    });

    test("should filter out very short codes", () => {
      const url = "https://example.com/test_A_BC_DEF_GHIJ.jpg";
      const codes = extractCadillacOptionCodes(url);

      expect(codes).not.toContain("A"); // Too short
      expect(codes).toContain("BC");
      expect(codes).toContain("DEF");
      expect(codes).toContain("GHIJ");
    });
  });

  describe("getCadillacExteriorColor", () => {
    test("should return fallback for invalid input", () => {
      expect(getCadillacExteriorColor(null)).toBe("N/A");
      expect(getCadillacExteriorColor("", "Custom Fallback")).toBe("Custom Fallback");
    });

    test("should extract exterior color from URL", () => {
      const url = "https://example.com/image/GBA_1SC_test.jpg";
      expect(getCadillacExteriorColor(url)).toBe("Black Raven");
    });

    test("should return fallback when no exterior color found", () => {
      const url = "https://example.com/image/1SC_EMY_test.jpg"; // Only interior codes
      expect(getCadillacExteriorColor(url)).toBe("N/A");
    });
  });

  describe("getCadillacInteriorColor", () => {
    test("should return fallback for invalid input", () => {
      expect(getCadillacInteriorColor(null)).toBe("N/A");
      expect(getCadillacInteriorColor("", "Custom Fallback")).toBe("Custom Fallback");
    });

    test("should extract interior color from URL", () => {
      const url = "https://example.com/image/GBA_1SC_test.jpg";
      expect(getCadillacInteriorColor(url)).toBe("Noir with Santorini Blue Accents");
    });

    test("should extract ESCALADE IQ interior color", () => {
      const url = "https://example.com/image/GAB_H7D_test.jpg";
      expect(getCadillacInteriorColor(url)).toBe("Backen Black with Santorini Accents");
    });

    test("should return fallback when no interior color found", () => {
      const url = "https://example.com/image/GBA_GAI_test.jpg"; // Only exterior codes
      expect(getCadillacInteriorColor(url)).toBe("N/A");
    });
  });

  describe("buildColorMappingFromFacets", () => {
    test("should return empty mappings for invalid input", () => {
      const result = buildColorMappingFromFacets(null);
      expect(result.colorMapping).toEqual({});
      expect(result.facetsMapping).toEqual({});
    });

    test("should build mapping from exterior color facets", () => {
      const input = {
        facets: {
          data: {
            exteriorColor: [
              {
                values: ["GBA"],
                displayValue: "Black Raven",
              },
              {
                values: ["GAB"],
                displayValue: "Black Cherry Tintcoat",
              },
            ],
          },
        },
      };

      const result = buildColorMappingFromFacets(input);

      expect(result.colorMapping["GBA"]).toBe("Black Raven");
      expect(result.colorMapping["GAB"]).toBe("Black Cherry Tintcoat");
      expect(result.facetsMapping["GBA"]).toEqual({
        type: "exterior",
        displayValue: "Black Raven",
      });
    });

    test("should build mapping from interior color facets", () => {
      const input = {
        facets: {
          data: {
            interiorColor: [
              {
                values: ["H7D"],
                displayValue: "Backen Black with Santorini Accents",
              },
              {
                values: ["EMY"],
                displayValue: "Camelia with Backen Black accents",
              },
            ],
          },
        },
      };

      const result = buildColorMappingFromFacets(input);

      expect(result.colorMapping["H7D"]).toBe("Backen Black with Santorini Accents");
      expect(result.colorMapping["EMY"]).toBe("Camelia with Backen Black accents");
      expect(result.facetsMapping["H7D"]).toEqual({
        type: "interior",
        displayValue: "Backen Black with Santorini Accents",
      });
    });

    test("should handle different color value structures", () => {
      const input = {
        facets: {
          data: {
            exteriorColor: [
              {
                values: "GBA", // String instead of array
                displayValue: "Black Raven",
              },
              {
                value: ["GAB"], // 'value' instead of 'values'
                displayValue: "Black Cherry Tintcoat",
              },
              {
                code: "GAI", // 'code' field
                name: "Deep Space Metallic",
              },
            ],
          },
        },
      };

      const result = buildColorMappingFromFacets(input);

      expect(result.colorMapping["GBA"]).toBe("Black Raven");
      expect(result.colorMapping["GAB"]).toBe("Black Cherry Tintcoat");
      expect(result.colorMapping["GAI"]).toBe("Deep Space Metallic");
    });

    test("should handle multiple codes per color", () => {
      const input = {
        facets: {
          data: {
            exteriorColor: [
              {
                values: ["GBA", "GB8"], // Multiple codes for same color
                displayValue: "Black Raven",
              },
            ],
          },
        },
      };

      const result = buildColorMappingFromFacets(input);

      expect(result.colorMapping["GBA"]).toBe("Black Raven");
      expect(result.colorMapping["GB8"]).toBe("Black Raven");
    });
  });

  describe("getCadillacColorsFromPackageCodes", () => {
    test("should return fallbacks for empty input", () => {
      const result = getCadillacColorsFromPackageCodes([], null);
      expect(result.exteriorColor).toBe("N/A");
      expect(result.interiorColor).toBe("N/A");
    });

    test("should use custom fallbacks", () => {
      const result = getCadillacColorsFromPackageCodes(
        [],
        null,
        "Custom Exterior",
        "Custom Interior",
      );
      expect(result.exteriorColor).toBe("Custom Exterior");
      expect(result.interiorColor).toBe("Custom Interior");
    });

    test("should extract colors from packageOemCodes", () => {
      const packageOemCodes = ["1SF", "PDB"];
      const result = getCadillacColorsFromPackageCodes(packageOemCodes);

      expect(result.interiorColor).toBe("Noir with Santorini Blue Accents");
    });

    test("should extract colors from image URL when packageOemCodes fail", () => {
      const packageOemCodes = ["UNKNOWN"];
      const imageUrl = "https://example.com/image/GBA_H7D_test.jpg";

      const result = getCadillacColorsFromPackageCodes(packageOemCodes, imageUrl);

      expect(result.exteriorColor).toBe("Black Raven");
      expect(result.interiorColor).toBe("Backen Black with Santorini Accents");
    });

    test("should prioritize facets data over static mapping", () => {
      const packageOemCodes = ["TEST_CODE"];
      const input = {
        facets: {
          data: {
            exteriorColor: [
              {
                values: ["TEST_CODE"],
                displayValue: "Dynamic Color From Facets",
              },
            ],
          },
        },
      };

      const result = getCadillacColorsFromPackageCodes(
        packageOemCodes,
        null,
        "N/A",
        "N/A",
        input,
      );

      expect(result.exteriorColor).toBe("Dynamic Color From Facets");
    });

    test("should handle ESCALADE IQ scenario", () => {
      const packageOemCodes = ["1SF", "PDB", "PDF"];
      // Use a simpler URL that definitely contains H7D
      const imageUrl = "https://example.com/image/GAB_H7D_1SF_test.jpg";
      const input = {
        facets: {
          data: {
            exteriorColor: [
              {
                values: ["GAB"],
                displayValue: "Black Cherry Tintcoat",
              },
            ],
            interiorColor: [
              {
                values: ["H7D"],
                displayValue: "Backen Black with Santorini Accents",
              },
            ],
          },
        },
      };

      const result = getCadillacColorsFromPackageCodes(
        packageOemCodes,
        imageUrl,
        "Red", // fallback exterior from API
        "N/A",
        input,
      );

      // Should get interior from image URL parsing since H7D is in the facets
      expect(result.interiorColor).toBe("Backen Black with Santorini Accents"); // From H7D in image URL via facets
      expect(result.exteriorColor).toBe("Black Cherry Tintcoat"); // From GAB in facets
    });

    test("should use static mapping when no facets data available", () => {
      const packageOemCodes = ["1SF"]; // Has static mapping
      const imageUrl = "https://example.com/image/GBA_test.jpg";

      const result = getCadillacColorsFromPackageCodes(
        packageOemCodes,
        imageUrl,
        "N/A",
        "N/A",
        null, // No facets data
      );

      // Should use static mapping since no facets data
      expect(result.interiorColor).toBe("Noir with Santorini Blue Accents"); // From 1SF static mapping
      expect(result.exteriorColor).toBe("Black Raven"); // From GBA static mapping
    });

    test("should combine multiple color sources correctly", () => {
      const packageOemCodes = ["1SC"]; // Interior from static
      const imageUrl = "https://example.com/image/GBA_test.jpg"; // Exterior from image

      const result = getCadillacColorsFromPackageCodes(packageOemCodes, imageUrl);

      expect(result.exteriorColor).toBe("Black Raven"); // From image URL
      expect(result.interiorColor).toBe("Noir with Santorini Blue Accents"); // From packageOemCodes
    });

    test("should handle null/undefined packageOemCodes gracefully", () => {
      const imageUrl = "https://example.com/image/GBA_1SC_test.jpg";

      const result1 = getCadillacColorsFromPackageCodes(null, imageUrl);
      const result2 = getCadillacColorsFromPackageCodes(undefined, imageUrl);

      // Should still extract from image URL
      expect(result1.exteriorColor).toBe("Black Raven");
      expect(result1.interiorColor).toBe("Noir with Santorini Blue Accents");
      expect(result2.exteriorColor).toBe("Black Raven");
      expect(result2.interiorColor).toBe("Noir with Santorini Blue Accents");
    });

    test("should handle complex facets data structure variations", () => {
      const input = {
        facets: {
          data: {
            exteriorColor: [
              {
                value: "GBA", // singular 'value' instead of 'values' array
                name: "Black Raven", // 'name' instead of 'displayValue'
              },
            ],
            interiorColor: [
              {
                code: ["H7D"], // 'code' array
                label: "Backen Black with Santorini Accents", // 'label' instead of 'displayValue'
              },
            ],
          },
        },
      };

      const result = getCadillacColorsFromPackageCodes(
        ["GBA", "H7D"],
        null,
        "N/A",
        "N/A",
        input,
      );

      expect(result.exteriorColor).toBe("Black Raven");
      expect(result.interiorColor).toBe("Backen Black with Santorini Accents");
    });
  });
});
