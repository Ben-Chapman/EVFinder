describe("The application responds correctly to deep links", () => {
  it("A valid slogan is shown for a given deep link", () => {
    const deepLinks = [
      { link: "/inventory/2024/hyundai/ioniq-5", text: "Hyundai Ioniq 5" },
      { link: "/inventory/2024/audi/etron-gt", text: "Audi e-tron® GT" },
      { link: "/inventory/2024/volkswagen/id.4", text: "Volkswagen ID.4" },
      { link: "/inventory/2023/ford/mustang-mach-e", text: "Ford Mustang Mach-E®" },
    ];

    deepLinks.forEach((link) => {
      cy.visit(link.link);

      cy.get("#slogan-large-display").contains(
        `Find Your New ${link.text} With The EV Finder`
      );
    });
  });

  it("An invalid URL redirects to /", () => {
    const invalidUrls = [
      "/inventory/2021/chevrolet/bolt-ev", // invalid year
      "/2024/chevrolet/bolt-ev/", // missing /inventory
      "/inventory/2024/chevrolet/bolt-lightning", // invalid model
      "/foo", // bar baz
    ];
    invalidUrls.forEach((url) => {
      cy.visit(url);
      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
    });
  });

  it("A complete URL populates search form fields and performs an inventory search", () => {
    const validUrls = [
      "/inventory/2024/hyundai/ioniq-6?zipcode=90210&radius=10",
      "/inventory/2024/kia/ev6?zipcode=10036&radius=10",
    ];

    validUrls.forEach((url) => {
      const zipcode = url.split("=")[1].split("&")[0];
      const radius = url.split("=")[2].split("&")[0];

      cy.visit(url);

      // Validate the form fields
      cy.get(".form-group > div > #form-zipcode").should("have.value", zipcode);
      cy.get(".form-group > div > #form-radius").should("have.value", radius);
      cy.get('[id="submit-button"]').should("be.enabled");

      // Validate that the inventory API call was made and successful
      cy.get(".inventory-table", { timeout: 15000 });
    });
  });

  it("A change to the URL changes the form fields", () => {
    cy.visit("/inventory/2023/hyundai/ioniq-5");
    cy.get(".form-group > div > #form-year").should("have.value", "2023");
    cy.get(".form-group > div > #form-model").should("have.value", "ioniq-5");

    cy.visit("/inventory/2023/audi/sq8-etron");
    cy.get(".form-group > div > #form-model").should("have.value", "sq8-etron");

    cy.visit("/inventory/2024/audi/sq8-etron");
    cy.get(".form-group > div > #form-year").should("have.value", "2024");
  });
});
