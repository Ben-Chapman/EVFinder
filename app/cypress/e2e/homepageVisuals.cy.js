describe("Homepage Background is Correct", () => {
  beforeEach(() => {
    cy.visit("/index.html");
  });

  context("Desktop Browsers", () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
    });

    it("Has a valid Desktop background image", () => {
      cy.get("#background")
        .should("have.css", "background-color", "rgba(0, 0, 0, 0)")
        .should("have.css", "background-image");
    });

    it("Has the site slogan", () => {
      cy.contains("h1", "Find Your New");
    });
  });

  const mobileDevices = [
    "ipad-2",
    "ipad-mini",
    "iphone-8",
    "iphone-x",
    "iphone-xr",
    "iphone-se2",
    "samsung-note9",
    "samsung-s10",
  ];

  context("Mobile Browsers in Portrait", () => {
    mobileDevices.forEach((device) => {
      it(`Has a valid Mobile background image for ${device}`, () => {
        cy.viewport(device);

        cy.get("#background")
          .should("have.css", "background-color", "rgba(0, 0, 0, 0)")
          .should("have.css", "background-image")
          .should("match", /hero_images\/mobile\/[0-9a-z\-]+.jpg/);

        cy.get("#background")
          .should("have.css", "background-position")
          .should("match", /-\d+px\s50%/); // -67px 50%
      });
    });
  });

  context("Mobile Browsers in Landscape", () => {
    mobileDevices.forEach((device) => {
      it(`Has a valid Mobile background image for ${device}`, () => {
        cy.viewport(device, "landscape");

        cy.get("#background")
          .should("have.css", "background-color", "rgba(0, 0, 0, 0)")
          .should("have.css", "background-image")
          .should("match", /hero_images\/mobile\/[0-9a-z\-]+.jpg/);

        cy.get("#background")
          .should("have.css", "background-position")
          .should("match", /50%\s50%/);
      });
    });
  });

  context("Image Position Changes When Device Is Rotated", () => {
    mobileDevices.forEach((device) => {
      it(`Background Image Changes when ${device} Is Rotated`, () => {
        cy.viewport(device, "portrait");
        cy.get("#background")
          .should("have.css", "background-position")
          .should("match", /-\d+px\s50%/);

        cy.viewport(device, "landscape");
        cy.get("#background")
          .should("have.css", "background-position")
          .should("match", /50%\s50%/);
      });
    });
  });
});
