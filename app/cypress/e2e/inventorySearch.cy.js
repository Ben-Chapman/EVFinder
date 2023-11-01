describe("Search for Vehicle Inventory and Validate Results", () => {
  before(() => {
    cy.visit("/index.html");
    cy.get(".form-group > div > #form-zipcode").clear().type("90210");
    cy.get(".form-group > div > #form-radius").clear().type("100");
    cy.wait(500);
    cy.get('[id="submit-button"]').click();
  });

  it("Confirms Inventory Results", () => {
    /**
     * Upon page load a random vehicle model is pre-selected. This test uses that random
     * model as the initial inventory search. If there is no inventory for this inventory
     * search, manually select Ioniq 5, and re-run the search.
     */
    if ((cy.get(".no-inventory"), { timeout: 60000 })) {
      cy.get(".form-group > div > #form-model").select("Ioniq 5");
      cy.wait(500);
      cy.get('[id="submit-button"]').click();
    }

    // The XX Vehicles Available Message
    cy.get(".vehicles-available", { timeout: 60000 }).contains("Vehicles Available");

    // Do we have at least 1 table row?
    cy.get("tbody").first();
    cy.percySnapshot("Inventory Results");
  });

  it("Clicks on Table Row", () => {
    cy.get("tbody > :nth-child(1)").click();
    cy.get("td").contains("MSRP");

    // Take a snapshot while the VIN Detail section is expanded
    cy.percySnapshot("VIN Detail Expanded");

    cy.get("tbody > :nth-child(1)").click(); // Close the row detail

    // Ensure the VIN detail section closes properly
    cy.percySnapshot("VIN Detail Collapsed");
  });

  it("Sorts by Column Heading", () => {
    const isSorted = (inputArray) => {
      return inputArray[0] > inputArray[1];
    };

    for (let i = 1; i <= 4; i++) {
      const columnData = `tbody > :nth-child(1) > [aria-colindex="${i}"]`;
      const columnHeader = `thead > tr > [aria-colindex="${i}"] > div`;

      let columnValues = [];
      for (let j = 0; j <= 1; j++) {
        cy.get(columnHeader).click();
        cy.get(columnData).then(($colData) => {
          columnValues[j] = $colData.text();
        });
      }
      // TODO: Actually make this validation work...
    }
  });
});
