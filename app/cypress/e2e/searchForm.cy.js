describe("Validation of the Input Form", () => {
  before(() => {
    cy.visit("/index.html");
  });

  it("Submit Button Is Disabled With Empty Form", () => {
    cy.get('[id="invalid-submit-button"]').should("be.disabled");
    cy.percySnapshot("Submit button is disabled with empty form");
  });

  it("Form Indicates Error with Invalid Zip Code", () => {
    ["00000", "-100", "00500"].forEach((invalidZip) => {
      cy.get(".form-group > div > #form-zipcode")
        .clear()
        .type(`${invalidZip}`)
        .should("have.class", "is-invalid");
      cy.get('[id="invalid-submit-button"]').should("be.disabled");
    });
  });

  it("Form Indicates Error with Invalid Search Radius", () => {
    ["0", "-100", "9999"].forEach((invalidSearchRadius) => {
      cy.get(".form-group > div > #form-radius")
        .clear()
        .type(`${invalidSearchRadius}`)
        .should("have.class", "is-invalid");
      cy.get('[id="invalid-submit-button"]').should("be.disabled");
    });
    cy.percySnapshot("Form shows error with invalid radius and invalid zipcode");
  });

  it("Form Indicates Success with Valid Zip Code", () => {
    ["90210", "10036", "01010"].forEach((validZip) => {
      cy.get(".form-group > div > #form-zipcode")
        .clear()
        .type(`${validZip}`)
        .should("have.class", "is-valid");
      cy.get('[id="invalid-submit-button"]').should("be.disabled");
    });
    cy.percySnapshot("Zipcode is valid and shows success");
  });

  it("Form Indicates Success with Valid Search Radius", () => {
    ["1", "100", "999"].forEach((validSearchRadius) => {
      cy.get(".form-group > div > #form-radius")
        .clear()
        .type(`${validSearchRadius}`)
        .wait(500) // Wait for form field debouncing
        .should("have.class", "is-valid");
      cy.get('[id="submit-button"]').should("be.enabled");
    });
    cy.percySnapshot("Radius is valid and shows success");
  });

  it("Form Is Complete and Valid", () => {
    cy.get(".form-group > div > #form-zipcode").clear().type("90210");
    cy.get(".form-group > div > #form-radius").clear().type("100");
    cy.wait(500);
    cy.get('[id="submit-button"]').should("be.enabled");
    cy.percySnapshot("Entire form is complete and shows success");
  });
});
